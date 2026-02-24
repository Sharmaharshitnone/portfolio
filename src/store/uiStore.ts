import { atom } from 'nanostores';

export type Theme = 'dark' | 'light' | 'system';

// ═══════════════ THEME STATE ═══════════════
// SSR-safe: always start with 'dark' on the server.
// The client FOUC script in BaseLayout sets data-theme before hydration,
// so the atom is only used for reactive UI (ThemeToggle icon state).
/** Must match the key in BaseHead.astro FOUC script */
export const THEME_KEY = 'harshit:theme';

function getInitialTheme(): Theme {
    if (typeof window === 'undefined') return 'dark';
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark' || stored === 'light' || stored === 'system') return stored;
    return 'system';
}

export const $theme = atom<Theme>(getInitialTheme());

/** Resolves 'system' to the actual OS preference */
export function resolveTheme(theme: Theme): 'dark' | 'light' {
  if (theme !== 'system') return theme;
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Apply theme to DOM + persist to localStorage */
export function applyTheme(theme: Theme): void {
  $theme.set(theme);
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.setAttribute('data-theme', resolveTheme(theme));
}

/** Toggle between dark and light. If current is 'system', resolve it and toggle to the opposite.
 *
 * Effect: user can only select 'dark' or 'light'; 'system' is used only as the initial default.
 */
export function cycleTheme(): void {
  const current = $theme.get();
  const resolved = resolveTheme(current);
  const next: Theme = resolved === 'dark' ? 'light' : 'dark';
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

// ═══════════════ VIEW-TRANSITION SYNC ═══════════════
// Bundled modules execute once; this listener persists across navigations.
// It keeps $theme in-sync after every client-side View Transition swap so
// all islands that useStore($theme) re-render with the correct value.
if (typeof document !== 'undefined') {
  document.addEventListener('astro:after-swap', () => {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark' || stored === 'light' || stored === 'system') {
      $theme.set(stored);
    }
  });
}
