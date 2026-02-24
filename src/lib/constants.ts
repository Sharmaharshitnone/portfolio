export const SITE_META = {
    title: "Harshit Sharma — Systems Engineer",
    description: "Senior Backend & Systems Engineer specializing in Rust, Go, and distributed systems."
};

export const NAV_LINKS = [
    { href: "/", label: "Index" },
    { href: "/projects", label: "Projects" },
    { href: "/algorithms", label: "Algorithms" },
    { href: "/logs", label: "Logs" },
    { href: "/contact", label: "Contact" },
];

export const STATS = [
    { label: "Years experience", value: "5+" },
    { label: "Open source PRs", value: "200+" },
    { label: "Problems solved", value: "800+" },
    { label: "CF rating", value: "1900+" },
];

export const CONTACT_LINKS = [
    {
        label: "EMAIL",
        value: "harshit@systems.dev",
        href: "mailto:harshit@systems.dev" as string | null,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
    },
    {
        label: "GITHUB",
        value: "@sharmaharshitnone",
        href: "https://github.com/sharmaharshitnone" as string | null,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>`,
    },
    {
        label: "LINKEDIN",
        value: "in/harshit",
        href: "https://linkedin.com/in/harshit" as string | null,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>`,
    },
    {
        label: "LOCATION",
        value: "Remote / Global",
        href: null as string | null,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>`,
    },
];

export const TECH_STACK = [
    { label: "Rust", abbr: "Rs" },
    { label: "Go", abbr: "Go" },
    { label: "TypeScript", abbr: "TS" },
    { label: "Python", abbr: "Py" },
    { label: "C++", abbr: "++" },
    { label: "React", abbr: "Re" },
    { label: "Next.js", abbr: "Nx" },
    { label: "Node.js", abbr: "Nd" },
    { label: "Postgres", abbr: "Pg" },
    { label: "Redis", abbr: "Rd" },
    { label: "K8s", abbr: "K8" },
    { label: "Docker", abbr: "Dk" },
    { label: "GraphQL", abbr: "GQ" },
    { label: "AWS", abbr: "AW" },
    { label: "Linux", abbr: "Lx" },
    { label: "Neovim", abbr: "Nv" },
    { label: "Git", abbr: "Gi" },
    { label: "Arch", abbr: "Ar" },
];

export const PLATFORM_NAMES: Record<string, string> = {
    codeforces: "Codeforces",
    leetcode: "LeetCode",
    atcoder: "AtCoder",
    cses: "CSES",
    codechef: "CodeChef",
};
