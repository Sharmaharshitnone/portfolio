import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
    // ── 12-Factor: Site URL is injected from env or defaults to production URL
    site: process.env.SITE_URL ?? "https://harshit.systems",

    integrations: [
        preact({ compat: false }),
        sitemap({
            // Exclude draft pages or admin routes if added later
            filter: (page) => !page.includes("/api/"),
        }),
    ],

    vite: {
        plugins: [tailwindcss()],
    },

    // Explicit static output — Cloudflare Pages-compatible
    output: "static",

    // Enable TypeScript path aliases
    // tsconfig.json handles this via compilerOptions.paths
});
