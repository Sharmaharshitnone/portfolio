# ADR-003: Preact for Client Islands

| Field | Value |
|---|---|
| **Status** | ✅ Accepted |
| **Date** | 2026-02-22 |
| **Deciders** | Harshit Sharma |

## Context

Astro's island architecture requires a UI framework for interactive components. Only a few components need client-side JavaScript: theme toggle, contact form, algorithm filter, and view counter.

## Decision

Use **Preact** (`@astrojs/preact`) for all client-side islands.

### Why Preact Over React/Svelte/Vue/Solid

| Framework | Bundle Size (min+gz) | React API Compatible | Astro Integration |
|---|---|---|---|
| **Preact** | **3 KB** | ✅ Yes (`preact/compat`) | `@astrojs/preact` |
| React 18 | 42 KB | — | `@astrojs/react` |
| Svelte 5 | 2 KB (per component) | ❌ No | `@astrojs/svelte` |
| Vue 3 | 33 KB | ❌ No | `@astrojs/vue` |
| Solid | 7 KB | ❌ No | `@astrojs/solid` |

**Preact wins because:**
1. **3 KB** — smallest framework with React API compatibility
2. Familiar JSX/TSX syntax — no new language to learn
3. React ecosystem compatible via `preact/compat` (if ever needed)
4. Perfect for portfolios where island count is low (3-5 components)

### Island Hydration Strategy

| Component | Directive | Rationale |
|---|---|---|
| `ThemeToggle.tsx` | `client:load` | Must be interactive immediately (above fold, prevents FOUC) |
| `ContactForm.tsx` | `client:visible` | Below fold — hydrate when scrolled into view |
| `AlgoFilter.tsx` | `client:idle` | Nice-to-have filter — hydrate when browser is idle |
| `ViewCounter.tsx` | `client:visible` | Minimal — pings API when visible |

```astro
---
// Usage in .astro file
import ThemeToggle from '../components/islands/ThemeToggle.tsx';
import ContactForm from '../components/islands/ContactForm.tsx';
---
<ThemeToggle client:load />
<ContactForm client:visible />
```

### What Stays Zero-JS (Static Astro Components)

Everything else renders as pure HTML at build time:
- `Nav.astro`, `Footer.astro`, `BaseLayout.astro`
- `ProjectCard.astro`, `AlgorithmRow.astro`, `LogItem.astro`
- `Badge.astro`, `TerminalBlock.astro`, `OptimizedImage.astro`

## Consequences

- `@astrojs/preact` must be installed and registered in `astro.config.mjs`
- Island components MUST be `.tsx` files (not `.astro`)
- State shared between islands requires `nanostores` (see ADR for nanostores in state management)
- Islands add JS — be disciplined about what gets `client:*` directives

## References

- [Astro Islands architecture](https://docs.astro.build/en/concepts/islands/)
- [Preact integration](https://docs.astro.build/en/guides/integrations-guide/preact/)
- [Client directives reference](https://docs.astro.build/en/reference/directives-reference/#client-directives)
