# Changelog

All notable changes to DotShare Auth will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] — 2026-03-09

### Added
- **Seamless OAuth flow** — users no longer enter credentials manually; all app secrets stored in server `.env`
- **Auto redirect to VS Code** — after successful auth, browser automatically redirects via `vscode://freerave.dotshare/auth?platform=...&access_token=...`
- `NEXT_PUBLIC_*` env variables for client-side platform config (Client ID / App ID only)
- Server-side env variables for secrets (`LINKEDIN_CLIENT_SECRET`, `FACEBOOK_APP_SECRET`, `REDDIT_CLIENT_SECRET`)

### Changed
- All auth pages (`linkedin`, `x`, `facebook`, `reddit`) — removed credential input forms; now read Client ID from `NEXT_PUBLIC_*` env
- All callback pages — replaced "Copy Token" UI with "Redirecting back to VS Code..." message + auto deep link redirect after 1.5s
- All API routes (`/api/auth/*`) — credentials now read from server env instead of request body
- `sessionStorage` now used only for non-secret PKCE values (`x_code_verifier`) and CSRF state — no secrets ever stored client-side
- README updated to reflect new one-click flow and env variable requirements

### Fixed
- Removed `console.log` of LinkedIn token response from API route
- Facebook and Reddit callback pages were still using old sessionStorage pattern

---

## [1.1.0] — 2026-03-08

### Added
- Dark / Light mode toggle with system preference detection and `localStorage` persistence
- `ThemeToggle` component — animated gold knob sliding between ☽ and ☀
- CSS variables for light mode under `[data-theme="light"]` in `globals.css`
- Gradient CSS variables for all platform pages (`--gradient-home`, `--gradient-linkedin`, `--gradient-x`, `--gradient-facebook`, `--gradient-reddit`, `--gradient-success`, `--gradient-error`, `--gradient-loading`)
- Platform-specific corner color variables (`--linkedin-corner`, `--x-corner`, `--facebook-corner`, `--reddit-corner`) for dark and light themes
- `--border-medium`, `--spinner-bg`, `--grain-opacity` added to token system

### Changed
- All hardcoded hex colors replaced with CSS token system via `t.*` and `t.platform()`
- `PlatformCard` now derives color from `t.platform(platformKey)` internally — `color` prop removed
- `body::before` grain overlay opacity now controlled via CSS `opacity` property (fixes full-opacity grain bug in light mode)
- All page backgrounds now use `var(--gradient-*)` CSS variables instead of hardcoded `radial-gradient` strings
- Corner brackets on all pages now use `var(--*-corner)` variables
- Input border defaults now use `t.border` token instead of `#1f1f1f`
- Spinner borders now use `p.border` and `p.color` tokens instead of hardcoded platform hex values
- `lib/platforms.ts` — removed hardcoded `color` field; colors are now exclusively managed via CSS variables

### Fixed
- X platform badge invisible in dark mode (was `#111111` on dark background — fixed to `#e7e7e7`)
- Light mode page backgrounds were still dark (hardcoded gradients not responding to theme)
- Grain overlay showing at full opacity in light mode

---

## [1.0.0] — 2026-03-07

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

#### Architecture
- CSS token system — all colors defined as CSS custom properties in `globals.css`
- `lib/tokens.ts` — TypeScript references to all CSS variables, zero magic strings in components
- `lib/platforms.ts` — centralized platform config (name, icon, scopes, auth URL)
- `lib/pkce.ts` — server-side PKCE helpers (`generateCodeVerifier`, `generateCodeChallenge`, `generateState`)
- `.env.example` for clean onboarding
- `.gitignore` configured to exclude secrets while allowing `.env.example`

---

## [Unreleased]

### Planned
- Bluesky support (identifier + app password flow)
- Token refresh endpoint for platforms that support it
- Internationalization (Arabic / English)
- Rate limiting on API routes
- Deployment guide for self-hosting on Railway