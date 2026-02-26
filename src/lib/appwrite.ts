/**
 * appwrite.ts — Appwrite client factory.
 *
 * Per ADR-004: Appwrite Cloud is used exclusively for:
 *  1. PageViews table  — slug + view count
 *  2. ContactMessages table — name, email, message, timestamp
 *
 * ── Why a factory and not a module-level singleton? ──────────────────────────
 * Cloudflare Worker [vars] and secrets are NOT in process.env.
 * They are injected per-request into the Worker's env binding object,
 * accessible in Astro via context.locals.runtime.env.
 *
 * A module-level client would always read empty strings at import time.
 * createAppwrite(cfEnv) is called once per request handler with the live bindings.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { Client, Databases, ID } from 'node-appwrite';

/** Shape of the Cloudflare binding env object (subset we use). */
export interface CfEnv {
  APPWRITE_ENDPOINT?: string;
  APPWRITE_PROJECT_ID?: string;
  APPWRITE_DB_ID?: string;
  APPWRITE_VIEWS_TABLE_ID?: string;
  APPWRITE_CONTACT_TABLE_ID?: string;
  APPWRITE_STATUS_TABLE_ID?: string;
  APPWRITE_API_KEY?: string;
}

/** Per-request Appwrite client — call this at the top of each API route handler. */
export function createAppwrite(cfEnv: CfEnv) {
  const endpoint = cfEnv.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
  const projectId = cfEnv.APPWRITE_PROJECT_ID || '';
  const apiKey   = cfEnv.APPWRITE_API_KEY   || '';

  const client = new Client();
  if (endpoint && projectId) {
    client.setEndpoint(endpoint).setProject(projectId);
  }
  // Server API key — unlocks reads/writes on restricted collections.
  if (apiKey) {
    client.setKey(apiKey);
  }

  return {
    databases:      new Databases(client),
    DB_ID:          cfEnv.APPWRITE_DB_ID          || '',
    viewsTableId:   cfEnv.APPWRITE_VIEWS_TABLE_ID  || '',
    contactTableId: cfEnv.APPWRITE_CONTACT_TABLE_ID || '',
    statusTableId:  cfEnv.APPWRITE_STATUS_TABLE_ID  || '',
  };
}

export { ID };
