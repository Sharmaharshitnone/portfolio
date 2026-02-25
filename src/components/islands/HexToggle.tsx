/**
 * HexToggle — Navbar button to switch between UI and Hex Dump view.
 * Hydrated with client:load (must be interactive immediately).
 *
 * Imports $viewMode from nanostores — NOT $theme (ADR-012 compliant).
 * Uses CSS vars for theming.
 */
import { useStore } from '@nanostores/preact';
import { $viewMode, toggleViewMode } from '../../store/uiStore';

export function HexToggle() {
  const mode = useStore($viewMode);
  const isHex = mode === 'hex';

  return (
    <button
      onClick={toggleViewMode}
      class="p-2 text-[11px] font-mono leading-none rounded-md transition-colors"
      style={{
        color: isHex ? 'var(--terminal-cursor)' : 'var(--faint)',
        backgroundColor: isHex ? 'var(--surface)' : 'transparent',
      }}
      aria-label={isHex ? 'Switch to normal view' : 'Switch to hex dump view'}
      aria-pressed={isHex}
      title={isHex ? 'UI' : 'HEX'}
    >
      {isHex ? 'UI' : 'HEX'}
    </button>
  );
}
