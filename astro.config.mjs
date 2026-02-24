import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
    // ── 12-Factor: Site URL is injected from env or defaults to production URL
    site: process.env.SITE_URL ?? "https://harshit.systems",

    // Cloudflare Pages adapter — needed for server-rendered API routes
    adapter: cloudflare({
        platformProxy: { enabled: true },
    }),

    integrations: [
        preact({ compat: false }),
        sitemap({
            // Exclude draft pages or admin routes if added later
            filter: (page) => !page.includes("/api/"),
        }),
    ],

    vite: {
        plugins: [tailwindcss()],
        ssr: {
            // @resvg/resvg-js uses native .node binaries — must be external
            // for Rollup bundling. Only used at build time for OG image generation.
            external: ['@resvg/resvg-js'],
        },
    },

    // Hybrid: static by default, opt-in server with `export const prerender = false`
    output: "static",

    // Enable TypeScript path aliases
    // tsconfig.json handles this via compilerOptions.paths
});
