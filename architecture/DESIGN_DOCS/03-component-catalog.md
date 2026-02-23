# Component Catalog

> **Every reusable component from the DESIGN folder.** Mapped to their Astro equivalents per [LLD/03](../LLD/03-component-specs.md).

---

## Shell Components (Zero JS — Astro only)

### Navbar

| Property | Value |
|---|---|
| **Position** | `sticky top-0 z-50` |
| **Background** | `rgba(13,17,23,0.8)` + `backdrop-blur-xl` |
| **Height** | `h-14` (56px) |
| **Border** | `borderBottom: 1px solid #30363d` |
| **Container** | `px-[5%] sm:px-[6%]` |

#### Nav Items

```
Index  |  Projects  |  Algorithms  |  Logs  |  Contact
```

- Text: `text-[13px]`, dim by default → foreground when active
- Padding: `px-3 py-1.5`
- Active: `text-foreground` (no bg change — minimal)
- Hover: `text-subtle`

#### Logo

```
harshit.dev
```

- Mono font, `text-[13px]`, `tracking-tight`
- Color: foreground → dim on hover

#### Mobile Menu
- Trigger: hamburger (Menu icon) / X icon
- Panel: slides below nav with `borderTop: 1px solid #30363d`
- Items: `px-3 py-2`, active gets `bg-surface`

**Astro migration notes:**
- Add `aria-label` and `aria-expanded` to hamburger button
- Add `<a id="skip-to-content">` before nav

---

### Footer

| Property | Value |
|---|---|
| **Border** | `borderTop: 1px solid #21262d` |
| **Padding** | `py-12` |
| **Layout** | Flex row: name left, icons right |

- Name: `Harshit Sharma · 2026` in faint `13px`
- Icons: GitHub, LinkedIn, Mail — faint → dim on hover, `h-4 w-4`
- Each icon has `aria-label`

**Astro migration notes:** Add RSS icon link to footer

---

### Layout

```astro
<div class="min-h-screen flex flex-col bg-background text-foreground">
  <Navbar />
  <main class="flex-1">
    <slot />
  </main>
  <Footer />
</div>
```

---

## Interactive Components (Preact Islands)

### TerminalHero (client:load)

See [04-animation-spec.md](./04-animation-spec.md) for full implementation.

- Self-contained: no props, no external data
- Pre-computed frames at module load
- macOS title bar with traffic light dots
- 3D perspective transform: `perspective(1400px) rotateY(-2.5deg) rotateX(1deg)`

---

### TechStackGrid

| Property | Value |
|---|---|
| **Grid** | `grid-cols-4 sm:grid-cols-6 lg:grid-cols-9 gap-5 sm:gap-7` |
| **Icon source** | Devicon CDN (web font classes) |
| **Icon size** | `w-12 h-12 sm:w-[52px] sm:h-[52px]` |
| **Icon color** | `#8b949e` (dim) |
| **Label** | `text-faint text-[10px]` mono, center-aligned |
| **Hover** | Icon box gets `bg-surface-raised`, label goes `text-dim` |
| **Border** | Each icon has `border: 1px solid #30363d` |

#### Items (18 total)

```
Rust  Go  TypeScript  Python  C++  React  Next.js  Node.js  Postgres
Redis  K8s  Docker  GraphQL  AWS  Linux  Neovim  Git  Arch
```

**Production note:** Replace Devicon CDN with self-hosted SVGs for the 18 icons.

---

### CategoryFilter (Preact)

Used on: ProjectsPage, AlgorithmsPage, LogsPage

| Property | Value |
|---|---|
| **Style** | Inline pill toggles |
| **Active** | `bg-foreground text-background` (inverted) |
| **Inactive** | `text-faint hover:text-dim`, `border: 1px solid #30363d` |
| **Font** | Mono `text-[11px]` (LogsPage) or `text-[13px]` (ProjectsPage) |
| **Gap** | `gap-1.5` (tags) or `gap-2` (categories) |

---

### ContactForm (client:visible — Preact)

#### Fields

| Field | Type | Placeholder |
|---|---|---|
| Name | `text` | "Your name" |
| Email | `email` | "you@example.com" |
| Message | `textarea` (5 rows) | "What would you like to discuss?" |

#### Input Style

```css
/* Underline-only inputs */
background: transparent;
border: none;
border-bottom: 1px solid #30363d;
padding: 0 0 12px 0;
font-size: 14px (text-sm);
color: var(--foreground);
placeholder-color: var(--color-faint);
```

#### Button States

| State | Background | Text | Icon |
|---|---|---|---|
| idle | `bg-foreground` | `text-background` | Send |
| submitting | `bg-foreground opacity-50` | `text-background` | Spinner (animated ring) |
| success | `bg-surface border-line` | `text-foreground` | CheckCircle |
| error | `bg-surface border-line` | `text-foreground` | AlertCircle |

---

## Shared UI Patterns

### Project Card

```
┌──────────────────────────────┐
│ Category         ★ 234  ⑂ 45 │
│                               │
│ Project Title                 │
│ Description text spanning     │
│ up to two lines...            │
│                               │
│ [Rust] [GRPC] [Tokio]         │
│───────────────────────────────│
│ ⚙ Source    ↗ Demo            │
└──────────────────────────────┘
```

### Problem Row

```
● LC  Two Sum                           [hash-map] [array]  2025-10-01  →
```

### Tech Badge

```css
/* Inline tech stack badge */
padding: 1.5px 6px;
font-size: 11px;
font-family: var(--font-mono);
background: #21262d;
border-radius: 4px;
color: var(--color-dim);
```

### Log Entry

```
  ● a3f7c2d  2026-02-18  ⏰ 12 min
  > Implementing Raft Consensus from Scratch in Rust
    A deep dive into building a production-grade...
    [rust] [distributed-systems] [raft]
```

---

## Lucide Icons Used

| Icon | Component | Context |
|---|---|---|
| `ArrowRight` | HomePage, AlgorithmsPage | "View all →" links, row arrows |
| `ArrowLeft` | ProblemDetailPage, NotFound | Back navigation |
| `ArrowUpRight` | ContactPage | External link arrows |
| `ExternalLink` | ProjectsPage, ProblemDetailPage | Demo links, original problem |
| `Github` | HomePage, ProjectsPage, ContactPage, Footer | GitHub links |
| `Star` | HomePage, ProjectsPage | Star counts |
| `GitFork` | ProjectsPage | Fork counts |
| `Filter` | ProjectsPage | Filter icon |
| `Search` | AlgorithmsPage | Search input icon |
| `Menu` / `X` | Navbar | Mobile menu toggle |
| `Mail` | ContactPage, Footer | Email links |
| `Linkedin` | ContactPage, Footer | LinkedIn links |
| `MapPin` | ContactPage | Location |
| `Send` | ContactPage | Form submit |
| `CheckCircle` | ContactPage | Success state |
| `AlertCircle` | ContactPage | Error state |
| `ChevronRight` | LogsPage | Expandable entry |
| `Clock` | LogsPage, ProblemDetailPage | Read time, solved date |
| `Tag` | ProblemDetailPage | Tag pills |
