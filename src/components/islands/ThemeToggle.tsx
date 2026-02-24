import { useStore } from '@nanostores/preact';
import { useEffect } from 'preact/hooks';
import { $theme, applyTheme, cycleTheme, type Theme } from '../../store/uiStore';

function SunIcon({ class: cls }: { class?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={cls} aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
  );
}

function MoonIcon({ class: cls }: { class?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={cls} aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
  );
}

function MonitorIcon({ class: cls }: { class?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={cls} aria-hidden="true"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
  );
}

const ICON_MAP: Record<Theme, preact.ComponentType<{ class?: string }>> = {
  light: SunIcon,
  dark: MoonIcon,
  system: MonitorIcon,
};

const LABEL_MAP: Record<Theme, string> = {
  light: 'Light mode — click for dark',
  dark: 'Dark mode — click for system',
  system: 'System mode — click for light',
};

export function ThemeToggle() {
  const theme = useStore($theme);
  const Icon = ICON_MAP[theme];

  // Sync atom from localStorage on mount AND after every View Transition swap.
  // This ensures the icon matches the persisted theme even after soft navigation.
  useEffect(() => {
    function syncFromStorage() {
      const stored = localStorage.getItem('theme') as Theme | null;
      if (stored === 'dark' || stored === 'light' || stored === 'system') {
        $theme.set(stored);
      } else {
        // First visit — detect OS preference, persist it
        const resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        applyTheme(resolved);
      }
    }
    syncFromStorage();
    document.addEventListener('astro:after-swap', syncFromStorage);
    return () => document.removeEventListener('astro:after-swap', syncFromStorage);
  }, []);

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={LABEL_MAP[theme]}
      title={LABEL_MAP[theme]}
      class="p-2 text-faint hover:text-dim transition-colors rounded-md hover:bg-surface"
    >
      <Icon class="w-4 h-4" />
    </button>
  );
}
