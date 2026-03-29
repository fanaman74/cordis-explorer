import ProfileMatchWizard from '../components/profile-match/ProfileMatchWizard';

export default function ProfileMatchPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <span className="inline-block bg-[color-mix(in_srgb,var(--color-eu-blue-lighter)_12%,transparent)] text-[var(--color-eu-blue-lighter)] border border-[color-mix(in_srgb,var(--color-eu-blue-lighter)_25%,transparent)] rounded-full text-xs font-semibold px-3 py-1 mb-4">
          Profile-Based Matching · AI-Powered
        </span>
        <h1 className="text-3xl font-extrabold text-[var(--color-text-primary)] leading-tight tracking-tight mb-3">
          EU Grants Matched to{' '}
          <span className="text-[var(--color-eu-blue-lighter)]">Your Profile</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
          Describe what you do and we'll find the best EU funding calls for you — no sector selection needed. Claude reads your profile and matches it against open calls.
        </p>
      </div>

      <ProfileMatchWizard />
    </div>
  );
}
