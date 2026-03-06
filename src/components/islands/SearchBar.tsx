import { useState, useEffect, useCallback, useRef, useMemo } from 'preact/hooks';

// ─── Types ────────────────────────────────────────────────

interface SearchItem {
    id: string;
    title: string;
    type: 'project' | 'algorithm' | 'log';
    tags: string[];
    href: string;
    /** Secondary info line: "leetcode · hard · dp, graphs" */
    meta: string;
}

interface Props {
    items: SearchItem[];
}

// ─── Scoring ──────────────────────────────────────────────

/**
 * Lightweight fuzzy scorer.  Returns 0 (no match) or a positive score.
 *
 * Scoring rules (higher = better):
 *  - Exact substring at start of word boundary  → +50
 *  - Exact substring anywhere                   → +30
 *  - Case-insensitive substring                 → +20
 *  - Tag exact match                            → +40
 *  - Partial tag match                          → +15
 *  - Consecutive-char fuzzy (fallback)          → +5 per char
 */
function scoreItem(item: SearchItem, query: string): number {
    if (!query) return 0;
    const q = query.toLowerCase().trim();
    if (!q) return 0;

    let score = 0;
    const titleLower = item.title.toLowerCase();
    const metaLower = item.meta.toLowerCase();

    // ── Title matching ──
    if (titleLower === q) {
        score += 100; // exact
    } else if (titleLower.startsWith(q)) {
        score += 60;
    } else {
        // word-boundary match
        const words = titleLower.split(/[\s\-_.:]+/);
        const wordStart = words.some(w => w.startsWith(q));
        if (wordStart) score += 50;
        else if (titleLower.includes(q)) score += 30;
    }

    // ── Tag matching ──
    for (const tag of item.tags) {
        const tl = tag.toLowerCase();
        if (tl === q) { score += 40; break; }
        if (tl.includes(q) || q.includes(tl)) { score += 15; break; }
    }

    // ── Meta matching (platform, difficulty, etc.) ──
    if (metaLower.includes(q)) score += 10;

    // ── Fuzzy: consecutive char matching in title as fallback ──
    if (score === 0) {
        let qi = 0;
        for (let i = 0; i < titleLower.length && qi < q.length; i++) {
            if (titleLower[i] === q[qi]) qi++;
        }
        if (qi === q.length) score += 5 * q.length;
    }

    return score;
}

// ─── Highlight ────────────────────────────────────────────

/** Wraps matched substring(s) in <mark> */
function highlightMatch(text: string, query: string): preact.JSX.Element {
    if (!query) return <>{text}</>;
    const q = query.trim();
    if (!q) return <>{text}</>;

    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return <>{text}</>;

    return (
        <>
            {text.slice(0, idx)}
            <mark className="bg-transparent text-[var(--accent)] font-semibold">{text.slice(idx, idx + q.length)}</mark>
            {text.slice(idx + q.length)}
        </>
    );
}

// ─── Icons ────────────────────────────────────────────────

function SearchIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            aria-hidden="true" className="shrink-0">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
    );
}

function ProjectIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
            aria-hidden="true" className="shrink-0">
            <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2Z" />
        </svg>
    );
}

function AlgoIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
            aria-hidden="true" className="shrink-0">
            <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
        </svg>
    );
}

function LogIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
            aria-hidden="true" className="shrink-0">
            <path d="M12 20h9" /><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
        </svg>
    );
}

function ReturnIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            aria-hidden="true" className="shrink-0">
            <polyline points="9 10 4 15 9 20" /><path d="M20 4v7a4 4 0 0 1-4 4H4" />
        </svg>
    );
}

const TYPE_ICON: Record<string, () => preact.JSX.Element> = {
    project: ProjectIcon,
    algorithm: AlgoIcon,
    log: LogIcon,
};

const TYPE_LABEL: Record<string, string> = {
    project: 'Projects',
    algorithm: 'Algorithms',
    log: 'Logs',
};

// ─── Component ────────────────────────────────────────────

