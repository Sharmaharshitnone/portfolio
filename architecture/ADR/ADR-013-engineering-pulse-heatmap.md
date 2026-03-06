# ADR-013: Engineering Pulse Heatmap — Dominant-Source Coloring

**Status:** Accepted
**Date:** 2026-02-27
**Deciders:** Harshit Sharma

## Context

The Engineering Pulse section on the homepage shows a GitHub-style contribution heatmap
aggregating activity from three sources: GitHub, LeetCode, and Codeforces. The question
was how to visualize multi-source data in a single heatmap.

Three approaches were evaluated:

### Option A — Stacked/Layered (three separate heatmaps)
- Pros: Each source clearly visible
- Cons: Occupies 3x vertical space, overwhelming, breaks page flow

### Option B — Dominant-Source Coloring (chosen)
- Cell color = platform with highest count for that day
- Cell opacity = intensity level (0-4 scale)
- Pros: Single compact graph, platform distribution visible at a glance, familiar GitHub aesthetic
- Cons: Minor sources for a day are hidden

### Option C — Unified Green-Only
- All sources merged into a single green intensity scale
- Pros: Simplest, most familiar
- Cons: Loses platform attribution entirely

## Decision

**Approach B — Dominant-Source Coloring.**

Each cell's color indicates which platform contributed the most activity that day:
- GitHub: `var(--heatmap-github)` — green (#3fb950 dark / #1a7f37 light)
- LeetCode: `var(--heatmap-leetcode)` — orange (#ffa116 dark / #9a6700 light)
- Codeforces: `var(--heatmap-codeforces)` — blue (#58a6ff dark / #0969da light)

Colors use CSS custom properties per ADR-012 so they adapt to theme automatically.
Only `ThemeToggle` imports `$theme`; the heatmap reads colors from `var(--*)`.

## Data Flow

1. `src/lib/pulse-data.ts` fetches activity from all three APIs at build time
2. Data is aggregated per-day into a `Map<string, DayData>` with per-source counts
3. `EngineeringPulse.astro` renders the heatmap as static HTML (zero JS)
4. Cell opacity is determined by total count mapped to 5 levels (0-4)
5. Cell color is determined by which source has the highest count for that day

## Consequences

- Heatmap is a single compact visualization — fits the portfolio page density
- Users can see at a glance which platform they're most active on
- Legend shows source-color dots and a Less→More opacity gradient
- If a new source is added (e.g., AtCoder), only `pulse-data.ts` and the CSS vars need updating
