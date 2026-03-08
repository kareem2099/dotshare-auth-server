'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { t } from '@/lib/tokens';

export default function FacebookAuth() {
  const router = useRouter();
  const [appId, setAppId] = useState('');
  const [appSecret, setAppSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const p = t.platform('facebook');

  const handleAuth = () => {
    if (!appId.trim() || !appSecret.trim()) {
      setError('Please enter both App ID and App Secret');
      return;
    }
    setLoading(true);
    setError('');
    sessionStorage.setItem('fb_app_id', appId.trim());
    sessionStorage.setItem('fb_app_secret', appSecret.trim());
    const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
    authUrl.searchParams.set('client_id', appId.trim());
    authUrl.searchParams.set('redirect_uri', `${window.location.origin}/auth/facebook/callback`);
    authUrl.searchParams.set('scope', 'pages_manage_posts,pages_read_engagement,publish_to_groups');
    authUrl.searchParams.set('response_type', 'code');
    window.location.href = authUrl.toString();
  };

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      background: 'var(--gradient-facebook)',
    }}>
      {[
        { top: 32,    left: 32,  borderTop:    `1px solid var(--facebook-corner)`, borderLeft:   `1px solid var(--facebook-corner)` },
        { top: 32,    right: 32, borderTop:    `1px solid var(--facebook-corner)`, borderRight:  `1px solid var(--facebook-corner)` },
        { bottom: 32, left: 32,  borderBottom: `1px solid var(--facebook-corner)`, borderLeft:   `1px solid var(--facebook-corner)` },
        { bottom: 32, right: 32, borderBottom: `1px solid var(--facebook-corner)`, borderRight:  `1px solid var(--facebook-corner)` },
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
              color: 'white', fontFamily: 'Georgia, serif', fontSize: 14, fontWeight: 700,
            }}>f</div>
            <span style={{
              fontFamily: t.mono, fontSize: 10, color: p.color,
              letterSpacing: '0.2em', textTransform: 'uppercase',
            }}>Facebook OAuth 2.0</span>
          </div>

          <h1 style={{
            fontFamily: t.serif,
            fontSize: 'clamp(36px, 7vw, 52px)',
            fontWeight: 300, letterSpacing: '-0.02em',
            lineHeight: 1.1, color: t.text, marginBottom: 12,
          }}>
            Connect<br />
            <span style={{
              background: `linear-gradient(90deg, ${p.color}, #42a5f5)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Facebook</span>
          </h1>

          <p style={{
            fontFamily: t.mono, fontSize: 11,
            color: t.textDim, letterSpacing: '0.1em', lineHeight: 1.8,
          }}>
            Enter your app credentials from the<br />Meta Developer Portal
          </p>
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', gap: 16,
          animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s forwards',
          opacity: 0,
        }}>
          {[
            { label: 'App ID',     value: appId,     setter: setAppId,     type: 'text',     placeholder: 'From Meta Developer Portal' },
            { label: 'App Secret', value: appSecret, setter: setAppSecret, type: 'password', placeholder: '••••••••••••••••' },
          ].map(({ label, value, setter, type, placeholder }) => (
            <div key={label}>
              <label style={{
                display: 'block', fontFamily: t.mono, fontSize: 10,
                letterSpacing: '0.2em', textTransform: 'uppercase',
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
                  background: t.surface, border: `1px solid ${t.border}`,
                  borderRadius: 2, color: t.text,
                  fontFamily: t.mono, fontSize: 13,
                  outline: 'none', transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = p.focus)}
                onBlur={e => (e.target.style.borderColor = t.border)}
              />
            </div>
          ))}

          <p style={{
            fontFamily: t.mono, fontSize: 10,
            color: t.textDimmer, letterSpacing: '0.1em',
          }}>
            Processed locally · Never stored on any server
          </p>

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
              background: loading ? p.bg : p.color,
              border: `1px solid ${p.color}`, borderRadius: 2,
              color: loading ? p.color : 'white',
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
                  border: `1px solid ${p.border}`,
                  borderTop: `1px solid ${p.color}`,
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  display: 'inline-block',
                }} />
                Redirecting...
              </>
            ) : 'Authenticate with Facebook →'}
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
          {['pages_manage_posts', 'pages_read_engagement', 'publish_to_groups'].map(scope => (
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