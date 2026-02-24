import { atom } from 'nanostores';

export type Theme = 'dark' | 'light' | 'system';

// ═══════════════ THEME STATE ═══════════════
// SSR-safe: always start with 'dark' on the server.
// The client FOUC script in BaseLayout sets data-theme before hydration,
// so the atom is only used for reactive UI (ThemeToggle icon state).
export const $theme = atom<Theme>('dark');

/** Resolves 'system' to the actual OS preference */
function resolveTheme(theme: Theme): 'dark' | 'light' {
  if (theme !== 'system') return theme;
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Apply theme to DOM + persist to localStorage */
export function applyTheme(theme: Theme): void {
  $theme.set(theme);
  localStorage.setItem('theme', theme);
  document.documentElement.setAttribute('data-theme', resolveTheme(theme));
}

/** Cycle: light → dark → system → light (per design spec) */
export function cycleTheme(): void {
  const current = $theme.get();
  const next: Theme = current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light';
  applyTheme(next);
}

// ═══════════════ ALGORITHM FILTER STATE ═══════════════
// Transient — resets on full page navigation.
export interface AlgoFilterState {
  search: string;
  platform: string | null;
  difficulty: string | null;
}

export const $algoFilter = atom<AlgoFilterState>({
  search: '',
  platform: null,
  difficulty: null,
});
