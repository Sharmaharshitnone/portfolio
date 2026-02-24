# Low-Level Design — Directory Structure

## Complete File Tree (Astro 5 Compliant)

```
portfolio/
├── public/                           # Static assets (NOT processed by Astro)
│   ├── _headers                      # Cloudflare Pages security headers (CSP, HSTS)
│   ├── _redirects                    # Cloudflare Pages redirect rules (optional)
│   ├── robots.txt                    # Search engine crawl directives
│   ├── favicon.svg                   # Vector favicon
│   └── fonts/                        # Self-hosted fonts (WOFF2 only)
│       ├── inter-var-latin.woff2     # Inter Variable (~95KB → subset to ~30KB)
│       └── jetbrains-mono-latin.woff2 # JetBrains Mono (~40KB → subset to ~20KB)
│
├── src/
│   ├── content.config.ts             # ⚠️ ASTRO 5: Content Layer config (NOT in src/content/)
│   │
│   ├── data/                         # Content source files (loaded by glob())
│   │   ├── projects/                 # One .md per project
│   │   │   ├── vault-ledger.md
│   │   │   └── syncly.md
│   │   ├── algorithms/               # One .md per CP problem
│   │   │   ├── cf-1900A.md
│   │   │   └── lc-215-kth-largest.md
│   │   └── logs/                     # Engineering log entries
│   │       ├── daily/
│   │       │   └── 2026-02-22.md
│   │       ├── weekly/
│   │       │   └── 2026-w08.md
│   │       └── project/
│   │           └── vault-ledger-auth.md
│   │
│   ├── components/
│   │   ├── global/                   # Layout shell (zero JS)
│   │   │   ├── BaseLayout.astro      # HTML skeleton, font preloads, ClientRouter
│   │   │   ├── BaseHead.astro        # <head> meta tags, OG, JSON-LD, ClientRouter
│   │   │   ├── Nav.astro             # Navigation bar
│   │   │   └── Footer.astro          # Footer with social links
│   │   │
│   │   ├── ui/                       # Zero-JS design system primitives
│   │   │   ├── Badge.astro           # Tag/label badges
│   │   │   ├── TerminalBlock.astro   # Code terminal aesthetic block
│   │   │   ├── SectionHeading.astro  # Consistent section titles
│   │   │   ├── Card.astro            # Generic card container
│   │   │   └── OptimizedImage.astro  # Wraps astro:assets Image
│   │   │
│   │   ├── domain/                   # Domain-specific UI (zero JS, typed via Zod)
│   │   │   ├── ProjectCard.astro     # Project showcase card
│   │   │   ├── AlgorithmRow.astro    # CP problem listing row
│   │   │   ├── LogItem.astro         # Engineering log entry card
│   │   │   └── CaseStudy.astro       # Project case study layout
│   │   │
│   │   ├── sections/                 # Page sections (composed, zero JS)
│   │   │   ├── Hero.astro            # Landing page hero
│   │   │   ├── FeaturedProjects.astro # Homepage featured projects
│   │   │   ├── RecentLogs.astro      # Latest engineering logs
│   │   │   └── AboutSection.astro    # About me section
│   │   │
│   │   └── islands/                  # ⚠️ STRICT JS BOUNDARY: Preact islands
│   │       ├── ThemeToggle.tsx        # client:load — dark/light/system toggle
│   │       ├── ContactForm.tsx        # client:visible — form → Appwrite
│   │       ├── AlgoFilter.tsx         # client:idle — filter by platform/difficulty
│   │       ├── ViewCounter.tsx        # client:visible — page view ping
│   │       └── ErrorBoundary.tsx      # Wraps islands for graceful degradation
│   │
│   ├── layouts/                      # Page layout wrappers
│   │   ├── PageLayout.astro          # Standard page (title + content)
│   │   ├── ProjectLayout.astro       # Project detail page layout
│   │   ├── AlgorithmLayout.astro     # Algorithm solution page layout
│   │   └── LogLayout.astro           # Engineering log page layout
│   │
│   ├── pages/                        # File-based routing
│   │   ├── index.astro               # Homepage
│   │   ├── contact.astro             # Contact page with form island
│   │   ├── projects/
│   │   │   ├── index.astro           # All projects listing
│   │   │   └── [id].astro            # Dynamic: /projects/vault-ledger
│   │   ├── algorithms/
│   │   │   ├── index.astro           # All algorithms with filter island
│   │   │   └── [id].astro            # Dynamic: /algorithms/cf-1900A
│   │   ├── logs/
│   │   │   ├── index.astro           # All logs chronological feed
│   │   │   └── [id].astro            # Dynamic: /logs/2026-02-22
│   │   ├── og/
│   │   │   └── [...slug].png.ts      # Build-time OG image generation (Satori)
│   │   ├── api/
│   │   │   ├── views.ts              # GET/POST: page view counter (prerender:false)
│   │   │   └── contact.ts            # POST: contact form handler (prerender:false)
│   │   └── rss.xml.ts                # GET: RSS feed for logs
│   │
│   ├── store/                        # Cross-island state (nanostores)
│   │   └── uiStore.ts                # theme atom, algoFilter atom
│   │
│   ├── lib/                          # Shared utilities
│   │   ├── appwrite.ts               # Appwrite client + database exports
│   │   ├── seo.ts                    # JSON-LD generators (Person, SoftwareApplication)
│   │   └── formatter.ts              # Date formatting, slug helpers
│   │
│   └── styles/
│       └── global.css                # Tailwind @import + @theme design tokens
│
├── architecture/                     # You are here
│   ├── ARCHITECTURE.md               # System design document
│   ├── portfolio.md                  # Requirements & scope
│   ├── ADR/                          # Architecture Decision Records (11)
│   ├── HLD/                          # High-Level Design diagrams (5)
│   └── LLD/                          # Low-Level Design specifications (7)
│
├── scripts/                          # Build & ops scripts
│   ├── backup-appwrite.mjs           # Appwrite data backup (GitHub Actions)
│   └── restore-appwrite.mjs          # Appwrite data restore
│
├── backups/                          # Appwrite data backups (auto-committed)
│   ├── page-views/                   # Daily JSON exports
│   ├── contacts/                     # Daily JSON exports
│   └── .gitkeep
│
├── .github/
│   └── workflows/
│       └── appwrite-backup.yml       # Daily backup cron job
│
├── wrangler.toml                     # Cloudflare Pages + Workers config (IaC)
├── astro.config.mjs                  # Astro + Vite + integrations config
├── tsconfig.json                     # TypeScript (extends astro/tsconfigs/strict)
├── package.json                      # Dependencies and scripts
├── pnpm-lock.yaml                    # Lockfile
└── .gitignore
```

## Directory Naming Conventions

| Directory | Convention | Example |
|---|---|---|
| `src/data/` | kebab-case filenames, match collection name | `vault-ledger.md` |
| `src/components/` | PascalCase `.astro`, PascalCase `.tsx` for islands | `ProjectCard.astro` |
| `src/pages/` | lowercase, `[param]` for dynamic routes | `[id].astro` |
| `src/lib/` | camelCase `.ts` utilities | `appwrite.ts` |
| `src/store/` | camelCase `.ts` stores | `uiStore.ts` |
| `public/` | lowercase, no processing | `robots.txt` |
