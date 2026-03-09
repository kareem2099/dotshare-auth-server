# DotShare Auth

> OAuth 2.0 Authentication Portal for the [DotShare](https://github.com/kareem2099/dotshare) VS Code Extension

A clean, luxury-designed Next.js application that handles OAuth 2.0 flows for all social platforms supported by DotShare. Users authenticate with one click — tokens are exchanged server-side and sent directly back to VS Code automatically.

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

- **One-click authentication** — no manual credential entry or token copying
- **Zero client-side secrets** — all app credentials stored in server `.env`, never exposed to the browser
- **Auto redirect to VS Code** — tokens sent directly via `vscode://` deep link after auth
- **PKCE support** for X (Twitter) — code verifier generated client-side
- **CSRF protection** via `state` parameter for X and Reddit
- **Dark / Light mode** with system preference detection and localStorage persistence
- **Luxury UI** — Cormorant Garamond + DM Mono, gold accents, grain overlay, staggered animations
- **CSS token system** — all colors defined as CSS custom properties via `lib/tokens.ts`
- Deployable to **Vercel** in one command

---

## How It Works

```
VS Code Extension
  → opens browser to https://dotshare-auth-server.vercel.app/auth/{platform}
  → user clicks "Authenticate" (no credentials to enter)
  → redirected to platform OAuth page
  → platform redirects back to /auth/{platform}/callback
  → server exchanges code for token using .env credentials
  → browser redirects to vscode://freerave.dotshare/auth?platform=...&access_token=...
  → VS Code extension receives token automatically
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

Copy the example file:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

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
2. Create an app and enable:
   - **Share on LinkedIn**
   - **Sign In with LinkedIn using OpenID Connect**
3. Add Redirect URL: `https://your-domain.com/auth/linkedin/callback`
4. Copy **Client ID** and **Client Secret** → add to `.env`

### X (Twitter)

1. Go to [X Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a project and app
3. Enable **OAuth 2.0** with **PKCE**
4. Set app type to **Public client**
5. Add Callback URL: `https://your-domain.com/auth/x/callback`
6. Copy **Client ID** (no secret needed for PKCE) → add to `.env`

### Facebook

1. Go to [Meta Developer Portal](https://developers.facebook.com/apps)
2. Create an app → **Business** type
3. Add **Facebook Login** product
4. Add Redirect URI: `https://your-domain.com/auth/facebook/callback`
5. Copy **App ID** and **App Secret** → add to `.env`

### Reddit

1. Go to [Reddit App Preferences](https://www.reddit.com/prefs/apps)
2. Create app → type: **web app**
3. Set redirect URI: `https://your-domain.com/auth/reddit/callback`
4. Copy **Client ID** and **Client Secret** → add to `.env`

---

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

Add all environment variables in the Vercel dashboard under **Settings → Environment Variables**.

---

## Project Structure

```
src/
  app/
    page.tsx                    # Home — platform selection
    layout.tsx                  # Root layout with ThemeToggle
    auth/
      linkedin/
        page.tsx                # LinkedIn auth (one-click, reads from env)
        callback/page.tsx       # LinkedIn callback → auto redirect to VS Code
      x/
        page.tsx                # X auth (PKCE, one-click)
        callback/page.tsx       # X callback → auto redirect to VS Code
      facebook/
        page.tsx                # Facebook auth (one-click, reads from env)
        callback/page.tsx       # Facebook callback → auto redirect to VS Code
      reddit/
        page.tsx                # Reddit auth (one-click, reads from env)
        callback/page.tsx       # Reddit callback → auto redirect to VS Code
    api/
      auth/
        linkedin/route.ts       # LinkedIn token exchange (reads secret from env)
        x/route.ts              # X token exchange (reads client ID from env)
        facebook/route.ts       # Facebook token exchange (reads secret from env)
        reddit/route.ts         # Reddit token exchange (reads secret from env)
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

- **Zero client-side secrets** — all app credentials live in server `.env` only
- **PKCE** prevents authorization code interception for X
- **State parameter** prevents CSRF for X and Reddit
- **sessionStorage** used only for non-secret PKCE and state values, cleared after use
- All token exchanges happen **server-side** via Next.js API routes
- Tokens are passed directly to VS Code via deep link — never logged or stored

---

## License

MIT © [kareem2099](https://github.com/kareem2099)