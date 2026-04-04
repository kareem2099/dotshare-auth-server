# Roadmap

> DotShare Auth development roadmap. Items are subject to change based on priority and community feedback.

---

## ✅ Released

### v1.0.0 — Foundation
- Full OAuth 2.0 flows for LinkedIn, X, Facebook, Reddit
- Server-side token exchange via Next.js API routes
- PKCE for X, CSRF state for X + Reddit
- Luxury dark UI — Cormorant Garamond + DM Mono
- CSS token system

### v1.1.0 — Theme
- Dark / Light mode toggle
- System preference detection
- CSS variable token system for all colors

### v1.2.0 — Seamless
- One-click auth — no manual credential entry
- Auto deep link redirect to VS Code
- Zero client-side secrets

### v1.3.0 "Pro" — Token Lifecycle
- Token refresh for X and Reddit
- Token extension for Facebook (60-day)
- `expires_in` in all deep links
- Shared `AuthPage` + `CallbackPage` components
- `lib/platforms.ts` as single source of truth

---

## 🔄 In Progress

### v1.4.0 — Rate Limiting
- Rate limiting on all `/api/auth/*` routes
- Per-IP limits using Vercel Edge middleware
- Exponential backoff responses

---

## 📋 Planned

### v1.5.0 — i18n
- Arabic / English language support
- RTL layout for Arabic
- Language detection from browser preferences
- Manual language toggle

### v1.6.0 — Railway Deployment
- Self-hosting guide for Railway
- One-click Railway deploy button
- Docker support
- Environment variable documentation for non-Vercel hosting

### v2.0.0 — Multi-tenant
- Support for multiple DotShare instances / workspaces
- Per-workspace OAuth app configuration
- Workspace-scoped deep links

---

## 💡 Under Consideration

- **GitHub OAuth** — connect GitHub for repo-aware dotfile sharing
- **GitLab OAuth** — enterprise self-hosted support
- **Discord OAuth** — community / server-based sharing
- **Token introspection endpoint** — validate token without calling platform APIs
- **Webhook support** — notify extension on token expiry
- **Analytics dashboard** — auth success/failure rates (privacy-preserving)

---

## ❌ Won't Do

- **Token storage on server** — by design, tokens are never persisted server-side
- **LinkedIn token refresh** — requires enterprise approval from LinkedIn; out of scope
- **User accounts / database** — DotShare Auth is stateless by design

---

## Contributing

Have a feature idea? Open a [feature request](https://github.com/kareem2099/dotshare-auth-server/issues/new?template=feature_request.md) or start a [discussion](https://github.com/kareem2099/dotshare-auth-server/discussions).

---

Apache-2.0 © 2026 FreeRave (kareem)