import { Link } from 'react-router-dom';

const TOOLS = [
  {
    to: '/grant-search',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <circle cx="11" cy="11" r="8" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
      </svg>
    ),
    label: 'Grant Search',
    description: 'Tell us what you do. Get ranked EU funding calls you can apply for — in seconds.',
    badge: null,
    accent: 'eu-blue',
  },
  {
    to: '/profile-match',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8z" />
      </svg>
    ),
    label: 'Profile Match',
    description: 'Build a full startup profile and let Claude find the best-fit calls across all EU programmes.',
    badge: null,
    accent: 'eu-blue',
  },
  {
    to: '/grant-match',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    label: 'GrantMatch',
    description: 'Step-by-step startup wizard with sector, stage and R&D filters for the most precise match.',
    badge: 'NEW',
    accent: 'amber',
  },
];

const ALSO = [
  {
    to: '/search',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0l-4-4m4 4l-4 4" />
      </svg>
    ),
    label: 'Browse CORDIS Projects',
    description: 'Search and explore 50,000+ funded EU research projects by keyword, country, programme, and more.',
  },
];

export default function HomePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      {/* Hero */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-[color-mix(in_srgb,var(--color-eu-blue)_18%,transparent)] border border-[color-mix(in_srgb,var(--color-eu-blue-lighter)_25%,transparent)] text-[var(--color-eu-blue-lighter)] rounded-full text-xs font-semibold px-4 py-1.5 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-eu-blue-lighter)] animate-pulse" />
          Powered by Claude AI · CORDIS EURIO Knowledge Graph
        </div>
        <h1 className="text-4xl font-extrabold text-[var(--color-text-primary)] leading-tight tracking-tight mb-4">
          EU Funding,<br />
          <span className="text-[var(--color-eu-blue-lighter)]">Decoded.</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] text-base leading-relaxed max-w-xl mx-auto">
          Search 50,000+ EU-funded projects and find grants you can apply for — matched to your organisation using Claude AI.
        </p>
      </div>

      {/* Main tool cards */}
      <div className="grid grid-cols-1 gap-3 mb-4">
        {TOOLS.map(tool => (
          <Link
            key={tool.to}
            to={tool.to}
            className="group glass-card rounded-2xl p-5 no-underline flex items-center gap-5 hover:scale-[1.01] transition-transform duration-200"
          >
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center shrink-0
              ${tool.accent === 'amber'
                ? 'bg-[color-mix(in_srgb,var(--color-amber)_15%,transparent)] text-[var(--color-amber)] border border-[color-mix(in_srgb,var(--color-amber)_25%,transparent)]'
                : 'bg-[color-mix(in_srgb,var(--color-eu-blue-lighter)_12%,transparent)] text-[var(--color-eu-blue-lighter)] border border-[color-mix(in_srgb,var(--color-eu-blue-lighter)_20%,transparent)]'
              }
            `}>
              {tool.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-bold text-[var(--color-text-primary)] text-base">{tool.label}</span>
                {tool.badge && (
                  <span className="bg-[color-mix(in_srgb,var(--color-amber)_15%,transparent)] text-[var(--color-amber)] border border-[color-mix(in_srgb,var(--color-amber)_30%,transparent)] rounded-full text-[10px] font-bold px-1.5 py-0.5">
                    {tool.badge}
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--color-text-muted)] leading-snug">{tool.description}</p>
            </div>
            <svg
              className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)] group-hover:translate-x-0.5 transition-transform shrink-0"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-[var(--color-border)]" />
        <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest">also</span>
        <div className="flex-1 h-px bg-[var(--color-border)]" />
      </div>

      {/* Browse card */}
      {ALSO.map(item => (
        <Link
          key={item.to}
          to={item.to}
          className="group glass-card rounded-2xl p-5 no-underline flex items-center gap-5 hover:scale-[1.01] transition-transform duration-200"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-white/5 text-[var(--color-text-muted)] border border-white/10">
            {item.icon}
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-bold text-[var(--color-text-primary)] text-base block mb-0.5">{item.label}</span>
            <p className="text-sm text-[var(--color-text-muted)] leading-snug">{item.description}</p>
          </div>
          <svg
            className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)] group-hover:translate-x-0.5 transition-transform shrink-0"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ))}

      {/* Footer note */}
      <p className="mt-10 text-center text-xs text-[var(--color-text-muted)]">
        Data from the{' '}
        <a href="https://cordis.europa.eu/datalab" target="_blank" rel="noopener noreferrer" className="text-[var(--color-eu-blue-lighter)] hover:underline">
          CORDIS EURIO Knowledge Graph
        </a>
        {' '}· AI matching powered by Claude
      </p>
    </div>
  );
}
