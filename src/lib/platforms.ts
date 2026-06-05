export interface PlatformConfig {
    name: string;
    icon: string;
    description?: string;
    scopes: string[];
    authUrl: string;
    clientId?: string;
    titleGradientTo?: string;
    /**
     * Extra query-string parameters to append to the OAuth authorisation URL.
     * Used for platform-specific requirements (e.g. Reddit's `duration=permanent`
     * which controls whether a refresh_token is issued at all).
     */
    authParams?: Record<string, string>;
}

export const PLATFORMS: Record<string, PlatformConfig> = {
    linkedin: {
        name: 'LinkedIn',
        icon: 'in',
        description: 'Professional network',
        scopes: ['openid', 'profile', 'email', 'w_member_social'],
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
        clientId: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID,
        titleGradientTo: '#4da3ff',
    },
    x: {
        name: 'X (Twitter)',
        icon: '𝕏',
        description: 'Public discourse',
        scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
        authUrl: 'https://twitter.com/i/oauth2/authorize',
        clientId: process.env.NEXT_PUBLIC_X_CLIENT_ID,
    },


};

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export type PlatformKey = 'linkedin' | 'x';

export function getRedirectUri(platform: string): string {
    return `${BASE_URL}/auth/${platform}/callback`;
}