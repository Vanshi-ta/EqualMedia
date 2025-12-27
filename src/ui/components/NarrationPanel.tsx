import React, { useState } from "react";
import { Button } from "@swc-react/button";
import { DocumentSandboxApi } from "../../models/DocumentSandboxApi";
import { AudioNarration } from "../../models/AudioNarration";
import { GoogleCloudService } from "../../services/GoogleCloudService";
import "./NarrationPanel.css";

interface NarrationPanelProps {
    sandboxProxy: DocumentSandboxApi;
}

export const NarrationPanel: React.FC<NarrationPanelProps> = ({ sandboxProxy }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [narration, setNarration] = useState<AudioNarration | null>(null);
    const [sourceText, setSourceText] = useState<string>("");

    const handleExtractText = async () => {
        try {
            const extractedTexts = await sandboxProxy.extractTextFromDocument();
            const combinedText = extractedTexts.join(" ");
            setSourceText(combinedText);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to extract text from document");
            console.error("Error extracting text:", err);
        }
    };

    const handleGenerateNarration = async () => {
        if (!sourceText.trim()) {
            setError("Please extract text from document or enter text manually");
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            const googleService = new GoogleCloudService();
            const generatedNarration = await googleService.synthesizeSpeech(sourceText);
            setNarration(generatedNarration);
            sandboxProxy.addAudioNarrationToDocument(generatedNarration);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate narration");
            console.error("Error generating narration:", err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="narration-panel">
            <h3 className="panel-title">Text-to-Audio Narration</h3>
            <p className="panel-description">
                Convert text content into audio narration for accessibility.
            </p>

            <Button
                size="m"
                variant="secondary"
                onClick={handleExtractText}
                className="extract-button"
            >
                Extract Text from Document
            </Button>

            <div className="text-input-section">
                <label htmlFor="narration-text">Text to narrate:</label>
                <textarea
                    id="narration-text"
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    placeholder="Enter text or extract from document..."
                    rows={5}
                    className="text-input"
                />
            </div>

            <Button
                size="m"
                variant="primary"
                onClick={handleGenerateNarration}
                disabled={isGenerating || !sourceText.trim()}
                className="generate-button"
            >
                {isGenerating ? "Generating Narration..." : "Generate Audio Narration"}
            </Button>

            {error && <div className="error-message">{error}</div>}

            {narration && (
                <div className="narration-preview">
                    <h4>Narration Generated:</h4>
                    <p className="narration-info">
                        <strong>Duration:</strong> {narration.duration.toFixed(1)} seconds
                    </p>
                    <p className="narration-info">
                        <strong>Source Text:</strong> {narration.sourceText.substring(0, 100)}
                        {narration.sourceText.length > 100 ? "..." : ""}
                    </p>
                    <audio controls src={URL.createObjectURL(narration.audioBlob)} className="audio-player" />
                </div>
            )}
        </div>
    );
};

