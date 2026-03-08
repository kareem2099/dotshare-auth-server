export interface PlatformConfig {
    name: string;
    icon: string;
    scopes: string[];
    authUrl: string;
}

export const PLATFORMS: Record<string, PlatformConfig> = {
    linkedin: {
        name: 'LinkedIn',
        icon: 'in',
        scopes: ['openid', 'profile', 'email', 'w_member_social'],
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    },
    x: {
        name: 'X (Twitter)',
        icon: '𝕏',
        scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
        authUrl: 'https://twitter.com/i/oauth2/authorize',
    },
    facebook: {
        name: 'Facebook',
        icon: 'f',
        scopes: ['pages_manage_posts', 'pages_read_engagement', 'publish_to_groups'],
        authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    },
    reddit: {
        name: 'Reddit',
        icon: 'r/',
        scopes: ['submit', 'read', 'identity'],
        authUrl: 'https://www.reddit.com/api/v1/authorize',
    },
};

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export function getRedirectUri(platform: string): string {
    return `${BASE_URL}/auth/${platform}/callback`;
}