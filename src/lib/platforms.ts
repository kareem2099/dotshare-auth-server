export interface PlatformConfig {
    name: string;
    icon: string;
    description?: string;
    scopes: string[];
    authUrl: string;
    envKey: string;
    titleGradientTo?: string;
}

export const PLATFORMS: Record<string, PlatformConfig> = {
    linkedin: {
        name: 'LinkedIn',
        icon: 'in',
        description: 'Professional network',
        scopes: ['openid', 'profile', 'email', 'w_member_social'],
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
        envKey: 'NEXT_PUBLIC_LINKEDIN_CLIENT_ID',
        titleGradientTo: '#4da3ff',
    },
    x: {
        name: 'X (Twitter)',
        icon: '𝕏',
        description: 'Public discourse',
        scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
        authUrl: 'https://twitter.com/i/oauth2/authorize',
        envKey: 'NEXT_PUBLIC_X_CLIENT_ID',
    },
    facebook: {
        name: 'Facebook',
        icon: 'f',
        description: 'Social network',
        scopes: ['pages_manage_posts', 'pages_read_engagement', 'publish_to_groups'],
        authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
        envKey: 'NEXT_PUBLIC_FACEBOOK_APP_ID',
        titleGradientTo: '#42a5f5',
    },
    reddit: {
        name: 'Reddit',
        icon: 'r/',
        description: 'Discussion forums',
        scopes: ['submit', 'read', 'identity'],
        authUrl: 'https://www.reddit.com/api/v1/authorize',
        envKey: 'NEXT_PUBLIC_REDDIT_CLIENT_ID',
        titleGradientTo: '#ff7043',
    },
};

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export type PlatformKey = 'linkedin' | 'x' | 'facebook' | 'reddit';

export function getRedirectUri(platform: string): string {
    return `${BASE_URL}/auth/${platform}/callback`;
}