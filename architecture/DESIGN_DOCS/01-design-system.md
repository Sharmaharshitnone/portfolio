# Design System — Token Reference

> **Source of truth for all visual constants.** Tokens defined here must be used as-is in the Astro production build. No deviation.

## Color Palette

The palette is **GitHub Dark Dimmed** exact — chosen because it's the most readable dark scheme in the industry, battle-tested by 100M+ developers daily.

### Core Semantic Tokens

```css
/* Dark theme (default) — applied on :root and .dark */
--background:         #0d1117    /* Page background — pure GitHub dark */
--foreground:         #e6edf3    /* Primary text — near-white */
--card:               #161b22    /* Cards, panels, nav bg */
--card-foreground:    #e6edf3    /* Text on cards */
--muted:              #161b22    /* Muted backgrounds */
--muted-foreground:   #8b949e    /* Subdued text (metadata, labels) */
--border:             #30363d    /* Default borders — all components */
--ring:               #58a6ff    /* Focus ring — blue accessibility glow */
--destructive:        #f85149    /* Error state / destructive actions */
```

### Extended Semantic Tokens

```css
/* Custom tokens beyond shadcn defaults */
--color-surface:        #161b22    /* Hover-state card backgrounds */
--color-surface-raised: #1c2128    /* Elevated elements (icon boxes / elevated panels) */
--color-dim:            #8b949e    /* Secondary text (= muted-foreground) */
--color-subtle:         #c9d1d9    /* Slightly brighter than dim — titles, links */
--color-faint:          #484f58    /* Tertiary text (dates, counters, metadata) */
--color-line:           #30363d    /* Borders (= border) */
--color-line-strong:    #484f58    /* Active/hover borders */
```

### Functional Colors

```css
/* Difficulty system — used across Algorithms page + badges */
--color-diff-easy:   #3fb950    /* Green — easy problems */
--color-diff-medium: #d29922    /* Amber — medium problems */
--color-diff-hard:   #f85149    /* Red — hard problems (= destructive) */
```

### Color Usage Matrix

| Token | Where Used | Example |
|---|---|---|
| `--background` | `<body>`, terminal body, code blocks | `#0d1117` |
| `--foreground` | Headings, primary text, active nav, CTA bg | `#e6edf3` |
| `--card` | Project cards, nav bg, code block headers | `#161b22` |
| `--color-dim` | Body prose, nav links, descriptions | `#8b949e` |
| `--color-faint` | Dates, read times, star counts, category labels | `#484f58` |
| `--color-subtle` | Links, code output, table cells | `#c9d1d9` |
| `--border` | Every bordered element — cards, inputs, table rows | `#30363d` |
| `#21262d` | Inner borders (table row dividers), tech badge bg | Darker than `--border` |
| `#010409` | Terminal main body (darker than page bg) | Pure terminal black |

### 60-30-10 Rule Application

| Ratio | Color | Usage |
|---|---|---|
| **60%** | `#0d1117` (background) | Page, terminal body, inputs |
| **30%** | `#161b22` (card/surface) | Cards, nav, code headers, panels |
| **10%** | `#e6edf3` (foreground) | Active text, CTA buttons, inverted badges |

---

## Typography

### Font Stack

```css
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
```

| Context | Font | Weight | Size | Usage |
|---|---|---|---|---|
| **Headings** | Inter | 500 (medium) | `clamp(1.75rem, 4vw, 2.5rem)` | Page titles |
| **Hero name** | Inter | 500 | `clamp(2rem, 5vw, 3rem)` | Homepage H1 |
| **Body prose** | Inter | 400 (normal) | `15px` or `text-sm` (14px) | Descriptions, paragraphs |
| **Terminal text** | JetBrains Mono | 400 | `13px` or `text-sm` | Terminal hero, code blocks |
| **Data labels** | JetBrains Mono | 400 | `11px` | Tags, dates, counters, platform badges |
| **Nav links** | Inter | 400 | `13px` | Navigation items |
| **CTA buttons** | Inter | 500 | `13px` | Action buttons |
| **Stat values** | JetBrains Mono | 400 | `text-lg` (18px) | "800+", "1900+", etc. |

### Font Production Rule

> **⚠️ Self-host required.** Download Inter Variable + JetBrains Mono as WOFF2 to `public/fonts/`. The design prototype uses Google Fonts CDN — this adds 100-300ms LCP. Self-hosting with `font-display: swap` + `<link rel="preload">` is mandatory.

---

## Spacing System

### Container Pattern

```css
/* Used on ALL page content sections */
.container {
  width: 100%;
  padding-left: 5%;      /* mobile */
  padding-right: 5%;
}
@media (min-width: 640px) {
  .container {
    padding-left: 6%;    /* desktop */
    padding-right: 6%;
  }
}
```

> **No max-width container.** Content flows to 100% width with percentage padding. This creates the Linear.app / Vercel-style edge-to-edge feel.

### Vertical Rhythm

| Spacing | Value | Usage |
|---|---|---|
| Page top padding | `pt-20 sm:pt-32` (80→128px) | First section top |
| Section gap | `pb-24 sm:pb-36` (96→144px) | Between major sections |
| Heading to content | `mb-8` → `mb-14` | Varies by density |
| Card inner padding | `p-5` or `p-6 sm:p-8` | Standard / featured |
| Card gap (grid) | `gap-4` (16px) | Between cards in grid |
| Element micro-gap | `gap-1.5` → `gap-3` | Tags, badges, icons |

### Border Radius

```css
--radius: 6px;
--radius-sm: 4px;    /* calc(6px - 2px) */
--radius-md: 6px;    /* base */
--radius-lg: 8px;    /* calc(6px + 2px) */
--radius-xl: 12px;   /* calc(6px + 6px) */
```

All components use `rounded-md` (6px) as the standard. Terminal hero uses `rounded-lg` (8px).

---

## Shadows

| Context | Shadow |
|---|---|
| Terminal hero (3D) | `0 30px 80px -12px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03)` |
| Standard cards | None (border-only aesthetic) |
| Hover states | Background change only (`hover:bg-surface`) |

> **Design principle:** No box-shadows on cards. The dark theme uses border + background-change for elevation instead of shadows. This creates the GitHub/Linear flat aesthetic.

---

## Selection Color

```css
::selection {
  background: rgba(88, 166, 255, 0.25);  /* Blue tint from --ring */
}
```
