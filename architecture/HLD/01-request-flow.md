# High-Level Design — Request Flow

## Browser → Edge → Static HTML

```mermaid
sequenceDiagram
    participant B as Browser (Recruiter)
    participant CF as Cloudflare Edge
    participant S as Static HTML
    participant AW as Appwrite Cloud

    B->>CF: GET harshit.systems/projects/vault-ledger
    CF->>CF: Check edge cache
    alt Cache HIT
        CF-->>B: 200 OK (HTML, p99 < 50ms)
    else Cache MISS
        CF->>S: Serve from origin (dist/)
        S-->>CF: Static HTML + CSS
        CF-->>B: 200 OK (cache + serve)
    end

    Note over B: Page renders instantly (Zero JS content)
    Note over B: Islands hydrate based on directive

    B->>CF: POST /api/views (client:visible island)
    CF->>AW: Increment page view
    AW-->>CF: 200 OK
    CF-->>B: 200 OK
```

## Key Properties

| Property | Value |
|---|---|
| **First byte** | < 200ms (Cloudflare edge cache) |
| **HTML size** | < 50KB per page (no JS runtime) |
| **Cache strategy** | Immutable assets (hashed filenames) + HTML stale-while-revalidate |
| **SSL** | Cloudflare Universal SSL (free, auto-renewed) |
| **WAF** | Cloudflare managed rules (bot protection, rate limiting) |

## Request Types

| Path Pattern | Type | Handler |
|---|---|---|
| `/`, `/projects/*`, `/algorithms/*`, `/logs/*` | Static HTML | Cloudflare CDN cache |
| `/api/views.ts` | API endpoint | Cloudflare Worker (or build-time if SSG) |
| `/api/contact.ts` | API endpoint | Cloudflare Worker |
| `*.css`, `*.js`, `*.woff2` | Static assets | Cloudflare CDN (immutable) |
| `/rss.xml`, `/sitemap*.xml` | SEO files | Static, generated at build time |
