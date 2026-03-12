# Low-Level Design — Component Specifications

## Component Architecture

```mermaid
graph TD
    subgraph Layouts ["Layouts (Page Shells)"]
        BL[BaseLayout]
        PL[PageLayout]
        PRL[ProjectLayout]
        ALL[AlgorithmLayout]
        LL[LogLayout]
    end

    subgraph Global ["Global Components"]
        BH[BaseHead]
        NAV[Nav]
        FT[Footer]
    end

    subgraph Sections ["Page Sections"]
      HERO[Hero]
      FP[FeaturedProjects]
      RL[RecentLogs]
      AS[AboutSection]
    end

    subgraph Domain ["Domain Components"]
      PC[ProjectCard]
      AR[AlgorithmRow]
      LI[LogItem]
      CS[CaseStudy]
    end

    subgraph UI ["UI Primitives"]
        BDG[Badge]
        TB[TerminalBlock]
        SH[SectionHeading]
        CRD[Card]
        OI[OptimizedImage]
    end

    subgraph Islands ["Preact Islands"]
        TT[ThemeToggle]
        TH[TerminalHero]
        PF[ProjectFilter]
        LT[LogTimeline]
        CF[ContactForm]
        AF[AlgoFilter]
        VC[ViewCounter]
    end

    BL --> BH
    BL --> NAV
    BL --> FT
    PL --> BL
    PRL --> BL
    ALL --> BL
    LL --> BL
    HERO --> OI
    FP --> PC
    PC --> BDG
    AR --> BDG
    LI --> BDG
```

## Component Specifications

### BaseLayout.astro

| Property | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | ✅ | Page title |
| `description` | `string` | ✅ | Meta description |
| `image` | `string` | ❌ | OG image path (default: `/og-default.png`) |
| `type` | `'website' \| 'article'` | ❌ | OG type (default: `website`) |

```astro
---
// BaseLayout.astro — renders <html>, <head>, <body> wrapper
import BaseHead from './BaseHead.astro';
import Nav from './Nav.astro';
import Footer from './Footer.astro';
import ThemeToggle from '../islands/ThemeToggle.tsx';

interface Props {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article';
}
const { title, description, image, type } = Astro.props;
---
<!doctype html>
<html lang="en" class="dark">
  <head>
    <BaseHead {title} {description} {image} {type} />
    <!-- ⚠️ CRITICAL: FOUC prevention — must be is:inline in <head> -->
    <script is:inline>
      (function() {
        const theme = localStorage.getItem('harshit:theme') || 'system';
        const isDark = theme === 'dark' ||
          (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        document.documentElement.classList.toggle('dark', isDark);
      })();
    </script>
  </head>
  <body class="bg-bg-primary text-text-primary font-sans antialiased">
    <!-- Accessibility: skip-to-content link -->
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-accent focus:text-bg-primary">
      Skip to content
    </a>
    <Nav />
    <ThemeToggle client:load />
    <main id="main-content">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

---

### ProjectCard.astro

| Property | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | ✅ | Project name |
| `description` | `string` | ✅ | Short description |
| `techStack` | `string[]` | ✅ | Technology badges |
| `liveUrl` | `string` | ❌ | Live demo link |
| `githubUrl` | `string` | ✅ | GitHub repo link |
| `thumbnail` | `string` | ❌ | Thumbnail image path |
| `featured` | `boolean` | ❌ | Featured flag |
| `id` | `string` | ✅ | Content collection entry ID |

**Hydration:** Static (zero JS) — Pure `.astro` component.

---

### ThemeToggle.tsx (Preact Island)

| Property | Type | Required | Description |
|---|---|---|---|
| (none) | — | — | Self-contained, reads `$theme` nanostore for icon state |

**Hydration:** `client:load` — Must be interactive immediately.

**Theme pattern:** Only island that imports `$theme`. Uses `THEME_KEY = 'harshit:theme'` for localStorage. Toggles dark↔light (no system mode). See ADR-012 for why other islands use CSS custom properties instead.

```tsx
// ThemeToggle.tsx — simplified
import { useStore } from '@nanostores/preact';
import { $theme, cycleTheme } from '../store/uiStore';

