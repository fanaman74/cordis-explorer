import { useState } from 'react';
import type { StartupProfile } from '../../api/types';

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

export default function Step3Funding({ data, onChange, onBack, onSubmit, isLoading }: Props) {
  const [gdpr, setGdpr] = useState(false);
  const [terms, setTerms] = useState(false);
  const valid = !!(data.teamSize && data.rdActivity && gdpr && terms);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (valid) onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="step-title-row">
        <span className="step-num">3</span>
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Funding Readiness</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Team Size <span className="text-[var(--color-amber)]">*</span></label>
          <select value={data.teamSize ?? ''} onChange={e => onChange({ teamSize: e.target.value })} className="gm-select" required>
            <option value="">— Select —</option>
            {TEAM_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
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
          <label className="field-label">R&amp;D Activity <span className="text-[var(--color-amber)]">*</span></label>
          <select value={data.rdActivity ?? ''} onChange={e => onChange({ rdActivity: e.target.value })} className="gm-select" required>
            <option value="">— Select —</option>
            {RD_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Co-funding Capacity</label>
          <select value={data.coFundingCapacity ?? ''} onChange={e => onChange({ coFundingCapacity: e.target.value || undefined })} className="gm-select">
            <option value="">— Select —</option>
            {COFUNDING.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="field-label">Top Matches to Return <span className="text-[var(--color-amber)]">*</span></label>
        <select value={data.matchCount ?? 5} onChange={e => onChange({ matchCount: Number(e.target.value) })} className="gm-select">
          {MATCH_COUNTS.map(n => <option key={n} value={n}>Top {n} matches</option>)}
        </select>
      </div>

      <div className="space-y-2 pt-2 border-t border-[var(--color-border)]">
        <label className="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" checked={gdpr} onChange={e => setGdpr(e.target.checked)} className="mt-1 accent-[var(--color-eu-blue-lighter)]" required />
          <span className="text-xs text-[var(--color-text-secondary)]">
            I consent to processing of my data to scan EU funding opportunities and send me matching alerts. I can unsubscribe at any time. <span className="text-[var(--color-amber)]">*</span>
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
          ) : '🔍 Scan My Profile'}
        </button>
      </div>
    </form>
  );
}
