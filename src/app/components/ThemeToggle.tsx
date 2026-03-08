'use client';

import { useEffect, useState } from 'react';
import { t } from '@/lib/tokens';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    async function initTheme() {
      const saved = localStorage.getItem('theme') as 'dark' | 'light' | null;
      const preferred = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      const initial = saved || preferred;
      setTheme(initial);
      document.documentElement.setAttribute('data-theme', initial);
    }
    initTheme();
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  };

  return (
    <button
      onClick={toggle}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      style={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 200,
        width: 40,
        height: 24,
        borderRadius: 12,
        border: `1px solid ${t.borderLight}`,
        background: t.surface,
        cursor: 'pointer',
        padding: 3,
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = t.gold)}
      onMouseLeave={e => (e.currentTarget.style.borderColor = t.borderLight)}
    >
      <div style={{ width: '100%', height: '100%', borderRadius: 10, position: 'relative' }}>
        <div style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: t.gold,
          position: 'absolute',
          top: '50%',
          transform: `translateY(-50%) translateX(${theme === 'light' ? '16px' : '0px'})`,
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 9,
        }}>
          {theme === 'dark' ? '☽' : '☀'}
        </div>
      </div>
    </button>
  );
}