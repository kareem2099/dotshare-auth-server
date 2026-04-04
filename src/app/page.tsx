import { t } from '@/lib/tokens';
import { PLATFORMS } from '@/lib/platforms';
import PlatformCard from './components/PlatformCard';

export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      background: 'var(--gradient-home)',
    }}>

      {/* Decorative corners */}
      {[
        { top: 32,    left: 32,  borderTop:    `1px solid ${t.borderLight}`, borderLeft:   `1px solid ${t.borderLight}` },
        { top: 32,    right: 32, borderTop:    `1px solid ${t.borderLight}`, borderRight:  `1px solid ${t.borderLight}` },
        { bottom: 32, left: 32,  borderBottom: `1px solid ${t.borderLight}`, borderLeft:   `1px solid ${t.borderLight}` },
        { bottom: 32, right: 32, borderBottom: `1px solid ${t.borderLight}`, borderRight:  `1px solid ${t.borderLight}` },
      ].map((style, i) => (
        <div key={i} style={{ position: 'fixed', width: 48, height: 48, ...style }} />
      ))}

      <div style={{ width: '100%', maxWidth: 480 }}>

        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: 64,
          animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
          opacity: 0,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 32,
          }}>
            <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, transparent, ${t.borderLight})` }} />
            <span style={{
              fontFamily: t.mono,
              fontSize: 10,
              letterSpacing: '0.3em',
              color: t.textDimmer,
              textTransform: 'uppercase',
            }}>Authentication Portal</span>
            <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, ${t.borderLight}, transparent)` }} />
          </div>

          <h1 style={{
            fontFamily: t.serif,
            fontSize: 'clamp(48px, 10vw, 72px)',
            fontWeight: 300,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            marginBottom: 12,
            color: t.text,
          }}>
            Dot<span className="gold-text">Share</span>
          </h1>

          <p style={{
            fontFamily: t.mono,
            fontSize: 11,
            letterSpacing: '0.25em',
            color: t.textDim,
            textTransform: 'uppercase',
          }}>
            Connect your platforms
          </p>
        </div>

        {/* Platforms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {Object.entries(PLATFORMS).map(([key, config], i) => (
            <PlatformCard
              key={key}
              platformKey={key as 'linkedin' | 'x' | 'facebook' | 'reddit'}
              index={i}
              name={config.name}
              description={config.description ?? ''}
              symbol={config.icon}
            />
          ))}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: 48,
          animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.5s forwards',
          opacity: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 12 }}>
            <div style={{ width: 24, height: '1px', background: t.textDimmest }} />
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: t.borderHover, border: `1px solid ${t.gold}` }} />
            <div style={{ width: 24, height: '1px', background: t.textDimmest }} />
          </div>
          <p style={{
            fontFamily: t.mono,
            fontSize: 10,
            color: t.textDimmest,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}>
            Tokens never stored · Secure OAuth 2.0
          </p>
        </div>

      </div>
    </main>
  );
}