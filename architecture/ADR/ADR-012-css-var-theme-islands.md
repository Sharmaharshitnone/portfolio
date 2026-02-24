# ADR-012: CSS Custom Properties for Island Theming

| Field | Value |
|---|---|
| **Status** | ✅ Accepted |
| **Date** | 2026-02-24 |
| **Deciders** | Harshit Sharma |
| **Supersedes** | Partial guidance in ADR-006 (JS-based theme sync) |

## Context

Preact islands that derive visual state from a nanostore (`$theme`) fail to reflect theme changes after View Transition navigation. This is a known Astro limitation ([withastro/astro#8781](https://github.com/withastro/astro/issues/8781)):

1. **Bundled modules execute once** — the nanostore module initialises on first page load and persists.
2. **Islands re-hydrate from static HTML** — when navigating back to a page, Preact hydrates against the server-rendered (stale) DOM.
3. **Hydration reconciliation fails for inline styles** — Preact does not reliably diff inline `style` attributes set by the server against values derived from the (now-updated) nanostore.

The result: toggling theme on page B, then navigating to page A, leaves the island (e.g., TerminalHero) stuck in the old theme.

### Approaches Evaluated

| Approach | Pros | Cons |
|---|---|---|
| `useStore($theme)` + JS color objects | Simple reactive binding | Hydration mismatch; inline styles stale |
| `astro:after-swap` → `$theme.set()` | Re-syncs store on navigation | Still depends on Preact re-render racing DOM swap |
| `transition:persist` on island | Preserves island state entirely | Component not on every page; persisted DOM stale |
| MutationObserver on `data-theme` | Detects attribute changes | Extra listener per island; cleanup complexity |
| **CSS custom properties (selected)** | Zero JS; cascade handles it | Slightly more CSS to maintain |

## Decision

**Use CSS custom properties for all theme-dependent island colours.**

Every colour that varies between dark/light themes in an island component is defined as a `--terminal-*` (or `--component-*`) CSS custom property in `global.css`, scoped under `[data-theme="dark"]` and `[data-theme="light"]`. The island references `var(--terminal-prompt-user)` etc. in inline styles.

### Why This Works

```
data-theme="light" on <html>
        │
        ├─ CSS cascade resolves all var(--terminal-*) to light values
        │
        └─ Browser repaints — no JS, no store, no hydration
```

When `BaseHead.astro`'s inline script sets `data-theme` during `astro:before-swap`, the CSS variables resolve to the correct palette **before the transition screenshot is captured**. The island's inline styles never change — they're always `var(--terminal-X)` — only the CSS variable definitions change.

### Implementation Pattern

```css
/* global.css */
:root, [data-theme="dark"] {
    --terminal-prompt-user:  #3fb950;
    --terminal-body-bg:      linear-gradient(...);
    /* ... */
}
[data-theme="light"] {
    --terminal-prompt-user:  #1a7f37;
    --terminal-body-bg:      linear-gradient(...);
    /* ... */
}
```

```tsx
/* TerminalHero.tsx — no theme imports needed */
<span style={{ color: 'var(--terminal-prompt-user)' }}>{text}</span>
<div style={{ background: 'var(--terminal-body-bg)' }}>...</div>
```

## Consequences

### Positive
- **Zero JS theme sync** — no nanostore subscription, no `astro:after-swap` handler needed for colours
- **Immune to hydration bugs** — inline style values are static strings (`var(--x)`), not dynamic JS values
- **Smooth transitions** — CSS `transition` on the container animates colour changes for free
- **Works with View Transitions** — `astro:before-swap` stamps `data-theme` on `newDocument`, so CSS vars resolve correctly in the transition snapshot

### Negative
- Each themed island adds ~10-20 CSS custom properties to `global.css`
- Designers must update both `[data-theme="dark"]` and `[data-theme="light"]` blocks
- `box-shadow` with complex gradients stored as CSS vars can be harder to read

### When to Still Use `useStore($theme)`
- **Icon switching** (e.g., ThemeToggle showing sun/moon) — this is boolean logic, not styling
- **Conditional rendering** — showing/hiding elements based on theme
- For these cases, the `astro:after-swap` → `$theme.set()` listener in `uiStore.ts` remains correct

## References

- [Astro View Transitions — Script Behavior](https://docs.astro.build/en/guides/view-transitions/#script-behavior-with-view-transitions)
- [GitHub Issue #8781 — Persist island state across View Transitions](https://github.com/withastro/astro/issues/8781)
- [CSS Custom Properties Cascade](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
