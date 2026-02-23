# Low-Level Design — Styling & State Management

## Tailwind CSS 4 — Design System

### Global CSS (`src/styles/global.css`)

```css
@import "tailwindcss";

@theme {
  /* ═══════════════ COLOR PALETTE ═══════════════ */
  /* Dark theme (default) — Terminal/Neovim-inspired, GitHub Dark Dimmed base */
  --color-bg-primary: #0d1117;          /* GitHub dark background */
  --color-bg-secondary: #161b22;        /* Slightly lighter panels */
  --color-bg-card: #1c2128;             /* Card surfaces */
  --color-bg-hover: #262c36;            /* Hover states */

  --color-text-primary: #e6edf3;        /* High-contrast body text */
  --color-text-secondary: #8b949e;      /* Subdued text */
  --color-text-muted: #6e7681;          /* Disabled / placeholder */

  --color-accent: #2dd4bf;              /* Teal — primary accent (terminal cursor) */
  --color-accent-hover: #14b8a6;        /* Teal hover */
  --color-accent-subtle: rgba(45, 212, 191, 0.1);  /* Teal glow backgrounds */

  --color-success: #3fb950;             /* Green — builds pass */
  --color-warning: #d29922;             /* Amber — caution badges */
  --color-error: #f85149;               /* Red — error states */

  --color-border: #30363d;              /* Subtle borders */
  --color-border-hover: #484f58;        /* Active borders */

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

/* ═══════════════ LIGHT THEME OVERRIDES ═══════════════ */
html:not(.dark) {
  --color-bg-primary: #f6f8fa;          /* GitHub light background */
  --color-bg-secondary: #eaeef2;
  --color-bg-card: #ffffff;
  --color-bg-hover: #d0d7de;
  --color-text-primary: #1f2328;        /* Near-black text */
  --color-text-secondary: #656d76;
  --color-text-muted: #8c959f;
  --color-accent: #0d9488;              /* Teal — darker for light bg contrast */
  --color-accent-hover: #0f766e;
  --color-border: #d0d7de;
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
export const $theme = persistentAtom<'light' | 'dark' | 'system'>(
  'harshit:theme',  // localStorage key
  'system',         // default value
);

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
