import React, { useState } from "react";
import { Button } from "@swc-react/button";
import { DocumentSandboxApi } from "../../models/DocumentSandboxApi";
import { SignLanguageAvatar, SignLanguageAvatarConfig } from "../../models/SignLanguageAvatar";
import "./AvatarPanel.css";

interface AvatarPanelProps {
    sandboxProxy: DocumentSandboxApi;
}

export const AvatarPanel: React.FC<AvatarPanelProps> = ({ sandboxProxy }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sourceText, setSourceText] = useState<string>("");
    const [avatarAdded, setAvatarAdded] = useState(false);

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

    const handleAddAvatar = async () => {
        if (!sourceText.trim()) {
            setError("Please extract text from document or enter text manually");
            return;
        }

        setIsAdding(true);
        setError(null);

        try {
            // Create placeholder avatar
            const avatar: SignLanguageAvatar = {
                sourceText: sourceText,
                isPlaceholder: true,
            };

            const config: SignLanguageAvatarConfig = {
                position: { x: 10, y: 10 },
                size: { width: 200, height: 200 },
            };

            sandboxProxy.addSignLanguageAvatarToDocument(avatar, config);
            setAvatarAdded(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add sign language avatar");
            console.error("Error adding avatar:", err);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="avatar-panel">
            <h3 className="panel-title">Sign-Language Avatar Overlay</h3>
            <p className="panel-description">
                Add a sign-language avatar overlay to your content (placeholder implementation).
            </p>

            <div className="placeholder-notice">
                <strong>Note:</strong> This is a placeholder implementation. Full sign-language avatar
                generation will be available in a future update.
            </div>

            <Button
                size="m"
                variant="secondary"
                onClick={handleExtractText}
                className="extract-button"
            >
                Extract Text from Document
            </Button>

            <div className="text-input-section">
                <label htmlFor="avatar-text">Text for sign language interpretation:</label>
                <textarea
                    id="avatar-text"
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
                onClick={handleAddAvatar}
                disabled={isAdding || !sourceText.trim()}
                className="generate-button"
            >
                {isAdding ? "Adding Avatar..." : "Add Sign Language Avatar"}
            </Button>

            {error && <div className="error-message">{error}</div>}

            {avatarAdded && (
                <div className="success-message">
                    Sign language avatar placeholder has been added to the document. Full implementation coming soon!
                </div>
            )}
        </div>
    );
};

