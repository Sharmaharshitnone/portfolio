# Design Review Findings — Summary

> **Consolidated findings from the DESIGN folder review. All issues prioritized and mapped to implementation phases.**

---

## Score: 92/100 — Top 3% Quality

---

## Must Fix (Before Launch)

| # | Issue | File(s) | Fix |
|---|---|---|---|
| 1 | No `aria-label` on hamburger | Navbar | Add `aria-label` + `aria-expanded` |
| 2 | Index keys in animation | TerminalHero | Content-based key: `${kind}-${i}-${text}` |
| 3 | Google Fonts CDN | fonts.css | Self-host WOFF2 + `font-display: swap` + `<link rel="preload">` |
| 4 | No `prefers-reduced-motion` | TerminalHero | Skip to final frame if user prefers reduced motion |

## Should Fix (High Impact)

| # | Issue | Resolution |
|---|---|---|
| 5 | No SEO/OG/JSON-LD | Handled by Astro build (BaseHead, ADR-009, ADR-011) |
| 6 | Hardcoded data | Migrate to `src/data/` markdown + `content.config.ts` |
| 7 | No light mode | Implement ThemeToggle island + CSS overrides |
| 8 | 48 unused shadcn/ui files | Delete on Astro conversion (only need form primitives) |
| 9 | Devicon CDN dependency | Self-host 18 SVG icons inline |

## Recommended Enhancements

| # | Enhancement | Benefit |
|---|---|---|
| 10 | Shiki syntax highlighting | Zero-JS build-time code highlighting |
| 11 | Scroll-driven nav shrink | Premium interaction feel |
| 12 | View counter on cards | Social proof via Appwrite API |
| 13 | RSS link in footer | Discoverability for blog readers |

---

## Architecture Alignment

| Verified Against | Status |
|---|---|
| LLD/05 color palette | ✅ Exact match |
| LLD/02 content schemas | ⚠️ Data needs migration to markdown |
| LLD/03 component specs | ✅ Matches (+ exceeds with TerminalHero) |
| ADR-003 Preact islands | ✅ Interactive components identified |
| HLD/03 island hydration map | ⚠️ ThemeToggle + ViewCounter missing |
| ADR-011 OG images | ❌ Not yet built (expected) |
