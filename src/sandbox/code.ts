import addOnSandboxSdk from "add-on-sdk-document-sandbox";
import { editor } from "express-document-sdk";
import { DocumentSandboxApi } from "../models/DocumentSandboxApi";
import { Caption } from "../models/Caption";
import { AudioNarration } from "../models/AudioNarration";
import { SignLanguageAvatar, SignLanguageAvatarConfig } from "../models/SignLanguageAvatar";

// Get the document sandbox runtime.
const { runtime } = addOnSandboxSdk.instance;

// Store state for tracking added features
let addedCaptions: Caption[] = [];
let addedNarration: AudioNarration | null = null;
let addedAvatar: SignLanguageAvatar | null = null;

function start(): void {
    // APIs to be exposed to the UI runtime
    // i.e., to the `App.tsx` file of this add-on.
    const sandboxApi: DocumentSandboxApi = {
        createRectangle: () => {
            const rectangle = editor.createRectangle();

            // Define rectangle dimensions.
            rectangle.width = 240;
            rectangle.height = 180;

            // Define rectangle position.
            rectangle.translation = { x: 10, y: 10 };

            // Define rectangle color.
            const color = { red: 0.32, green: 0.34, blue: 0.89, alpha: 1 };

            // Fill the rectangle with the color.
            const rectangleFill = editor.makeColorFill(color);
            rectangle.fill = rectangleFill;

            // Add the rectangle to the document.
            const insertionParent = editor.context.insertionParent;
            insertionParent.children.append(rectangle);
        },

        addCaptionsToDocument: (captions: Caption[]) => {
            try {
                addedCaptions = captions;
                const insertionParent = editor.context.insertionParent;

                // Create text elements for each caption
                // Note: In a real implementation, these would be positioned and timed with video
                captions.forEach((caption, index) => {
                    try {
                        // Create a text element for the caption
                        const textElement = editor.createText();
                        textElement.text = caption.text;

                        // Position the caption
                        textElement.translation = { x: 10, y: 50 + index * 30 };

                        // Add caption time as metadata in the text
                        textElement.text = `[${formatTime(caption.startTime)}-${formatTime(caption.endTime)}] ${caption.text}`;

                        insertionParent.children.append(textElement);
                    } catch (error) {
                        console.error(`Error adding caption ${index}:`, error);
                    }
                });

                console.log(`Added ${captions.length} captions to document`);
            } catch (error) {
                console.error("Error adding captions to document:", error);
                throw error;
            }
        },

        async extractTextFromDocument(): Promise<string[]> {
            try {
                const textElements: string[] = [];
                const insertionParent = editor.context.insertionParent;

                // Traverse the document to find text elements
                // Note: This is a simplified implementation
                // In production, you'd need to properly traverse the document tree
                if (insertionParent && insertionParent.children) {
                    // Try to access children and extract text
                    // The exact API depends on the express-document-sdk capabilities
                    // For now, return empty array as placeholder
                    console.log("Extracting text from document (simplified implementation)");
                }

                // Fallback: return empty array
                // TODO: Implement proper text extraction based on SDK capabilities
                return textElements;
            } catch (error) {
                console.error("Error extracting text from document:", error);
                return [];
            }
        },

        addAudioNarrationToDocument: (narration: AudioNarration) => {
            try {
                addedNarration = narration;

                // Create a visual indicator for the audio narration
                // Note: Actual audio insertion depends on SDK capabilities
                const insertionParent = editor.context.insertionParent;

                const indicator = editor.createRectangle();
                indicator.width = 200;
                indicator.height = 50;
                indicator.translation = { x: 10, y: 100 };

                // Style as audio indicator
                const audioColor = { red: 0.2, green: 0.6, blue: 0.8, alpha: 1 };
                const audioFill = editor.makeColorFill(audioColor);
                indicator.fill = audioFill;

                insertionParent.children.append(indicator);

                // Add text label
                try {
                    const label = editor.createText();
                    label.text = `Audio Narration (${narration.duration.toFixed(1)}s)`;
                    label.translation = { x: 15, y: 115 };

                    insertionParent.children.append(label);
                } catch (error) {
                    console.error("Error adding narration label:", error);
                }

                console.log("Added audio narration to document");
            } catch (error) {
                console.error("Error adding audio narration to document:", error);
                throw error;
            }
        },

        addSignLanguageAvatarToDocument: (avatar: SignLanguageAvatar, config?: SignLanguageAvatarConfig) => {
            try {
                addedAvatar = avatar;
                const insertionParent = editor.context.insertionParent;

                // Create a placeholder rectangle to represent the avatar
                const avatarPlaceholder = editor.createRectangle();
                
                const position = config?.position || { x: 10, y: 200 };
                const size = config?.size || { width: 200, height: 200 };

                avatarPlaceholder.width = size.width;
                avatarPlaceholder.height = size.height;
                avatarPlaceholder.translation = position;

                // Style as avatar placeholder
                const avatarColor = { red: 0.9, green: 0.7, blue: 0.4, alpha: 1 }; // Orange/brown tone
                const avatarFill = editor.makeColorFill(avatarColor);
                avatarPlaceholder.fill = avatarFill;

                insertionParent.children.append(avatarPlaceholder);

                // Add label indicating this is a placeholder
                try {
                    const label = editor.createText();
                    label.text = "Sign Language Avatar (Placeholder)";
                    label.translation = { x: position.x + 10, y: position.y + size.height / 2 - 10 };

                    insertionParent.children.append(label);
                } catch (error) {
                    console.error("Error adding avatar label:", error);
                }

                console.log("Added sign language avatar placeholder to document");
            } catch (error) {
                console.error("Error adding sign language avatar to document:", error);
                throw error;
            }
        },
    };

    // Expose `sandboxApi` to the UI runtime.
    runtime.exposeApi(sandboxApi);
}

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

start();
