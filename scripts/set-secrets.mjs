#!/usr/bin/env node
/**
 * scripts/set-secrets.mjs
 *
 * Interactively sets Cloudflare Pages environment variables / secrets.
 * Usage: pnpm secrets:set
 *
 * Reads values from process.env first (CI-friendly), or prompts interactively.
 * Secrets are stored encrypted in Cloudflare — never written to disk.
 *
 * Requires: wrangler login to have been run first.
 */

import { execSync } from 'node:child_process';
import { createInterface } from 'node:readline';

const PROJECT = 'harshit-systems';

// Non-secret env vars (go to [vars] in wrangler.toml → set them in CF dashboard)
const PUBLIC_VARS = [
  'APPWRITE_ENDPOINT',
  'APPWRITE_PROJECT_ID',
  'APPWRITE_DB_ID',
  'APPWRITE_VIEWS_TABLE_ID',
  'APPWRITE_CONTACT_TABLE_ID',
  'SITE_URL',
];

// These would be secrets if you add a server-side Appwrite API key later
// Currently empty — add keys here as needed
const SECRETS = [
  'APPWRITE_API_KEY',
];

const rl = createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  console.log('\n🚀 Cloudflare Pages — Environment Variable Setup');
  console.log('   Project:', PROJECT);
  console.log('   Run `pnpm cf:login` if not logged in yet.\n');

  // ── Check login ──────────────────────────────────────
  try {
    const who = execSync('pnpm exec wrangler whoami 2>&1', { encoding: 'utf8' });
    const match = who.match(/You are logged in with an OAuth Token, associated with the email '([^']+)'/);
    if (match) console.log(`   Logged in as: ${match[1]}\n`);
  } catch {
    console.warn('   ⚠ Not logged in — run `pnpm cf:login` first.\n');
    rl.close();
    return;
  }

  // ── Public vars via wrangler pages env ───────────────
  console.log('──────────────────────────────────────────────────');
  console.log(' PUBLIC env vars (stored as plaintext in Cloudflare)');
  console.log('──────────────────────────────────────────────────');
  console.log(' These are set in wrangler.toml [vars] and the Cloudflare dashboard.');
  console.log(' Update wrangler.toml directly, then deploy — they will be applied.\n');

  for (const key of PUBLIC_VARS) {
    const current = process.env[key] ?? '';
    const val = await ask(`  ${key} [${current || 'enter value'}]: `);
    const final = val.trim() || current;
    if (final) {
      console.log(`  ✓ ${key} = ${final}`);
      // Print the wrangler.toml line so user can paste it
      console.log(`    → add to wrangler.toml [vars]: ${key} = "${final}"\n`);
    }
  }

  // ── Secrets via wrangler secret put ──────────────────
  if (SECRETS.length > 0) {
    console.log('\n──────────────────────────────────────────────────');
    console.log(' SECRETS (stored encrypted in Cloudflare Workers)');
    console.log('──────────────────────────────────────────────────\n');

    for (const key of SECRETS) {
      const val = process.env[key] ?? await ask(`  ${key}: `);
      if (val.trim()) {
        console.log(`  Setting secret ${key}...`);
        try {
          execSync(
            `pnpm exec wrangler pages secret put ${key} --project-name=${PROJECT}`,
            { input: val.trim(), stdio: ['pipe', 'inherit', 'inherit'] }
          );
        } catch (e) {
          console.error(`Failed to set secret ${key}:`, e.message);
          console.log(`You can also run: pnpm exec wrangler pages secret put ${key} --project-name=${PROJECT}`);
        }
        console.log(`  ✓ ${key} set.\n`);
      }
    }
  }

  console.log('\n✅ Done! Update wrangler.toml [vars] with the values above, then run:');
  console.log('   pnpm pages:deploy\n');

  rl.close();
}

main();
