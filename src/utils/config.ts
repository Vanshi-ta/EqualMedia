// Configuration for API keys and service endpoints
// In production, these should be stored securely (environment variables, user-provided, etc.)

export interface ApiConfig {
    googleCloudApiKey?: string;
    googleCloudProjectId?: string;
}

let apiConfig: ApiConfig = {};

export function getApiConfig(): ApiConfig {
    return apiConfig;
}

export function setApiConfig(config: ApiConfig): void {
    apiConfig = { ...apiConfig, ...config };
}

// Default configuration (can be overridden)
// TODO: In production, load from environment variables or user settings
export const DEFAULT_CONFIG: ApiConfig = {
    googleCloudApiKey: undefined, // User should provide their own API key
    googleCloudProjectId: undefined,
};

