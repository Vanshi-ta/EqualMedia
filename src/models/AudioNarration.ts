export interface AudioNarration {
    audioBlob: Blob;
    sourceText: string;
    duration: number; // in seconds
    languageCode: string;
}

