import { Github, Linkedin, Mail, Rss } from "lucide-preact";

const SOCIAL_LINKS = [
    { href: "https://github.com/harshit", icon: Github, label: "GitHub" },
    { href: "https://linkedin.com/in/harshit", icon: Linkedin, label: "LinkedIn" },
    { href: "mailto:harshit@systems.dev", icon: Mail, label: "Email" },
    { href: "/rss.xml", icon: Rss, label: "RSS Feed" },
] as const;

export function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer style={{ borderTop: "1px solid var(--color-border)" }}>
            <div className="container py-12">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <span className="text-faint text-[13px]">
                        Harshit Sharma · {year}
                    </span>

                    <div className="flex items-center gap-1">
                        {SOCIAL_LINKS.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                target={link.href.startsWith("http") ? "_blank" : undefined}
                                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                                className="text-faint hover:text-dim p-2.5 transition-colors inline-flex items-center justify-center rounded-md hover:bg-surface"
                                aria-label={link.label}
                            >
                                <link.icon className="h-4 w-4" aria-hidden="true" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
