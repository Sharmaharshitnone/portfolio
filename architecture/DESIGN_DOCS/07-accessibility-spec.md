# Accessibility Specification

> **WCAG 2.1 AA compliance requirements for the production build.**

---

## Current A11y Gaps in Prototype

| # | Issue | Severity | Component |
|---|---|---|---|
| 1 | No `aria-label` on hamburger button | **Critical** | Navbar |
| 2 | No `aria-expanded` on mobile menu toggle | **Critical** | Navbar |
| 3 | No skip-to-content link | **Major** | Layout |
| 4 | No `prefers-reduced-motion` guard | **Major** | TerminalHero |
| 5 | Insufficient touch targets (<44px) | **Minor** | Multiple |
| 6 | No visible focus indicators beyond browser default | **Major** | All interactive |
| 7 | No `role` or `aria-label` on filter pill groups | **Minor** | AlgorithmsPage, LogsPage |
| 8 | Log expand/collapse has no `aria-expanded` | **Major** | LogsPage |
| 9 | Color-only difficulty indicators (dots) | **Major** | AlgorithmsPage |

---

## Required Implementations

### 1. Skip-to-Content Link

```astro
<!-- First element in BaseLayout.astro, before <Navbar /> -->
<a
  href="#main-content"
  class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100]
         focus:px-4 focus:py-2 focus:bg-foreground focus:text-background
         focus:rounded-md focus:text-sm"
>
  Skip to content
</a>

<!-- On <main> -->
<main id="main-content" class="flex-1">
```

### 2. Focus Indicators

```css
/* Global focus-visible style */
:focus-visible {
  outline: 2px solid var(--ring);  /* #58a6ff blue */
  outline-offset: 2px;
}

/* Remove default outline on non-keyboard focus */
:focus:not(:focus-visible) {
  outline: none;
}
```

### 3. Reduced Motion Guard

```typescript
// In TerminalHero — skip animation entirely
useEffect(() => {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq.matches) {
    setFrameIdx(FRAMES.length - 1); // Show final state immediately
    return;
  }
  // ... normal animation logic
}, []);
```

```css
/* Global CSS guard for all transitions */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 4. Semantic HTML Structure

```html
<!-- Each page should have -->
<nav> ... </nav>                <!-- Navigation -->
<main id="main-content">       <!-- Primary content -->
  <section aria-labelledby="hero-heading">
    <h1 id="hero-heading">...</h1>
  </section>
  <section aria-labelledby="projects-heading">
    <h2 id="projects-heading">Featured Projects</h2>
  </section>
</main>
<footer> ... </footer>         <!-- Footer -->
```

### 5. ARIA for Interactive Widgets

#### Mobile Menu

```tsx
<button
  aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
  aria-expanded={mobileOpen}
  aria-controls="mobile-nav"
>
<nav id="mobile-nav" aria-label="Mobile navigation" hidden={!mobileOpen}>
```

#### Filter Pills

```tsx
<div role="group" aria-label="Filter by difficulty">
  <button aria-pressed={diffFilter === 'easy'}>Easy</button>
  <button aria-pressed={diffFilter === 'medium'}>Medium</button>
</div>
```

#### Expandable Log Entries

```tsx
<button
  aria-expanded={expandedId === log.id}
  aria-controls={`log-content-${log.id}`}
>
  {log.title}
</button>
<div id={`log-content-${log.id}`} role="region" hidden={expandedId !== log.id}>
  {/* content */}
</div>
```

### 6. Color Accessibility

#### Difficulty Indicators

Currently color-only dots. Add text labels alongside:

```tsx
{/* Current: color dot only */}
<span className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: '#3fb950' }} />

{/* Fixed: color dot + text label */}
<span className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: '#3fb950' }} aria-hidden="true" />
<span className="text-[11px]" style={{ color: '#3fb950' }}>Easy</span>
```

The problem table already has a text label column — ensure it's always visible (not hidden on mobile).

---

## Contrast Ratios

| Text | Background | Ratio | WCAG AA? |
|---|---|---|---|
| `#e6edf3` on `#0d1117` | Primary text | **13.2:1** | ✅ AAA |
| `#c9d1d9` on `#0d1117` | Subtle text | **9.6:1** | ✅ AAA |
| `#8b949e` on `#0d1117` | Dim text | **5.3:1** | ✅ AA |
| `#484f58` on `#0d1117` | Faint text | **3.0:1** | ❌ Fails AA for body |
| `#3fb950` on `#0d1117` | Easy label | **6.9:1** | ✅ AA |
| `#d29922` on `#0d1117` | Medium label | **6.6:1** | ✅ AA |
| `#f85149` on `#0d1117` | Hard/error label | **5.4:1** | ✅ AA |
| `#0d1117` on `#e6edf3` | CTA button text | **13.2:1** | ✅ AAA |

> **⚠️ `--color-faint` (`#484f58`) fails AA** for small text. It's acceptable for non-essential metadata (dates, counters) but must NOT be used for primary labels or links. Keep `faint` usage limited to supplementary information.

---

## Keyboard Navigation

| Key | Action |
|---|---|
| `Tab` | Move between interactive elements |
| `Enter` / `Space` | Activate buttons, links, toggles |
| `Escape` | Close mobile menu |
| `Arrow keys` | Navigate within filter groups (with `role="group"`) |
