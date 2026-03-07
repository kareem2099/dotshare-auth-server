'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { t } from '@/lib/tokens';

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState<'access' | 'refresh' | null>(null);

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

      const storedState = sessionStorage.getItem('x_state');
      const codeVerifier = sessionStorage.getItem('x_code_verifier');
      const clientId = sessionStorage.getItem('x_client_id');

      if (state !== storedState) {
        setStatus('error');
        setErrorMsg('State mismatch — possible CSRF attack. Please try again.');
        return;
      }

      if (!codeVerifier || !clientId) {
        setStatus('error');
        setErrorMsg('Session expired. Please start over.');
        return;
      }

      try {
        const res = await fetch('/api/auth/x', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            codeVerifier,
            clientId,
            redirectUri: `${window.location.origin}/auth/x/callback`,
          }),
        });

        const data = await res.json();

        if (data.access_token) {
          setAccessToken(data.access_token);
          setRefreshToken(data.refresh_token || '');
          setStatus('success');
          sessionStorage.removeItem('x_code_verifier');
          sessionStorage.removeItem('x_state');
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

  const copy = async (type: 'access' | 'refresh') => {
    const val = type === 'access' ? accessToken : refreshToken;
    await navigator.clipboard.writeText(val);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      background: status === 'success'
        ? 'radial-gradient(ellipse 80% 60% at 50% -20%, #0d1a0d 0%, #080808 60%)'
        : status === 'error'
          ? 'radial-gradient(ellipse 80% 60% at 50% -20%, #1a0808 0%, #080808 60%)'
          : 'radial-gradient(ellipse 80% 60% at 50% -20%, #111 0%, #080808 60%)',
    }}>
      <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>

        {status === 'loading' && (
          <div style={{ animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards', opacity: 0 }}>
            <div style={{
              width: 48, height: 48,
              border: '1px solid #2a2a2a',
              borderTop: '1px solid #c9a84c',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 32px',
            }} />
            <h2 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 32, fontWeight: 300, color: t.text, marginBottom: 8,
            }}>Authenticating</h2>
            <p style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: 11, color: t.textDim, letterSpacing: '0.15em',
            }}>Exchanging authorization code...</p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards', opacity: 0 }}>
            <div style={{
              width: 48, height: 48,
              border: `1px solid ${t.successBorderDim}`, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 32px', color: t.success, fontSize: 20,
            }}>✓</div>

            <h2 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 36, fontWeight: 300, color: t.text, marginBottom: 8,
            }}>Connected</h2>
            <p style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: 11, color: t.textDim, letterSpacing: '0.15em', marginBottom: 32,
            }}>X authenticated successfully</p>

            {/* Access Token */}
            {[
              { label: 'Access Token', value: accessToken, type: 'access' as const },
              ...(refreshToken ? [{ label: 'Refresh Token', value: refreshToken, type: 'refresh' as const }] : []),
            ].map(({ label, value, type }) => (
              <div key={type} style={{ marginBottom: 12 }}>
                <div style={{
                  background: t.surface, border: '1px solid #1f1f1f',
                  borderRadius: 2, padding: 20, marginBottom: 8, textAlign: 'left',
                }}>
                  <div style={{
                    fontFamily: 'DM Mono, monospace', fontSize: 10, color: t.textDim,
                    letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10,
                  }}>{label}</div>
                  <div style={{
                    fontFamily: 'DM Mono, monospace', fontSize: 11,
                    color: t.gold, wordBreak: 'break-all', lineHeight: 1.6,
                  }}>
                    {value.substring(0, 40)}...
                  </div>
                </div>
                <button onClick={() => copy(type)} style={{
                  width: '100%', padding: '12px 24px',
                  background: copied === type ? t.successBg : t.surface,
                  border: `1px solid ${copied === type ? t.successBorder : t.border}`,
                  borderRadius: 2,
                  color: copied === type ? t.success : t.text,
                  fontFamily: 'DM Mono, monospace', fontSize: 11,
                  letterSpacing: '0.2em', textTransform: 'uppercase' as const,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}>
                  {copied === type ? `✓ Copied` : `Copy ${label}`}
                </button>
              </div>
            ))}

            <button onClick={() => router.push('/')} style={{
              marginTop: 20,
              fontFamily: 'DM Mono, monospace', fontSize: 10,
              color: t.textDim, letterSpacing: '0.2em',
              textTransform: 'uppercase' as const,
              background: 'none', border: 'none',
              cursor: 'pointer', padding: 0,
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = t.gold)}
              onMouseLeave={e => (e.currentTarget.style.color = t.textDim)}
            >
              ← Back to platforms
            </button>
          </div>
        )}

        {status === 'error' && (
          <div style={{ animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards', opacity: 0 }}>
            <div style={{
              width: 48, height: 48,
              border: `1px solid ${t.errorBorderDim}`, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 32px', color: t.error, fontSize: 20,
            }}>✕</div>

            <h2 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 36, fontWeight: 300, color: t.text, marginBottom: 8,
            }}>Failed</h2>
            <p style={{
              fontFamily: 'DM Mono, monospace', fontSize: 11, color: t.error,
              letterSpacing: '0.1em', marginBottom: 32, lineHeight: 1.6,
            }}>{errorMsg}</p>

            <button onClick={() => router.push('/auth/x')} style={{
              padding: '14px 32px', background: t.surface,
              border: '1px solid #1f1f1f', borderRadius: 2,
              color: t.text, fontFamily: 'DM Mono, monospace',
              fontSize: 11, letterSpacing: '0.2em',
              textTransform: 'uppercase' as const, cursor: 'pointer',
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