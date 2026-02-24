# Low-Level Design — Styling & State Management

## Tailwind CSS 4 — Design System

### Global CSS (`src/styles/global.css`)

```css
@import "tailwindcss";

@theme {
  /* ═══════════════ COLOR PALETTE ═══════════════ */
  /* Colors use CSS var indirection — @theme maps to CSS custom props */
  --color-background: var(--bg);
  --color-foreground: var(--fg);
  --color-card: var(--card-bg);
  --color-surface: var(--surface);
  --color-dim: var(--dim);
  --color-subtle: var(--subtle);
  --color-faint: var(--faint);
  --color-border: var(--border);

  --color-accent: #58a6ff;              /* GitHub Blue — primary accent */
  --color-accent-glow: #388bfd;         /* Accent hover */

  --color-diff-easy: #3fb950;           /* Green — easy difficulty */
  --color-diff-medium: #d29922;         /* Amber — medium difficulty */
  --color-diff-hard: #f85149;           /* Red — hard difficulty */

  /* ═══════════════ TYPOGRAPHY ═══════════════ */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;

  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  --font-size-hero: 3.5rem;

  /* ═══════════════ SPACING ═══════════════ */
  --spacing-section: 6rem;
  --spacing-card: 1.5rem;
  --spacing-inline: 0.5rem;

  /* ═══════════════ BORDERS ═══════════════ */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;

  /* ═══════════════ TRANSITIONS ═══════════════ */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 350ms ease;

  /* ═══════════════ SHADOWS ═══════════════ */
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.3);
  --shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.4);
}

/* ═══════════════ DARK PALETTE (default / SSR fallback) — GitHub Dark Dimmed ═══════════════ */
:root {
  --bg: #0d1117;
  --fg: #e6edf3;
  --card-bg: #161b22;
  --surface: #161b22;
  --dim: #8b949e;
  --subtle: #c9d1d9;
  --faint: #484f58;
  --border: #30363d;
  --accent: #58a6ff;
}

/* ═══════════════ LIGHT THEME — data-theme attribute ═══════════════ */
[data-theme="light"] {
  --bg: #f6f8fa;
  --fg: #1f2328;
  --card-bg: #ffffff;
  --surface: #f0f3f6;
  --dim: #656d76;
  --subtle: #31363b;
  --faint: #8b949e;
  --border: #d0d7de;
  --accent: #0969da;
  --color-border-hover: #afb8c1;
  --color-shadow-card: 0 1px 3px rgba(31, 35, 40, 0.08);
  --color-shadow-hover: 0 4px 12px rgba(31, 35, 40, 0.12);
}

/* ═══════════════ BASE STYLES ═══════════════ */
@layer base {
  @font-face {
    font-family: 'Inter';
    src: url('/fonts/inter-var-latin.woff2') format('woff2');
    font-weight: 100 900;
    font-display: swap;
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+2000-206F;
  }

  @font-face {
    font-family: 'JetBrains Mono';
    src: url('/fonts/jetbrains-mono-latin.woff2') format('woff2');
    font-weight: 400 700;
    font-display: swap;
    unicode-range: U+0000-00FF;
  }

  html {
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
  }

  /* Accessibility: respect reduced motion preference */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* Accessibility: visible focus indicators */
  :focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
}
```

### Responsive Breakpoints

| Breakpoint | Width | Use Case |
|---|---|---|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Small desktop |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Wide desktop |

---

## State Management — nanostores

### Store Architecture

```typescript
// src/store/uiStore.ts
import { persistentAtom } from '@nanostores/persistent';
import { atom } from 'nanostores';

// ═══════════════ PERSISTENT STATE ═══════════════
// Survives page refreshes, view transitions, and browser sessions
// SSR-safe: always start with 'dark' on the server.
// The client FOUC script in BaseHead sets data-theme before hydration,
// so the atom is only used for reactive UI (ThemeToggle icon state).
export const $theme = atom<'dark' | 'light' | 'system'>('dark');

/** Apply theme to DOM + persist to localStorage */
export function applyTheme(theme: Theme): void {
  $theme.set(theme);
  localStorage.setItem('theme', theme);  // localStorage key: 'theme'
  document.documentElement.setAttribute('data-theme', resolveTheme(theme));
}

/** Cycle: light → dark → system → light */
export function cycleTheme(): void {
  const current = $theme.get();
  const next = current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light';
  applyTheme(next);
}

// ═══════════════ TRANSIENT STATE ═══════════════
// Resets on page navigation (unless using transition:persist)
export const $algoFilter = atom<{
  platform: string | null;
  difficulty: string | null;
  tag: string | null;
}>({
  platform: null,
  difficulty: null,
  tag: null,
});
```

### Usage in Preact Islands

```tsx
// In any island .tsx file
import { useStore } from '@nanostores/preact';
import { $theme, $algoFilter } from '../store/uiStore';

export default function MyIsland() {
  const theme = useStore($theme);      // Re-renders on change
  const filter = useStore($algoFilter);

  // Write: $theme.set('dark');
  // Write: $algoFilter.set({ ...filter, platform: 'leetcode' });
}
```

### Dependencies

| Package | Size (gzip) | Purpose |
|---|---|---|
| `nanostores` | 334 B | Core atom/map stores |
| `@nanostores/persistent` | 890 B | localStorage persistence |
| `@nanostores/preact` | 200 B | Preact useStore hook |
| **Total** | **~1.4 KB** | |
