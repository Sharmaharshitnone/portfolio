/**
 * WasmRunner — Preact island for running pre-compiled WebAssembly algorithms.
 * Hydrated with client:visible (0 KB JS until scrolled into view).
 *
 * Architecture:
 * - Pre-compiled .wasm files live in /wasm/{slug}.wasm
 * - Each .wasm module exports a `solve(inputPtr, inputLen)` function
 * - I/O uses shared memory: write input to memory, call solve, read output
 * - All colors via CSS custom properties (ADR-012, no nanostore imports)
 *
 * The Wasm modules are compiled from C++ via Emscripten with a custom I/O shim
 * that redirects stdin/stdout to memory buffers accessible from JS.
 */
import { useState, useRef, useCallback, useEffect } from 'preact/hooks';

interface Props {
  /** Slug matching /wasm/{slug}.wasm filename */
  slug: string;
  /** Language hint for UI display */
  language: string;
  /** Pre-filled sample input */
  sampleInput?: string;
  /** Expected output for the sample input */
  sampleOutput?: string;
}

type RunState = 'idle' | 'loading' | 'running' | 'success' | 'error';

interface WasmExports {
  memory: WebAssembly.Memory;
  solve: (inputPtr: number, inputLen: number) => number;
  get_output_ptr: () => number;
  get_output_len: () => number;
  alloc: (size: number) => number;
  dealloc: (ptr: number, size: number) => void;
}

/** Max input size: 64KB. Prevents abuse and keeps memory small. */
const MAX_INPUT_BYTES = 65536;
/** Max execution time before we kill the run. */
const TIMEOUT_MS = 5000;

