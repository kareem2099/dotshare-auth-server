import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export type CallbackStatus = 'loading' | 'success' | 'error';

export type PlatformKey = 'facebook' | 'linkedin' | 'x' | 'reddit';

// Platforms that send a `state` param for CSRF validation
const STATEFUL_PLATFORMS: PlatformKey[] = ['x', 'reddit'];

// Platforms that return a refresh_token
const REFRESHABLE_PLATFORMS: PlatformKey[] = ['x', 'reddit'];

interface UseOAuthCallbackResult {
  status: CallbackStatus;
  errorMsg: string;
}

export function useOAuthCallback(platform: PlatformKey): UseOAuthCallbackResult {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<CallbackStatus>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setStatus('error');
        setErrorMsg(
          errorParam === 'access_denied'
            ? 'Access was denied by the user.'
            : searchParams.get('error_description') || errorParam
        );
        return;
      }

      const state = searchParams.get('state');
      const needsState = STATEFUL_PLATFORMS.includes(platform);

      if (!code || (needsState && !state)) {
        setStatus('error');
        setErrorMsg('No authorization code received');
        return;
      }

      // CSRF validation
      if (needsState) {
        const storedState = sessionStorage.getItem(`${platform}_state`);
        if (state !== storedState) {
          setStatus('error');
          setErrorMsg('State mismatch — possible CSRF attack. Please try again.');
          return;
        }
        sessionStorage.removeItem(`${platform}_state`);
      }

      // PKCE — X only
      let codeVerifier: string | null = null;
      if (platform === 'x') {
        codeVerifier = sessionStorage.getItem('x_code_verifier');
        if (!codeVerifier) {
          setStatus('error');
          setErrorMsg('Session expired. Please start over.');
          return;
        }
        sessionStorage.removeItem('x_code_verifier');
      }

      try {
        const res = await fetch(`/api/auth/${platform}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            redirectUri: `${window.location.origin}/auth/${platform}/callback`,
            ...(codeVerifier && { codeVerifier }),
          }),
        });

        const data = await res.json();

        if (!data.access_token) {
          setStatus('error');
          setErrorMsg(
            data.error?.message || data.error_description || data.error || 'Failed to get access token'
          );
          return;
        }

        setStatus('success');

        setTimeout(() => {
          const params = new URLSearchParams({
            platform,
            access_token: data.access_token,
            ...(REFRESHABLE_PLATFORMS.includes(platform) && data.refresh_token
              ? { refresh_token: data.refresh_token }
              : {}),
            // Absorb all enriched metadata for proactive client-side refresh
            ...(data.expires_in && { expires_in: String(data.expires_in) }),
            ...(data.expires_at && { expires_at: String(data.expires_at) }),
            ...(data.expires_at_iso && { expires_at_iso: String(data.expires_at_iso) }),
            ...(data.should_refresh_soon !== undefined && { 
              should_refresh_soon: String(data.should_refresh_soon) 
            }),
            ...(data.warning && { warning: String(data.warning) }),
          });
          window.location.href = `vscode://freerave.dotshare/auth?${params.toString()}`;
        }, 1500);

      } catch {
        setStatus('error');
        setErrorMsg('Network error occurred');
      }
    }

    handleCallback();
  }, [searchParams, platform]);

  return { status, errorMsg };
}