import GrantSearchForm from '../components/grant-search/GrantSearchForm';
import AuthGate from '../components/auth/AuthGate';

export default function GrantSearchPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
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

      <AuthGate
        title="Sign in to search for grants"
        description="Create a free account to use AI-powered grant search. It takes less than a minute."
      >
        <GrantSearchForm />
      </AuthGate>
    </div>
  );
}
