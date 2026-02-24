# ADR-006: View Transitions via `<ClientRouter />`

| Field | Value |
|---|---|
| **Status** | ✅ Accepted |
| **Date** | 2026-02-22 |
| **Deciders** | Harshit Sharma |

## Context

The portfolio should feel like a modern SPA (smooth page navigation) while remaining an MPA (Multi-Page App) with zero JS content pages.

## Decision

Use Astro's **View Transitions** via the `<ClientRouter />` component for SPA-feel navigation.

### How It Works

```astro
---
// src/components/global/BaseHead.astro
import { ClientRouter } from 'astro:transitions';
---
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<ClientRouter />
```

Adding `<ClientRouter />` to the shared `<head>` enables:
1. **Client-side navigation** — link clicks intercepted, only new content fetched
2. **Automatic animations** — fade transitions between pages by default
3. **Fallback for old browsers** — gracefully degrades to full page loads

### Transition Directives

| Directive | Use Case | Example |
|---|---|---|
| `transition:name` | Pair elements across pages for shared animations | Project card → Project hero image |
| `transition:animate` | Override default animation (`fade`, `slide`, custom) | Slide-in sidebar |
| `transition:persist` | Keep interactive element state across navigations | Theme toggle state, audio player |

### Theme Persistence with View Transitions

Dark mode must survive View Transitions. The approach has two layers:

#### Layer 1: DOM attribute stamping (inline script in BaseHead)

The inline `is:inline` script sets `data-theme` on `<html>` at three points:
1. **Immediate** — prevents FOUC on initial page load
2. **`astro:before-swap`** — stamps `event.newDocument.documentElement` so the transition screenshot is correct
3. **`astro:after-swap`** — belt-and-suspenders re-application after DOM swap

```astro
<script is:inline>
  ;(function () {
    var KEY = 'harshit:theme';
    function resolve() {
      var s = localStorage.getItem(KEY) || 'system';
      return (s === 'dark' || (s === 'system' && matchMedia('(prefers-color-scheme:dark)').matches))
        ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', resolve());
    document.addEventListener('astro:before-swap', function (e) {
      e.newDocument.documentElement.setAttribute('data-theme', resolve());
    });
    document.addEventListener('astro:after-swap', function () {
      document.documentElement.setAttribute('data-theme', resolve());
    });
  })();
</script>
```

#### Layer 2: CSS custom properties for island colours (ADR-012)

Island components like TerminalHero use `var(--terminal-*)` CSS custom properties
instead of JS-derived colour objects. This eliminates hydration mismatches entirely —
see [ADR-012: CSS Custom Properties for Island Theming](ADR-012-css-var-theme-islands.md).

#### Layer 3: Nanostore sync for non-styling state

The `$theme` nanostore is re-synced via `astro:after-swap` in `uiStore.ts` module scope.
This is only needed for **icon switching** (ThemeToggle sun/moon) —
styling must NOT depend on the nanostore.

## Consequences

- All internal links get client-side navigation automatically
- Scripts may need `data-astro-rerun` attribute to re-execute after transitions
- Theme state requires `astro:after-swap` event listener
- External links and form submissions behave normally (full page load)

## References

- [Astro View Transitions docs](https://docs.astro.build/en/guides/view-transitions/)
- [ClientRouter API](https://docs.astro.build/en/reference/modules/astro-transitions/)
