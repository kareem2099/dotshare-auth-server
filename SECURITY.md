# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.3.x (Pro) | ✅ |
| 1.2.x | ⚠️ Security fixes only |
| < 1.2.0 | ❌ |

---

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Report vulnerabilities privately via email:

**kareem209907@gmail.com** *(or open a [GitHub private advisory](https://github.com/kareem2099/dotshare-auth-server/security/advisories/new))*

### What to include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (optional)

### Response timeline

| Stage | Time |
|-------|------|
| Acknowledgement | 48 hours |
| Initial assessment | 5 business days |
| Fix + disclosure | 30 days (critical: 7 days) |

---

## Security Design

DotShare Auth is designed with these principles:

**Zero client-side secrets**
App credentials (`CLIENT_SECRET`, `APP_SECRET`) never leave the server. Only public IDs (`NEXT_PUBLIC_*`) are exposed to the browser.

**PKCE for X (Twitter)**
Authorization code interception is prevented via `code_verifier` / `code_challenge` — no client secret needed or used.

**CSRF protection**
`state` parameter is generated per-session and validated on callback for X and Reddit.

**sessionStorage hygiene**
Only non-secret PKCE and state values are stored client-side. All values are removed immediately after use.

**Server-side token exchange**
All OAuth code-for-token exchanges happen in Next.js API routes — tokens are never handled in the browser.

**No token storage**
Tokens are passed directly to VS Code via deep link and are never logged, cached, or persisted on the server.

---

## Scope

| In scope | Out of scope |
|----------|--------------|
| Auth server logic | VS Code extension internals |
| API route vulnerabilities | Third-party OAuth providers |
| Token handling / leakage | Social platform security |
| Dependency vulnerabilities | Vercel infrastructure |

---

## Hall of Fame

Responsible disclosures will be credited here (with permission).

*None yet — be the first.*

---

Apache-2.0 © 2026 FreeRave (kareem)