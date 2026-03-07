'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { t } from '@/lib/tokens';

function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function RedditAuth() {
  const router = useRouter();
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const p = t.platform('reddit');

  const handleAuth = () => {
    if (!clientId.trim() || !clientSecret.trim()) {
      setError('Please enter both Client ID and Client Secret');
      return;
    }

    setLoading(true);
    setError('');

    const state = generateState();
    sessionStorage.setItem('reddit_client_id', clientId.trim());
    sessionStorage.setItem('reddit_client_secret', clientSecret.trim());
    sessionStorage.setItem('reddit_state', state);

    const authUrl = new URL('https://www.reddit.com/api/v1/authorize');
    authUrl.searchParams.set('client_id', clientId.trim());
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('redirect_uri', `${window.location.origin}/auth/reddit/callback`);
    authUrl.searchParams.set('duration', 'permanent');
    authUrl.searchParams.set('scope', 'submit read identity');

    window.location.href = authUrl.toString();
  };

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      background: 'radial-gradient(ellipse 80% 60% at 50% -20%, #1a0d00 0%, #080808 60%)',
    }}>
      {[
        { top: 32, left: 32, borderTop: '1px solid #2a1a0a', borderLeft: '1px solid #2a1a0a' },
        { top: 32, right: 32, borderTop: '1px solid #2a1a0a', borderRight: '1px solid #2a1a0a' },
        { bottom: 32, left: 32, borderBottom: '1px solid #2a1a0a', borderLeft: '1px solid #2a1a0a' },
        { bottom: 32, right: 32, borderBottom: '1px solid #2a1a0a', borderRight: '1px solid #2a1a0a' },
      ].map((style, i) => (
        <div key={i} style={{ position: 'fixed', width: 48, height: 48, ...style }} />
      ))}

      <div style={{ width: '100%', maxWidth: 440 }}>

        <button
          onClick={() => router.push('/')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontFamily: 'DM Mono, monospace', fontSize: 10,
            color: t.textDim, letterSpacing: '0.2em', textTransform: 'uppercase',
            marginBottom: 48, background: 'none', border: 'none',
            cursor: 'pointer', padding: 0, transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = t.gold)}
          onMouseLeave={e => (e.currentTarget.style.color = t.textDim)}
        >
          ← Back
        </button>

        {/* Header */}
        <div style={{
          marginBottom: 48,
          animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
          opacity: 0,
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '8px 16px',
            background: p.bg,
            border: `1px solid ${p.border}`,
            borderRadius: 2, marginBottom: 24,
          }}>
            <div style={{
              width: 24, height: 24, background: p.color, borderRadius: 3,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontFamily: 'DM Mono, monospace', fontSize: 10, fontWeight: 700,
            }}>r/</div>
            <span style={{
              fontFamily: 'DM Mono, monospace', fontSize: 10,
              color: p.color, letterSpacing: '0.2em', textTransform: 'uppercase',
            }}>Reddit OAuth 2.0</span>
          </div>

          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(36px, 7vw, 52px)',
            fontWeight: 300, letterSpacing: '-0.02em',
            lineHeight: 1.1, color: t.text, marginBottom: 12,
          }}>
            Connect<br />
            <span style={{
              background: `linear-gradient(90deg, ${p.color}, #ff7043)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Reddit</span>
          </h1>

          <p style={{
            fontFamily: 'DM Mono, monospace', fontSize: 11,
            color: t.textDim, letterSpacing: '0.1em', lineHeight: 1.8,
          }}>
            Enter your app credentials from the<br />
            Reddit Developer Portal
          </p>
        </div>

        {/* Form */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 16,
          animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s forwards',
          opacity: 0,
        }}>
          {[
            { label: 'Client ID', value: clientId, setter: setClientId, type: 'text', placeholder: 'From Reddit App Preferences' },
            { label: 'Client Secret', value: clientSecret, setter: setClientSecret, type: 'password', placeholder: '••••••••••••••••' },
          ].map(({ label, value, setter, type, placeholder }) => (
            <div key={label}>
              <label style={{
                display: 'block', fontFamily: 'DM Mono, monospace',
                fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
                color: t.textDim, marginBottom: 8,
              }}>{label}</label>
              <input
                type={type}
                value={value}
                onChange={e => setter(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAuth()}
                placeholder={placeholder}
                style={{
                  width: '100%', padding: '14px 16px',
                  background: t.surface, border: '1px solid #1f1f1f',
                  borderRadius: 2, color: t.text,
                  fontFamily: 'DM Mono, monospace', fontSize: 13,
                  outline: 'none', transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = p.focus)}
                onBlur={e => (e.target.style.borderColor = t.border)}
              />
            </div>
          ))}

          <p style={{
            fontFamily: 'DM Mono, monospace', fontSize: 10,
            color: t.textDimmer, letterSpacing: '0.1em',
          }}>
            Processed locally · Never stored on any server
          </p>

          {error && (
            <div style={{
              padding: '12px 16px', background: t.errorBg,
              border: '1px solid #ff000030', borderRadius: 2,
              fontFamily: 'DM Mono, monospace', fontSize: 11,
              color: t.error, letterSpacing: '0.05em',
            }}>{error}</div>
          )}

          <button
            onClick={handleAuth}
            disabled={loading}
            style={{
              marginTop: 8, padding: '16px 24px',
              background: loading ? `${p.bg}` : p.color,
              border: `1px solid ${p.color}`, borderRadius: 2,
              color: loading ? `${p.color}80` : 'white',
              fontFamily: 'DM Mono, monospace', fontSize: 11,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 10,
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = p.hover; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = p.color; }}
          >
            {loading ? (
              <>
                <span style={{
                  width: 12, height: 12,
                  border: '1px solid #ff450060',
                  borderTop: '1px solid #ff4500',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  display: 'inline-block',
                }} />
                Redirecting...
              </>
            ) : 'Authenticate with Reddit →'}
          </button>
        </div>

        {/* Scopes */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          margin: '32px 0',
          animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s forwards',
          opacity: 0,
        }}>
          <div style={{ flex: 1, height: '1px', background: '#1a1a1a' }} />
          <span style={{
            fontFamily: 'DM Mono, monospace', fontSize: 10,
            color: t.textDimmest, letterSpacing: '0.2em',
          }}>Required Scopes</span>
          <div style={{ flex: 1, height: '1px', background: '#1a1a1a' }} />
        </div>

        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 8,
          animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.25s forwards',
          opacity: 0,
        }}>
          {['submit', 'read', 'identity'].map(scope => (
            <span key={scope} style={{
              padding: '4px 10px',
              background: p.bg, border: `1px solid ${p.border}`,
              borderRadius: 2, fontFamily: 'DM Mono, monospace',
              fontSize: 10, color: p.color, letterSpacing: '0.1em',
            }}>{scope}</span>
          ))}
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </main>
  );
}