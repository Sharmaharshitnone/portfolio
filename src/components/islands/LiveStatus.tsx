/**
 * LiveStatus — Preact island for the hero live status indicator.
 * Hydrated with client:idle — enhancement, not critical path.
 *
 * Fetches /api/status to display the current activity.
 * Shows a pulsing green dot + status text (e.g., "Writing Rust in Neovim").
 *
 * Architecture notes:
 * - Zero nanostores imports (ADR-012: uses CSS vars for theming)
 * - Graceful degradation: shows nothing until data loads, fallback on error
 * - Mono font for data display per design system
 */
import { useState, useEffect } from 'preact/hooks';

interface StatusData {
  status: string;
  emoji: string;
}

/** Validate the API response shape at runtime without pulling in Zod (saves ~14KB). */
function isStatusData(v: unknown): v is StatusData {
  return (
    typeof v === 'object' && v !== null &&
    typeof (v as StatusData).status === 'string' &&
    typeof (v as StatusData).emoji === 'string'
  );
}

export function LiveStatus() {
  const [data, setData] = useState<StatusData | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStatus() {
      try {
        const res = await fetch('/api/status');
        if (!res.ok || cancelled) return;
        const json: unknown = await res.json();
        if (isStatusData(json) && !cancelled) {
          setData(json);
        }
      } catch {
        // Silent degradation — show nothing on error
      }
    }

    fetchStatus();
    return () => { cancelled = true; };
  }, []);

  // Return a stable empty container instead of null to prevent Preact hydration
  // mismatch — the island wrapper must have consistent root structure.
  if (!data) return <span class="inline-flex items-center gap-2" aria-hidden="true" />;

  return (
    <div
      class="inline-flex items-center gap-2 text-[13px] font-mono select-none"
      role="status"
      aria-label={`Current status: ${data.status}`}
    >
      {/* Pulsing indicator dot */}
      <span class="relative flex h-2 w-2 shrink-0" aria-hidden="true">
        <span
          class="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
          style={{ backgroundColor: 'var(--terminal-prompt-user)', animationDuration: '2s' }}
        />
        <span
          class="relative inline-flex h-2 w-2 rounded-full"
          style={{ backgroundColor: 'var(--terminal-prompt-user)' }}
        />
      </span>

      {/* Status text */}
      <span style={{ color: 'var(--dim)' }}>
        <span style={{ color: 'var(--faint)' }}>{data.emoji}</span>
        {' '}
        {data.status}
      </span>
    </div>
  );
}
