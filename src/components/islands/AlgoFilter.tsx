/**
 * AlgoFilter — Preact island for client-side algorithm filtering.
 * Hydrated with client:idle (enhancement, not critical).
 *
 * Reads/writes $algoFilter nanostore. The algorithm list is rendered
 * as static HTML and progressively enhanced: this island hides/shows
 * rows via data attributes + DOM manipulation (no virtual list).
 */
import { useStore } from '@nanostores/preact';
import { useCallback } from 'preact/hooks';
import { $algoFilter, type AlgoFilterState } from '../../store/uiStore';

interface Props {
  platforms: string[];
  difficulties: string[];
}

export function AlgoFilter({ platforms, difficulties }: Props) {
  const filter = useStore($algoFilter);

  const update = useCallback((patch: Partial<AlgoFilterState>) => {
    const next = { ...$algoFilter.get(), ...patch };
    $algoFilter.set(next);
    applyFilter(next);
  }, []);

  return (
    <div class="flex flex-col sm:flex-row items-center gap-4 mb-8">
      {/* Search */}
      <div class="relative w-full sm:w-64">
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
          class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--faint)]"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          placeholder="Search problems..."
          value={filter.search}
          onInput={(e) => update({ search: (e.target as HTMLInputElement).value })}
          class="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md pl-9 pr-4 py-2 text-[13px] font-mono text-[var(--fg)] focus:border-[var(--accent)] transition-colors focus:outline-none placeholder:text-[var(--faint)]"
        />
      </div>

      {/* Dropdowns */}
      <div class="flex items-center gap-4 w-full sm:w-auto">
        <select
          value={filter.difficulty ?? 'all'}
          onChange={(e) => {
            const v = (e.target as HTMLSelectElement).value;
            update({ difficulty: v === 'all' ? null : v });
          }}
          class="bg-[var(--bg)] border border-[var(--border)] rounded-md px-3 py-2 text-[13px] text-[var(--faint)] focus:outline-none w-full sm:w-auto appearance-none pr-8"
        >
          <option value="all">Difficulty</option>
          {difficulties.map((d) => (
            <option key={d} value={d}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={filter.platform ?? 'all'}
          onChange={(e) => {
            const v = (e.target as HTMLSelectElement).value;
            update({ platform: v === 'all' ? null : v });
          }}
          class="bg-[var(--bg)] border border-[var(--border)] rounded-md px-3 py-2 text-[13px] text-[var(--faint)] focus:outline-none w-full sm:w-auto appearance-none pr-8"
        >
          <option value="all">Platform</option>
          {platforms.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

/**
 * DOM-based filtering: each AlgorithmRow <a> has data-title, data-platform,
 * data-difficulty attributes. We toggle `hidden` class to show/hide.
 * This avoids re-rendering the entire list in Preact.
 */
function applyFilter(filter: AlgoFilterState) {
  if (typeof document === 'undefined') return;
  const rows = document.querySelectorAll<HTMLElement>('[data-algo-row]');
  const search = filter.search.toLowerCase();

  rows.forEach((row) => {
    const title = (row.dataset.title ?? '').toLowerCase();
    const platform = row.dataset.platform ?? '';
    const difficulty = row.dataset.difficulty ?? '';

    const matchSearch = !search || title.includes(search);
    const matchPlatform = !filter.platform || platform === filter.platform;
    const matchDifficulty = !filter.difficulty || difficulty === filter.difficulty;

    row.style.display = matchSearch && matchPlatform && matchDifficulty ? '' : 'none';
  });
}
