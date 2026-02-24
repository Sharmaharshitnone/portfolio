/**
 * ViewCounter — Preact island for page view tracking.
 * Hydrated with client:visible — pings API when scrolled into viewport.
 *
 * On mount: POST /api/views { slug } → increment + display count.
 * Graceful degradation: shows nothing if API fails.
 */
import { useState, useEffect } from 'preact/hooks';

interface Props {
  slug: string;
}

export function ViewCounter({ slug }: Props) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function track() {
      try {
        const res = await fetch('/api/views', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug }),
        });

        if (res.ok && !cancelled) {
          const data = await res.json();
          setViews(data.views ?? 0);
        }
      } catch {
        // Silent fail — page stays functional
      }
    }

    track();
    return () => { cancelled = true; };
  }, [slug]);

  if (views === null) return null; // Loading / failed — show nothing

  return (
    <span class="text-[11px] font-mono text-[var(--faint)] inline-flex items-center gap-1.5">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      {views.toLocaleString()} view{views !== 1 ? 's' : ''}
    </span>
  );
}
