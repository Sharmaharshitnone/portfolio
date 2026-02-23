# ADR-010: Subdomain Isolation for Deployed Projects

| Field | Value |
|---|---|
| **Status** | ✅ Accepted |
| **Date** | 2026-02-22 |
| **Deciders** | Harshit Sharma |

## Context

The portfolio showcases multiple deployed projects. These projects have different tech stacks (Spring Boot, React, etc.) and should be independently deployable.

## Decision

Deploy each major project on its own **subdomain** under `harshit.systems`, managed by Cloudflare DNS.

### Domain Map

```
harshit.systems                    ← Portfolio (Astro SSG, Cloudflare Pages)
blog.harshit.systems               ← Blog (separate site, external link)
vault-ledger.harshit.systems       ← Vault Ledger project
project-n.harshit.systems          ← Future projects
```

### Integration with Portfolio

The portfolio links to subdomains via `ProjectCard.astro`:

```astro
---
// ProjectCard.astro
interface Props {
  title: string;
  liveUrl?: string;
  subdomain?: string;
  githubUrl: string;
}
const { title, liveUrl, subdomain, githubUrl } = Astro.props;
const url = liveUrl || (subdomain ? `https://${subdomain}.harshit.systems` : undefined);
---
<a href={url} target="_blank" rel="noopener noreferrer">{title}</a>
```

### Why Subdomains Over Subdirectories

| Criteria | Subdomains | Subdirectories |
|---|---|---|
| Independent deployment | ✅ Each has own CI/CD | ❌ Must rebuild portfolio |
| Different tech stacks | ✅ Any framework | ❌ Must be same framework |
| Blast radius | ✅ Isolated failures | ❌ One breaks all |
| SEO | Neutral (Google treats separately) | Slightly better (domain authority) |
| Difficulty | Easy (Cloudflare DNS CNAME) | N/A |

### Cloudflare DNS Setup

For each project subdomain:
- Add `CNAME` record → target deployment platform (Vercel, Cloudflare Pages, Azure VM)
- Enable Cloudflare proxy (orange cloud) for HTTPS + WAF
- Each project manages its own SSL via Cloudflare

## Consequences

- New projects require a DNS record (1 minute in Cloudflare dashboard)
- Subdomains don't share portfolio's SEO domain authority
- Each project deploys independently — portfolio doesn't need to rebuild
- Blog is a separate site — portfolio only contains a link to it

## References

- [Cloudflare DNS management](https://developers.cloudflare.com/dns/)
