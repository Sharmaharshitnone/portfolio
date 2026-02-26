/**
 * HexOverlay — Full-page hex dump overlay (Preact island).
 * Hydrated with client:idle — only activates when $viewMode === 'hex'.
 *
 * When activated, reads the page's visible text content from #main-content,
 * converts it to a classic hex dump format (offset | hex bytes | ASCII),
 * and renders it as a full-page overlay with terminal aesthetics.
 *
 * Architecture notes:
 * - Imports $viewMode (NOT $theme — ADR-012 compliant)
 * - Uses CSS vars for all colors (theme-reactive)
 * - Renders nothing when mode === 'ui' (zero DOM cost)
 * - Mono font, fixed-width layout per design system
 */
import { useStore } from '@nanostores/preact';
import { useState, useEffect } from 'preact/hooks';
import { $viewMode, toggleViewMode } from '../../store/uiStore';

/** Number of bytes per hex dump line */
const BYTES_PER_LINE = 16;
/** Max bytes to dump (prevent huge pages from freezing) */
const MAX_BYTES = 4096;

/** Convert a string to a UTF-8 byte array */
function textToBytes(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

/** Format a single byte as two-character hex */
function byteToHex(byte: number): string {
  return byte.toString(16).padStart(2, '0');
}

/** Check if a byte is printable ASCII */
function isPrintable(byte: number): boolean {
  return byte >= 0x20 && byte <= 0x7e;
}

interface HexLine {
  offset: string;
  hex: string;
  ascii: string;
}

/** Build hex dump lines from raw bytes */
function buildHexDump(bytes: Uint8Array): HexLine[] {
  const lines: HexLine[] = [];
  const len = Math.min(bytes.length, MAX_BYTES);

  for (let i = 0; i < len; i += BYTES_PER_LINE) {
    const slice = bytes.slice(i, Math.min(i + BYTES_PER_LINE, len));

    const offset = i.toString(16).padStart(8, '0');

    const hexParts: string[] = [];
    const asciiParts: string[] = [];

    for (let j = 0; j < BYTES_PER_LINE; j++) {
      if (j < slice.length) {
        hexParts.push(byteToHex(slice[j]));
        asciiParts.push(isPrintable(slice[j]) ? String.fromCharCode(slice[j]) : '.');
      } else {
        hexParts.push('  ');
        asciiParts.push(' ');
      }
    }

    // Group hex bytes in pairs of 8 with extra space in middle
    const hexLeft = hexParts.slice(0, 8).join(' ');
    const hexRight = hexParts.slice(8).join(' ');

    lines.push({
      offset,
      hex: `${hexLeft}  ${hexRight}`,
      ascii: asciiParts.join(''),
    });
  }

  return lines;
}

export function HexOverlay() {
  const mode = useStore($viewMode);
  const [lines, setLines] = useState<HexLine[]>([]);
  const [byteCount, setByteCount] = useState(0);

  useEffect(() => {
    if (mode !== 'hex') return;

    // Read text from main content area
    const main = document.getElementById('main-content');
    const text = main?.innerText ?? document.body.innerText ?? '';
    const bytes = textToBytes(text);
    setByteCount(bytes.length);
    setLines(buildHexDump(bytes));
  }, [mode]);

  // ESC key to exit hex mode
  useEffect(() => {
    if (mode !== 'hex') return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        toggleViewMode();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mode]);

  // Never return null from a transition:persist island — Preact's diffChildren
  // crashes when switching between a rendered tree and null. Use CSS hiding instead.
  const hidden = mode !== 'hex';
  const truncated = byteCount > MAX_BYTES;

  return (
    <div
      class="fixed inset-0 z-40 overflow-auto"
      style={{
        backgroundColor: 'var(--bg)',
        paddingTop: '3.5rem',
        display: hidden ? 'none' : undefined,
      }}
      role="region"
      aria-label="Hex dump view of page content"
      aria-hidden={hidden}
    >
      {/* Header bar */}
      <div
        class="sticky top-0 z-10 flex items-center justify-between px-4 py-2 border-b font-mono text-[11px]"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          color: 'var(--dim)',
        }}
      >
        <span>
          <span style={{ color: 'var(--terminal-prompt-user)' }}>hexdump</span>
          {' '}
          <span style={{ color: 'var(--faint)' }}>
            {byteCount.toLocaleString()} bytes
            {truncated ? ` (showing first ${MAX_BYTES.toLocaleString()})` : ''}
          </span>
        </span>
        <button
          onClick={toggleViewMode}
          class="px-2 py-1 rounded transition-colors"
          style={{
            color: 'var(--terminal-cursor)',
            backgroundColor: 'var(--surface-raised)',
          }}
          aria-label="Close hex dump view"
        >
          ESC / UI
        </button>
      </div>

      {/* Hex dump content */}
      <div class="p-4 sm:p-6">
        <pre
          class="font-mono text-[11px] sm:text-[12px] leading-[1.6] select-all"
          style={{ color: 'var(--dim)', tabSize: 4 }}
        >
          {/* Column header */}
          <span style={{ color: 'var(--faint)' }}>
            {'Offset    00 01 02 03 04 05 06 07  08 09 0A 0B 0C 0D 0E 0F  |ASCII           |'}
          </span>
          {'\n'}
          <span style={{ color: 'var(--border-strong)' }}>
            {'─'.repeat(80)}
          </span>
          {'\n'}
          {lines.map((line) => (
            <div key={line.offset}>
              <span style={{ color: 'var(--terminal-path)' }}>{line.offset}</span>
              {'  '}
              <span style={{ color: 'var(--dim)' }}>{line.hex}</span>
              {'  '}
              <span style={{ color: 'var(--faint)' }}>|</span>
              <span style={{ color: 'var(--terminal-output)' }}>{line.ascii}</span>
              <span style={{ color: 'var(--faint)' }}>|</span>
            </div>
          ))}
          {truncated && (
            <div style={{ color: 'var(--faint)' }}>
              {'\n... truncated at '}
              {MAX_BYTES.toLocaleString()}
              {' bytes. Toggle back to UI for full content.'}
            </div>
          )}
        </pre>
      </div>
    </div>
  );
}
