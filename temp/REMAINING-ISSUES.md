# Remaining Issues & Follow-Up Items

Items that were identified during the codebase audit but not yet addressed in code.

---

## Code Quality

### ViewCounter.tsx — Dead Code or Missing Integration
`src/components/islands/ViewCounter.tsx` exists but is never imported anywhere.
- **Option A**: Wire it into blog/project/algorithm detail pages with `client:visible`
- **Option B**: Remove it entirely if view tracking isn't needed in the UI

### ErrorBoundary.tsx — Unused Safety Net
`src/components/islands/ErrorBoundary.tsx` exists but wraps nothing.
- Wrap interactive islands (SearchBar, ContactForm, LogTimeline) in it to
  prevent full-page crashes from unhandled Preact errors.

### TerminalHero.tsx — Unstable React Keys
The mapped list items in TerminalHero use array index as keys. If the list
is static this is fine, but if it re-renders dynamically, use stable string keys.

---

## Architecture Documentation Updates Needed

The following docs are out of date and should be updated to match the current
codebase. See the `architecture/` directory.

1. **ARCHITECTURE.md** — Master doc missing EngineeringPulse, LiveStatus, WasmRunner features
2. **LLD/01-directory-structure.md** — Missing 6+ new islands, new lib files, new routes
3. **LLD/02-content-schemas.md** — Schema definitions drifted from actual content.config.ts
4. **LLD/03-component-specs.md** — Missing specs for: WasmRunner, SearchBar, LiveStatus,
   EdgeTelemetry, HexOverlay, HexToggle, EngineeringPulse
5. **LLD/04-routing-api-contracts.md** — Missing `/api/status`, still references deleted
   `/algorithms/[id]/[section]` route
6. **HLD/03-island-hydration-map.md** — Missing new islands with hydration directives
7. **New ADR needed** — Engineering Pulse feature decisions (dominant-source coloring,
   heatmap approach, data aggregation strategy)
8. **New ADR needed** — Appwrite security model (server SDK only, permission lockdown,
   rate limiting at edge)
