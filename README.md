# DotShare Auth

> OAuth 2.0 Authentication Portal for the [DotShare](https://github.com/kareem2099/dotshare) VS Code Extension

A clean, luxury-designed Next.js application that handles OAuth 2.0 flows for all social platforms supported by DotShare. Users authenticate with one click — tokens are exchanged server-side and sent directly back to VS Code automatically.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/license-Apache--2.0-gold?style=flat-square)
![Version](https://img.shields.io/badge/version-1.3.0%20Pro-gold?style=flat-square)

---

## What's New — v1.3.0 "Pro"

- Token refresh endpoints for X and Reddit
- Token extension endpoint for Facebook (60-day long-lived tokens)
- `expires_in` + `refresh_token` now included in all VS Code deep links
- Shared `AuthPage` + `CallbackPage` components — zero duplicated UI code
- `lib/platforms.ts` is now the single source of truth for everything

---

## Supported Platforms

| Platform | Flow | Tokens | Refresh |
|----------|------|--------|---------|
| LinkedIn | OAuth 2.0 | Access Token | ❌ |
| X (Twitter) | OAuth 2.0 PKCE | Access + Refresh Token | ✅ `/api/auth/x/refresh` |
| Facebook | OAuth 2.0 | Access Token | ⚠️ `/api/auth/facebook/extend` (60-day) |
| Reddit | OAuth 2.0 + State | Access + Refresh Token | ✅ `/api/auth/reddit/refresh` |

---

## Features

- **One-click authentication** — no manual credential entry or token copying
- **Zero client-side secrets** — all app credentials stored in server `.env`, never exposed to the browser
- **Auto redirect to VS Code** — tokens sent directly via `vscode://` deep link after auth
- **Token refresh** for X and Reddit — call `/api/auth/{platform}/refresh` with `{ refreshToken }`
- **Token extension** for Facebook — call `/api/auth/facebook/extend` with `{ accessToken }` to get a 60-day token
- **`expires_in` in deep link** — extension can track expiry without polling
- **PKCE support** for X (Twitter) — code verifier generated client-side
- **CSRF protection** via `state` parameter for X and Reddit
- **Dark / Light mode** with system preference detection and localStorage persistence
- **Luxury UI** — Cormorant Garamond + DM Mono, gold accents, grain overlay, staggered animations
- **CSS token system** — all colors defined as CSS custom properties via `lib/tokens.ts`
- **Single source of truth** — adding a new platform requires changes in `lib/platforms.ts` only
- Deployable to **Vercel** in one command

---

## How It Works

### Auth Flow
```
VS Code Extension
  → opens browser to https://dotshare-auth-server.vercel.app/auth/{platform}
  → user clicks "Authenticate" (no credentials to enter)
  → redirected to platform OAuth page
  → platform redirects back to /auth/{platform}/callback
  → server exchanges code for token using .env credentials
  → browser redirects to vscode://freerave.dotshare/auth?platform=...&access_token=...&expires_in=...
  → VS Code extension receives token automatically
```

### Token Refresh Flow
```
VS Code Extension detects token expiring (expires_at - now < 5min)
  → POST /api/auth/x/refresh        { refreshToken }
  → POST /api/auth/reddit/refresh   { refreshToken }
  → POST /api/auth/facebook/extend  { accessToken }
  → receives new access_token (+ new refresh_token for X/Reddit)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation
```bash
git clone https://github.com/kareem2099/dotshare-auth-server.git
cd dotshare-auth-server
npm install
```

### Environment Variables
```bash
cp .env.example .env.local
```
```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# LinkedIn
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# X (Twitter)
NEXT_PUBLIC_X_CLIENT_ID=your_x_client_id
X_CLIENT_ID=your_x_client_id

# Facebook
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Reddit
NEXT_PUBLIC_REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
```

### Development
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Platform Setup

### LinkedIn
1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps/new)
2. Enable **Share on LinkedIn** + **Sign In with LinkedIn using OpenID Connect**
3. Add Redirect URL: `https://your-domain.com/auth/linkedin/callback`
4. Copy **Client ID** and **Client Secret** → add to `.env`

### X (Twitter)
1. Go to [X Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Enable **OAuth 2.0** with **PKCE**, app type: **Public client**
3. Add Callback URL: `https://your-domain.com/auth/x/callback`
4. Copy **Client ID** (no secret needed) → add to `.env`

### Facebook
1. Go to [Meta Developer Portal](https://developers.facebook.com/apps)
2. Create **Business** app → add **Facebook Login** product
3. Add Redirect URI: `https://your-domain.com/auth/facebook/callback`
4. Copy **App ID** and **App Secret** → add to `.env`

### Reddit
1. Go to [Reddit App Preferences](https://www.reddit.com/prefs/apps)
2. Create app → type: **web app**
3. Set redirect URI: `https://your-domain.com/auth/reddit/callback`
4. Copy **Client ID** and **Client Secret** → add to `.env`

---

## API Reference

### Token Exchange

| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/api/auth/linkedin` | `{ code, redirectUri }` |
| POST | `/api/auth/x` | `{ code, codeVerifier, redirectUri }` |
| POST | `/api/auth/facebook` | `{ code, redirectUri }` |
| POST | `/api/auth/reddit` | `{ code, redirectUri }` |

### Token Refresh / Extend

| Method | Endpoint | Body | Returns |
|--------|----------|------|---------|
| POST | `/api/auth/x/refresh` | `{ refreshToken }` | `access_token`, `refresh_token` |
| POST | `/api/auth/reddit/refresh` | `{ refreshToken }` | `access_token` |
| POST | `/api/auth/facebook/extend` | `{ accessToken }` | `access_token`, `expires_in` (~60 days) |

---

## Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

Add all environment variables under **Settings → Environment Variables**.

---

## Project Structure
```
src/
  app/
    page.tsx                         # Home — reads platforms from lib/platforms.ts
    layout.tsx                       # Root layout with ThemeToggle
    auth/
      linkedin/
        page.tsx                     # → <AuthPage platform="linkedin" />
        callback/page.tsx            # → <CallbackPage platform="linkedin" />
      x/
        page.tsx                     # → <AuthPage platform="x" />
        callback/page.tsx            # → <CallbackPage platform="x" />
      facebook/
        page.tsx                     # → <AuthPage platform="facebook" />
        callback/page.tsx            # → <CallbackPage platform="facebook" />
      reddit/
        page.tsx                     # → <AuthPage platform="reddit" />
        callback/page.tsx            # → <CallbackPage platform="reddit" />
    api/
      auth/
        linkedin/route.ts            # Token exchange
        x/route.ts                   # Token exchange (PKCE)
        x/refresh/route.ts           # Token refresh
        facebook/route.ts            # Token exchange
        facebook/extend/route.ts     # Token extension (60-day)
        reddit/route.ts              # Token exchange
        reddit/refresh/route.ts      # Token refresh
    components/
      AuthPage.tsx                   # Shared auth UI
      CallbackPage.tsx               # Shared callback UI
      PlatformCard.tsx               # Animated platform link card
      ThemeToggle.tsx                # Dark/light mode toggle
  hooks/
    useOAuthInit.ts                  # Shared OAuth init logic (PKCE, state, redirect)
    useOAuthCallback.ts              # Shared callback logic (exchange, deep link)
  lib/
    tokens.ts                        # CSS variable references
    platforms.ts                     # Single source of truth for all platform config
    pkce.ts                          # PKCE helpers (server-side)
```

---

## Security

- **Zero client-side secrets** — all app credentials live in server `.env` only
- **PKCE** prevents authorization code interception for X
- **State parameter** prevents CSRF for X and Reddit
- **sessionStorage** used only for non-secret PKCE and state values, cleared after use
- All token exchanges happen **server-side** via Next.js API routes
- Tokens passed directly to VS Code via deep link — never logged or stored

---

## License

Apache-2.0 © 2026 [FreeRave (kareem)](https://github.com/kareem2099)