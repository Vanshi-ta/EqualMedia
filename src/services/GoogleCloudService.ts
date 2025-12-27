import { Caption, CaptionSegment } from "../models/Caption";
import { AudioNarration } from "../models/AudioNarration";
import { getApiConfig } from "../utils/config";

export class GoogleCloudService {
    private apiKey: string | undefined;
    private baseUrl = "https://speech.googleapis.com/v1";
    private ttsBaseUrl = "https://texttospeech.googleapis.com/v1";

    constructor() {
        const config = getApiConfig();
        this.apiKey = config.googleCloudApiKey;
    }

    /**
     * Transcribes audio to text with timestamps using Google Cloud Speech-to-Text API
     * @param audioBlob Audio data as Blob
     * @param languageCode Language code (e.g., 'en-US')
     * @returns Promise with array of captions with timestamps
     */
    async transcribeAudio(audioBlob: Blob, languageCode: string = "en-US"): Promise<Caption[]> {
        if (!this.apiKey) {
            throw new Error("Google Cloud API key is not configured");
        }

        try {
            // Convert blob to base64
            const base64Audio = await this.blobToBase64(audioBlob);

            // Determine audio encoding format
            const audioFormat = this.detectAudioFormat(audioBlob);

            const response = await fetch(
                `${this.baseUrl}/speech:recognize?key=${this.apiKey}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        config: {
                            encoding: audioFormat,
                            sampleRateHertz: 44100, // Adjust based on actual audio
                            languageCode: languageCode,
                            enableWordTimeOffsets: true,
                            enableAutomaticPunctuation: true,
                        },
                        audio: {
                            content: base64Audio,
                        },
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Speech-to-Text API error: ${error.error?.message || response.statusText}`);
            }

            const data = await response.json();
            return this.convertResultsToCaptions(data);
        } catch (error) {
            console.error("Error transcribing audio:", error);
            throw error;
        }
    }

    /**
     * Converts text to speech using Google Cloud Text-to-Speech API
     * @param text Text to convert
     * @param languageCode Language code (e.g., 'en-US')
     * @param voiceName Optional voice name
     * @returns Promise with AudioNarration object
     */
    async synthesizeSpeech(
        text: string,
        languageCode: string = "en-US",
        voiceName?: string
    ): Promise<AudioNarration> {
        if (!this.apiKey) {
            throw new Error("Google Cloud API key is not configured");
        }

        try {
            const response = await fetch(
                `${this.ttsBaseUrl}/text:synthesize?key=${this.apiKey}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        input: { text: text },
                        voice: {
                            languageCode: languageCode,
                            name: voiceName || "en-US-Standard-C",
                            ssmlGender: "NEUTRAL",
                        },
                        audioConfig: {
                            audioEncoding: "MP3",
                            speakingRate: 1.0,
                            pitch: 0.0,
                        },
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Text-to-Speech API error: ${error.error?.message || response.statusText}`);
            }

            const data = await response.json();
            const audioContent = data.audioContent;

            // Convert base64 to Blob
            const audioBlob = await this.base64ToBlob(audioContent, "audio/mp3");

            // Estimate duration (rough calculation)
            const duration = text.length * 0.06; // Approximate seconds per character

            return {
                audioBlob,
                sourceText: text,
                duration,
                languageCode,
            };
        } catch (error) {
            console.error("Error synthesizing speech:", error);
            throw error;
        }
    }

    /**
     * Converts Google Cloud Speech-to-Text results to Caption format
     */
    private convertResultsToCaptions(data: any): Caption[] {
        if (!data.results || data.results.length === 0) {
            return [];
        }

        const captions: Caption[] = [];
        
        for (const result of data.results) {
            if (result.alternatives && result.alternatives.length > 0) {
                const alternative = result.alternatives[0];
                
                if (alternative.words && alternative.words.length > 0) {
                    // Create caption segments from words
                    const words = alternative.words;
                    let currentSegment: CaptionSegment = {
                        text: "",
                        startTime: parseFloat(words[0].startTime.replace("s", "")),
                        endTime: parseFloat(words[words.length - 1].endTime.replace("s", "")),
                    };

                    for (const word of words) {
                        currentSegment.text += word.word + " ";
                    }
                    currentSegment.text = currentSegment.text.trim();

                    captions.push({
                        text: currentSegment.text,
                        startTime: currentSegment.startTime,
                        endTime: currentSegment.endTime,
                    });
                } else if (alternative.transcript) {
                    // Fallback: use full transcript without timing
                    const startTime = result.resultEndTime
                        ? parseFloat(result.resultEndTime.replace("s", "")) - 5
                        : 0;
                    captions.push({
                        text: alternative.transcript,
                        startTime: startTime,
                        endTime: startTime + 5,
                    });
                }
            }
        }

        return captions;
    }

    /**
     * Converts Blob to base64 string
     */
    private async blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = (reader.result as string).split(",")[1];
                resolve(base64String);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Converts base64 string to Blob
     */
    private async base64ToBlob(base64: string, mimeType: string): Promise<Blob> {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    }

    /**
     * Detects audio format from Blob type
     */
    private detectAudioFormat(blob: Blob): string {
        const mimeType = blob.type.toLowerCase();
        if (mimeType.includes("webm")) return "WEBM_OPUS";
        if (mimeType.includes("mp4")) return "MP4";
        if (mimeType.includes("wav")) return "LINEAR16";
        if (mimeType.includes("flac")) return "FLAC";
        // Default to LINEAR16 for unknown types
        return "LINEAR16";
    }
}

