# Contributing to DotShare Auth

Thank you for your interest in contributing! This document outlines the process for contributing to this project.

---

## Development Setup

```bash
git clone https://github.com/kareem2099/dotshare-auth-server.git
cd dotshare-auth-server
npm install
cp .env.example .env.local
npm run dev
```

---

## Project Conventions

### Colors & Theming

**Never use hardcoded hex values in components.** All colors must go through the token system:

```typescript
// ❌ Wrong
color: '#f0ede8'
background: '#0f0f0f'

// ✅ Correct
import { t } from '@/lib/tokens';
color: t.text
background: t.surface
```

All CSS variables are defined in `globals.css` under `:root` (dark) and `[data-theme="light"]`.

### Adding a New Platform

1. Add platform config to `lib/platforms.ts`:
   ```typescript
   platformname: {
     name: 'Platform Name',
     icon: 'icon',
     description: 'Short description',
     scopes: ['scope.one', 'scope.two'],
     authUrl: 'https://platform.com/oauth/authorize',
     envKey: 'NEXT_PUBLIC_PLATFORMNAME_CLIENT_ID',
     titleGradientTo: '#hexcolor',
   }
   ```
2. Add `PlatformKey` to the union type in `lib/platforms.ts`:
   ```typescript
   export type PlatformKey = 'linkedin' | 'x' | 'facebook' | 'reddit' | 'platformname';
   ```
3. Add CSS variables in `globals.css`:
   ```css
   --platformname: #hexcolor;
   --platformname-bg: #hexcolor15;
   --platformname-border: #hexcolor30;
   --platformname-focus: #hexcolor50;
   --platformname-hover: #darkercolor;
   --platformname-corner: #tintcolor;
   ```
4. Add gradient variables in `globals.css`:
   ```css
   /* :root */
   --gradient-platformname: radial-gradient(ellipse 80% 60% at 50% -20%, #tintcolor 0%, #080808 60%);
   /* [data-theme="light"] */
   --gradient-platformname: radial-gradient(ellipse 80% 60% at 50% -20%, #lighttint 0%, #faf8f5 60%);
   ```
5. Create pages:
   ```
   app/auth/platformname/page.tsx
   app/auth/platformname/callback/page.tsx
   ```
   Both are single-line wrappers — no logic needed:
   ```typescript
   // page.tsx
   'use client';
   import { AuthPage } from '@/components/AuthPage';
   export default function PlatformNameAuth() {
     return <AuthPage platform="platformname" />;
   }

   // callback/page.tsx
   'use client';
   import { CallbackPage } from '@/components/CallbackPage';
   export default function PlatformNameCallback() {
     return <CallbackPage platform="platformname" />;
   }
   ```
6. Create API route: `app/api/auth/platformname/route.ts`
   - If the platform supports token refresh, also add `app/api/auth/platformname/refresh/route.ts`
   - If the platform uses token extension (like Facebook), add `app/api/auth/platformname/extend/route.ts`
7. Add env variables to `.env.example`:
   ```env
   NEXT_PUBLIC_PLATFORMNAME_CLIENT_ID=your_client_id
   PLATFORMNAME_CLIENT_ID=your_client_id
   PLATFORMNAME_CLIENT_SECRET=your_client_secret
   ```

> `app/page.tsx` reads from `PLATFORMS` automatically — no changes needed there.

### Code Style

- **TypeScript** — strict mode, no `any`
- **Client components** — use `'use client'` only when needed (event handlers, hooks)
- **Navigation** — use `useRouter().push()` for internal routes, `window.location.href` for external OAuth redirects
- **No `<a>` tags** for internal navigation — use `useRouter` or `<Link>`
- **Async in useEffect** — always wrap setState calls in an async function inside useEffect

```typescript
// ✅ Correct pattern
useEffect(() => {
  async function handleCallback() {
    // ... setState calls here
  }
  handleCallback();
}, [deps]);
```

---

## Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make your changes
4. Run checks:
   ```bash
   npm run build
   npm run lint
   ```
5. Commit using conventional commits (see below)
6. Push and open a Pull Request

### Commit Convention

```
feat:     new feature
fix:      bug fix
style:    UI/CSS changes (no logic change)
refactor: code restructure
docs:     documentation only
chore:    build, deps, config
```

Examples:
```
feat: add Bluesky OAuth support
feat: add Bluesky token refresh endpoint
fix: state mismatch on Reddit callback
style: update Reddit corner color token
refactor: extract shared callback logic into useOAuthCallback
docs: add Reddit setup instructions to README
```

---

## Reporting Issues

When reporting a bug, please include:

- Platform affected (LinkedIn / X / Facebook / Reddit)
- Browser and OS
- Steps to reproduce
- Expected vs actual behavior
- Any console errors

> For security vulnerabilities, do **not** open a public issue — see [SECURITY.md](./SECURITY.md) instead.

---

## License

By contributing, you agree that your contributions will be licensed under the Apache-2.0 License.
```