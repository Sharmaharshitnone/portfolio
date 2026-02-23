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

Dark mode must survive View Transitions. Handle with `astro:after-swap`:

```astro
<script is:inline>
  // Runs AFTER every view transition swap — re-applies theme class
  document.addEventListener('astro:after-swap', () => {
    const theme = localStorage.getItem('harshit:theme') || 'system';
    const isDark = theme === 'dark' || 
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
  });
</script>
```

> **Note:** This is the _View Transition_ theme restore. The initial FOUC prevention script (also `is:inline`) runs in `<head>` on first load — see [HLD/03 Island Hydration Map](../HLD/03-island-hydration-map.md#fouc-prevention).

## Consequences

- All internal links get client-side navigation automatically
- Scripts may need `data-astro-rerun` attribute to re-execute after transitions
- Theme state requires `astro:after-swap` event listener
- External links and form submissions behave normally (full page load)

## References

- [Astro View Transitions docs](https://docs.astro.build/en/guides/view-transitions/)
- [ClientRouter API](https://docs.astro.build/en/reference/modules/astro-transitions/)
