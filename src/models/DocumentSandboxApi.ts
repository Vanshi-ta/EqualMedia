// This interface declares all the APIs that the document sandbox runtime ( i.e. code.ts ) exposes to the UI/iframe runtime
import { Caption } from "./Caption";
import { AudioNarration } from "./AudioNarration";
import { SignLanguageAvatar, SignLanguageAvatarConfig } from "./SignLanguageAvatar";

export interface DocumentSandboxApi {
    createRectangle(): void;
    
    // Captions methods
    addCaptionsToDocument(captions: Caption[]): void;
    extractTextFromDocument(): Promise<string[]>;
    
    // Audio narration methods
    addAudioNarrationToDocument(narration: AudioNarration): void;
    
    // Sign language avatar methods
    addSignLanguageAvatarToDocument(avatar: SignLanguageAvatar, config?: SignLanguageAvatarConfig): void;
}
