# ADR-007: Tailwind CSS 4 via Vite Plugin

| Field | Value |
|---|---|
| **Status** | ✅ Accepted |
| **Date** | 2026-02-22 |
| **Deciders** | Harshit Sharma |

## Context

The portfolio needs a styling solution that is fast, maintainable, and produces minimal CSS output.

## Decision

Use **Tailwind CSS 4** via the official `@tailwindcss/vite` plugin (NOT `@astrojs/tailwind`).

### Breaking Change in Astro 5.2+

The `@astrojs/tailwind` integration is **deprecated** for Tailwind v4. The correct integration path:

```bash
# Install
pnpm add tailwindcss @tailwindcss/vite
```

```javascript
// astro.config.mjs
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  vite: { plugins: [tailwindcss()] },
});
```

### CSS-First Configuration

Tailwind 4 moves config from `tailwind.config.js` → CSS `@theme` rule:

```css
/* src/styles/global.css */
@import "tailwindcss";

@theme {
  /* Color Palette — Dark/Terminal-inspired */
  --color-bg-primary: #0a0a0a;
  --color-bg-secondary: #111111;
  --color-text-primary: #e4e4e7;
  --color-text-secondary: #a1a1aa;
  --color-accent: #58a6ff;        /* GitHub Blue accent */
  --color-accent-glow: #388bfd;    /* Accent hover */
  --color-success: #4ade80;
  --color-warning: #facc15;

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Spacing Scale */
  --spacing-section: 6rem;
  --spacing-card: 1.5rem;

  /* Border Radius */
  --radius-card: 0.75rem;
  --radius-badge: 0.375rem;
}
```

### Key Tailwind 4 Features Used

| Feature | Benefit |
|---|---|
| **Oxide Engine** | 5x faster full builds, 100x faster incremental |
| **CSS-first config** | No `tailwind.config.js` — design tokens in CSS |
| **Native cascade layers** | Better specificity control |
| **Zero-config content detection** | Auto-detects template files |
| **CSS theme variables** | Design tokens as CSS custom properties by default |

## Consequences

- No `tailwind.config.js` or `tailwind.config.ts` needed
- Must import `@tailwindcss/vite` in `astro.config.mjs` vite plugins
- Design tokens declared with `@theme` in CSS, not JavaScript
- `@astrojs/tailwind` must NOT be installed alongside `@tailwindcss/vite`

## References

- [Tailwind CSS v4.0 announcement](https://tailwindcss.com/blog/tailwindcss-v4)
- [Astro + Tailwind v4 guide](https://docs.astro.build/en/guides/styling/#tailwind)
