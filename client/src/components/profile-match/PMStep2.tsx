import { useState } from 'react';
import { useCountries } from '../../hooks/useCountries';
import type { StartupProfile } from '../../api/types';

const ORG_TYPES = ['Startup', 'SME', 'Non-profit / NGO', 'Research Organisation', 'Pre-incorporation / Solo Founder', 'Other'];
const STAGES = ['Idea / Pre-product', 'MVP / Prototype', 'Early Revenue', 'Growth / Scaling', 'Established'];
const TEAM_SIZES = ['Solo founder', '2-5', '6-15', '16-50', '51+'];
const REVENUES = ['Pre-revenue', 'Under €100K', '€100K–€500K', '€500K–€2M', '€2M–€10M', 'Over €10M'];
const RD_OPTIONS = ['Yes — active R&D', 'Planned — within 12 months'];
const COFUNDING = ['Up to 25%', '25–50%', 'Over 50%', 'Not sure'];
const MATCH_COUNTS = [5, 10, 15];

interface Props {
  data: Partial<StartupProfile>;
  onChange: (updates: Partial<StartupProfile>) => void;
  onBack: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export default function PMStep2({ data, onChange, onBack, onSubmit, isLoading }: Props) {
  const { data: countries = [] } = useCountries();
  const [gdpr, setGdpr] = useState(false);
  const [terms, setTerms] = useState(false);

  const valid = !!(
    data.organisationType && data.countryOfTaxResidence &&
    data.productDescription && data.stage && data.teamSize &&
    data.rdActivity && gdpr && terms
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (valid) onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="step-title-row">
        <span className="step-num">2</span>
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Your Profile</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Organisation Type <span className="text-[var(--color-amber)]">*</span></label>
          <select value={data.organisationType ?? ''} onChange={e => onChange({ organisationType: e.target.value })} className="gm-select" required>
            <option value="">— Select —</option>
            {ORG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Country of Tax Residence <span className="text-[var(--color-amber)]">*</span></label>
          <select value={data.countryOfTaxResidence ?? ''} onChange={e => onChange({ countryOfTaxResidence: e.target.value })} className="gm-select" required>
            <option value="">— Select —</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="field-label">Tell us about your work <span className="text-[var(--color-amber)]">*</span></label>
        <textarea
          required
          value={data.productDescription ?? ''}
          onChange={e => onChange({ productDescription: e.target.value })}
          className="gm-textarea"
          placeholder="Describe what you do, what problem you solve, and what makes your work innovative. The more detail, the better the match."
          rows={5}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Stage <span className="text-[var(--color-amber)]">*</span></label>
          <select value={data.stage ?? ''} onChange={e => onChange({ stage: e.target.value })} className="gm-select" required>
            <option value="">— Select —</option>
            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Team Size <span className="text-[var(--color-amber)]">*</span></label>
          <select value={data.teamSize ?? ''} onChange={e => onChange({ teamSize: e.target.value })} className="gm-select" required>
            <option value="">— Select —</option>
            {TEAM_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">R&amp;D Activity <span className="text-[var(--color-amber)]">*</span></label>
          <select value={data.rdActivity ?? ''} onChange={e => onChange({ rdActivity: e.target.value })} className="gm-select" required>
            <option value="">— Select —</option>
            {RD_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Annual Revenue</label>
          <select value={data.annualRevenue ?? ''} onChange={e => onChange({ annualRevenue: e.target.value || undefined })} className="gm-select">
            <option value="">— Select —</option>
            {REVENUES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Co-funding Capacity</label>
          <select value={data.coFundingCapacity ?? ''} onChange={e => onChange({ coFundingCapacity: e.target.value || undefined })} className="gm-select">
            <option value="">— Select —</option>
            {COFUNDING.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Top Matches to Return</label>
          <select value={data.matchCount ?? 5} onChange={e => onChange({ matchCount: Number(e.target.value) })} className="gm-select">
            {MATCH_COUNTS.map(n => <option key={n} value={n}>Top {n} matches</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-[var(--color-border)]">
        <label className="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" checked={gdpr} onChange={e => setGdpr(e.target.checked)} className="mt-1 accent-[var(--color-eu-blue-lighter)]" required />
          <span className="text-xs text-[var(--color-text-secondary)]">
            I consent to processing of my data to scan EU funding opportunities. <span className="text-[var(--color-amber)]">*</span>
          </span>
        </label>
        <label className="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} className="mt-1 accent-[var(--color-eu-blue-lighter)]" required />
          <span className="text-xs text-[var(--color-text-secondary)]">
            I have read and agree to the Terms and Conditions. <span className="text-[var(--color-amber)]">*</span>
          </span>
        </label>
      </div>

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} disabled={isLoading} className="gm-btn-secondary">← Back</button>
        <button type="submit" disabled={!valid || isLoading} className="gm-btn-scan">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Scanning…
            </span>
          ) : '🔍 Find My Grants'}
        </button>
      </div>
    </form>
  );
}
