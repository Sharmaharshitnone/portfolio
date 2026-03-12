/**
 * Typed environment variable access.
 *
 * 12-Factor App — Factor III: Config
 * All config must come from the environment, never hardcoded.
 *
 * ── Security model ───────────────────────────────────────────────────────────
 * Astro/Vite only bakes PUBLIC_-prefixed vars into the client JS bundle.
 * None of our vars use PUBLIC_ → they are NEVER shipped to the browser.
 *
 * Where values come from at runtime:
 *   build-time:  import.meta.env (Vite replaces PUBLIC_* only — others undefined)
 *   CF bindings: context.locals.runtime.env  ← wrangler.toml [vars] and Pages secrets live HERE
 *                NOT in process.env — use createAppwrite(cfEnv) in API routes, not this module
 *
 * Rule of thumb:
 *   [vars] in wrangler.toml   → non-secret config (endpoint, project id, table id)
 *   `pages secret put`        → anything you'd never put in git (API keys, tokens)
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Read optional env var — returns fallback (default "") if not set. */
function optionalEnv(key: string, fallback = ""): string {
    const fromImportMeta = typeof import.meta !== 'undefined' ? (import.meta as any).env?.[key] : undefined;
    const fromProcess = typeof process !== 'undefined' ? process.env?.[key] : undefined;
    return fromImportMeta ?? fromProcess ?? fallback;
}

export const env = {
    // ── Public site config ──────────────────────────────────────────────────
    /** Canonical public URL — used in sitemap, OG images, canonical links. */
    SITE_URL: optionalEnv("SITE_URL", "https://harshit.systems"),

    // ── Appwrite config is intentionally NOT here ───────────────────────────
    // Cloudflare [vars] and secrets are injected into context.locals.runtime.env
    // per-request, NOT into process.env. Read them via createAppwrite(cfEnv)
    // in each API route. Putting them here would always return empty strings.

    // ── Feature flags ────────────────────────────────────────────────────────
    ANALYTICS_ENABLED: optionalEnv("ANALYTICS_ENABLED", "false") === "true",
} as const;
