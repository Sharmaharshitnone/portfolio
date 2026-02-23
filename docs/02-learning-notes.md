# Step-by-Step Learning Notes

> Concepts you'll encounter in this codebase — explained from first principles, in the order you should learn them.

---

## 1. Astro Pages vs Components

**Astro files (`.astro`)** always render server-side (or build-time):
```astro
---
// This JS runs at BUILD TIME, not in the browser
const data = await getCollection('projects');
---

<!-- This HTML ships to the browser -->
<ul>
  {data.map(p => <li>{p.data.title}</li>)}
</ul>
```

**Preact components (`.tsx`)** run in the browser *when hydrated*:
```tsx
// This runs in the browser
export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

**Key rule:** Props can only flow *down* from Astro → Preact, not the reverse.

---

## 2. Hydration Directives

When you use a Preact component in an `.astro` file, you choose *when* the browser loads its JS:

```astro
<!-- Load JS immediately (blocks paint slightly) -->
<TerminalHero client:load />

<!-- Load JS after paint, during idle time -->
<Navbar client:idle />

<!-- Load JS only when element is visible on screen -->
<HeavyChart client:visible />

<!-- Never load JS (render HTML only, no interactivity) -->
<StaticComponent />
```

**Mental model:** Think of `client:*` as a budget. Every directive costs bytes. Spend wisely.

---

## 3. Astro Content Layer API (Astro 5)

Content Collections are how you manage Markdown data in a type-safe way.

### Step 1: Define schema in `src/content.config.ts`
```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/projects' }),
  schema: z.object({
    title: z.string(),           // required
    featured: z.boolean().default(false),  // optional with default
  }),
});

export const collections = { projects };
```

### Step 2: Write Markdown in `src/data/projects/`
```markdown
---
title: "My Project"
featured: true
---

Case study content goes here.
```

### Step 3: Query in a page
```astro
---
import { getCollection } from 'astro:content';
const projects = await getCollection('projects');
// projects[0].data.title is fully typed ✅
---
```

**Why Zod?** If `title` is missing from your Markdown, the build fails with a clear error instead of a runtime crash.

---

## 4. TypeScript in `.astro` files

The `---` frontmatter fence is TypeScript — same as a `.ts` file.

Rule: Declare your `Props` interface to type incoming data from parent components:
```astro
---
interface Props {
  title: string;
  description?: string;  // optional
}
const { title, description = "default" } = Astro.props;
---
```

**Without this interface:** TypeScript won't catch prop typos. You'll pass `tittle="..."` and wonder why nothing renders.

---

## 5. View Transitions

`<ClientRouter />` in `BaseLayout.astro` gives you SPA-style page transitions without a full SPA.

Under the hood: Astro intercepts `<a>` clicks, fetches the next page, and swaps the `<body>` content with a cross-fade animation.

**`transition:persist`** on Navbar tells Astro: *"Don't replace this element during transitions — keep the same DOM node."*

Result: Navbar keeps state (mobile menu open/closed) across navigation.

---

## 6. CSS Custom Properties + Tailwind v4

Tailwind v4 maps CSS variables to utility classes automatically:

```css
@theme {
  --color-background: #0d1117;
}
```

This automatically generates the utility class `bg-background` which expands to `background-color: var(--color-background)`.

**Why this matters:** You can change a color in one place (`global.css`) and it propagates everywhere.

---

## 7. Preact Hooks Cheat Sheet

```tsx
// State: re-renders component when value changes
const [count, setCount] = useState(0);

// Effect: runs after render, cleanup on unmount
useEffect(() => {
  const id = setInterval(() => {}, 1000);
  return () => clearInterval(id);  // cleanup!
}, []); // [] = run once

// Memo: expensive computation cached until deps change
const sorted = useMemo(() => data.sort(...), [data]);
```

**Critical rule:** Always return a cleanup function from `useEffect` when you set up timers, event listeners, or subscriptions. TerminalHero does this correctly.

---

## 8. Understanding `pnpm build` Output

```
building client (vite)
  dist/_astro/Navbar.6o9p1fz6.js   4.96 kB
  dist/_astro/TerminalHero.js      3.32 kB
```

The numbers are the **client JavaScript bundle sizes**. Every KB here is what the browser has to download and parse.

**Target:** Under 50KB total JavaScript for a portfolio.

`dist/_astro/preact.module.CK4bCYyt.js  10.43 kB` — this is the Preact runtime, shared across all islands. Loaded once, cached forever.
