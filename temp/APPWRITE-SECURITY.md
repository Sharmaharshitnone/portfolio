# Appwrite Security Hardening — Manual Steps Required

> **Priority: CRITICAL**
> All Appwrite collections currently have "any" role with full CRUD permissions.
> Anyone who discovers your project ID can read contact messages (PII), manipulate
> view counts, or change your live status. Since all API routes use the server SDK
> with `client.setKey(apiKey)` (which bypasses collection permissions), the fix is
> to **remove all "any" role permissions** from every collection.

---

## 1. Find Your Appwrite User ID

1. Log in to the Appwrite Console: `https://cloud.appwrite.io`
2. Go to **Auth** > **Users** in your project
3. Click your user row — the **User ID** is shown at the top (e.g. `65a1b2c3d4e5f6g7h8i9`)
4. Copy it — you'll use it below as `YOUR_USER_ID`

---

## 2. Lock Down Collection Permissions

For **each** of the three collections, apply these steps:

### A. ContactMessages Collection

Purpose: Stores contact form submissions (contains PII: names, emails).

1. Go to **Databases** > your DB > **ContactMessages** > **Settings** tab
2. Under **Permissions**, remove ALL existing entries (especially "any")
3. Add a single permission:
   - **Role**: `user:YOUR_USER_ID`
   - **Permissions**: Read, Create, Update, Delete (all four)
4. Click **Update**

Why: Only the server SDK (with API key) writes here. Your user ID permission
lets you browse data in the Appwrite console. The "any" role is never needed.

### B. PageViews Collection

Purpose: Stores per-slug view counts.

1. Go to **Databases** > your DB > **PageViews** > **Settings** tab
2. Under **Permissions**, remove ALL existing entries
3. Add a single permission:
   - **Role**: `user:YOUR_USER_ID`
   - **Permissions**: Read, Create, Update, Delete
4. Click **Update**

### C. LiveStatus Collection

Purpose: Stores your current live status message.

1. Go to **Databases** > your DB > **LiveStatus** > **Settings** tab
2. Under **Permissions**, remove ALL existing entries
3. Add a single permission:
   - **Role**: `user:YOUR_USER_ID`
   - **Permissions**: Read, Create, Update, Delete
4. Click **Update**

---

## 3. Verify Permissions Are Working

After updating all three collections:

```bash
# 1. Test contact form (should still work — server SDK bypasses permissions)
curl -X POST https://harshit.systems/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test","email":"test@test.com","message":"Security test message"}'

# 2. Test view counter
curl -X POST https://harshit.systems/api/views \
  -H 'Content-Type: application/json' \
  -d '{"slug":"test-security"}'

# 3. Test status endpoint
curl https://harshit.systems/api/status

# 4. Verify direct Appwrite access is BLOCKED (should return 401/403)
curl -X GET "https://sgp.cloud.appwrite.io/v1/databases/YOUR_DB_ID/collections/YOUR_CONTACT_TABLE_ID/documents" \
  -H "X-Appwrite-Project: YOUR_PROJECT_ID"
```

The last command should fail with a permission error. If it returns data, the
"any" role is still present — re-check the collection settings.

---

## 4. Rate Limiting (Cloudflare Dashboard)

The `/api/contact` and `/api/views` endpoints have no server-side rate limiting.
Use Cloudflare's built-in WAF rate limiting rules:

1. Go to **Cloudflare Dashboard** > your zone > **Security** > **WAF** > **Rate limiting rules**
2. Create Rule: **Contact Form**
   - **If**: URI Path equals `/api/contact` AND Method equals `POST`
   - **Rate**: 5 requests per 10 minutes per IP
   - **Action**: Block for 10 minutes
   - **Response**: 429 Too Many Requests
3. Create Rule: **Views API**
   - **If**: URI Path equals `/api/views` AND Method equals `POST`
   - **Rate**: 30 requests per 1 minute per IP
   - **Action**: Block for 5 minutes
   - **Response**: 429 Too Many Requests
4. Deploy both rules

This is handled at the edge (before Workers), so it's zero-cost and instant.

---

## 5. Additional Recommendations

### Rotate the Appwrite API Key
If the current key was ever exposed (e.g. in a git commit, logs, or client JS):
1. Go to **Appwrite Console** > **API Keys**
2. Create a new key with the same scopes
3. Delete the old key
4. Update the secret in Cloudflare:
   ```bash
   pnpm exec wrangler pages secret put APPWRITE_API_KEY --project-name=harshit-systems
   ```

### Enable Appwrite Audit Logs
Appwrite Cloud has built-in audit logging. Check **Settings** > **Activity** in
your project to monitor for unauthorized access attempts.

### Consider IP Allowlisting (Optional)
If all traffic routes through Cloudflare Workers, you could allowlist only
Cloudflare's IP ranges in Appwrite's project settings. This prevents any direct
access to Appwrite that doesn't go through your Workers.

---

## Summary Checklist

- [ ] Found your Appwrite User ID
- [ ] Removed "any" role from ContactMessages
- [ ] Removed "any" role from PageViews
- [ ] Removed "any" role from LiveStatus
- [ ] Added `user:YOUR_USER_ID` with full CRUD to all three collections
- [ ] Verified API routes still work (server SDK bypasses permissions)
- [ ] Verified direct Appwrite access is blocked
- [ ] Created Cloudflare WAF rate limiting rules
- [ ] Rotated Appwrite API key (if previously exposed)
