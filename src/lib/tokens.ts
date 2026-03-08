export const t = {
  // ── Backgrounds ───────────────────────────
  bg:          'var(--bg)',
  surface:     'var(--surface)',
  surface2:    'var(--surface-2)',
  surfaceHover:'var(--surface-hover)',
  surfaceHoverBorder: 'var(--surface-hover-border)',

  // ── Borders ───────────────────────────────
  border:      'var(--border)',
  borderMedium: 'var(--border-medium)',
  borderLight: 'var(--border-light)',
  borderHover: 'var(--border-hover)',

  // ── Text ──────────────────────────────────
  text:        'var(--text)',
  textMuted:   'var(--text-muted)',
  textDim:     'var(--text-dim)',
  textDimmer:  'var(--text-dimmer)',
  textDimmest: 'var(--text-dimmest)',
  textHover:          'var(--text-hover)',


  // ── Gold ──────────────────────────────────
  gold:        'var(--gold)',
  goldLight:   'var(--gold-light)',
  goldDim:     'var(--gold-dim)',

  // ── Status ────────────────────────────────
  success:       'var(--success)',
  successBg:     'var(--success-bg)',
  successBorder: 'var(--success-border)',
  successBorderDim:   'var(--success-border-dim)',
  error:         'var(--error)',
  errorBg:       'var(--error-bg)',
  errorBorder:   'var(--error-border)',
  errorBorderDim:     'var(--error-border-dim)',

  // ── Fonts ─────────────────────────────────
  serif:       'var(--font-serif)',
  mono:        'var(--font-mono)',

  // ── Platforms ─────────────────────────────
  platform: (name: 'linkedin' | 'x' | 'facebook' | 'reddit') => ({
    color:  `var(--${name})`,
    bg:     `var(--${name}-bg)`,
    border: `var(--${name}-border)`,
    focus:  `var(--${name}-focus)`,
    hover:  `var(--${name}-hover)`,
  }),
} as const;