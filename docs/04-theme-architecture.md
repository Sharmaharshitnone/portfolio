# Theme Architecture: CSS Custom Properties for Preact Islands

## TL;DR

Preact islands that need theme-aware colours must use **CSS custom properties** (`var(--terminal-*)`) instead of JavaScript-derived colour objects from nanostores. This eliminates a class of bugs caused by Astro's View Transition hydration behaviour.

---

## The Problem

### Symptoms

1. Toggle to light mode on `/projects`
2. Navigate to `/` (homepage)
3. TerminalHero renders in dark colours despite `data-theme="light"` on `<html>`
4. Clicking the theme toggle or refreshing the page fixes it

### Root Cause

Astro's `<ClientRouter />` enables SPA-style navigation via View Transitions. When navigating between pages:

1. **Bundled JS modules only execute once** — the nanostore module (`uiStore.ts`) persists in memory
2. **Islands are destroyed and re-hydrated** — Preact receives the server-rendered static HTML and hydrates against it
3. **Hydration reconciliation ignores inline style differences** — if the server rendered `color: #3fb950` (dark) but the nanostore now says "light", Preact's hydrator doesn't reliably update inline `style` attributes

This is documented in [Astro Issue #8781](https://github.com/withastro/astro/issues/8781).

### Why Previous Fixes Failed

| Attempt | Why It Failed |
|---|---|
| `useStore($theme)` in TerminalHero | Nanostore value correct, but Preact hydration doesn't apply the new inline styles |
| `astro:after-swap` → `$theme.set()` | Re-syncs store, but the re-render races against the DOM swap; Preact may not diff the styles |
| MutationObserver on `data-theme` | Detects changes, but triggering a state update during hydration leads to inconsistent renders |

---

## The Solution: CSS Custom Properties

### Architecture

```
                                ┌─────────────────┐
 localStorage ──▶ BaseHead.astro │  is:inline script│
 'harshit:theme'   (before-swap) │  Sets data-theme │
                                └───────┬─────────┘
                                        │
                    ┌───────────────────┼────────────────────┐
                    │                   │                    │
              ┌─────▼─────┐    ┌───────▼───────┐   ┌───────▼──────┐
              │ global.css │    │ global.css     │   │ global.css   │
              │ :root,     │    │ [data-theme=   │   │ [data-theme= │
              │ [dark]     │    │  "light"]      │   │  "dark"]     │
              │--terminal- │    │--terminal-     │   │--terminal-   │
              │prompt-user:│    │prompt-user:    │   │prompt-user:  │
              │ #3fb950    │    │ #1a7f37        │   │ #3fb950      │
              └─────┬──────┘    └───────┬───────┘   └──────┬───────┘
                    │                   │                   │
                    └───────────┬───────┘                   │
                                │                           │
                    ┌───────────▼──────────────┐            │
                    │  TerminalHero.tsx         │            │
                    │  style={{ color:         │            │
                    │    'var(--terminal-       │            │
                    │     prompt-user)' }}      │            │
                    │                          │            │
                    │  NO nanostore import     │            │
                    │  NO useStore($theme)     │            │
                    │  NO resolveTheme()       │            │
                    └──────────────────────────┘
```

### Key Principle

> **CSS cascade resolves `var()` at paint time.** When `data-theme` changes on `<html>`, every `var(--terminal-*)` reference updates instantly — no JavaScript, no framework re-render, no hydration.

### Implementation

#### Step 1: Define CSS custom properties in `global.css`

```css
:root, [data-theme="dark"] {
    --terminal-prompt-user:  #3fb950;
    --terminal-separator:    #7d8590;
    --terminal-path:         #58a6ff;
    --terminal-command:      #e6edf3;
    --terminal-output:       #d2dae4;
    --terminal-cursor:       #00e5a0;
    --terminal-header-bg:    rgba(22, 27, 34, 0.9);
    --terminal-body-bg:      linear-gradient(145deg, #0a0e14 0%, #0d1117 50%, #0f1318 100%);
    --terminal-title-text:   #7d8590;
    --terminal-shadow:       0 0 0 1px rgba(0,229,160,0.12), ...;
}

[data-theme="light"] {
    --terminal-prompt-user:  #1a7f37;
    /* ... light-theme equivalents ... */
}
```

#### Step 2: Reference CSS vars in island component

```tsx
// TerminalHero.tsx — NO theme imports
export function TerminalHero() {
    return (
        <div style={{ background: 'var(--terminal-body-bg)' }}>
            <span style={{ color: 'var(--terminal-prompt-user)' }}>harshit@arch</span>
        </div>
    );
}
```

#### Step 3: Add CSS transitions for smooth switching

```css
.terminal-hero {
    transition: background 0.3s ease, box-shadow 0.3s ease;
}
.terminal-hero span, .terminal-hero div {
    transition: color 0.3s ease, background-color 0.3s ease;
}
```

---

## When to Use Each Approach

| Scenario | Use CSS Custom Properties | Use `useStore($theme)` |
|---|---|---|
| Background colours | ✅ | ❌ |
| Text colours | ✅ | ❌ |
| Box shadows | ✅ | ❌ |
| Gradients | ✅ | ❌ |
| Icon switching (sun/moon) | ❌ | ✅ |
| Conditional rendering | ❌ | ✅ |
| Non-visual logic | ❌ | ✅ |

**Rule of thumb:** If it's a colour/style → CSS var. If it's logic → nanostore.

---

## Files Changed

| File | Change |
|---|---|
| `src/styles/global.css` | Added `--terminal-*` CSS vars to both theme blocks; added `.terminal-hero` transition rules |
| `src/components/islands/TerminalHero.tsx` | Removed `useStore`, `$theme`, `resolveTheme` imports; deleted `darkColors`/`lightColors` objects; replaced all `activeColors.X` with `var(--terminal-X)` |
| `architecture/ADR/ADR-012-css-var-theme-islands.md` | Formal ADR documenting the decision |
| `architecture/ADR/ADR-006-view-transitions.md` | Updated theme persistence section with 3-layer architecture |

---

## References

- [Astro View Transitions: Script Behavior](https://docs.astro.build/en/guides/view-transitions/#script-behavior-with-view-transitions)
- [Astro Issue #8781: Persist island state with View Transitions](https://github.com/withastro/astro/issues/8781)
- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Astro Dark Mode Pattern](https://docs.astro.build/en/tutorial/6-islands/3/)
