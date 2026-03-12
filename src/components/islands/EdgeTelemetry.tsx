/**
 * EdgeTelemetry — Preact island for real-time edge telemetry display.
 * Hydrated with client:idle — enhancement, not critical path.
 *
 * Fetches Cloudflare's /cdn-cgi/trace endpoint (available on all CF domains)
 * and parses the plain-text key=value response to display connection details.
 *
 * Architecture notes:
 * - Zero nanostores imports (ADR-012: uses CSS vars for theming)
 * - Graceful degradation: shows nothing if fetch fails (non-CF environments)
 * - No Appwrite dependency — pure client-side edge introspection
 */
import { useState, useEffect } from 'preact/hooks';

interface TraceData {
  colo: string;
  loc: string;
  http: string;
  tls: string;
  ip: string;
}

/** Well-known Cloudflare PoP codes → city names */
const COLO_NAMES: Record<string, string> = {
  BOM: 'Mumbai', DEL: 'Delhi', MAA: 'Chennai', BLR: 'Bengaluru',
  HYD: 'Hyderabad', CCU: 'Kolkata', AMD: 'Ahmedabad',
  SIN: 'Singapore', HKG: 'Hong Kong', NRT: 'Tokyo', ICN: 'Seoul',
  SYD: 'Sydney', MEL: 'Melbourne',
  IAD: 'Ashburn', EWR: 'Newark', ORD: 'Chicago', DFW: 'Dallas',
  LAX: 'Los Angeles', SFO: 'San Francisco', SEA: 'Seattle', MIA: 'Miami',
  ATL: 'Atlanta', DEN: 'Denver', YYZ: 'Toronto', YVR: 'Vancouver',
  LHR: 'London', CDG: 'Paris', FRA: 'Frankfurt', AMS: 'Amsterdam',
  ARN: 'Stockholm', WAW: 'Warsaw', MXP: 'Milan', MAD: 'Madrid',
  ZRH: 'Zurich', HEL: 'Helsinki', DUB: 'Dublin', VIE: 'Vienna',
  GRU: 'Sao Paulo', SCL: 'Santiago', BOG: 'Bogota', MEX: 'Mexico City',
  JNB: 'Johannesburg', CPT: 'Cape Town', NBO: 'Nairobi', CAI: 'Cairo',
  DXB: 'Dubai', BAH: 'Bahrain', DOH: 'Doha', KWI: 'Kuwait City',
};

function parseTrace(text: string): TraceData | null {
  const map: Record<string, string> = {};
  for (const line of text.trim().split('\n')) {
    const idx = line.indexOf('=');
    if (idx > 0) {
      map[line.slice(0, idx)] = line.slice(idx + 1);
    }
  }

  if (!map.colo) return null;

  return {
    colo: map.colo,
    loc: map.loc ?? '',
    http: map.http ?? 'h2',
    tls: map.tls ?? '',
    ip: map.ip ?? '',
  };
}

export function EdgeTelemetry() {
  const [trace, setTrace] = useState<TraceData | null>(null);
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchTrace() {
      try {
        const start = performance.now();
        const res = await fetch('https://harshit.systems/cdn-cgi/trace', { cache: 'no-store' });
        const elapsed = Math.round(performance.now() - start);

        if (res.ok && !cancelled) {
          const text = await res.text();
          const data = parseTrace(text);
          if (data) {
            setTrace(data);
            setLatency(elapsed);
          }
        }
      } catch {
        // Not on Cloudflare or fetch failed — silent degradation
      }
    }

    fetchTrace();
    return () => { cancelled = true; };
  }, []);

  // Graceful degradation: render nothing if not on Cloudflare
  if (!trace) return null;

  const cityName = COLO_NAMES[trace.colo] ?? trace.colo;
  const protocol = trace.http === 'h3-29' || trace.http === 'h3'
    ? 'HTTP/3' : trace.http === 'h2' ? 'HTTP/2' : trace.http.toUpperCase();
  const tls = trace.tls ? trace.tls.toUpperCase().replace('TLSV', 'TLS ') : '';

  return (
    <div
      class="flex items-center gap-2 text-[11px] font-mono leading-none select-none"
      role="status"
      aria-label="Edge connection telemetry"
    >
      {/* Pulsing dot */}
      <span class="relative flex h-2 w-2" aria-hidden="true">
        <span
          class="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
          style={{ backgroundColor: 'var(--terminal-cursor)', animationDuration: '2s' }}
        />
        <span
          class="relative inline-flex h-2 w-2 rounded-full"
          style={{ backgroundColor: 'var(--terminal-cursor)' }}
        />
      </span>

      {/* Telemetry string */}
      <span style={{ color: 'var(--faint)' }}>
        <span style={{ color: 'var(--terminal-path)' }}>{trace.colo}</span>
        {' '}
        <span style={{ color: 'var(--dim)' }}>({cityName})</span>
        {' · '}
        {protocol}
        {tls && ` · ${tls}`}
        {latency !== null && (
          <>
            {' · '}
            <span style={{ color: 'var(--terminal-prompt-user)' }}>{latency}ms</span>
          </>
        )}
      </span>
    </div>
  );
}
