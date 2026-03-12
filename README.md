# Astro Starter Kit: Minimal

```sh
pnpm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `pnpm install`             | Installs dependencies                            |
| `pnpm dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm build`           | Build your production site to `./dist/`          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Cloudflare Pages — Deployment & Appwrite secrets

Follow these steps to populate `wrangler.toml`, add a server API key (secret), and deploy.

1. Copy the template and fill in values:

```bash
cp wrangler.toml.template wrangler.toml
# Edit wrangler.toml and fill APPWRITE_* values (project id, db id, table ids)
```

2. (Optional but recommended) Add a server API key in Appwrite and store it as a Pages secret:

```bash
# Generate an Appwrite API key in the Appwrite console (Project > API Keys)
# Then run the interactive helper which will push the secret to Pages:
pnpm secrets:set
# Or set it manually:
pnpm exec wrangler pages secret put APPWRITE_API_KEY --project-name=harshit-systems
```

3. Build and run Pages dev locally (wrangler will load `wrangler.toml`):

```bash
pnpm build
pnpm pages:dev
```

4. Deploy to Cloudflare Pages:

```bash
pnpm pages:deploy
```

Notes:
- Public values (prefixed `PUBLIC_`) are safe for client-side use; secrets like `APPWRITE_API_KEY` must not be exposed to the browser.
- If your Appwrite collections are locked for public writes, `APPWRITE_API_KEY` is required for server write operations.
- sample