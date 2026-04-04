'use client';

import { useRouter } from 'next/navigation';
import { t } from '@/lib/tokens';
import { PLATFORMS, PlatformKey } from '@/lib/platforms';
import { useOAuthInit } from '@/hooks/useOAuthInit';

interface AuthPageProps {
  platform: PlatformKey;
}

export function AuthPage({ platform }: AuthPageProps) {
  const router = useRouter();
  const config = PLATFORMS[platform];
  const p = t.platform(platform);
  const { handleAuth, loading, error } = useOAuthInit(platform);

  const titleStyle = config.titleGradientTo
    ? {
        background: `linear-gradient(90deg, ${p.color}, ${config.titleGradientTo})`,
        WebkitBackgroundClip: 'text' as const,
        WebkitTextFillColor: 'transparent' as const,
      }
    : { color: p.color };

  return (
    <main style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '40px 24px',
      background: `var(--gradient-${platform})`,
    }}>

      {/* Decorative corners */}
      {[
        { top: 32,    left: 32,  borderTop:    `1px solid var(--${platform}-corner)`, borderLeft:   `1px solid var(--${platform}-corner)` },
        { top: 32,    right: 32, borderTop:    `1px solid var(--${platform}-corner)`, borderRight:  `1px solid var(--${platform}-corner)` },
        { bottom: 32, left: 32,  borderBottom: `1px solid var(--${platform}-corner)`, borderLeft:   `1px solid var(--${platform}-corner)` },
        { bottom: 32, right: 32, borderBottom: `1px solid var(--${platform}-corner)`, borderRight:  `1px solid var(--${platform}-corner)` },
      ].map((style, i) => (
        <div key={i} style={{ position: 'fixed', width: 48, height: 48, ...style }} />
      ))}

      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Back */}
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

        {/* Header */}
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
              color: platform === 'x' ? 'var(--bg)' : 'white',
              fontFamily: t.mono, fontSize: platform === 'facebook' ? 14 : 11,
              fontWeight: 700,
            }}>{config.icon}</div>
            <span style={{
              fontFamily: t.mono, fontSize: 10, color: p.color,
              letterSpacing: '0.2em', textTransform: 'uppercase',
            }}>
              {platform === 'x' ? 'OAuth 2.0 PKCE' : `${config.name} OAuth 2.0`}
            </span>
          </div>

          <h1 style={{
            fontFamily: t.serif,
            fontSize: 'clamp(36px, 7vw, 52px)',
            fontWeight: 300, letterSpacing: '-0.02em',
            lineHeight: 1.1, color: t.text, marginBottom: 12,
          }}>
            Connect<br />
            <span style={titleStyle}>{config.name}</span>
          </h1>

          <p style={{
            fontFamily: t.mono, fontSize: 11,
            color: t.textDim, letterSpacing: '0.1em', lineHeight: 1.8,
          }}>
            Securely connect your {config.name} account<br />with one click.
          </p>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 16,
          animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s forwards',
          opacity: 0,
        }}>
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
              color: loading ? p.color : (platform === 'x' ? 'var(--bg)' : 'white'),
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
            ) : `Authenticate with ${config.name} →`}
          </button>

          {/* Cancel — Reddit only */}
          {platform === 'reddit' && !loading && (
            <button
              onClick={() => window.close()}
              style={{
                padding: '12px 24px', background: 'none',
                border: `1px solid ${t.borderMedium}`, borderRadius: 2,
                color: t.textDim, fontFamily: t.mono, fontSize: 11,
                letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.text; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = t.borderMedium; e.currentTarget.style.color = t.textDim; }}
            >
              Cancel
            </button>
          )}
        </div>

        {/* Scopes */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, margin: '32px 0',
          animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s forwards',
          opacity: 0,
        }}>
          <div style={{ flex: 1, height: '1px', background: t.borderMedium }} />
          <span style={{ fontFamily: t.mono, fontSize: 10, color: t.textDimmest, letterSpacing: '0.2em' }}>
            Required Scopes
          </span>
          <div style={{ flex: 1, height: '1px', background: t.borderMedium }} />
        </div>

        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 8,
          animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.25s forwards',
          opacity: 0,
        }}>
          {config.scopes.map(scope => (
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