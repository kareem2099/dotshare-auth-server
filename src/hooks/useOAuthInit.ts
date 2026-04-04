import { useState } from 'react';
import { PLATFORMS, PlatformKey } from '@/lib/platforms';

const PKCE_PLATFORMS: PlatformKey[] = ['x'];
const STATEFUL_PLATFORMS: PlatformKey[] = ['x', 'reddit'];

function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

interface UseOAuthInitResult {
  handleAuth: () => Promise<void>;
  loading: boolean;
  error: string;
}

export function useOAuthInit(platform: PlatformKey): UseOAuthInitResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    const config = PLATFORMS[platform];
    const clientId = process.env[config.envKey as keyof typeof process.env];

    if (!clientId) {
      setError(`Server configuration error: Missing ${config.envKey} in .env`);
      return;
    }

    setLoading(true);
    setError('');

    const authUrl = new URL(config.authUrl);
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', `${window.location.origin}/auth/${platform}/callback`);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', config.scopes.join(' '));

    // State (CSRF) — X and Reddit
    if (STATEFUL_PLATFORMS.includes(platform)) {
      const state = generateState();
      sessionStorage.setItem(`${platform}_state`, state);
      authUrl.searchParams.set('state', state);
    }

    // PKCE — X only
    if (PKCE_PLATFORMS.includes(platform)) {
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      sessionStorage.setItem('x_code_verifier', codeVerifier);
      authUrl.searchParams.set('code_challenge', codeChallenge);
      authUrl.searchParams.set('code_challenge_method', 'S256');
    }

    // Permanent refresh token — Reddit only
    if (platform === 'reddit') {
      authUrl.searchParams.set('duration', 'permanent');
    }

    window.location.href = authUrl.toString();
  };

  return { handleAuth, loading, error };
}