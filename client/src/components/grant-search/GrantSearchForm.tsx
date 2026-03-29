import { useState } from 'react';
import { useCountries } from '../../hooks/useCountries';
import type { StartupProfile } from '../../api/types';
import MatchResults from '../grant-match/MatchResults';
import { useGrantMatch } from '../../hooks/useGrantMatch';

const ORG_TYPES = ['Startup', 'SME', 'Non-profit / NGO', 'Research Organisation', 'Pre-incorporation / Solo Founder', 'Other'];
const MATCH_COUNTS = [5, 10, 15];

export default function GrantSearchForm() {
  const { data: countries = [] } = useCountries();
  const { mutate, isPending, isError, error, data: results } = useGrantMatch();

  const [profile, setProfile] = useState<Partial<StartupProfile>>({
    matchCount: 5,
    // defaults so boolean filters pass
    stage: 'MVP / Prototype',
    teamSize: '2-5',
    rdActivity: 'Yes — active R&D',
    organisationType: '',
    countryOfTaxResidence: '',
    productDescription: '',
  });

  const valid = !!(profile.organisationType && profile.countryOfTaxResidence && profile.productDescription?.trim());

  function update(updates: Partial<StartupProfile>) {
    setProfile(prev => ({ ...prev, ...updates }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (valid) mutate(profile as StartupProfile);
  }

  return (
    <div>
      <div className="glass-card rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Organisation Type <span className="text-[var(--color-amber)]">*</span></label>
              <select
                value={profile.organisationType ?? ''}
                onChange={e => update({ organisationType: e.target.value })}
                className="gm-select"
                required
              >
                <option value="">— Select —</option>
                {ORG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Country <span className="text-[var(--color-amber)]">*</span></label>
              <select
                value={profile.countryOfTaxResidence ?? ''}
                onChange={e => update({ countryOfTaxResidence: e.target.value })}
                className="gm-select"
                required
              >
                <option value="">— Select —</option>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="field-label">Tell us about your work <span className="text-[var(--color-amber)]">*</span></label>
            <textarea
              required
              value={profile.productDescription ?? ''}
              onChange={e => update({ productDescription: e.target.value })}
              className="gm-textarea"
              placeholder="Describe what you do, what problem you're solving, and what makes your work innovative. The more detail you provide, the better the grant match."
              rows={6}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="w-40">
              <label className="field-label">Results</label>
              <select
                value={profile.matchCount ?? 5}
                onChange={e => update({ matchCount: Number(e.target.value) })}
                className="gm-select"
              >
                {MATCH_COUNTS.map(n => <option key={n} value={n}>Top {n}</option>)}
              </select>
            </div>
            <button
              type="submit"
              disabled={!valid || isPending}
              className="gm-btn-scan"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Searching…
                </span>
              ) : '🔍 Search Grants'}
            </button>
          </div>
        </form>
      </div>

      {isError && (
        <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          {error?.message ?? 'Search failed. Please try again.'}
        </div>
      )}

      {results && results.length >= 0 && (
        <MatchResults profile={profile as StartupProfile} results={results} />
      )}
    </div>
  );
}
