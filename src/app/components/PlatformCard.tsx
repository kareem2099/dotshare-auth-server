'use client';

import { t } from '@/lib/tokens';
import Link from 'next/link';
import { useState } from 'react';

type PlatformKey = 'linkedin' | 'x' | 'facebook' | 'reddit';

interface PlatformCardProps {
  platformKey: PlatformKey;
  name: string;
  description: string;
  symbol: string;
  index: number;
}

export default function PlatformCard({
  platformKey,
  name,
  description,
  symbol,
  index,
}: PlatformCardProps) {
  const [hovered, setHovered] = useState(false);
  const p = t.platform(platformKey);

  return (
    <Link
      href={`/auth/${platformKey}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        padding: '20px 24px',
        background: hovered ? t.surfaceHover : t.surface,
        border: `1px solid ${hovered ? t.borderHover : t.borderMedium}`,
        textDecoration: 'none',
        position: 'relative',
        overflow: 'hidden',
        animation: `fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) ${0.1 + index * 0.08}s forwards`,
        opacity: 0,
        transition: 'border-color 0.2s, background 0.2s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Left accent bar */}
      <div style={{
        position: 'absolute',
        left: 0, top: 0, bottom: 0,
        width: 2,
        background: `linear-gradient(180deg, transparent, ${p.color}, transparent)`,
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.2s',
      }} />

      {/* Platform symbol */}
      <div style={{
        width: 40,
        height: 40,
        borderRadius: 4,
        background: p.bg,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: hovered ? p.focus : p.border,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: p.color,
        fontFamily: t.mono,
        fontSize: 13,
        flexShrink: 0,
        transition: 'border-color 0.2s',
      }}>
        {symbol}
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: t.serif,
          fontSize: 20,
          fontWeight: 400,
          color: hovered ? t.textHover : t.text,
          letterSpacing: '0.01em',
          transition: 'color 0.2s',
        }}>
          {name}
        </div>
        <div style={{
          fontFamily: t.mono,
          fontSize: 10,
          color: hovered ? t.textMuted : t.textDim,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginTop: 2,
          transition: 'color 0.2s',
        }}>
          {description}
        </div>
      </div>

      {/* Arrow */}
      <div style={{
        fontFamily: t.mono,
        fontSize: 16,
        color: hovered ? t.gold : t.textDimmest,
        transition: 'color 0.2s, transform 0.2s',
        transform: hovered ? 'translateX(4px)' : 'translateX(0)',
      }}>
        →
      </div>
    </Link>
  );
}