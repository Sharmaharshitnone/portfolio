# Page Specifications

> **Pixel-complete reference for every page.** Each section documents the layout, content, and visual behavior as defined in the Figma prototype.

---

## Global Shell (Layout)

```
┌─────────────────────────────────────────────────┐
│  Navbar (sticky, z-50, backdrop-blur)           │
├─────────────────────────────────────────────────┤
│                                                 │
│  <main class="flex-1">                          │
│    Page content (Outlet)                        │
│                                                 │
├─────────────────────────────────────────────────┤
│  Footer                                        │
└─────────────────────────────────────────────────┘
```

- Full-height: `min-h-screen flex flex-col`
- Main stretches: `flex-1`
- Background: `bg-background text-foreground`

---

## 1. Homepage (`/`)

### Section Order

| # | Section | Padding | Content |
|---|---|---|---|
| 1 | **Hero** | `pt-20 sm:pt-32 pb-24 sm:pb-36` | Name, tagline, TerminalHero |
| 2 | **Stats** | `pb-24 sm:pb-36` | 4 inline stats (mono values + faint labels) |
| 3 | **Featured Projects** | `pb-24 sm:pb-36` | "Featured Projects" + "View all →" + 3-column grid |
| 4 | **Tech Stack** | `pb-24 sm:pb-36` | "Tech Stack" + icon grid (4→6→9 columns) |
| 5 | **Recent Problems** | `pb-24 sm:pb-36` | "Recent Problems" + "All problems →" + bordered list |
| 6 | **CTA** | `pb-28 sm:pb-40` | "Let's work together" + 2 action buttons |

### Hero Detail

- **H1:** `clamp(2rem, 5vw, 3rem)`, tracking `-0.02em`, line-height `1.15`
- **Tagline:** `text-dim text-[15px] max-w-lg leading-relaxed`
- **Terminal:** Below tagline with `mb-14 sm:mb-16` gap

### Stats Row

```
5+              200+             800+              1900+
Years experience  Open source PRs   Problems solved    CF rating
```

- Values: mono font, `text-foreground text-lg`
- Labels: `text-faint text-sm ml-2`
- Layout: `flex flex-wrap gap-x-10 gap-y-4`

### Featured Projects Grid

- 3 cards: `grid sm:grid-cols-2 lg:grid-cols-3 gap-4`
- Each card: bordered (`1px solid #30363d`), `p-5`, `hover:bg-surface`
- Content: title (subtle→foreground on hover), description (dim, line-clamp-2), tech badges
- Top-right: star count in mono

### Recent Problems List

- Bordered container with inner dividers (`1px solid #21262d`)
- Each row: difficulty dot (6×6px) + platform badge + title + date + arrow
- On hover: `bg-surface` transition

### CTA

- H3 + paragraph + 2 buttons: primary (inverted: `bg-foreground text-background`) + secondary (bordered outline with GitHub icon)

---

## 2. Projects (`/projects`)

### Header
- Title: `clamp(1.75rem, 4vw, 2.5rem)`, description in dim text

### Category Filter
- Inline pill bar: `[all] [systems] [web] [data] [devops] [tools]`
- Active: `bg-foreground text-background` (inverted)
- Inactive: `text-faint`, bordered (`1px solid #30363d`)
- Icon: Filter (lucide) left of pills

### Featured Cards (expanded)
- Full-width, `p-6 sm:p-8`
- Two-column on sm+: content left, stats + links right
- `featured` badge: inverted mono label
- Long description (for featured items)
- Tech badges + star/fork counts + Source/Demo buttons

### Regular Cards (grid)
- `grid sm:grid-cols-2 lg:grid-cols-3 gap-4`
- Same bordered card pattern as homepage, with category label top-left
- Footer section with separator (`borderTop: 1px solid #21262d`) and links

---

## 3. Algorithms (`/algorithms`)

### Stats Row
- Same pattern as homepage but with colored values: total (foreground), easy (#3fb950), medium (#d29922), hard (#f85149)

### Filters
- Search bar: mono font, `bg-#0d1117`, bordered, with Search icon
- Dropdowns: styled `<select>` elements for difficulty + platform

### Data Table
- **Header row:** `bg-#161b22`, uppercase mono `11px` labels: Problem / Platform / Difficulty / Tags / Solved
- **Rows:** 5 columns via `grid-cols-[1fr_80px_90px_auto_90px]`
- **Row content:** difficulty dot + title | platform badge | colored difficulty text | tag pills (max 3) | date + arrow
- **Footer:** "Showing X of Y problems" in mono

---

## 4. Problem Detail (`/algorithms/:slug`)

### Breadcrumb
- "← All problems" link at top

### Header
- Title: `clamp(1.5rem, 3vw, 2rem)`
- Metadata row: platform badge + difficulty dot + difficulty label + solved date + "Original" external link

### Tags
- Inline pill row with Tag icon prefix

### Sections  
1. **Approach** — prose paragraph, `text-dim text-sm leading-[1.85]`
2. **Complexity** — two-column: "Time: O(n log k)" / "Space: O(k)" in mono
3. **Solution** — full code block with file label header (`#161b22` bg, `solution.rs`)

---

## 5. Logs (`/logs`)

### Tag Filter
- Same pill pattern as Algorithms but with content tags (e.g., `rust`, `distributed-systems`, `ebpf`)

### Timeline Layout
- Git branch visual: `borderLeft: 1px solid #30363d` with branch dots (`9×9px, #e6edf3`)
- Each entry: `pl-8 sm:pl-10 pb-12` relative to the branch line
- **Date line:** commit hash + date + read time (all in mono faint `11px`)
- **Title:** clickable accordion with ChevronRight (rotates 90° on expand)
- **Excerpt:** dim text below title
- **Tags:** pill row

### Expanded Content (markdown rendering)
The LogsPage implements a **custom inline markdown renderer** for expanded entries:
- Code blocks: detected by `` ``` `` prefix → rendered with language header + pre/code
- Tables: detected by `|` prefix → parsed into `<table>` with header row
- Numbered lists: detected by `/^\d+\./m` → rendered with bold extraction
- Inline code: detected by backtick wrapping → `<code>` with `#21262d` bg
- Regular paragraphs: plain text blocks

---

## 6. Contact (`/contact`)

### Two-Column Layout
- `grid lg:grid-cols-2 gap-20 lg:gap-32`
- Left: contact form | Right: contact info + availability

### Form Design
- **Input style:** Underline-only (no box borders). `bg-transparent`, `borderBottom: 1px solid #30363d`
- Fields: Name, Email (text inputs), Message (textarea, 5 rows)
- Labels: dim `13px` above each field

### Submit Button States
| State | Visual | Icon |
|---|---|---|
| `idle` | `bg-foreground text-background` | Send |
| `submitting` | Same + opacity 50% | Spinning ring |
| `success` | `bg-surface text-foreground` bordered | CheckCircle |
| `error` | `bg-surface text-foreground` bordered | AlertCircle |

### Contact Info Panel
- 4 items: Email, GitHub, LinkedIn, Location
- Each: icon (faint) + uppercase label (`11px`) + value link with ArrowUpRight
- Bottom: availability note with separator

---

## 7. 404 Page (`/*`)

- Centered: `py-28 sm:py-44 text-center`
- "404" in mono faint `text-sm`
- "Page not found" H1
- Description paragraph
- "← Back to home" inverted CTA button
