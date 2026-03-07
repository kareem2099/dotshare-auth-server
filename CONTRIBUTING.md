# Contributing to DotShare Auth

Thank you for your interest in contributing! This document outlines the process for contributing to this project.

---

## Development Setup

```bash
git clone https://github.com/freerave/dotshare-auth.git
cd dotshare-auth
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

1. Add platform config to `lib/platforms.ts`
2. Add CSS variables in `globals.css`:
   ```css
   --platformname: #hexcolor;
   --platformname-bg: #hexcolor15;
   --platformname-border: #hexcolor30;
   --platformname-focus: #hexcolor50;
   --platformname-hover: #darkercolor;
   --platformname-corner: #tintcolor;
   ```
3. Add to `t.platform()` union type in `lib/tokens.ts`
4. Create pages: `app/auth/platformname/page.tsx` and `app/auth/platformname/callback/page.tsx`
5. Create API route: `app/api/auth/platformname/route.ts`
6. Add card to `app/page.tsx`

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
fix: state mismatch on Reddit callback
style: update Reddit corner color token
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

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.