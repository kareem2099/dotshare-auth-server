# Changelog

All notable changes to DotShare Auth will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2025-03-07

### Added

#### Core
- Next.js 16 App Router project setup with TypeScript and Tailwind CSS
- Full OAuth 2.0 flow for **LinkedIn** (Authorization Code + Client Secret)
- Full OAuth 2.0 PKCE flow for **X (Twitter)** (no Client Secret required)
- Full OAuth 2.0 flow for **Facebook** (Authorization Code + App Secret)
- Full OAuth 2.0 flow for **Reddit** (Authorization Code + State + Basic Auth)
- Server-side token exchange via Next.js API routes for all platforms
- CSRF protection via `state` parameter (X, Reddit)
- PKCE `code_verifier` / `code_challenge` generated client-side (X)
- `sessionStorage` cleanup after successful token exchange

#### UI / Design
- Luxury dark UI with **Cormorant Garamond** (display) + **DM Mono** (mono) typography
- Gold shimmer animation on DotShare logotype
- Grain overlay via SVG filter for depth and texture
- Staggered `fadeUp` entrance animations on all pages
- Decorative corner brackets on every page (platform-tinted)
- Platform-specific color schemes (LinkedIn blue, X white, Facebook blue, Reddit orange)
- Loading spinner during OAuth redirect and token exchange
- Success state with token preview and one-click copy
- Error state with descriptive message and retry button
- `PlatformCard` component with hover accent bar and animated arrow
- `ThemeToggle` component — dark/light mode with system preference detection and localStorage persistence

#### Architecture
- CSS token system — all colors defined as CSS custom properties in `globals.css`
- `lib/tokens.ts` — TypeScript references to all CSS variables, zero magic strings in components
- `lib/platforms.ts` — centralized platform config (name, color, scopes, auth URL)
- `lib/pkce.ts` — server-side PKCE helpers (`generateCodeVerifier`, `generateCodeChallenge`, `generateState`)
- `.env.example` for clean onboarding
- `.gitignore` configured to exclude secrets while allowing `.env.example`

---

## [Unreleased]

### Planned
- Bluesky support (identifier + app password flow)
- Token refresh endpoint for platforms that support it
- Copy-all button on success page (copies both access + refresh tokens)
- Toast notifications instead of inline copy feedback
- Internationalization (Arabic / English)
- Rate limiting on API routes
- Deployment guide for self-hosting on Railway