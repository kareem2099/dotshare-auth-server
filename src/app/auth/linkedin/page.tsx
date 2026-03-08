'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { t } from '@/lib/tokens';

export default function LinkedInAuth() {
  const router = useRouter();
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const p = t.platform('linkedin');

  const handleAuth = async () => {
    if (!clientId || !clientSecret) {
      setError('Please enter both Client ID and Client Secret');
      return;
    }

    setLoading(true);
    setError('');

    // Store in sessionStorage for use after redirect
    sessionStorage.setItem('li_client_id', clientId);
    sessionStorage.setItem('li_client_secret', clientSecret);

    const scopes = ['openid', 'profile', 'email', 'w_member_social'].join(' ');
    const redirectUri = `${window.location.origin}/auth/linkedin/callback`;

    const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', scopes);

    window.location.href = authUrl.toString();
  };

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      background: 'var(--gradient-linkedin)',
    }}>
      {/* Decorative corners */}
      {[
        { top: 32,    left: 32,  borderTop:    `1px solid var(--linkedin-corner)`, borderLeft:   `1px solid var(--linkedin-corner)` },
        { top: 32,    right: 32, borderTop:    `1px solid var(--linkedin-corner)`, borderRight:  `1px solid var(--linkedin-corner)` },
        { bottom: 32, left: 32,  borderBottom: `1px solid var(--linkedin-corner)`, borderLeft:   `1px solid var(--linkedin-corner)` },
        { bottom: 32, right: 32, borderBottom: `1px solid var(--linkedin-corner)`, borderRight:  `1px solid var(--linkedin-corner)` },
      ].map((style, i) => (
        <div key={i} style={{ position: 'fixed', width: 48, height: 48, ...style }} />
      ))}

      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Back button */}
        <button
          onClick={() => router.push('/')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: t.mono,
            fontSize: 10, 
            color: t.textDim,
            letterSpacing: '0.2em', 
            textTransform: 'uppercase',
            marginBottom: 48, 
            transition: 'color 0.2s',
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            padding: 0,
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
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '8px 16px', background: p.bg,
            border: `1px solid ${p.border}`, borderRadius: 2, marginBottom: 24,
          }}>
            <div style={{
              width: 24, height: 24, background: p.color, borderRadius: 3,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontFamily: t.mono, fontSize: 11, fontWeight: 700,
            }}>in</div>
            <span style={{
              fontFamily: t.mono, fontSize: 10, color: p.color,
              letterSpacing: '0.2em', textTransform: 'uppercase',
            }}>LinkedIn OAuth 2.0</span>
          </div>

          <h1 style={{
            fontFamily: t.serif,
            fontSize: 'clamp(36px, 7vw, 52px)',
            fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.1,
            color: t.text, marginBottom: 12,
          }}>
            Connect<br />
            <span style={{
              background: `linear-gradient(90deg, ${p.color}, #4da3ff)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>LinkedIn</span>
          </h1>

          <p style={{
            fontFamily: t.mono, fontSize: 11, color: t.textDim,
            letterSpacing: '0.1em', lineHeight: 1.8,
          }}>
            Enter your app credentials from the<br />LinkedIn Developer Portal
          </p>
        </div>

        {/* Form */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 16,
          animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s forwards',
          opacity: 0,
        }}>
          {/* Client ID */}
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
              placeholder="From LinkedIn Developer Portal"
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

          {/* Client Secret */}
          <div>
            <label style={{
              display: 'block', fontFamily: t.mono, fontSize: 10,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: t.textDim, marginBottom: 8,
            }}>Client Secret</label>
            <input
              type="password"
              value={clientSecret}
              onChange={e => setClientSecret(e.target.value)}
              placeholder="••••••••••••••••"
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
              fontFamily: t.mono, fontSize: 10, color: t.textDimmer,
              letterSpacing: '0.1em', marginTop: 8,
            }}>
              Processed locally · Never stored on any server
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '12px 16px', background: t.errorBg,
              border: `1px solid ${t.errorBorder}`, borderRadius: 2,
              fontFamily: t.mono, fontSize: 11,
              color: t.error, letterSpacing: '0.05em',
            }}>
              {error}
            </div>
          )}

          {/* Button */}
          <button
            onClick={handleAuth}
            disabled={loading}
            style={{
              marginTop: 8, padding: '16px 24px',
              background: loading ? p.bg : p.color,
              border: `1px solid ${p.color}`, borderRadius: 2,
              color: loading ? `${p.color}` : 'white',
              fontFamily: t.mono, fontSize: 11,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
            onMouseEnter={e => { if (!loading) (e.currentTarget.style.background = p.hover); }}
            onMouseLeave={e => { if (!loading) (e.currentTarget.style.background = p.color); }}
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
            ) : 'Authenticate with LinkedIn →'}
          </button>
        </div>

        {/* Divider */}
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

        {/* Scopes */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 8,
          animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.25s forwards',
          opacity: 0,
        }}>
          {['openid', 'profile', 'email', 'w_member_social'].map(scope => (
            <span key={scope} style={{
              padding: '4px 10px', background: p.bg,
              border: `1px solid ${p.border}`, borderRadius: 2,
              fontFamily: t.mono, fontSize: 10,
              color: p.color, letterSpacing: '0.1em',
            }}>
              {scope}
            </span>
          ))}
        </div>

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </main>
  );
}