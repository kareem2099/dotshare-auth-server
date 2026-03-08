# DotShare Auth

> OAuth 2.0 Authentication Portal for the [DotShare](https://github.com/kareem2099/dotshare) VS Code Extension

A clean, luxury-designed Next.js application that handles OAuth 2.0 flows for all social platforms supported by DotShare. Users authenticate once, copy their tokens, and paste them into the extension — no manual API key hunting required.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/license-MIT-gold?style=flat-square)

---

## Supported Platforms

| Platform | Flow | Tokens |
|----------|------|--------|
| LinkedIn | OAuth 2.0 | Access Token |
| X (Twitter) | OAuth 2.0 PKCE | Access + Refresh Token |
| Facebook | OAuth 2.0 | Access Token |
| Reddit | OAuth 2.0 + State | Access + Refresh Token |

---

## Features

- **Zero server-side secret storage** — credentials are passed per-request and never persisted
- **PKCE support** for X (Twitter) — code verifier generated client-side
- **CSRF protection** via `state` parameter for X and Reddit
- **Dark / Light mode** with system preference detection and localStorage persistence
- **Luxury UI** — Cormorant Garamond + DM Mono, gold accents, grain overlay, staggered animations
- **CSS token system** — all colors defined as CSS custom properties via `lib/tokens.ts`
- Deployable to **Vercel** or **Railway** in one command

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

Copy the example file:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
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
2. Create an app and enable:
   - **Share on LinkedIn**
   - **Sign In with LinkedIn using OpenID Connect**
3. Add Redirect URL: `https://your-domain.com/auth/linkedin/callback`
4. Copy **Client ID** and **Client Secret**

### X (Twitter)

1. Go to [X Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a project and app
3. Enable **OAuth 2.0** with **PKCE**
4. Set app type to **Public client**
5. Add Callback URL: `https://your-domain.com/auth/x/callback`
6. Copy **Client ID** (no secret needed for PKCE)

### Facebook

1. Go to [Meta Developer Portal](https://developers.facebook.com/apps)
2. Create an app → **Business** type
3. Add **Facebook Login** product
4. Add Redirect URI: `https://your-domain.com/auth/facebook/callback`
5. Copy **App ID** and **App Secret**

### Reddit

1. Go to [Reddit App Preferences](https://www.reddit.com/prefs/apps)
2. Create app → type: **web app**
3. Set redirect URI: `https://your-domain.com/auth/reddit/callback`
4. Copy **Client ID** (under app name) and **Client Secret**

---

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

Set environment variable in Vercel dashboard:
```
NEXT_PUBLIC_BASE_URL=https://your-project.vercel.app
```

### Railway

```bash
railway init
railway up
```

Set `NEXT_PUBLIC_BASE_URL` in Railway environment variables.

---

## Project Structure

```
src/
  app/
    page.tsx                    # Home — platform selection
    layout.tsx                  # Root layout with ThemeToggle
    auth/
      linkedin/
        page.tsx                # LinkedIn auth form
        callback/page.tsx       # LinkedIn callback handler
      x/
        page.tsx                # X auth form (PKCE)
        callback/page.tsx       # X callback handler
      facebook/
        page.tsx                # Facebook auth form
        callback/page.tsx       # Facebook callback handler
      reddit/
        page.tsx                # Reddit auth form
        callback/page.tsx       # Reddit callback handler
    api/
      auth/
        linkedin/route.ts       # LinkedIn token exchange
        x/route.ts              # X token exchange
        facebook/route.ts       # Facebook token exchange
        reddit/route.ts         # Reddit token exchange
    components/
      PlatformCard.tsx          # Animated platform link card
      ThemeToggle.tsx           # Dark/light mode toggle
  lib/
    tokens.ts                   # CSS variable references
    platforms.ts                # Platform config (scopes, auth URLs)
    pkce.ts                     # PKCE helpers (server-side)
```

---

## Security

- **No secrets stored** — all credentials are sent per-request from the client and used immediately
- **PKCE** prevents authorization code interception for X
- **State parameter** prevents CSRF for X and Reddit
- **sessionStorage** is cleared after token exchange (secrets removed immediately)
- All token exchanges happen **server-side** via Next.js API routes — credentials never hit third-party services from the browser

---

## License

MIT © [kareem2099](https://github.com/kareem2099)