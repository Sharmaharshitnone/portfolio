import { useState, useEffect } from "preact/hooks";
import { Menu, X } from "lucide-preact";
import { NAV_LINKS } from "../../lib/constants";

interface Props {
    currentPath?: string;
}

export function Navbar({ currentPath = "/" }: Props) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Close mobile nav on route change (View Transitions)
    useEffect(() => {
        const handleNav = () => setMobileOpen(false);
        document.addEventListener("astro:page-load", handleNav);
        return () => document.removeEventListener("astro:page-load", handleNav);
    }, []);

    // Subtle scroll-driven shadow
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`sticky top-0 z-50 h-14 border-b border-border backdrop-blur-sm transition-shadow duration-200 ${scrolled ? "shadow-sm" : ""}`}
            style={{
                backgroundColor: "color-mix(in srgb, var(--bg) 80%, transparent)",
            }}
        >
            <div className="container h-full flex items-center justify-between">
                <a
                    href="/"
                    className="font-mono text-[13px] font-semibold tracking-tight text-foreground hover:text-accent transition-colors"
                    aria-label="Harshit Sharma — Home"
                >
                    harshit.dev
                </a>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
                    {NAV_LINKS.map((link) => {
                        const isActive =
                            link.href === "/"
                                ? currentPath === "/"
                                : currentPath.startsWith(link.href);

                        return (
                            <a
                                key={link.label}
                                href={link.href}
                                aria-current={isActive ? "page" : undefined}
                                className={`text-[13px] px-3 py-1.5 rounded-md transition-colors ${isActive
                                    ? "text-foreground bg-surface font-medium"
                                    : "text-dim hover:text-foreground"
                                    }`}
                            >
                                {link.label}
                            </a>
                        );
                    })}
                </nav>

                <div className="md:hidden flex items-center gap-1">
                    <button
                        className="p-2.5 text-dim hover:text-foreground transition-colors"
                        onClick={() => setMobileOpen((prev) => !prev)}
                        aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
                        aria-expanded={mobileOpen}
                        aria-controls="mobile-nav"
                    >
                        {mobileOpen ? (
                            <X className="h-5 w-5" aria-hidden="true" />
                        ) : (
                            <Menu className="h-5 w-5" aria-hidden="true" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Nav Panel */}
            <div
                id="mobile-nav"
                role="region"
                aria-label="Mobile navigation"
                className={`md:hidden absolute top-14 left-0 w-full bg-background border-b border-border transition-[max-height,opacity] duration-200 overflow-hidden ${mobileOpen ? "max-h-[320px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                aria-hidden={!mobileOpen}
            >
                <nav className="px-5 py-4 flex flex-col gap-1">
                    {NAV_LINKS.map((link) => {
                        const isActive =
                            link.href === "/"
                                ? currentPath === "/"
                                : currentPath.startsWith(link.href);

                        return (
                            <a
                                key={link.label}
                                href={link.href}
                                aria-current={isActive ? "page" : undefined}
                                className={`text-[15px] px-3 py-3 rounded-md transition-colors ${isActive
                                    ? "text-foreground bg-surface font-medium"
                                    : "text-foreground hover:bg-surface"
                                    }`}
                                onClick={() => setMobileOpen(false)}
                            >
                                {link.label}
                            </a>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}
