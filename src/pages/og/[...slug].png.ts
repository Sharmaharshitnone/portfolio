/**
 * OG Image Generation — Build-time static endpoint.
 *
 * Per ADR-011: Generates 1200×630 PNG OG cards at build time
 * using Satori (JSX → SVG) + @resvg/resvg-wasm (SVG → PNG).
 *
 * Route: /og/projects/slug.png, /og/algorithms/slug.png, /og/logs/slug.png
 * Referenced by BaseHead.astro via og:image meta tag.
 *
 * Runs inside @astrojs/cloudflare v13's workerd prerender server — no node:fs.
 * WASM is imported as a WebAssembly.Module (bare .wasm import, Workers-native).
 * Fonts are fetched via HTTP from the prerender server's static file handler.
 *
 * satori/standalone is used (not satori) so that the yoga WASM can be supplied
 * as a pre-compiled WebAssembly.Module. This bypasses the Emscripten base64
 * loader path which calls WebAssembly.instantiate(buffer) — disallowed in workerd.
 * satori/standalone's init(module) calls WebAssembly.instantiate(module, imports)
 * (the two-arg form with a pre-compiled Module), which IS allowed in workerd.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import satori, { init as initSatori } from 'satori/standalone';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm';
// yoga.wasm is not in satori's exports map; resolved via Vite alias in astro.config.mjs.
// @cloudflare/vite-plugin resolves bare .wasm imports as WebAssembly.Module.
import yogaWasm from 'satori/yoga.wasm';

// Initialize both WASM modules once at module scope (workerd-safe).
// - resvgWasm: WebAssembly.Module imported via bare .wasm import
// - yogaWasm: WebAssembly.Module imported via bare .wasm import
// Both use the Workers-native pre-compiled Module path; no dynamic instantiation.
await initWasm(resvgWasm);
await initSatori(yogaWasm);

// Module-level Promise cache so fonts are fetched only once across all OG renders.
let fontsPromise: Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> | null = null;

function getFonts(origin: string): Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      fetch(new URL('/fonts/inter-regular.ttf', origin)).then((r) => r.arrayBuffer()),
      fetch(new URL('/fonts/inter-bold.ttf', origin)).then((r) => r.arrayBuffer()),
    ])
      .then(([regular, bold]) => ({ regular, bold }))
      .catch(() => ({ regular: new ArrayBuffer(0), bold: new ArrayBuffer(0) }));
  }
  return fontsPromise;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const projects = await getCollection('projects');
  const algorithms = await getCollection('algorithms');
  const logs = await getCollection('logs');

  return [
    ...projects.map((p) => ({
      params: { slug: `projects/${p.id}` },
      props: {
        title: p.data.title,
        type: p.data.category.toUpperCase(),
        extra: p.data.techStack.join(' · '),
      },
    })),
    ...algorithms.map((a) => ({
      params: { slug: `algorithms/${a.id}` },
      props: {
        title: a.data.title,
        type: a.data.platform.toUpperCase(),
        extra: `${a.data.timeComplexity} · ${a.data.difficulty}`,
      },
    })),
    ...logs.map((l) => ({
      params: { slug: `logs/${l.id}` },
      props: {
        title: l.data.title,
        type: l.data.type.toUpperCase(),
        extra: l.data.tags.join(' · '),
      },
    })),
  ];
};

export const GET: APIRoute = async ({ props, url }) => {
  const { title, type, extra } = props as {
    title: string;
    type: string;
    extra: string;
  };

  const { regular, bold } = await getFonts(url.origin);

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          padding: '60px',
          background: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
          color: '#e6edf3',
          fontFamily: 'Inter',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { fontSize: 24, color: '#58a6ff', marginBottom: 16, letterSpacing: '0.05em' },
              children: type,
            },
          },
          {
            type: 'div',
            props: {
              style: {
                fontSize: 48,
                fontWeight: 700,
                lineHeight: 1.2,
                marginBottom: 24,
                maxWidth: '80%',
              },
              children: title,
            },
          },
          {
            type: 'div',
            props: {
              style: { fontSize: 20, color: '#8b949e' },
              children: extra,
            },
          },
          {
            type: 'div',
            props: {
              style: {
                fontSize: 18,
                color: '#58a6ff',
                marginTop: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              },
              children: 'harshit.systems',
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: regular,
          weight: 400,
          style: 'normal' as const,
        },
        {
          name: 'Inter',
          data: bold,
          weight: 700,
          style: 'normal' as const,
        },
      ],
    },
  );

  const png = new Resvg(svg, {
    fitTo: { mode: 'width' as const, value: 1200 },
  }).render().asPng();

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  });
};
