export interface SignLanguageAvatar {
    avatarUrl?: string; // For placeholder/future implementation
    sourceText: string;
    isPlaceholder: boolean;
}

export interface SignLanguageAvatarConfig {
    position?: { x: number; y: number };
    size?: { width: number; height: number };
}

