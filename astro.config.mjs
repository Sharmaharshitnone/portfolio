import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import cloudflare from "@astrojs/cloudflare";
import { createRequire } from "node:module";
import { join } from "node:path";

const require = createRequire(import.meta.url);

// Resolve yoga.wasm from the satori package root.
// satori ships yoga.wasm at its package root but does not list it in `exports`,
// so `require.resolve('satori/yoga.wasm')` throws. We resolve the package root
// via `require.resolve('satori/package.json')` (which IS exported) and build the path.
const satoriRoot = join(require.resolve('satori/package.json'), '..');
const yogaWasmPath = join(satoriRoot, 'yoga.wasm');

// https://astro.build/config
export default defineConfig({
    // ── 12-Factor: Site URL is injected from env or defaults to production URL
    site: process.env.SITE_URL ?? "https://harshit.systems",

    // Prefetch linked pages on hover so navigation feels instant
    prefetch: {
        prefetchAll: false,
        defaultStrategy: "hover",
    },

    // Cloudflare Pages adapter — needed for server-rendered API routes
    // imageService: 'passthrough' — this site does not use Cloudflare Images (paid).
    // Without this, the adapter defaults to "cloudflare-binding" which injects an IMAGES
    // binding into Miniflare that does not exist locally (nor in wrangler.toml), adding
    // unnecessary instability to hot reloads.
    adapter: cloudflare({ imageService: 'passthrough' }),

    integrations: [
        preact({ compat: false }),
        sitemap({
            // Exclude draft pages or admin routes if added later
            filter: (page) => !page.includes("/api/"),
        }),
    ],

    markdown: {
        shikiConfig: {
            // Dual themes — CSS-driven, auto-switches with data-theme
            themes: {
                light: 'github-light',
                dark: 'github-dark',
            },
            defaultColor: false,
            wrap: false,
        },
    },

    vite: {
        plugins: [tailwindcss()],
        resolve: {
            alias: {
                // satori ships yoga.wasm at the package root but does not list it in
                // its `exports` map, so Vite/Rollup cannot resolve `satori/yoga.wasm`
                // via the standard subpath-exports mechanism.
                // We alias it here to the real file path so bare .wasm imports work.
                'satori/yoga.wasm': yogaWasmPath,
            },
        },
    },

    // Hybrid: static by default, opt-in server with `export const prerender = false`
    output: "static",

    // Enable TypeScript path aliases
    // tsconfig.json handles this via compilerOptions.paths
});
