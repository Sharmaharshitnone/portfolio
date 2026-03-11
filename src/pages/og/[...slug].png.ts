/**
 * OG Image Generation — Build-time static endpoint.
 *
 * Per ADR-011: Generates 1200×630 PNG OG cards at build time
 * using Satori (JSX → SVG) + @resvg/resvg-wasm (SVG → PNG).
 *
 * Route: /og/projects/slug.png, /og/algorithms/slug.png, /og/logs/slug.png
 * Referenced by BaseHead.astro via og:image meta tag.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import satori from 'satori';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Initialize WASM once at module load — runs at build time on Node.js only.
// @resvg/resvg-wasm has no native binaries so it bundles cleanly with Rollup.
await initWasm(
  readFileSync(join(process.cwd(), 'node_modules/@resvg/resvg-wasm/index_bg.wasm'))
);

// Load fonts as raw buffers — Satori requires TTF/OTF (not woff2)
let interRegular: ArrayBuffer;
let interBold: ArrayBuffer;
try {
  const base = join(process.cwd(), 'public', 'fonts');
  interRegular = readFileSync(join(base, 'inter-regular.ttf')).buffer as ArrayBuffer;
  interBold = readFileSync(join(base, 'inter-bold.ttf')).buffer as ArrayBuffer;
} catch {
  interRegular = new ArrayBuffer(0);
  interBold = new ArrayBuffer(0);
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

export const GET: APIRoute = async ({ props }) => {
  const { title, type, extra } = props as {
    title: string;
    type: string;
    extra: string;
  };

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
          data: interRegular,
          weight: 400,
          style: 'normal' as const,
        },
        {
          name: 'Inter',
          data: interBold,
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
