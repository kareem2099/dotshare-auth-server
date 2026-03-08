'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { t } from '@/lib/tokens';

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

function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function XAuth() {
  const router = useRouter();
  const [clientId, setClientId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const p = t.platform('x');

  const handleAuth = async () => {
    if (!clientId.trim()) {
      setError('Please enter your Client ID');
      return;
    }
    setLoading(true);
    setError('');
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateState();
    sessionStorage.setItem('x_code_verifier', codeVerifier);
    sessionStorage.setItem('x_state', state);
    sessionStorage.setItem('x_client_id', clientId.trim());
    const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', clientId.trim());
    authUrl.searchParams.set('redirect_uri', `${window.location.origin}/auth/x/callback`);
    authUrl.searchParams.set('scope', 'tweet.read tweet.write users.read offline.access');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    window.location.href = authUrl.toString();
  };

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      background: 'var(--gradient-x)',
    }}>
      {[
        { top: 32,    left: 32,  borderTop:    `1px solid var(--x-corner)`, borderLeft:   `1px solid var(--x-corner)` },
        { top: 32,    right: 32, borderTop:    `1px solid var(--x-corner)`, borderRight:  `1px solid var(--x-corner)` },
        { bottom: 32, left: 32,  borderBottom: `1px solid var(--x-corner)`, borderLeft:   `1px solid var(--x-corner)` },
        { bottom: 32, right: 32, borderBottom: `1px solid var(--x-corner)`, borderRight:  `1px solid var(--x-corner)` },
      ].map((style, i) => (
        <div key={i} style={{ position: 'fixed', width: 48, height: 48, ...style }} />
      ))}

      <div style={{ width: '100%', maxWidth: 440 }}>

        <button
          onClick={() => router.push('/')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontFamily: t.mono, fontSize: 10, color: t.textDim,
            letterSpacing: '0.2em', textTransform: 'uppercase',
            marginBottom: 48, background: 'none', border: 'none',
            cursor: 'pointer', padding: 0, transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = t.gold)}
          onMouseLeave={e => (e.currentTarget.style.color = t.textDim)}
        >
          ← Back
        </button>

        <div style={{
          marginBottom: 48,
          animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
          opacity: 0,
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '8px 16px', background: p.bg,
            border: `1px solid ${p.border}`, borderRadius: 2, marginBottom: 24,
          }}>
            <div style={{
              width: 24, height: 24, background: p.color, borderRadius: 3,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--bg)', fontFamily: 'serif', fontSize: 13, fontWeight: 700,
            }}>𝕏</div>
            <span style={{
              fontFamily: t.mono, fontSize: 10, color: p.color,
              letterSpacing: '0.2em', textTransform: 'uppercase',
            }}>OAuth 2.0 PKCE</span>
          </div>

          <h1 style={{
            fontFamily: t.serif,
            fontSize: 'clamp(36px, 7vw, 52px)',
            fontWeight: 300, letterSpacing: '-0.02em',
            lineHeight: 1.1, color: t.text, marginBottom: 12,
          }}>
            Connect<br />
            <span style={{ color: p.color }}>X</span>
          </h1>

          <p style={{
            fontFamily: t.mono, fontSize: 11,
            color: t.textDim, letterSpacing: '0.1em', lineHeight: 1.8,
          }}>
            Enter your Client ID from the<br />X Developer Portal
          </p>
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', gap: 16,
          animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s forwards',
          opacity: 0,
        }}>
          <div>
            <label style={{
              display: 'block', fontFamily: t.mono, fontSize: 10,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: t.textDim, marginBottom: 8,
            }}>Client ID</label>
            <input
              type="text"
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAuth()}
              placeholder="From X Developer Portal"
              style={{
                width: '100%', padding: '14px 16px',
                background: t.surface, border: `1px solid ${t.border}`,
                borderRadius: 2, color: t.text,
                fontFamily: t.mono, fontSize: 13,
                outline: 'none', transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.target.style.borderColor = p.focus)}
              onBlur={e => (e.target.style.borderColor = t.border)}
            />
            <p style={{
              fontFamily: t.mono, fontSize: 10,
              color: t.textDimmer, letterSpacing: '0.1em', marginTop: 8,
            }}>
              No Client Secret needed — PKCE handles security
            </p>
          </div>

          {error && (
            <div style={{
              padding: '12px 16px', background: t.errorBg,
              border: `1px solid ${t.errorBorder}`, borderRadius: 2,
              fontFamily: t.mono, fontSize: 11,
              color: t.error, letterSpacing: '0.05em',
            }}>{error}</div>
          )}

          <button
            onClick={handleAuth}
            disabled={loading}
            style={{
              marginTop: 8, padding: '16px 24px',
              background: loading ? t.surface : p.color,
              border: `1px solid ${p.color}`, borderRadius: 2,
              color: loading ? p.color : 'var(--bg)',
              fontFamily: t.mono, fontSize: 11,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = p.hover; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = p.color; }}
          >
            {loading ? (
              <>
                <span style={{
                  width: 12, height: 12,
                  border: `1px solid ${t.borderLight}`,
                  borderTop: `1px solid ${p.color}`,
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  display: 'inline-block',
                }} />
                Redirecting...
              </>
            ) : 'Authenticate with X →'}
          </button>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, margin: '32px 0',
          animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s forwards',
          opacity: 0,
        }}>
          <div style={{ flex: 1, height: '1px', background: t.borderMedium }} />
          <span style={{
            fontFamily: t.mono, fontSize: 10,
            color: t.textDimmest, letterSpacing: '0.2em',
          }}>Required Scopes</span>
          <div style={{ flex: 1, height: '1px', background: t.borderMedium }} />
        </div>

        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 8,
          animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.25s forwards',
          opacity: 0,
        }}>
          {['tweet.read', 'tweet.write', 'users.read', 'offline.access'].map(scope => (
            <span key={scope} style={{
              padding: '4px 10px', background: p.bg,
              border: `1px solid ${p.border}`, borderRadius: 2,
              fontFamily: t.mono, fontSize: 10,
              color: p.color, letterSpacing: '0.1em',
            }}>{scope}</span>
          ))}
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </main>
  );
}