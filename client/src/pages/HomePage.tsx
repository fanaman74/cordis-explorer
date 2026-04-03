import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { executeSparql } from '../api/sparql-client';
import { HE_CLUSTERS } from '../api/query-builder';

const ACCENT_COLORS = ['#ff385c', '#2563eb', '#16a34a', '#d97706', '#7c3aed'];

interface LatestProject {
  id: string;
  title: string;
  acronym?: string;
  startDate?: string;
  programme?: string;
}

function detectProgramme(startDate?: string): string | undefined {
  if (!startDate) return undefined;
  const year = new Date(startDate).getFullYear();
  if (year >= 2021) return 'HE';
  if (year >= 2014) return 'H2020';
  return 'FP7';
}

function useLatestProjects() {
  const [projects, setProjects] = useState<LatestProject[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    executeSparql(`
PREFIX eurio: <http://data.europa.eu/s66#>
SELECT DISTINCT ?projectId ?projectTitle ?projectAcronym ?startDate
WHERE {
  ?project a eurio:Project .
  ?project eurio:title ?projectTitle .
  OPTIONAL { ?project eurio:acronym ?projectAcronym }
  OPTIONAL { ?project eurio:identifier ?projectId }
  OPTIONAL { ?project eurio:startDate ?startDate }
}
ORDER BY DESC(?startDate)
LIMIT 5`.trim())
      .then(data => {
        const rows = (data.results.bindings as any[]).map(b => ({
          id: b.projectId?.value ?? '',
          title: b.projectTitle?.value ?? '',
          acronym: b.projectAcronym?.value,
          startDate: b.startDate?.value,
          programme: detectProgramme(b.startDate?.value),
        })).filter(r => r.title);
        setProjects(rows);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  return { projects, loading };
}

const TOOLS = [
  {
    requiresAuth: true, to: '/grant-search',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg>,
    label: 'Grant Search', description: 'Describe your work. Get ranked EU funding calls in seconds.',
  },
  {
    requiresAuth: true, to: '/profile-match',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8z"/></svg>,
    label: 'Profile Match', description: 'Build a full org profile and find best-fit EU calls.',
  },
  {
    requiresAuth: true, to: '/grant-match', badge: 'NEW',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>,
    label: 'GrantMatch', description: 'Step-by-step wizard with sector, stage & R&D filters.',
  },
  {
    to: '/search',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/></svg>,
    label: 'Browse CORDIS', description: 'Explore 50,000+ funded EU research projects.',
  },
  {
    requiresAuth: true, to: '/partner-match',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
    label: 'Partner Match', description: 'Find ideal EU consortium partners using AI.',
  },
  {
    requiresAuth: true, to: '/partner-search',
    icon: '🤝',
    label: 'Partner Search Hub', description: 'Find organisations actively seeking EU research partners via the F&T Portal, enriched with their CORDIS track record.',
  },
  {
    to: '/graph',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><circle cx="5" cy="12" r="2.5"/><circle cx="19" cy="6" r="2.5"/><circle cx="19" cy="18" r="2.5"/><circle cx="12" cy="12" r="2.5"/><path strokeLinecap="round" d="M7.5 12h2M14.5 12h2M17 7.5l-3 3M17 16.5l-3-3"/></svg>,
    label: 'Knowledge Graph', description: 'Explore the EURIO knowledge graph — organisations, projects, countries.',
  },
  {
    to: '/map',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>,
    label: 'Geographic Map', description: 'See EU project distribution across countries on an interactive map.',
  },
];

/* ── EU countries (viewBox 0 0 500 500)
     x = (lon + 25) * 7.14   y = (72 - lat) * 13.16  ── */
const EU_COUNTRIES = [
  // Norway (W coast + N cape + E border with Sweden)
  { id: 'no', d: 'M214,184 L214,132 L270,52 L378,13 L320,46 L271,92 L263,169 L232,186 Z',
    fill: 'rgba(37,99,235,0.14)', stroke: 'rgba(37,99,235,0.6)' },
  // Sweden (E of Norway border, W of Finland)
  { id: 'se', d: 'M263,169 L271,92 L320,46 L320,92 L310,211 L270,211 L253,211 L232,186 Z',
    fill: 'rgba(37,99,235,0.08)', stroke: 'rgba(37,99,235,0.45)' },
  // Finland
  { id: 'fi', d: 'M320,46 L385,33 L399,131 L378,151 L357,163 L334,165 L320,92 Z',
    fill: 'rgba(22,163,74,0.14)', stroke: 'rgba(22,163,74,0.55)' },
  // Denmark (Jutland + islands rough)
  { id: 'dk', d: 'M232,186 L253,186 L253,211 L270,211 L253,219 L232,214 Z',
    fill: 'rgba(255,56,92,0.16)', stroke: 'rgba(255,56,92,0.6)' },
  // Baltic States (Estonia + Latvia + Lithuania)
  { id: 'balt', d: 'M310,211 L320,92 L334,165 L357,163 L378,151 L385,184 L370,204 L344,214 L327,225 Z',
    fill: 'rgba(37,99,235,0.1)', stroke: 'rgba(37,99,235,0.42)' },
  // UK (Great Britain, simplified)
  { id: 'uk', d: 'M153,176 L163,196 L168,223 L183,272 L160,274 L135,290 L139,264 L142,211 Z',
    fill: 'rgba(37,99,235,0.14)', stroke: 'rgba(37,99,235,0.6)' },
  // Ireland
  { id: 'ie', d: 'M119,248 L143,237 L149,256 L137,267 L116,263 Z',
    fill: 'rgba(22,163,74,0.14)', stroke: 'rgba(22,163,74,0.55)' },
  // France
  { id: 'fr', d: 'M191,277 L222,293 L233,316 L232,323 L231,372 L199,389 L165,376 L159,329 L143,316 L167,296 Z',
    fill: 'rgba(255,56,92,0.14)', stroke: 'rgba(255,56,92,0.6)' },
  // Spain + Portugal (Iberian Peninsula)
  { id: 'es', d: 'M131,371 L165,373 L201,388 L178,421 L160,462 L138,473 L114,461 L110,440 L114,397 L131,395 Z',
    fill: 'rgba(255,56,92,0.12)', stroke: 'rgba(255,56,92,0.52)' },
  // Germany
  { id: 'de', d: 'M228,242 L245,225 L280,233 L284,258 L285,277 L274,313 L249,322 L232,322 L233,309 L221,280 Z',
    fill: 'rgba(37,99,235,0.16)', stroke: 'rgba(37,99,235,0.65)' },
  // Benelux (Netherlands + Belgium)
  { id: 'benl', d: 'M198,296 L222,293 L228,242 L211,250 L191,277 Z',
    fill: 'rgba(215,119,6,0.16)', stroke: 'rgba(215,119,6,0.6)' },
  // Switzerland + Austria
  { id: 'chau', d: 'M221,317 L232,322 L249,322 L274,313 L295,314 L295,336 L248,336 L221,336 Z',
    fill: 'rgba(124,58,237,0.14)', stroke: 'rgba(124,58,237,0.55)' },
  // Italy (boot)
  { id: 'it', d: 'M231,372 L279,347 L276,374 L299,407 L307,413 L287,447 L270,430 L267,395 L251,374 Z',
    fill: 'rgba(22,163,74,0.14)', stroke: 'rgba(22,163,74,0.55)' },
  // Poland
  { id: 'pl', d: 'M279,230 L309,229 L344,214 L327,225 L349,283 L341,291 L307,293 L285,283 L279,264 Z',
    fill: 'rgba(255,56,92,0.12)', stroke: 'rgba(255,56,92,0.5)' },
  // Czech Republic
  { id: 'cz', d: 'M267,277 L285,277 L285,283 L310,278 L310,305 L265,309 Z',
    fill: 'rgba(215,119,6,0.14)', stroke: 'rgba(215,119,6,0.55)' },
  // Slovakia + Hungary
  { id: 'husk', d: 'M295,314 L310,305 L341,291 L341,342 L303,345 L295,336 Z',
    fill: 'rgba(215,119,6,0.12)', stroke: 'rgba(215,119,6,0.5)' },
  // Romania
  { id: 'ro', d: 'M341,291 L349,283 L388,315 L385,350 L381,370 L352,373 L334,363 L334,318 L341,305 Z',
    fill: 'rgba(22,163,74,0.12)', stroke: 'rgba(22,163,74,0.5)' },
  // Western Balkans (Croatia, Serbia, Bosnia)
  { id: 'balk', d: 'M257,336 L295,336 L303,345 L341,342 L334,363 L320,375 L300,385 L266,380 L248,356 Z',
    fill: 'rgba(124,58,237,0.12)', stroke: 'rgba(124,58,237,0.48)' },
  // Bulgaria
  { id: 'bg', d: 'M334,363 L381,370 L381,396 L334,396 Z',
    fill: 'rgba(37,99,235,0.12)', stroke: 'rgba(37,99,235,0.5)' },
  // Greece
  { id: 'gr', d: 'M300,385 L320,375 L334,396 L381,396 L362,421 L348,447 L334,463 L322,445 L300,410 Z',
    fill: 'rgba(37,99,235,0.14)', stroke: 'rgba(37,99,235,0.58)' },
];

// x = (lon+25)*7.14  y = (72-lat)*13.16
const EU_CITIES = [
  { id: 'dublin',     x: 133, y: 247, color: '#16a34a', r: 3.5 },
  { id: 'london',     x: 178, y: 270, color: '#ff385c', r: 5   },
  { id: 'paris',      x: 196, y: 305, color: '#ff385c', r: 6   },
  { id: 'berlin',     x: 273, y: 257, color: '#2563eb', r: 6   },
  { id: 'amsterdam',  x: 213, y: 257, color: '#d97706', r: 3.5 },
  { id: 'brussels',   x: 209, y: 279, color: '#d97706', r: 3.5 },
  { id: 'madrid',     x: 151, y: 418, color: '#ff385c', r: 4   },
  { id: 'rome',       x: 267, y: 395, color: '#16a34a', r: 5   },
  { id: 'vienna',     x: 295, y: 314, color: '#7c3aed', r: 3.5 },
  { id: 'warsaw',     x: 327, y: 261, color: '#ff385c', r: 4   },
  { id: 'stockholm',  x: 308, y: 174, color: '#2563eb', r: 5   },
  { id: 'helsinki',   x: 357, y: 157, color: '#16a34a', r: 3.5 },
  { id: 'prague',     x: 281, y: 286, color: '#d97706', r: 3.5 },
  { id: 'copenhagen', x: 268, y: 214, color: '#2563eb', r: 3.5 },
  { id: 'athens',     x: 348, y: 447, color: '#2563eb', r: 4   },
  { id: 'bucharest',  x: 362, y: 365, color: '#16a34a', r: 3.5 },
];

const EU_ARCS = [
  { id: 'ar1',  d: 'M178,270 Q187,286 196,305',     color: '#ff385c', dur: '2.8s', begin: '0s'    },
  { id: 'ar2',  d: 'M196,305 Q202,290 209,279',     color: '#ff385c', dur: '1.8s', begin: '-0.9s' },
  { id: 'ar3',  d: 'M196,305 Q234,275 273,257',     color: '#ff385c', dur: '3.5s', begin: '-1.5s' },
  { id: 'ar4',  d: 'M273,257 Q300,255 327,261',     color: '#2563eb', dur: '2.5s', begin: '-0.8s' },
  { id: 'ar5',  d: 'M273,257 Q277,270 281,286',     color: '#2563eb', dur: '1.5s', begin: '-0.3s' },
  { id: 'ar6',  d: 'M281,286 Q288,300 295,314',     color: '#7c3aed', dur: '1.5s', begin: '-0.7s' },
  { id: 'ar7',  d: 'M295,314 Q280,355 267,395',     color: '#16a34a', dur: '3.2s', begin: '-1.2s' },
  { id: 'ar8',  d: 'M308,174 Q333,165 357,157',     color: '#2563eb', dur: '2.2s', begin: '-1.0s' },
  { id: 'ar9',  d: 'M308,174 Q288,194 268,214',     color: '#2563eb', dur: '2.0s', begin: '-0.5s' },
  { id: 'ar10', d: 'M151,418 Q174,362 196,305',     color: '#ff385c', dur: '4.0s', begin: '-2.0s' },
  { id: 'ar11', d: 'M267,395 Q307,421 348,447',     color: '#16a34a', dur: '3.5s', begin: '-1.8s' },
  { id: 'ar12', d: 'M327,261 Q345,313 362,365',     color: '#ff385c', dur: '3.8s', begin: '-2.1s' },
  { id: 'ar13', d: 'M209,279 Q211,268 213,257',     color: '#d97706', dur: '1.5s', begin: '-0.4s' },
  { id: 'ar14', d: 'M178,270 Q155,259 133,247',     color: '#ff385c', dur: '2.0s', begin: '-1.0s' },
];

function EuropeMapAnimation() {
  return (
    <svg viewBox="0 0 500 500" className="w-full h-full" fill="none" role="img" aria-label="Animated map of EU research collaboration network showing connections between major European cities">
      <defs>
        {EU_ARCS.map(a => <path key={a.id} id={a.id} d={a.d} />)}
      </defs>

      {/* Individual country fills */}
      {EU_COUNTRIES.map(c => (
        <path key={c.id} d={c.d} fill={c.fill} stroke={c.stroke} strokeWidth="1" strokeLinejoin="round" />
      ))}

      {/* Connection arcs */}
      {EU_ARCS.map(a => (
        <path key={`line-${a.id}`} d={a.d}
          stroke={a.color} strokeWidth="0.7" strokeOpacity="0.22" strokeDasharray="3 5" />
      ))}

      {/* City pulse rings */}
      {EU_CITIES.map((c, i) => (
        <circle key={`ring-${c.id}`} cx={c.x} cy={c.y} r={c.r + 6}
          fill="none" stroke={c.color} strokeWidth="0.8" strokeOpacity="0.2">
          <animate attributeName="r"
            values={`${c.r + 2};${c.r + 14};${c.r + 2}`}
            dur={`${2.4 + i * 0.14}s`} repeatCount="indefinite" />
          <animate attributeName="stroke-opacity"
            values="0.28;0;0.28"
            dur={`${2.4 + i * 0.14}s`} repeatCount="indefinite" />
        </circle>
      ))}

      {/* City dots */}
      {EU_CITIES.map((c, i) => (
        <circle key={`dot-${c.id}`} cx={c.x} cy={c.y} r={c.r} fill={c.color}>
          <animate attributeName="opacity"
            values="0.7;1;0.7"
            dur={`${2.0 + i * 0.11}s`} repeatCount="indefinite" />
        </circle>
      ))}

      {/* Traveling dots */}
      {EU_ARCS.map(a => (
        <circle key={`t-${a.id}`} r="2.2" fill={a.color} fillOpacity="0.95">
          <animateMotion dur={a.dur} repeatCount="indefinite" begin={a.begin}>
            <mpath href={`#${a.id}`} />
          </animateMotion>
        </circle>
      ))}
    </svg>
  );
}

const PROGRAMME_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  HE:    { bg: 'rgba(16,185,129,0.10)',  color: '#059669', border: 'rgba(16,185,129,0.28)' },
  H2020: { bg: 'rgba(37,99,235,0.10)',   color: '#2563eb', border: 'rgba(37,99,235,0.28)'  },
  FP7:   { bg: 'rgba(124,58,237,0.10)',  color: '#7c3aed', border: 'rgba(124,58,237,0.28)' },
};

function LatestAdditions() {
  const { projects, loading } = useLatestProjects();

  return (
    <section style={{ borderTop: '1px solid #ebebeb' }}>
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1" style={{ color: '#222222', letterSpacing: '-0.04em' }}>
              Latest additions to CORDIS
            </h2>
            <p className="text-sm" style={{ color: '#6a6a6a' }}>Most recently started EU-funded research projects</p>
          </div>
          <Link to="/search" className="text-xs font-semibold no-underline flex items-center gap-1"
            style={{ color: '#ff385c' }}>
            Browse all →
          </Link>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #ebebeb', background: '#ffffff' }}>
          {/* Header row */}
          <div className="grid px-5 py-3 text-[10px] font-bold uppercase tracking-widest"
            style={{ color: '#aaaaaa', borderBottom: '1px solid #f2f2f2', gridTemplateColumns: '2fr 4fr 1.2fr 1.2fr' }}>
            <span>Project</span>
            <span>Title</span>
            <span>Started</span>
            <span>Programme</span>
          </div>

          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid px-5 py-4 items-center animate-pulse"
                style={{ gridTemplateColumns: '2fr 4fr 1.2fr 1.2fr', borderBottom: i < 4 ? '1px solid #f7f7f7' : 'none' }}>
                <div className="h-4 rounded" style={{ background: '#f2f2f2', width: '70%' }} />
                <div className="h-4 rounded" style={{ background: '#f2f2f2', width: '90%' }} />
                <div className="h-4 rounded" style={{ background: '#f2f2f2', width: '50%' }} />
                <div className="h-4 rounded" style={{ background: '#f2f2f2', width: '60%' }} />
              </div>
            ))
          ) : (
            projects.map((p, i) => {
              const accent = ACCENT_COLORS[i % ACCENT_COLORS.length];
              const year = p.startDate ? new Date(p.startDate).getFullYear() : null;
              const progStyle = p.programme ? PROGRAMME_STYLES[p.programme] : null;
              return (
                <div key={p.id || i}
                  className="grid px-5 py-4 items-center transition-colors"
                  style={{
                    gridTemplateColumns: '2fr 4fr 1.2fr 1.2fr',
                    borderBottom: i < projects.length - 1 ? '1px solid #f7f7f7' : 'none',
                    borderLeft: `3px solid ${accent}`,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fafafa'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
                >
                  {/* Acronym / ID */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black shrink-0"
                      style={{ background: `${accent}18`, color: accent }}>
                      {(p.acronym ?? p.id ?? '?').slice(0, 3).toUpperCase()}
                    </div>
                    {p.id ? (
                      <Link to={`/project/${p.id}`} className="text-xs font-bold truncate no-underline hover:underline"
                        style={{ color: accent }}>
                        {p.acronym ?? p.id}
                      </Link>
                    ) : (
                      <span className="text-xs font-bold truncate" style={{ color: accent }}>
                        {p.acronym ?? '—'}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <p className="text-xs font-medium truncate pr-4" style={{ color: '#333333' }}>
                    {p.title.length > 70 ? p.title.slice(0, 68) + '…' : p.title}
                  </p>

                  {/* Date */}
                  <span className="text-xs font-medium" style={{ color: '#6a6a6a' }}>
                    {year ?? '—'}
                  </span>

                  {/* Programme badge */}
                  {progStyle ? (
                    <span
                      className="inline-flex items-center rounded-full text-[10px] font-bold px-2 py-0.5 w-fit"
                      style={{ background: progStyle.bg, color: progStyle.color, border: `1px solid ${progStyle.border}` }}
                    >
                      {p.programme}
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: '#cccccc' }}>—</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { user, openAuthModal } = useAuth();
  const visibleTools = TOOLS;

  useEffect(() => {
    document.title = 'CORDIS Explorer — Search EU-Funded Research Projects';
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#ffffff' }}>

      {/* ══════════════════════════════════
          HERO — dark cinematic
      ══════════════════════════════════ */}
      <section style={{
        position: 'relative',
        height: 'calc(100vh - 65px)',
        minHeight: 580,
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 58% 50%, rgba(255,56,92,0.14) 0%, transparent 58%), linear-gradient(155deg, #09000d 0%, #130008 55%, #07000a 100%)',
      }}>

        {/* Subtle grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03,
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }} />

        {/* ── Top-center: eyebrow + headline ── */}
        <div style={{
          position: 'absolute', top: 'clamp(20px, 4vh, 48px)', left: 0, right: 0,
          textAlign: 'center', zIndex: 10, pointerEvents: 'none',
        }}>
          {/* Eyebrow pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(255,56,92,0.12)', border: '1px solid rgba(255,56,92,0.3)',
            borderRadius: 999, padding: '5px 14px', marginBottom: 14,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ff385c', display: 'inline-block' }} />
            <span style={{ color: '#ff385c', fontSize: 9, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase' }}>
              EU Research Intelligence
            </span>
          </div>
          {/* Stacked headline */}
          <h1 style={{ lineHeight: 0.88, margin: 0 }}>
            {(['EU FUNDING', 'DECODED.'] as const).map((word, i) => (
              <span key={word} style={{
                display: 'block',
                fontSize: 'clamp(38px, 5.8vw, 90px)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                color: i === 1 ? '#ff385c' : 'white',
              }}>
                {word}
              </span>
            ))}
          </h1>
        </div>

        {/* ── Bottom-center: text + CTA ── */}
        <div style={{
          position: 'absolute',
          bottom: 'clamp(24px, 4vh, 52px)',
          left: 0, right: 0,
          textAlign: 'center',
          zIndex: 10,
        }}>
          <h2 style={{
            color: 'white',
            fontSize: 'clamp(18px, 2vw, 26px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            marginBottom: 10,
            textTransform: 'uppercase',
          }}>
            UNLOCK EU RESEARCH POTENTIAL{' '}
            <span style={{ color: '#ff385c' }}>WITH AI.</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
            From innovative{' '}
            <strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>grant matching</strong>{' '}
            to network analysis — explore 50,000+ EU‑funded research projects.
          </p>
          <button
            onClick={openAuthModal}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#ff385c', color: 'white', border: 'none', cursor: 'pointer',
              borderRadius: 7, padding: '0 28px', height: 44,
              fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
              fontFamily: 'inherit', transition: 'background 0.2s, transform 0.1s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#e00b41'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#ff385c'; }}
            onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.96)'; }}
            onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}
          >
            EXPLORE NOW
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </button>
        </div>

        {/* ── Center: animated Europe map ── */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-42%, -50%)',
          width: 'clamp(280px, 42vw, 520px)',
          height: '46%',
        }}>
          <EuropeMapAnimation />
        </div>

        {/* ── Giant watermark ── */}
        <div style={{
          position: 'absolute', bottom: -14, left: 0, right: 0,
          textAlign: 'center', pointerEvents: 'none', overflow: 'hidden',
          fontSize: 'clamp(60px, 16vw, 210px)', fontWeight: 900,
          letterSpacing: '-0.04em', lineHeight: 0.82, zIndex: 1,
          color: 'transparent',
          userSelect: 'none',
          ...({ WebkitTextStroke: '1px rgba(255,255,255,0.045)' } as React.CSSProperties),
        }}>
          CORDIS
        </div>
      </section>

      {/* ══════════════════════════════════
          STATS BAR
      ══════════════════════════════════ */}
      <section style={{ borderBottom: '1px solid #ebebeb' }}>
        <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { v: '50,000+', l: 'Funded projects' },
            { v: '€100B+', l: 'Total funding' },
            { v: '27', l: 'EU countries' },
            { v: '3', l: 'Research programmes' },
          ].map(s => (
            <div key={s.l}>
              <div className="text-2xl font-bold mb-1" style={{ color: '#222222', letterSpacing: '-0.04em' }}>{s.v}</div>
              <div className="text-sm" style={{ color: '#6a6a6a' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════
          ABOUT — prose content for SEO / AI extraction
      ══════════════════════════════════ */}
      <section className="max-w-3xl mx-auto px-6 py-14">
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#222222', letterSpacing: '-0.04em' }}>
          What is CORDIS Explorer?
        </h2>
        <div className="text-sm leading-relaxed space-y-3" style={{ color: '#484848' }}>
          <p>
            CORDIS Explorer is an AI-powered search platform for EU-funded research projects.
            It connects to the official CORDIS EURIO Knowledge Graph maintained by the European Commission
            and makes it easy to search, filter, and analyse over 50,000 projects funded under
            Horizon Europe, Horizon 2020, and FP7 — representing more than &euro;100 billion in public research funding.
          </p>
          <p>
            Unlike the official CORDIS portal, CORDIS Explorer adds intelligent grant matching:
            describe your research in plain language and the AI ranks the most relevant open EU funding calls
            for your organisation. The Partner Match tool identifies potential consortium partners
            based on complementary expertise and past project participation across 27 EU member states.
          </p>
          <p>
            The platform also features an interactive Knowledge Graph explorer for visualising relationships
            between organisations, projects, and research topics, as well as a geographic map showing
            how EU research funding is distributed across Europe.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════
          TOOLS
      ══════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-1.5" style={{ color: '#222222', letterSpacing: '-0.04em' }}>
            Explore our tools
          </h2>
          <p className="text-sm" style={{ color: '#6a6a6a' }}>
            {user ? 'All AI tools unlocked.' : 'Sign in to unlock AI-powered matching.'}
          </p>
        </div>

        <div className={`grid gap-4 ${visibleTools.length === 1 ? 'grid-cols-1 max-w-xs' : 'grid-cols-1 sm:grid-cols-2'}`}>
          {visibleTools.map(tool => (
            <Link
              key={tool.to}
              to={tool.to}
              onClick={tool.requiresAuth && !user ? (e: React.MouseEvent) => { e.preventDefault(); openAuthModal(); } : undefined}
              className="group rounded-2xl p-6 flex items-start gap-4 no-underline transition-all duration-200"
              style={{
                background: '#ffffff',
                border: '1px solid #ebebeb',
                boxShadow: 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.08) 0px 4px 8px',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = 'translateY(-2px)';
                el.style.boxShadow = 'rgba(0,0,0,0.08) 0px 8px 24px';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = '';
                el.style.boxShadow = 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.08) 0px 4px 8px';
              }}
            >
              <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                style={{ background: '#f2f2f2', color: '#222222' }}>
                {tool.icon}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm" style={{ color: '#222222', letterSpacing: '-0.01em' }}>{tool.label}</span>
                  {tool.requiresAuth && (
                    <span className="rounded-full text-[10px] font-bold px-2 py-0.5"
                      style={{ background: 'linear-gradient(135deg, #ff385c, #e00b41)', color: '#ffffff', letterSpacing: '0.04em' }}>
                      PRO
                    </span>
                  )}
                  {tool.badge && (
                    <span className="rounded-full text-[10px] font-bold px-2 py-0.5"
                      style={{ background: 'rgba(255,56,92,0.1)', color: '#ff385c', border: '1px solid rgba(255,56,92,0.2)' }}>
                      {tool.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs leading-snug" style={{ color: '#6a6a6a' }}>{tool.description}</p>
              </div>
              <svg className="w-4 h-4 shrink-0 mt-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200"
                fill="none" stroke="#ff385c" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════
          BROWSE BY HE CLUSTER
      ══════════════════════════════════ */}
      <section style={{ borderTop: '1px solid #ebebeb', borderBottom: '1px solid #ebebeb', background: '#fafafa' }}>
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="mb-5">
            <h2 className="text-xl font-bold" style={{ color: '#222222', letterSpacing: '-0.03em' }}>
              Browse by Horizon Europe Cluster
            </h2>
            <p className="text-sm mt-1" style={{ color: '#6a6a6a' }}>
              Horizon Europe Pillar II organises research into six thematic clusters.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(HE_CLUSTERS).map(([num, cluster]) => (
              <Link
                key={num}
                to={`/search?cluster=${num}&prog=HE`}
                className="group rounded-xl p-4 flex items-start gap-3 no-underline transition-all duration-150"
                style={{
                  background: '#ffffff',
                  border: `1.5px solid ${cluster.color}28`,
                  boxShadow: `0 1px 4px ${cluster.color}0a`,
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = `${cluster.color}70`;
                  el.style.boxShadow = `0 4px 16px ${cluster.color}18`;
                  el.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = `${cluster.color}28`;
                  el.style.boxShadow = `0 1px 4px ${cluster.color}0a`;
                  el.style.transform = '';
                }}
              >
                <div
                  className="flex items-center justify-center rounded-full shrink-0 text-xs font-bold"
                  style={{
                    width: 28, height: 28,
                    background: `${cluster.color}15`,
                    color: cluster.color,
                    border: `1.5px solid ${cluster.color}35`,
                  }}
                >
                  {num}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold leading-tight mb-0.5" style={{ color: cluster.color }}>
                    {cluster.short}
                  </div>
                  <div className="text-[11px] leading-snug" style={{ color: '#6a6a6a' }}>
                    {cluster.label}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          LATEST ADDITIONS
      ══════════════════════════════════ */}
      <LatestAdditions />

      {/* ══════════════════════════════════
          BOTTOM CTA
      ══════════════════════════════════ */}
      {!user && (
        <section className="dot-grid py-20">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="font-bold mb-4" style={{ fontSize: 'clamp(32px, 4vw, 48px)', color: '#1a1a1a', letterSpacing: '-0.04em' }}>
              Ready to find your next EU grant?
            </h2>
            <p className="text-base mb-8" style={{ color: '#6a6a6a' }}>
              Create a free account and run your first AI‑powered grant search in under a minute.
            </p>
            <button className="btn-brand btn-pill flex items-center gap-2 mx-auto" onClick={openAuthModal}
              style={{ height: 52, fontSize: 16, paddingLeft: 32, paddingRight: 32 }}>
              Get started — it's free
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17L17 7M17 7H7M17 7v10"/>
              </svg>
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
