import { useState } from 'preact/hooks';

interface Project {
    title: string;
    description: string;
    category: string;
    techStack: string[];
    githubUrl: string;
    liveUrl?: string;
    pubDate: string; // ISO string for serialisation
    href: string;
}

interface Props {
    projects: Project[];
    categories: string[];
}

function FilterIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
    );
}

function GithubIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
        </svg>
    );
}

function ExternalIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M7 7h10v10" /><path d="M7 17 17 7" />
        </svg>
    );
}

export function ProjectFilter({ projects, categories }: Props) {
    const [active, setActive] = useState<string>('all');

    const filtered = active === 'all'
        ? projects
        : projects.filter((p) => p.category === active);

    return (
        <div>
            {/* Filter Bar */}
            <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2 scrollbar-none">
                <div className="p-2 text-faint border border-border rounded-md shrink-0 bg-card">
                    <FilterIcon />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActive('all')}
                        className={`text-[13px] font-mono px-3 py-1.5 rounded-md shrink-0 transition-colors ${
                            active === 'all'
                                ? 'bg-foreground text-background'
                                : 'text-faint hover:text-dim border border-border'
                        }`}
                    >
                        all
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActive(cat)}
                            className={`text-[13px] font-mono px-3 py-1.5 rounded-md shrink-0 transition-colors ${
                                active === cat
                                    ? 'bg-foreground text-background'
                                    : 'text-faint hover:text-dim border border-border'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Project Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((project) => (
                    <a key={project.href} href={project.href} className="block group">
                        <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm hover:border-border-strong hover:bg-surface-raised transition-colors p-5 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-xs font-mono text-dim uppercase tracking-wider">
                                    {project.category}
                                </span>
                                <span className="text-xs font-mono text-faint">
                                    {project.pubDate.slice(0, 10)}
                                </span>
                            </div>

                            <h3 className="text-foreground font-medium mb-2 group-hover:text-subtle transition-colors">
                                {project.title}
                            </h3>

                            <p className="text-dim text-sm line-clamp-2 mb-6 flex-1">
                                {project.description}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {project.techStack.slice(0, 4).map((tech) => (
                                    <span
                                        key={tech}
                                        className="text-[11px] font-mono text-badge-text bg-badge-bg px-2 py-0.5 rounded border border-badge-border"
                                    >
                                        {tech}
                                    </span>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-border flex items-center gap-4 mt-auto">
                                <span className="text-dim text-[13px] inline-flex items-center gap-1.5">
                                    <GithubIcon /> Source
                                </span>
                                {project.liveUrl && (
                                    <span className="text-dim text-[13px] inline-flex items-center gap-1.5">
                                        <ExternalIcon /> Demo
                                    </span>
                                )}
                            </div>
                        </div>
                    </a>
                ))}
            </div>

            {filtered.length === 0 && (
                <p className="text-faint text-sm font-mono text-center py-20">
                    No projects in this category yet.
                </p>
            )}
        </div>
    );
}
