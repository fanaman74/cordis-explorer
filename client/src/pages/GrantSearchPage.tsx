import GrantSearchForm from '../components/grant-search/GrantSearchForm';
import { Seo } from '../lib/seo';

export default function GrantSearchPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Seo
        title="Grant Search — AI-Ranked EU Funding Calls | CORDIS Explorer"
        description="Describe who you are and what you do. Claude scans open EU funding calls and returns the grants you're most likely to qualify for, ranked by fit."
        canonical="/grant-search"
        keywords="EU funding calls, grant search, AI grant ranking, Horizon Europe open calls, EIC funding, Funding and Tenders portal"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Grant Search',
          description:
            'AI-powered search of open EU funding calls, ranked by how well you qualify.',
          url: 'https://cordis-explorer.eu/grant-search',
        }}
      />
      <div className="mb-8">
        <span className="inline-block bg-[color-mix(in_srgb,var(--color-eu-blue)_20%,transparent)] text-[var(--color-eu-blue-lighter)] border border-[color-mix(in_srgb,var(--color-eu-blue-lighter)_25%,transparent)] rounded-full text-xs font-semibold px-3 py-1 mb-4">
          Quick Search · AI-Powered
        </span>
        <h1 className="text-3xl font-extrabold text-[var(--color-text-primary)] leading-tight tracking-tight mb-3">
          Find Grants You Can{' '}
          <span className="text-[var(--color-eu-blue-lighter)]">Apply For</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
          Tell us who you are and what you do. Claude will scan open EU funding calls and return the ones you're most likely to qualify for.
        </p>
      </div>

      <GrantSearchForm />
    </div>
  );
}
