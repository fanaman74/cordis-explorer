import { Link } from 'react-router-dom';

const TOOLS = [
  {
    to: '/grant-search',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-8 h-8">
        <circle cx="11" cy="11" r="8" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
      </svg>
    ),
    label: 'Grant Search',
    description: 'Describe your work. Get ranked EU funding calls in seconds.',
    color: '#4f8ef7',
    glow: 'rgba(79,142,247,0.35)',
    bg: 'rgba(79,142,247,0.08)',
    border: 'rgba(79,142,247,0.25)',
    text: '#7eb3ff',
  },
  {
    to: '/profile-match',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8z" />
      </svg>
    ),
    label: 'Profile Match',
    description: 'Build a full org profile and find best-fit EU calls.',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.35)',
    bg: 'rgba(124,58,237,0.08)',
    border: 'rgba(124,58,237,0.25)',
    text: '#c4b5fd',
  },
  {
    to: '/grant-match',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    label: 'GrantMatch',
    description: 'Step-by-step wizard with sector, stage & R&D filters.',
    badge: 'NEW',
    color: '#fbbf24',
    glow: 'rgba(251,191,36,0.35)',
    bg: 'rgba(217,119,6,0.08)',
    border: 'rgba(217,119,6,0.25)',
    text: '#fbbf24',
  },
  {
    to: '/search',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
    label: 'Browse CORDIS',
    description: 'Explore 50,000+ funded EU research projects.',
    color: '#2dd4bf',
    glow: 'rgba(45,212,191,0.35)',
    bg: 'rgba(13,148,136,0.08)',
    border: 'rgba(13,148,136,0.25)',
    text: '#5eead4',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-4 pt-16 pb-12 overflow-hidden">
        {/* Background orbs */}
        <div
          className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[120px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.15) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 left-[15%] w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 right-[10%] w-[280px] h-[280px] rounded-full blur-[100px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(245,158,11,0.10) 0%, transparent 70%)' }}
        />

        {/* Badge */}
        <div className="relative z-10 inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-xs font-semibold border"
          style={{
            background: 'rgba(59,130,246,0.08)',
            borderColor: 'rgba(59,130,246,0.25)',
            color: '#7eb3ff',
          }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#7eb3ff] animate-pulse" />
          Powered by Claude AI · CORDIS EURIO Knowledge Graph
        </div>

        {/* Headline */}
        <h1 className="relative z-10 text-center text-6xl sm:text-7xl font-extrabold tracking-tight leading-[1.05] mb-5"
          style={{ color: 'var(--color-text-primary)' }}>
          EU Funding,{' '}
          <span className="animate-gradient-text">Decoded.</span>
        </h1>
        <p className="relative z-10 text-center text-base sm:text-lg leading-relaxed max-w-xl mb-14"
          style={{ color: 'var(--color-text-secondary)' }}>
          Search 50,000+ EU-funded projects and find grants matched to your organisation — powered by Claude AI.
        </p>

        {/* 2×2 card grid */}
        <div className="relative z-10 grid grid-cols-2 gap-5 w-full max-w-3xl">
          {TOOLS.map((tool) => (
            <Link
              key={tool.to}
              to={tool.to}
              className="group relative rounded-2xl p-7 flex flex-col items-start gap-5 no-underline overflow-hidden transition-all duration-300 hover:-translate-y-1.5"
              style={{
                background: tool.bg,
                border: `1px solid ${tool.border}`,
                backdropFilter: 'blur(12px)',
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                style={{ boxShadow: `inset 0 0 40px ${tool.bg}` }}
              />
              {/* Top-right glow dot */}
              <div
                className="absolute top-3 right-3 w-16 h-16 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none"
                style={{ background: tool.glow }}
              />

              {/* Icon */}
              <div
                className="relative z-10 w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${tool.bg}, rgba(255,255,255,0.04))`,
                  border: `1px solid ${tool.border}`,
                  color: tool.text,
                  boxShadow: `0 0 20px ${tool.glow}`,
                }}
              >
                {tool.icon}
              </div>

              {/* Text */}
              <div className="relative z-10 flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>
                    {tool.label}
                  </span>
                  {tool.badge && (
                    <span
                      className="rounded-full text-[10px] font-bold px-1.5 py-0.5"
                      style={{
                        background: 'rgba(251,191,36,0.15)',
                        color: '#fbbf24',
                        border: '1px solid rgba(251,191,36,0.3)',
                      }}
                    >
                      {tool.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm leading-snug" style={{ color: 'var(--color-text-muted)' }}>
                  {tool.description}
                </p>
              </div>

              {/* Arrow */}
              <svg
                className="relative z-10 w-4 h-4 self-end opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                style={{ color: tool.text }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        {/* Footer note */}
        <p className="relative z-10 mt-12 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Data from the{' '}
          <a
            href="https://cordis.europa.eu/datalab"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: 'var(--color-eu-blue-lighter)' }}
          >
            CORDIS EURIO Knowledge Graph
          </a>
          {' '}· AI matching powered by Claude
        </p>
      </div>
    </div>
  );
}