export function ThemeToggle() {
  const theme = useStore($theme);
  return (
    <button onClick={cycleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
      {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
```

---

### TerminalHero.tsx (Preact Island)

| Property | Type | Required | Description |
|---|---|---|---|
| (none) | — | — | Self-contained animated terminal hero |

**Hydration:** `client:load` — Above-the-fold hero animation.

**Theme pattern:** Uses `var(--terminal-*)` CSS custom properties for all colors. Zero nanostore imports. Theme changes cascade automatically via CSS.

---

### ProjectFilter.tsx (Preact Island)

| Property | Type | Required | Description |
|---|---|---|---|
| `projects` | `SerializedProject[]` | ✅ | All projects with ISO date strings |
| `categories` | `string[]` | ✅ | Unique categories derived from content |

**Hydration:** `client:load` — Interactive category filter on /projects page.

**Data flow:** Page fetches `getCollection('projects')` → serialises (Date→ISO string) → derives unique categories → passes both as props.

---

### LogTimeline.tsx (Preact Island)

| Property | Type | Required | Description |
|---|---|---|---|
| `logs` | `SerializedLog[]` | ✅ | All logs with ISO date strings, commit hashes |
| `allTags` | `string[]` | ✅ | Unique tags derived from content |

**Hydration:** `client:load` — Interactive tag filter + expandable accordion on /logs page.

**UI pattern:** Commit-log style with deterministic 7-char hex hashes, relative timestamps, branch-dot timeline, and chevron-toggled accordion for each entry.

---

### ContactForm.tsx (Preact Island)

| Property | Type | Required | Description |
|---|---|---|---|
| (none) | — | — | Self-contained, submits to Appwrite |

**Hydration:** `client:visible` — Only loads when user scrolls to contact section.

**Validation:** Inline Zod or HTML5 validation:
- `name`: required, min 2 chars
- `email`: required, valid email format
- `message`: required, min 10 chars, max 1000 chars

**Submit flow:** Form data → Appwrite `ContactMessages` table → show success/error state.

---

### AlgoFilter.tsx (Preact Island)

| Property | Type | Required | Description |
|---|---|---|---|
| `platforms` | `string[]` | ✅ | Available platform filter options |
| `difficulties` | `string[]` | ✅ | Available difficulty levels |
| `tags` | `string[]` | ✅ | Available tags |

**Hydration:** `client:idle` — Enhancement, not critical path.

**State:** Writes to `$algoFilter` nanostore. Algorithm page reads this store to filter displayed entries.

---

### ViewCounter.tsx (Preact Island)

| Property | Type | Required | Description |
|---|---|---|---|
| `slug` | `string` | ✅ | Page slug for view tracking |

**Hydration:** `client:visible` — Pings API when component enters viewport.

**Behavior:** On mount → `POST /api/views` with slug → render returned count.

**Status:** Exists but not currently imported in any page. Wire up or remove.

---

### SearchBar.tsx (Preact Island)

| Property | Type | Required | Description |
|---|---|---|---|
| `items` | `SearchItem[]` | ✅ | All searchable items (projects, algorithms, logs) |

**Hydration:** `client:load` with `transition:persist` — Survives View Transitions.

**Features:**
- Cmd+K / Ctrl+K keyboard shortcut to open
- `/` key opens search when not focused on an input
- Fuzzy scoring with word-boundary, tag, and consecutive-char matching
- Results grouped by type (Projects, Algorithms, Logs) with type icons
- Arrow key navigation, Enter to select, Escape to close
- Highlights matched substrings in results

**Theme pattern:** CSS custom properties only (`var(--*)`) — no nanostore import.

---

### LiveStatus.tsx (Preact Island)

| Property | Type | Required | Description |
|---|---|---|---|
| (none) | — | — | Self-contained, fetches from /api/status |

**Hydration:** `client:idle` — Not critical for first paint.

**Behavior:** On mount → `GET /api/status` → displays emoji + status text.
Falls back to default if API fails.

---

### WasmRunner.tsx (Preact Island)

| Property | Type | Required | Description |
|---|---|---|---|
| `wasmSlug` | `string` | ✅ | Path to the compiled WASM module |
| `sampleInput` | `string` | ✅ | Default input for the runner |
| `sampleOutput` | `string` | ✅ | Expected output for validation |

**Hydration:** `client:visible` — Only loads when scrolled to on algorithm detail pages.

**Behavior:** Loads WASM module, provides editable input textarea, runs algorithm,
displays output and execution time. Opt-in per algorithm via `wasmSlug` frontmatter field.

---

### HexOverlay.tsx (Preact Island)

| Property | Type | Required | Description |
|---|---|---|---|
| (none) | — | — | Self-contained canvas hex grid animation |

**Hydration:** `client:load` — Background animation on homepage.

**Theme pattern:** CSS custom properties for hex colors.

---

### HexToggle.tsx (Preact Island)

| Property | Type | Required | Description |
|---|---|---|---|
| (none) | — | — | Toggles HexOverlay visibility |

**Hydration:** `client:load` — Paired with HexOverlay.

---

### EdgeTelemetry.tsx (Preact Island)

| Property | Type | Required | Description |
|---|---|---|---|
| (none) | — | — | Self-contained, pings `/cdn-cgi/trace` |

**Hydration:** `client:idle` — Purely diagnostic, lowest priority.

**Behavior:** Fetches Cloudflare edge trace endpoint, displays colo/location info.
Uses relative URL (`/cdn-cgi/trace`) so it works in all environments.

---

### EngineeringPulse.astro (Static Section)

| Property | Type | Required | Description |
|---|---|---|---|
| (inline data) | — | — | Fetches data at build time via `pulse-data.ts` |

**Hydration:** None — fully static HTML rendered at build time.

**Features:**
- GitHub-style contribution heatmap aggregating GitHub, LeetCode, Codeforces activity
- Dominant-source coloring: cell color = platform with highest count (see ADR-013)
- Source-specific CSS vars per ADR-012: `var(--heatmap-github)`, `var(--heatmap-leetcode)`, `var(--heatmap-codeforces)`
- Legend shows source dots + Less→More opacity gradient
- Year/month labels on axes

---

### ErrorBoundary.tsx (Preact Utility)

| Property | Type | Required | Description |
|---|---|---|---|
| `fallback` | `ComponentChildren` | ❌ | Fallback UI on error (default: silent fail) |
| `children` | `ComponentChildren` | ✅ | Wrapped island component(s) |

**Purpose:** Wraps all Preact islands so a runtime JS error in one island doesn't crash the page. Since the page is mostly static HTML, a broken island should degrade gracefully.

```tsx
// ErrorBoundary.tsx
import { Component, type ComponentChildren } from 'preact';

interface Props {
  fallback?: ComponentChildren;
  children: ComponentChildren;
}

interface State { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('[Island Error]', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null; // Silent fail — page stays functional
    }
    return this.props.children;
  }
}
```

**Usage in `.astro` files:**
```astro
<ErrorBoundary client:load fallback={<span>⚠️</span>}>
  <ThemeToggle />
</ErrorBoundary>
```