export function WasmRunner({ slug, language, sampleInput, sampleOutput }: Props) {
  const [state, setState] = useState<RunState>('idle');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [wasmLoaded, setWasmLoaded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const moduleRef = useRef<WasmExports | null>(null);

  /** Lazily load and cache the .wasm module on first interaction */
  const loadModule = useCallback(async (): Promise<WasmExports> => {
    if (moduleRef.current) return moduleRef.current;

    setState('loading');
    const response = await fetch(`/wasm/${slug}.wasm`);
    if (!response.ok) {
      throw new Error(`Failed to load /wasm/${slug}.wasm (${response.status})`);
    }

    const wasmBytes = await response.arrayBuffer();
    const wasmResult = await WebAssembly.instantiate(wasmBytes, {
      env: {
        // Minimal environment stubs — the shim handles I/O via memory
        abort: () => { throw new Error('Wasm abort'); },
      },
    });

    // WebAssembly.instantiate with ArrayBuffer returns { instance, module }
    const instance = (wasmResult as unknown as { instance: WebAssembly.Instance }).instance;

    const exports = instance.exports as unknown as WasmExports;

    // Validate that the module exports the required interface
    if (typeof exports.solve !== 'function' ||
        typeof exports.get_output_ptr !== 'function' ||
        typeof exports.get_output_len !== 'function' ||
        typeof exports.alloc !== 'function') {
      throw new Error('Invalid Wasm module: missing required exports');
    }

    moduleRef.current = exports;
    setWasmLoaded(true);
    return exports;
  }, [slug]);

  /** Run the algorithm with the current textarea input */
  const run = useCallback(async () => {
    const input = textareaRef.current?.value ?? '';
    setOutput('');
    setError('');
    setElapsed(null);

    try {
      const wasm = await loadModule();
      setState('running');

      const encoder = new TextEncoder();
      const inputBytes = encoder.encode(input);

      if (inputBytes.length > MAX_INPUT_BYTES) {
        throw new Error(`Input too large (${inputBytes.length} bytes, max ${MAX_INPUT_BYTES})`);
      }

      // Allocate memory for input, write it
      const inputPtr = wasm.alloc(inputBytes.length);
      const mem = new Uint8Array(wasm.memory.buffer);
      mem.set(inputBytes, inputPtr);

      // Run with timeout
      const start = performance.now();
      const result = await Promise.race([
        new Promise<number>((resolve) => {
          // Use setTimeout(0) to allow the UI to update before running
          setTimeout(() => resolve(wasm.solve(inputPtr, inputBytes.length)), 0);
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Execution timed out (>${TIMEOUT_MS}ms)`)), TIMEOUT_MS)
        ),
      ]);
      const end = performance.now();

      // Read output from Wasm memory
      const outputPtr = wasm.get_output_ptr();
      const outputLen = wasm.get_output_len();
      const outputMem = new Uint8Array(wasm.memory.buffer, outputPtr, outputLen);
      const decoder = new TextDecoder();
      const outputStr = decoder.decode(outputMem);

      // Clean up
      wasm.dealloc(inputPtr, inputBytes.length);

      setElapsed(end - start);
      setOutput(outputStr.trimEnd());

      if (result !== 0) {
        setState('error');
        setError(`Process exited with code ${result}`);
      } else {
        setState('success');
      }
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [loadModule]);

  /** Fill textarea with sample input */
  const loadSample = useCallback(() => {
    if (textareaRef.current && sampleInput) {
      textareaRef.current.value = sampleInput;
    }
  }, [sampleInput]);

  /** Keyboard shortcut: Ctrl/Cmd+Enter to run */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        run();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [run]);

  const langLabel = language === 'cpp' ? 'C++' : language === 'rust' ? 'Rust' : language;
  const isRunning = state === 'loading' || state === 'running';

  return (
    <div
      class="wasm-runner"
      style={{
        border: '1px solid var(--wasm-border)',
        borderRadius: '8px',
        overflow: 'hidden',
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        fontSize: '13px',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          backgroundColor: 'var(--wasm-header-bg)',
          borderBottom: '1px solid var(--wasm-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Terminal dots */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f85149', opacity: 0.8 }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#d29922', opacity: 0.8 }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3fb950', opacity: 0.8 }} />
          </div>
          <span style={{ color: 'var(--wasm-text-dim)', fontSize: '11px' }}>
            wasm-runner — {langLabel}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {wasmLoaded && (
            <span style={{ color: 'var(--wasm-status-ok)', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--wasm-status-ok)', display: 'inline-block' }} />
              loaded
            </span>
          )}
          {elapsed !== null && (
            <span style={{ color: 'var(--wasm-text-dim)', fontSize: '11px' }}>
              {elapsed < 1 ? '<1' : elapsed.toFixed(1)}ms
            </span>
          )}
        </div>
      </div>

      {/* Input area */}
      <div style={{ backgroundColor: 'var(--wasm-bg)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 12px',
            borderBottom: '1px solid var(--wasm-border)',
          }}
        >
          <span style={{ color: 'var(--wasm-text-dim)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            stdin
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {sampleInput && (
              <button
                type="button"
                onClick={loadSample}
                style={{
                  color: 'var(--wasm-accent)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '11px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                }}
              >
                load sample
              </button>
            )}
          </div>
        </div>
        <textarea
          ref={textareaRef}
          rows={4}
          placeholder="Paste input here..."
          spellcheck={false}
          defaultValue={sampleInput ?? ''}
          style={{
            width: '100%',
            backgroundColor: 'var(--wasm-bg)',
            color: 'var(--wasm-text)',
            border: 'none',
            padding: '10px 12px',
            resize: 'vertical',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: '1.5',
            outline: 'none',
            minHeight: '60px',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Action bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderTop: '1px solid var(--wasm-border)',
          borderBottom: output || error ? '1px solid var(--wasm-border)' : 'none',
          backgroundColor: 'var(--wasm-header-bg)',
        }}
      >
        <button
          type="button"
          onClick={run}
          disabled={isRunning}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 14px',
            backgroundColor: isRunning ? 'var(--wasm-btn-bg)' : 'var(--wasm-prompt)',
            color: isRunning ? 'var(--wasm-text-dim)' : '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: isRunning ? 'wait' : 'pointer',
            fontSize: '12px',
            fontWeight: 500,
            fontFamily: "'Inter', system-ui, sans-serif",
            transition: 'background-color 0.15s ease',
          }}
        >
          {isRunning ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style={{ animation: 'spin 1s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              {state === 'loading' ? 'Loading...' : 'Running...'}
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21" />
              </svg>
              Run
            </>
          )}
        </button>
        <span style={{ color: 'var(--wasm-text-dim)', fontSize: '11px' }}>
          {isRunning ? '' : 'Ctrl+Enter'}
        </span>
      </div>

      {/* Output area */}
      {(output || error) && (
        <div style={{ backgroundColor: 'var(--wasm-bg)' }}>
          <div
            style={{
              padding: '6px 12px',
              borderBottom: '1px solid var(--wasm-border)',
            }}
          >
            <span style={{
              color: state === 'error' ? 'var(--wasm-error)' : 'var(--wasm-text-dim)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {state === 'error' ? 'stderr' : 'stdout'}
            </span>
          </div>
          <pre
            style={{
              padding: '10px 12px',
              margin: 0,
              color: state === 'error' ? 'var(--wasm-error)' : 'var(--wasm-output)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              lineHeight: '1.5',
              maxHeight: '300px',
              overflowY: 'auto',
            }}
          >
            {error || output}
          </pre>

          {/* Output verification */}
          {sampleOutput && output && state === 'success' && (
            <div
              style={{
                padding: '6px 12px',
                borderTop: '1px solid var(--wasm-border)',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {output.trim() === sampleOutput.trim() ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--wasm-status-ok)" stroke-width="2.5">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                  <span style={{ color: 'var(--wasm-status-ok)' }}>Output matches expected</span>
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--wasm-status-warn)" stroke-width="2.5">
                    <path d="M12 9v4" /><circle cx="12" cy="16" r="0.5" fill="var(--wasm-status-warn)" />
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  </svg>
                  <span style={{ color: 'var(--wasm-status-warn)' }}>
                    Output differs — expected: "{sampleOutput.trim()}"
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Spin animation keyframes */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