export function SearchBar({ items }: Props) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeIdx, setActiveIdx] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // ── Scored + grouped results ──
    const results = useMemo(() => {
        if (!query.trim()) return [];
        return items
            .map(item => ({ item, score: scoreItem(item, query) }))
            .filter(r => r.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 20)
            .map(r => r.item);
    }, [query, items]);

    // Group by type, preserving score order within each group
    const grouped = useMemo(() => {
        const map = new Map<string, SearchItem[]>();
        for (const r of results) {
            const list = map.get(r.type) ?? [];
            list.push(r);
            map.set(r.type, list);
        }
        return map;
    }, [results]);

    // Flat list for keyboard navigation
    const flatResults = results;

    // ── Keyboard shortcut: Cmd+K / Ctrl+K ──
    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setOpen(prev => !prev);
            }
            // Also open on / when not focused on an input
            if (e.key === '/' && !open) {
                const tag = (e.target as HTMLElement)?.tagName;
                if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
                    e.preventDefault();
                    setOpen(true);
                }
            }
        }
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [open]);

    // Focus input on open
    useEffect(() => {
        if (open) {
            setQuery('');
            setActiveIdx(0);
            // Small delay so DOM exists
            requestAnimationFrame(() => inputRef.current?.focus());
        }
    }, [open]);

    // Lock body scroll when open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    // Scroll active item into view
    useEffect(() => {
        if (!listRef.current) return;
        const el = listRef.current.querySelector('[data-active="true"]');
        if (el) (el as HTMLElement).scrollIntoView({ block: 'nearest' });
    }, [activeIdx]);

    // ── Navigation ──
    const navigate = useCallback((href: string) => {
        setOpen(false);
        // Use View Transitions if available
        window.location.href = href;
    }, []);

    const onKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            setOpen(false);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIdx(i => Math.min(i + 1, flatResults.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIdx(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const target = flatResults[activeIdx];
            if (target) navigate(target.href);
        }
    }, [flatResults, activeIdx, navigate]);

    // Reset activeIdx when results change
    useEffect(() => { setActiveIdx(0); }, [query]);

    // ── Always use a stable single root element ──
    // A transition:persist island must never switch between different root
    // VNode types (e.g. <button> vs <>Fragment</>). Preact's diffChildren
    // crashes with "o2 is null" when the root structure changes across renders.
    let flatIdx = -1;

    return (
        <div className="contents">
            {!open ? (
                // ── Trigger button (in navbar) ──
                <button
                    onClick={() => setOpen(true)}
                    className="flex items-center gap-2 text-[var(--faint)] hover:text-[var(--dim)] transition-colors text-[13px] font-mono"
                    aria-label="Open search (Ctrl+K)"
                    type="button"
                >
                    <SearchIcon />
                    <span className="hidden sm:inline">Search</span>
                    <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono rounded border border-[var(--border)] text-[var(--faint)] bg-[var(--surface)]">
                        ⌘K
                    </kbd>
                </button>
            ) : (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-[200] bg-[#000000]/60 backdrop-blur-sm"
                        onClick={() => setOpen(false)}
                        aria-hidden="true"
                    />

            {/* Dialog */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Search"
                className="fixed inset-0 z-[201] flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4"
            >
                <div
                    className="w-full max-w-[560px] rounded-xl border border-[var(--border)] bg-[var(--bg)] shadow-2xl overflow-hidden"
                    style="box-shadow: 0 25px 60px -12px rgba(0,0,0,0.5), 0 0 0 1px var(--border);"
                >
                    {/* Input */}
                    <div className="flex items-center gap-3 px-4 border-b border-[var(--border)]">
                        <SearchIcon />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
                            onKeyDown={onKeyDown}
                            placeholder="Search logs, algorithms, projects…"
                            className="flex-1 h-12 bg-transparent text-[var(--fg)] text-[15px] placeholder:text-[var(--faint)] outline-none font-sans"
                            aria-label="Search query"
                            autoComplete="off"
                            spellcheck={false}
                        />
                        <kbd
                            className="px-1.5 py-0.5 text-[10px] font-mono rounded border border-[var(--border)] text-[var(--faint)] cursor-pointer select-none"
                            onClick={() => setOpen(false)}
                        >
                            ESC
                        </kbd>
                    </div>

                    {/* Results */}
                    <div
                        ref={listRef}
                        className="max-h-[360px] overflow-y-auto overscroll-contain"
                        role="listbox"
                        aria-label="Search results"
                    >
                        {query.trim() && flatResults.length === 0 && (
                            <div className="px-4 py-10 text-center text-[var(--faint)] text-sm">
                                No results for "<span className="text-[var(--dim)]">{query}</span>"
                            </div>
                        )}

                        {!query.trim() && (
                            <div className="px-4 py-8 text-center text-[var(--faint)] text-[13px]">
                                <p className="mb-3">Type to search across all content</p>
                                <div className="flex items-center justify-center gap-4 text-[11px]">
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1 py-0.5 rounded border border-[var(--border)] bg-[var(--surface)] font-mono">↑↓</kbd>
                                        navigate
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1 py-0.5 rounded border border-[var(--border)] bg-[var(--surface)] font-mono">↵</kbd>
                                        open
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1 py-0.5 rounded border border-[var(--border)] bg-[var(--surface)] font-mono">esc</kbd>
                                        close
                                    </span>
                                </div>
                            </div>
                        )}

                        {Array.from(grouped.entries()).map(([type, groupItems]) => (
                            <div key={type}>
                                {/* Group header */}
                                <div className="px-4 pt-3 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--faint)] select-none">
                                    {TYPE_LABEL[type] ?? type}
                                </div>

                                {groupItems.map((item) => {
                                    flatIdx++;
                                    const idx = flatIdx;
                                    const isActive = idx === activeIdx;
                                    const Icon = TYPE_ICON[item.type] ?? SearchIcon;
                                    return (
                                        <a
                                            key={item.id}
                                            href={item.href}
                                            data-active={isActive}
                                            role="option"
                                            aria-selected={isActive}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                navigate(item.href);
                                            }}
                                            onMouseEnter={() => setActiveIdx(idx)}
                                            className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                                                isActive
                                                    ? 'bg-[var(--surface)] text-[var(--fg)]'
                                                    : 'text-[var(--dim)] hover:bg-[var(--surface)]'
                                            }`}
                                        >
                                            <Icon />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[14px] truncate">
                                                    {highlightMatch(item.title, query)}
                                                </div>
                                                <div className="text-[11px] font-mono text-[var(--faint)] truncate">
                                                    {item.meta}
                                                </div>
                                            </div>
                                            {isActive && (
                                                <div className="flex items-center gap-1 text-[var(--faint)]">
                                                    <ReturnIcon />
                                                </div>
                                            )}
                                        </a>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    {flatResults.length > 0 && (
                        <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--border)] text-[10px] font-mono text-[var(--faint)]">
                            <span>{flatResults.length} result{flatResults.length !== 1 ? 's' : ''}</span>
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1 py-0.5 rounded border border-[var(--border)] bg-[var(--surface)]">↑↓</kbd>
                                    navigate
                                </span>
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1 py-0.5 rounded border border-[var(--border)] bg-[var(--surface)]">↵</kbd>
                                    open
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
                </>
            )}
        </div>
    );
}