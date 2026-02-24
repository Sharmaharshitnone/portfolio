/**
 * seo.ts — JSON-LD structured data generators (ADR-009).
 *
 * Exports pure functions that return Schema.org objects.
 * Consumed by BaseHead.astro (Person) and detail pages
 * (SoftwareApplication, Article) via <script type="application/ld+json">.
 */

const SITE_URL = "https://harshit.systems";
const AUTHOR_NAME = "Harshit Sharma";

// ─── Shared author reference ────────────────────────────────────────
const authorRef = {
  "@type": "Person" as const,
  name: AUTHOR_NAME,
  url: SITE_URL,
};

// ─── Person (global) ────────────────────────────────────────────────
export interface PersonSchemaOpts {
  description: string;
}

export function generatePersonSchema(opts: PersonSchemaOpts) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: AUTHOR_NAME,
    url: SITE_URL,
    jobTitle: "Software Engineer",
    description: opts.description,
    sameAs: [
      "https://github.com/sharmaharshitnone",
      "https://linkedin.com/in/harshit",
    ],
    knowsAbout: [
      "Rust",
      "Go",
      "TypeScript",
      "C++",
      "Distributed Systems",
      "Competitive Programming",
    ],
  };
}

// ─── SoftwareApplication (per project) ──────────────────────────────
export interface ProjectSchemaOpts {
  title: string;
  description: string;
  category: string;
  githubUrl: string;
  liveUrl?: string;
  techStack: string[];
  pubDate: Date;
}

export function generateProjectSchema(opts: ProjectSchemaOpts) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: opts.title,
    description: opts.description,
    applicationCategory: mapCategory(opts.category),
    operatingSystem: "Web",
    url: opts.liveUrl ?? opts.githubUrl,
    author: authorRef,
    datePublished: opts.pubDate.toISOString().slice(0, 10),
    programmingLanguage: opts.techStack,
    codeRepository: opts.githubUrl,
  };
}

/** Map internal category enum → Schema.org applicationCategory */
function mapCategory(cat: string): string {
  const map: Record<string, string> = {
    fullstack: "DeveloperApplication",
    backend: "DeveloperApplication",
    frontend: "WebApplication",
    systems: "DesktopApplication",
    mobile: "MobileApplication",
  };
  return map[cat] ?? "DeveloperApplication";
}

// ─── Article (per log entry) ────────────────────────────────────────
export interface LogSchemaOpts {
  title: string;
  description?: string;
  pubDate: Date;
  tags: string[];
  url: string;
}

export function generateLogSchema(opts: LogSchemaOpts) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description ?? opts.title,
    datePublished: opts.pubDate.toISOString().slice(0, 10),
    author: authorRef,
    url: `${SITE_URL}${opts.url}`,
    keywords: opts.tags.join(", "),
    publisher: {
      "@type": "Person",
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
  };
}
