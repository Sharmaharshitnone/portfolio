# Requirements Document: harshit.systems

> **Version:** 2.0.0 | **Last Updated:** 2026-02-22 | **Status:** Active

## 1. Purpose

A developer portfolio serving as **Harshit Sharma's digital identity** — optimized for recruiter first impressions, developer peer review, and continuous engineering documentation.

**This is NOT a blog.** The blog lives at `blog.harshit.systems` as a separate site. This portfolio links to it.

## 2. Target Personas

| Persona | Goal | Key Pages | Time on Site |
|---|---|---|---|
| **Recruiter** | Evaluate technical competence in 30 seconds | `/`, `/projects/` | 30–60s |
| **Hiring Manager** | Deep-dive into specific project architecture | `/projects/[id]` (case study) | 3–5 min |
| **Fellow Developer** | Browse CP solutions, see engineering approach | `/algorithms/`, `/logs/` | 5–10 min |
| **Harshit (himself)** | Daily content updates, track learning | `/logs/` (write), all pages (review) | Daily |

## 3. Functional Requirements

### 3.1 Homepage (`/`)
- [ ] Hero section with name, title, one-line pitch
- [ ] Featured projects grid (top 3, pulled from content collection)
- [ ] Skills/tech stack visualization
- [ ] Recent engineering logs feed (latest 5)
- [ ] Link to blog (`blog.harshit.systems`)
- [ ] Call-to-action for contact

### 3.2 Projects (`/projects/`, `/projects/[id]`)
- [ ] Filterable project index page
- [ ] Each project has a case study page with:
  - Problem → Solution → Architecture → Challenges → Outcomes
  - Live demo link (subdomain or external)
  - GitHub link
  - Tech stack badges
  - Screenshots/images (optimized WebP/AVIF)

### 3.3 Algorithms/CP (`/algorithms/`, `/algorithms/[id]`)
- [ ] Searchable/filterable problem index
- [ ] Filter by: platform, difficulty, tags
- [ ] Each problem has:
  - Solution with syntax-highlighted code (Shiki)
  - Time/space complexity analysis
  - Platform link
  - Execution stats (time, memory)

### 3.4 Engineering Logs (`/logs/`, `/logs/[id]`)
- [ ] Chronological feed of log entries
- [ ] Types: daily, weekly, project, problem
- [ ] RSS feed at `/rss.xml`
- [ ] Each log shows mood indicator (optional), tags, date

### 3.5 Contact (`/contact`)
- [ ] Contact form (name, email, message)
- [ ] Form submits to Appwrite ContactMessages table
- [ ] Client-side validation (Zod)
- [ ] Success/error feedback states
- [ ] Rate limited via Cloudflare WAF

### 3.6 Global
- [ ] Dark/Light/System theme toggle (persistent)
- [ ] Responsive: mobile-first, tablet, desktop
- [ ] View Transitions (SPA-feel navigation)
- [ ] Page view counter (Appwrite, per-page)
- [ ] Navigation: consistent header with links to all sections
- [ ] Footer: social links (GitHub, LinkedIn, Twitter/X, Email)

## 4. Non-Functional Requirements

| Category | Requirement | Target |
|---|---|---|
| **Performance** | Largest Contentful Paint | < 1.0s |
| **Performance** | Cumulative Layout Shift | < 0.05 |
| **Performance** | Lighthouse (all categories) | 100/100 |
| **Performance** | Total JavaScript (typical page) | < 5 KB gzipped |
| **Accessibility** | WCAG compliance | AA |
| **Accessibility** | Keyboard navigation | Full |
| **SEO** | Sitemap, RSS, JSON-LD, OG images | All implemented |
| **Security** | CSP, X-Frame-Options, HSTS | Via `_headers` |
| **Uptime** | Availability | 99.9% (Cloudflare CDN) |
| **Build** | Build time (100 pages) | < 30 seconds |

## 5. Domain Strategy

```
harshit.systems              ← This portfolio (Astro SSG)
blog.harshit.systems         ← Blog (separate site, external link from portfolio)
vault-ledger.harshit.systems ← Project deployment (independent)
future-project.harshit.systems ← Future projects (add CNAME in Cloudflare)
```

**Integration point:** Portfolio project cards link to `*.harshit.systems` subdomains. Adding a new project subdomain = add Cloudflare DNS CNAME + create a project `.md` file.

## 6. Content Update Workflow

| Cadence | Content Type | Location | Action |
|---|---|---|---|
| Daily | Daily log | `src/data/logs/daily/YYYY-MM-DD.md` | Write in Neovim, `git push` |
| Weekly | Weekly summary | `src/data/logs/weekly/YYYY-WNN.md` | Summarize the week |
| Per event | Project log | `src/data/logs/project/*.md` | Document milestone/issue |
| Per solve | Algorithm | `src/data/algorithms/*.md` | Add CP solution |
| Per project | Project case study | `src/data/projects/*.md` | Full case study |

## 7. Out of Scope (v1)

- ❌ Blog (separate site)
- ❌ User authentication
- ❌ Comments/reactions system
- ❌ Newsletter subscription
- ❌ i18n / multi-language
- ❌ CMS admin panel (content is Git-managed Markdown)
