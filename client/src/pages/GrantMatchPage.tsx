import ProfileWizard from '../components/grant-match/ProfileWizard';
import AuthGate from '../components/auth/AuthGate';

export default function GrantMatchPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <span className="inline-block bg-[color-mix(in_srgb,var(--color-amber)_12%,transparent)] text-[var(--color-amber)] border border-[color-mix(in_srgb,var(--color-amber)_25%,transparent)] rounded-full text-xs font-semibold px-3 py-1 mb-4">
          100% Free · AI-Powered
        </span>
        <h1 className="text-3xl font-extrabold text-[var(--color-text-primary)] leading-tight tracking-tight mb-3">
          Find EU Grants That{' '}
          <span className="text-[var(--color-eu-blue-lighter)]">Match Your Startup</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
          Answer a few questions and we'll scan 900+ open EU funding calls — ranked by how well they fit your profile using Claude AI.
        </p>
      </div>

      <AuthGate
        title="Sign in to run your grant match"
        description="Create a free account to use AI-powered grant matching. It takes less than a minute."
      >
        <ProfileWizard />
      </AuthGate>
    </div>
  );
}
