import { useState, useCallback } from 'preact/hooks';

interface LogEntry {
    id: string;
    title: string;
    description: string;
    type: string;
    tags: string[];
    mood?: string;
    hoursWorked?: number;
    pubDate: string; // ISO string
    href: string;
    commitHash: string;
}

interface Props {
    logs: LogEntry[];
    allTags: string[];
}

/** Generate a deterministic 7-char hex hash from a string */
function fakeHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const ch = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + ch;
        hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(7, '0').slice(0, 7);
}

/** Relative time string (e.g. "3 days ago", "2 months ago") */
function timeAgo(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const seconds = Math.floor((now - then) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
    const years = Math.floor(months / 12);
    return `${years} year${years > 1 ? 's' : ''} ago`;
}

function ChevronIcon({ open }: { open: boolean }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class={`shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
            aria-hidden="true"
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
}

function ClockIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
    );
}

export function LogTimeline({ logs, allTags }: Props) {
    const [activeTag, setActiveTag] = useState<string>('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const filtered = activeTag === 'all'
        ? logs
        : logs.filter((log) => log.tags.includes(activeTag));

    const toggle = useCallback((id: string) => {
        setExpandedId((prev) => prev === id ? null : id);
    }, []);

    return (
        <div>
            {/* Tag Filter Bar */}
            <div className="flex items-center gap-2 mb-16 overflow-x-auto pb-2 scrollbar-none">
                <button
                    onClick={() => setActiveTag('all')}
                    className={`text-[11px] font-mono px-3 py-1.5 rounded-md shrink-0 transition-colors ${
                        activeTag === 'all'
                            ? 'bg-foreground text-background'
                            : 'text-faint hover:text-dim border border-border'
                    }`}
                >
                    all
                </button>
                {allTags.map((tag) => (
                    <button
                        key={tag}
                        onClick={() => setActiveTag(tag)}
                        className={`text-[11px] font-mono px-3 py-1.5 rounded-md shrink-0 transition-colors ${
                            activeTag === tag
                                ? 'bg-foreground text-background'
                                : 'text-faint hover:text-dim border border-border'
                        }`}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            {/* Timeline */}
            <div className="relative ml-2 sm:ml-4 pl-8 sm:pl-10 pb-12">
                {/* Explicit vertical line — separate div for precise dot alignment */}
                <div className="absolute left-0 top-0 bottom-0 w-px bg-border" aria-hidden="true" />

                <div className="flex flex-col gap-10">
                    {filtered.map((log) => {
                        const isOpen = expandedId === log.id;
                        return (
                            <div key={log.id} className="relative group">
                                {/* Branch dot — centered on the line via -translate-x-1/2 */}
                                <div className="absolute -left-8 sm:-left-10 top-2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-foreground ring-4 ring-background transition-shadow duration-200 group-hover:shadow-[0_0_10px_3px_var(--accent)]" />

                                {/* Commit metadata line */}
                                <div className="flex items-center gap-3 text-[11px] font-mono text-faint mb-2">
                                    <span className="text-dim">{log.commitHash}</span>
                                    <span>{log.pubDate.slice(0, 10)}</span>
                                    <span className="flex items-center gap-1">
                                        <ClockIcon />
                                        {timeAgo(log.pubDate)}
                                    </span>
                                </div>

                                {/* Clickable title — toggles accordion */}
                                <button
                                    onClick={() => toggle(log.id)}
                                    className="group flex items-center gap-2 w-full text-left mb-2 focus:outline-none"
                                    aria-expanded={isOpen}
                                >
                                    <ChevronIcon open={isOpen} />
                                    <h2 className="text-[17px] font-medium text-foreground group-hover:text-subtle transition-colors">
                                        {log.title}
                                    </h2>
                                </button>

                                {/* Description (always visible) */}
                                {!isOpen && (
                                    <p className="pl-6 text-dim text-sm mb-3">
                                        {log.description}
                                    </p>
                                )}

                                {/* Tags */}
                                <div className="pl-6 flex flex-wrap gap-2 mb-2">
                                    {log.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="text-[11px] font-mono text-badge-text bg-badge-bg px-2 py-0.5 rounded border border-badge-border"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Expanded content */}
                                {isOpen && (
                                    <div className="pl-6 mt-4 border-l-2 border-accent/40 ml-2 pl-6">
                                        <p className="text-dim text-sm leading-[1.7] italic mb-4">
                                            {log.description}
                                        </p>
                                        <a
                                            href={log.href}
                                            className="inline-flex items-center gap-1.5 text-accent text-sm font-mono hover:underline"
                                        >
                                            Read full log →
                                        </a>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {filtered.length === 0 && (
                <p className="text-faint text-sm font-mono text-center py-20">
                    No logs matching this tag.
                </p>
            )}
        </div>
    );
}
