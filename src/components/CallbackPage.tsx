'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { t } from '@/lib/tokens';
import { useOAuthCallback, PlatformKey } from '@/hooks/useOAuthCallback';
import { PLATFORMS } from '@/lib/platforms';

const GRADIENT_MAP: Record<PlatformKey, string> = {
  facebook: 'var(--gradient-facebook)',
  linkedin: 'var(--gradient-loading)',
  x:        'var(--gradient-x)',
  reddit:   'var(--gradient-reddit)',
};

interface CallbackPageProps {
  platform: PlatformKey;
}

function CallbackContent({ platform }: CallbackPageProps) {
  const router = useRouter();
  const { status, errorMsg } = useOAuthCallback(platform);

  const bgGradient =
    status === 'success' ? 'var(--gradient-success)' :
    status === 'error'   ? 'var(--gradient-error)'   :
    GRADIENT_MAP[platform];

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
              {PLATFORMS[platform].name} authenticated successfully
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
            <button onClick={() => router.push(`/auth/${platform}`)} style={{
              padding: '14px 32px', background: t.surface,
              border: `1px solid ${t.border}`, borderRadius: 2, color: t.text,
              fontFamily: t.mono, fontSize: 11,
              letterSpacing: '0.2em', textTransform: 'uppercase' as const, cursor: 'pointer',
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

export function CallbackPage({ platform }: CallbackPageProps) {
  return (
    <Suspense>
      <CallbackContent platform={platform} />
    </Suspense>
  );
}