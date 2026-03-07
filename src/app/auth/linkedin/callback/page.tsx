'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { t } from '@/lib/tokens';

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [token, setToken] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    // جمع كل الـ setState في async function
    async function handleCallback() {
      if (errorParam) {
        setStatus('error');
        setErrorMsg(searchParams.get('error_description') || errorParam);
        return;
      }

      if (!code) {
        setStatus('error');
        setErrorMsg('No authorization code received');
        return;
      }

      const clientId = sessionStorage.getItem('li_client_id');
      const clientSecret = sessionStorage.getItem('li_client_secret');

      if (!clientId || !clientSecret) {
        setStatus('error');
        setErrorMsg('Session expired. Please start over.');
        return;
      }

      try {
        const res = await fetch('/api/auth/linkedin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            clientId,
            clientSecret,
            redirectUri: `${window.location.origin}/auth/linkedin/callback`,
          }),
        });

        const data = await res.json();

        if (data.access_token) {
          setToken(data.access_token);
          setStatus('success');
          sessionStorage.removeItem('li_client_secret');
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

  const copyToken = async () => {
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      background: status === 'success'
        ? 'radial-gradient(ellipse 80% 60% at 50% -20%, #0a2818 0%, #080808 60%)'
        : status === 'error'
          ? 'radial-gradient(ellipse 80% 60% at 50% -20%, #280a0a 0%, #080808 60%)'
          : 'radial-gradient(ellipse 80% 60% at 50% -20%, #1a1508 0%, #080808 60%)',
    }}>
      <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>

        {/* Loading */}
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

        {/* Success */}
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
            }}>LinkedIn authenticated successfully</p>

            <div style={{
              background: t.surface, border: '1px solid #1f1f1f',
              borderRadius: 2, padding: 20, marginBottom: 12, textAlign: 'left',
            }}>
              <div style={{
                fontFamily: 'DM Mono, monospace', fontSize: 10, color: t.textDim,
                letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10,
              }}>Access Token</div>
              <div style={{
                fontFamily: 'DM Mono, monospace', fontSize: 11,
                color: t.gold, wordBreak: 'break-all', lineHeight: 1.6,
              }}>
                {token.substring(0, 40)}...
              </div>
            </div>

            <button onClick={copyToken} style={{
              width: '100%', padding: '14px 24px',
              background: copied ? t.successBg : t.surface,
              border: `1px solid ${copied ? t.successBorder : t.border}`,
              borderRadius: 2, color: copied ? t.success : t.text,
              fontFamily: 'DM Mono, monospace', fontSize: 11,
              letterSpacing: '0.2em', textTransform: 'uppercase' as const,
              cursor: 'pointer', transition: 'all 0.2s', marginBottom: 32,
            }}>
              {copied ? '✓ Copied to clipboard' : 'Copy Access Token'}
            </button>

            <button onClick={() => router.push('/')} style={{
              fontFamily: 'DM Mono, monospace', fontSize: 10,
              color: t.textDim, letterSpacing: '0.2em',
              textDecoration: 'none', textTransform: 'uppercase' as const,
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 0, display: 'inline'
            }}>
              ← Back to platforms
            </button>
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

            <h2 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 36, fontWeight: 300, color: t.text, marginBottom: 8,
            }}>Failed</h2>
            <p style={{
              fontFamily: 'DM Mono, monospace', fontSize: 11, color: t.error,
              letterSpacing: '0.1em', marginBottom: 32, lineHeight: 1.6,
            }}>{errorMsg}</p>

            <button onClick={() => router.push('/auth/linkedin')} style={{
              display: 'inline-block', padding: '14px 32px',
              background: t.surface, border: '1px solid #1f1f1f',
              borderRadius: 2, color: t.text,
              fontFamily: 'DM Mono, monospace', fontSize: 11,
              letterSpacing: '0.2em', cursor: 'pointer',
              textTransform: 'uppercase' as const,
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

export default function LinkedInCallback() {
  return (
    <Suspense>
      <CallbackContent />
    </Suspense>
  );
}