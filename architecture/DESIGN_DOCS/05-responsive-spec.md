# Responsive Design Specification

> **Breakpoints, mobile adaptations, and touch target compliance.**

---

## Breakpoints (Tailwind CSS 4 defaults)

| Prefix | Min-Width | Usage |
|---|---|---|
| (none) | 0px | Mobile-first base styles |
| `sm:` | 640px | Tablet / wider mobile |
| `md:` | 768px | Desktop nav reveal |
| `lg:` | 1024px | Multi-column grids |

---

## Container Responsive Behavior

```css
/* All pages use percentage padding — no max-width container */
Base:  px-[5%]   → 5% on each side (leaves 90% content width)
sm+:   px-[6%]   → 6% on each side (leaves 88% content width)
```

On a 1440px screen: content = 1440 × 0.88 = **1267px**
On a 375px phone: content = 375 × 0.90 = **337px**

---

## Component Breakpoint Behavior

### Navbar

| Property | Mobile (<768px) | Desktop (≥768px) |
|---|---|---|
| Nav links | Hidden | Inline flex `gap-0.5` |
| Hamburger | Visible | Hidden |
| Mobile menu | Toggleable panel below nav | N/A |
| Height | `h-14` (56px) | `h-14` (56px) |

### Grids

| Component | Mobile | `sm` (640px+) | `lg` (1024px+) |
|---|---|---|---|
| Project cards | 1 column | 2 columns | 3 columns |
| Tech stack icons | REMOVED from homepage; tech badges are shown per-project (project cards) | N/A | N/A |
| Contact layout | Stacked | Stacked | 2-column `lg:grid-cols-2` |
| Algorithm table | Stacked (single column) | 5-column grid | Same |

### Typography Scale

| Element | Mobile | Desktop |
|---|---|---|
| Page H1 | `clamp(1.75rem, 4vw, 2.5rem)` → ~28px | → ~40px |
| Hero H1 | `clamp(2rem, 5vw, 3rem)` → ~32px | → ~48px |
| Terminal text | `13px` | `text-sm` (14px) |
| Terminal padding | `px-5 py-6` | `px-7 py-7` |

### Spacing Scale

| Section | Mobile | Desktop |
|---|---|---|
| Hero top | `pt-20` (80px) | `pt-32` (128px) |
| Section gap | `pb-24` (96px) | `pb-36` (144px) |
| CTA bottom | `pb-28` (112px) | `pb-40` (160px) |

### Algorithm Table

On mobile (<640px), the 5-column grid collapses to a single column:

```
Mobile: grid-cols-1 → each cell stacks vertically
Desktop: grid-cols-[1fr_80px_90px_auto_90px]
```

Hidden on mobile: "Solved" date (`hidden sm:inline`).

### Terminal Hero Width

```
Mobile: w-full (edge-to-edge)
sm+:    w-[92%] mx-auto (slight inset for perspective effect)
```

---

## Touch Targets

| Element | Size | WCAG Compliant (44×44px)? |
|---|---|---|
| Nav links | `px-3 py-1.5` → ~48×28px | ⚠️ Height below 44px |
| Mobile nav links | `px-3 py-2` → ~48×36px | ⚠️ Height below 44px |
| Hamburger button | `p-2` → ~36×36px | ❌ Below minimum |
| Filter pills | `px-2.5 py-1` → ~40×24px | ❌ Below minimum |
| Footer icons | `h-4 w-4` → ~16×16px | ❌ Below minimum |
| CTA buttons | `px-4 py-2` or `px-5 py-2.5` | ✅ ~60×40px |

### Production Fixes

For Astro build, increase touch targets:
- Hamburger: `p-3` minimum → 48×48px
- Filter pills: `py-2` minimum → ~32px height (acceptable for non-critical)
- Footer icons: Wrap in `p-2` touch area → 32×32px minimum
