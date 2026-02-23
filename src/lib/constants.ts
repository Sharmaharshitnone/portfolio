import { Github, Linkedin, Mail, MapPin } from 'lucide-preact';

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
    { icon: Mail, label: "EMAIL", value: "harshit@systems.dev", href: "mailto:harshit@systems.dev" },
    { icon: Github, label: "GITHUB", value: "@harshit", href: "https://github.com/harshit" },
    { icon: Linkedin, label: "LINKEDIN", value: "in/harshit", href: "https://linkedin.com/in/harshit" },
    { icon: MapPin, label: "LOCATION", value: "Remote / Global", href: null },
];

export const TECH_STACK = [
    { label: "Rust", icon: "devicon-rust-plain" },
    { label: "Go", icon: "devicon-go-plain" },
    { label: "TypeScript", icon: "devicon-typescript-plain" },
    { label: "Python", icon: "devicon-python-plain" },
    { label: "C++", icon: "devicon-cplusplus-plain" },
    { label: "React", icon: "devicon-react-original" },
    { label: "Next.js", icon: "devicon-nextjs-plain" },
    { label: "Node.js", icon: "devicon-nodejs-plain" },
    { label: "Postgres", icon: "devicon-postgresql-plain" },
    { label: "Redis", icon: "devicon-redis-plain" },
    { label: "K8s", icon: "devicon-kubernetes-plain" },
    { label: "Docker", icon: "devicon-docker-plain" },
    { label: "GraphQL", icon: "devicon-graphql-plain" },
    { label: "AWS", icon: "devicon-amazonwebservices-plain-wordmark" },
    { label: "Linux", icon: "devicon-linux-plain" },
    { label: "Neovim", icon: "devicon-vim-plain" },
    { label: "Git", icon: "devicon-git-plain" },
    { label: "Arch", icon: "devicon-archlinux-plain" },
];

export const PLATFORM_NAMES = {
    LC: "LeetCode",
    CF: "Codeforces",
    AC: "AtCoder"
};
