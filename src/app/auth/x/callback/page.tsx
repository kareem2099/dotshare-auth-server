'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { t } from '@/lib/tokens';

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setStatus('error');
        setErrorMsg(searchParams.get('error_description') || errorParam);
        return;
      }
      if (!code || !state) {
        setStatus('error');
        setErrorMsg('No authorization code received');
        return;
      }

      // CSRF validation
      const storedState = sessionStorage.getItem('x_state');
      if (state !== storedState) {
        setStatus('error');
        setErrorMsg('State mismatch — possible CSRF attack. Please try again.');
        return;
      }

      // codeVerifier is not a secret — it's part of PKCE flow
      const codeVerifier = sessionStorage.getItem('x_code_verifier');
      if (!codeVerifier) {
        setStatus('error');
        setErrorMsg('Session expired. Please start over.');
        return;
      }

      sessionStorage.removeItem('x_state');
      sessionStorage.removeItem('x_code_verifier');

      try {
        const res = await fetch('/api/auth/x', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            codeVerifier,
            redirectUri: `${window.location.origin}/auth/x/callback`,
          }),
        });

        const data = await res.json();

        if (data.access_token) {
          setStatus('success');

          // Auto redirect to VS Code with both tokens
          setTimeout(() => {
            const params = new URLSearchParams({
              platform: 'x',
              access_token: data.access_token,
              ...(data.refresh_token && { refresh_token: data.refresh_token }),
            });
            window.location.href = `vscode://freerave.dotshare/auth?${params.toString()}`;
          }, 1500);

        } else {
          setStatus('error');
          setErrorMsg(data.error || 'Failed to get access token');
        }
      } catch {
        setStatus('error');
        setErrorMsg('Network error occurred');
      }
    }
    handleCallback();
  }, [searchParams]);

  const bgGradient =
    status === 'success' ? 'var(--gradient-success)' :
    status === 'error'   ? 'var(--gradient-error)'   :
                           'var(--gradient-x)';

  return (
    <main style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '40px 24px',
      background: bgGradient,
    }}>
      <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>

        {/* Loading */}
        {status === 'loading' && (
          <div style={{ animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards', opacity: 0 }}>
            <div style={{
              width: 48, height: 48,
              border: `1px solid ${t.borderLight}`,
              borderTop: `1px solid ${t.gold}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 32px',
            }} />
            <h2 style={{ fontFamily: t.serif, fontSize: 32, fontWeight: 300, color: t.text, marginBottom: 8 }}>
              Authenticating
            </h2>
            <p style={{ fontFamily: t.mono, fontSize: 11, color: t.textDim, letterSpacing: '0.15em' }}>
              Exchanging authorization code...
            </p>
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <div style={{ animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards', opacity: 0 }}>
            <div style={{
              width: 48, height: 48,
              border: `1px solid ${t.successBorderDim}`, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 32px', color: t.success, fontSize: 20,
            }}>✓</div>
            <h2 style={{ fontFamily: t.serif, fontSize: 36, fontWeight: 300, color: t.text, marginBottom: 8 }}>
              Connected
            </h2>
            <p style={{ fontFamily: t.mono, fontSize: 11, color: t.textDim, letterSpacing: '0.15em', marginBottom: 32 }}>
              X authenticated successfully
            </p>
            <div style={{
              padding: '16px', background: t.successBg, border: `1px solid ${t.successBorder}`,
              borderRadius: 2, color: t.success, fontFamily: t.mono, fontSize: 11,
              letterSpacing: '0.1em', marginBottom: 32,
            }}>
              Redirecting back to VS Code...
            </div>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div style={{ animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards', opacity: 0 }}>
            <div style={{
              width: 48, height: 48,
              border: `1px solid ${t.errorBorderDim}`, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 32px', color: t.error, fontSize: 20,
            }}>✕</div>
            <h2 style={{ fontFamily: t.serif, fontSize: 36, fontWeight: 300, color: t.text, marginBottom: 8 }}>
              Failed
            </h2>
            <p style={{ fontFamily: t.mono, fontSize: 11, color: t.error, letterSpacing: '0.1em', marginBottom: 32, lineHeight: 1.6 }}>
              {errorMsg}
            </p>
            <button onClick={() => router.push('/auth/x')} style={{
              padding: '14px 32px', background: t.surface,
              border: `1px solid ${t.border}`, borderRadius: 2, color: t.text,
              fontFamily: t.mono, fontSize: 11,
              letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer',
            }}>
              Try Again
            </button>
          </div>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </main>
  );
}

export default function XCallback() {
  return (
    <Suspense>
      <CallbackContent />
    </Suspense>
  );
}