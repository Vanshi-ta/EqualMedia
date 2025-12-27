import React, { useState } from "react";
import { Button } from "@swc-react/button";
import { DocumentSandboxApi } from "../../models/DocumentSandboxApi";
import { Caption } from "../../models/Caption";
import { GoogleCloudService } from "../../services/GoogleCloudService";
import "./CaptionsPanel.css";

interface CaptionsPanelProps {
    sandboxProxy: DocumentSandboxApi;
}

export const CaptionsPanel: React.FC<CaptionsPanelProps> = ({ sandboxProxy }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [captions, setCaptions] = useState<Caption[]>([]);
    const [apiKey, setApiKey] = useState<string>("");

    const handleGenerateCaptions = async () => {
        setIsGenerating(true);
        setError(null);

        try {
            // TODO: Extract audio from video in document
            // For now, this is a placeholder that demonstrates the flow
            // In production, we'd need to:
            // 1. Get video element from document
            // 2. Extract audio track
            // 3. Convert to Blob
            
            // Placeholder: Create a mock audio blob for demonstration
            // In real implementation, extract from document video
            alert("Video audio extraction not yet implemented. This would extract audio from the video in your document.");
            
            // Simulated flow (replace with actual audio extraction):
            // const audioBlob = await extractAudioFromVideo();
            // const googleService = new GoogleCloudService();
            // const generatedCaptions = await googleService.transcribeAudio(audioBlob);
            // setCaptions(generatedCaptions);
            // sandboxProxy.addCaptionsToDocument(generatedCaptions);
            
            // For now, show mock captions
            const mockCaptions: Caption[] = [
                { text: "Welcome to EqualMedia", startTime: 0, endTime: 2 },
                { text: "Making content accessible for everyone", startTime: 2, endTime: 5 },
            ];
            setCaptions(mockCaptions);
            sandboxProxy.addCaptionsToDocument(mockCaptions);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate captions");
            console.error("Error generating captions:", err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleApiKeyChange = (value: string) => {
        setApiKey(value);
        // In production, save to config
        if (value) {
            const { setApiConfig } = require("../../utils/config");
            setApiConfig({ googleCloudApiKey: value });
        }
    };

    return (
        <div className="captions-panel">
            <h3 className="panel-title">Auto-Generated Captions</h3>
            <p className="panel-description">
                Generate captions for video content to improve accessibility.
            </p>

            <div className="api-key-section">
                <input
                    type="text"
                    placeholder="Enter Google Cloud API Key (optional)"
                    value={apiKey}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    className="api-key-input"
                />
            </div>

            <Button
                size="m"
                variant="primary"
                onClick={handleGenerateCaptions}
                disabled={isGenerating}
                className="generate-button"
            >
                {isGenerating ? "Generating Captions..." : "Generate Captions"}
            </Button>

            {error && <div className="error-message">{error}</div>}

            {captions.length > 0 && (
                <div className="captions-preview">
                    <h4>Generated Captions:</h4>
                    <ul className="captions-list">
                        {captions.map((caption, index) => (
                            <li key={index} className="caption-item">
                                <span className="caption-time">
                                    {formatTime(caption.startTime)} - {formatTime(caption.endTime)}
                                </span>
                                <span className="caption-text">{caption.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

