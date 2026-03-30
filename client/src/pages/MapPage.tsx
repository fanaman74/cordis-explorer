import { useState, lazy, Suspense } from 'react';
import { useMapData } from '../hooks/useMapData';
import type { CountryMapData } from '../hooks/useMapData';

// Leaflet must be lazily imported to avoid SSR issues and ensure CSS loads
const CordisMap = lazy(() => import('../components/map/CordisMap'));

const PROGRAMMES = [
  { value: undefined, label: 'All Programmes' },
  { value: 'HE', label: 'Horizon Europe (2021+)' },
  { value: 'H2020', label: 'Horizon 2020 (2014–2020)' },
  { value: 'FP7', label: 'FP7 (2007–2013)' },
] as const;

function Legend({ max }: { max: number }) {
  const steps = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
  return (
    <div className="absolute bottom-6 left-4 z-[1000] glass-card rounded-xl p-3 text-xs">
      <p className="text-[var(--color-text-muted)] font-semibold mb-2 uppercase tracking-wider text-[10px]">Projects</p>
      <div className="flex items-center gap-1">
        {steps.map((t) => {
          const count = Math.round(Math.pow(t, 2.5) * max);
          const r = Math.round(26 + t * (96 - 26));
          const g = Math.round(58 + t * (165 - 58));
          const b = Math.round(107 + t * (250 - 107));
          return (
            <div key={t} className="flex flex-col items-center gap-1">
              <div className="w-6 h-4 rounded-sm" style={{ background: t === 0 ? '#1e2235' : `rgb(${r},${g},${b})` }} />
              <span className="text-[9px] text-[var(--color-text-muted)]">
                {t === 0 ? '0' : count >= 1000 ? `${Math.round(count / 1000)}k` : count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CountryPanel({ country, onClose }: { country: CountryMapData; onClose: () => void }) {
  return (
    <div className="absolute top-4 right-4 z-[1000] w-64 glass-card rounded-xl p-4 shadow-xl">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-bold text-[var(--color-text-primary)] text-base">{country.country}</h3>
        <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors ml-2 shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
          <span className="text-xs text-[var(--color-text-muted)]">Project participations</span>
          <span className="font-bold text-[var(--color-eu-blue-lighter)] text-sm">{country.projectCount.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
          <span className="text-xs text-[var(--color-text-muted)]">Organisations</span>
          <span className="font-bold text-[var(--color-text-primary)] text-sm">{country.orgCount.toLocaleString()}</span>
        </div>
      </div>
      <a
        href={`/search?country=${encodeURIComponent(country.country)}`}
        className="mt-3 block text-center text-xs font-semibold text-[var(--color-eu-blue-lighter)] border border-[var(--color-eu-blue-lighter)]/30 rounded-lg py-1.5 hover:bg-[var(--color-eu-blue-lighter)]/10 transition-colors no-underline"
      >
        Browse projects →
      </a>
    </div>
  );
}

export default function MapPage() {
  const [programme, setProgramme] = useState<string | undefined>(undefined);
  const [selected, setSelected] = useState<CountryMapData | null>(null);
  const { data = [], isLoading, error } = useMapData(programme);

  const max = Math.max(...data.map((d) => d.projectCount), 1);
  const top10 = [...data].sort((a, b) => b.projectCount - a.projectCount).slice(0, 10);

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 3.5rem)' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold text-[var(--color-text-primary)]">Geographic Distribution</h1>
          <span className="text-xs text-[var(--color-text-muted)]">EU-funded project participations by country</span>
        </div>
        <div className="flex items-center gap-2">
          {PROGRAMMES.map((p) => (
            <button
              key={String(p.value)}
              onClick={() => { setProgramme(p.value as string | undefined); setSelected(null); }}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                programme === p.value
                  ? 'bg-[var(--color-eu-blue)] border-[var(--color-eu-blue)] text-white'
                  : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-light)]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map + sidebar layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div className="relative flex-1">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[var(--color-bg-primary)]/80 backdrop-blur-sm">
              <div className="w-8 h-8 border-2 border-[var(--color-eu-blue-lighter)] border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm text-[var(--color-text-muted)]">Loading CORDIS data…</p>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <p className="text-sm text-red-400">Failed to load map data</p>
            </div>
          )}
          <Suspense fallback={null}>
            {!isLoading && !error && (
              <CordisMap
                data={data}
                selected={selected?.country ?? null}
                onCountryClick={setSelected}
              />
            )}
          </Suspense>
          {!isLoading && <Legend max={max} />}
          {selected && <CountryPanel country={selected} onClose={() => setSelected(null)} />}
        </div>

        {/* Right sidebar: top countries */}
        <div className="w-56 shrink-0 border-l border-[var(--color-border)] bg-[var(--color-bg-secondary)] overflow-y-auto">
          <div className="px-3 py-3 border-b border-[var(--color-border)]">
            <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Top Countries</p>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-[var(--color-eu-blue-lighter)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="py-1">
              {top10.map((d, i) => (
                <button
                  key={d.country}
                  onClick={() => setSelected(d)}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-white/5 transition-colors ${selected?.country === d.country ? 'bg-white/5' : ''}`}
                >
                  <span className="text-[10px] text-[var(--color-text-muted)] w-4 shrink-0">{i + 1}</span>
                  <span className="flex-1 text-xs text-[var(--color-text-secondary)] truncate">{d.country}</span>
                  <span className="text-[10px] font-semibold text-[var(--color-eu-blue-lighter)] shrink-0">
                    {d.projectCount >= 1000 ? `${(d.projectCount / 1000).toFixed(0)}k` : d.projectCount}
                  </span>
                </button>
              ))}
              {data.length > 10 && (
                <p className="text-[10px] text-[var(--color-text-muted)] px-3 py-2">{data.length - 10} more countries</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Leaflet CSS */}
      <style>{`
        .leaflet-container { background: #0f1117; }
        .cordis-map-tooltip {
          background: rgba(15,17,23,0.95) !important;
          border: 1px solid rgba(59,130,246,0.3) !important;
          border-radius: 8px !important;
          padding: 6px 10px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important;
        }
        .cordis-map-tooltip .leaflet-tooltip-top::before,
        .cordis-map-tooltip::before { border-top-color: rgba(59,130,246,0.3) !important; }
        .leaflet-control-attribution { background: rgba(15,17,23,0.8) !important; color: #64748b !important; }
        .leaflet-control-attribution a { color: #94a3b8 !important; }
        .leaflet-bar a { background: rgba(30,34,53,0.95) !important; color: #94a3b8 !important; border-color: rgba(255,255,255,0.1) !important; }
        .leaflet-bar a:hover { background: rgba(59,130,246,0.2) !important; color: #f1f5f9 !important; }
      `}</style>
    </div>
  );
}
