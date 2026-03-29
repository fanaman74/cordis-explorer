import { useCountries } from '../../hooks/useCountries';
import type { StartupProfile } from '../../api/types';

const ORGANISATION_TYPES = ['Startup', 'SME', 'Non-profit / NGO', 'Research Organisation', 'Pre-incorporation / Solo Founder', 'Other'];
const SECTORS = ['AI / Machine Learning', 'Fintech / Finance', 'Cleantech / Energy', 'Health / Biotech', 'Logistics / Supply Chain', 'AgriTech / Food', 'Cybersecurity', 'Space / Aerospace', 'Creative / Cultural', 'Tourism / Hospitality', 'Education / EdTech', 'Construction / Built Environment', 'Manufacturing / Industry 4.0', 'Social Impact / Inclusion', 'Other'];
const STAGES = ['Idea / Pre-product', 'MVP / Prototype', 'Early Revenue', 'Growth / Scaling', 'Established'];

interface Props {
  data: Partial<StartupProfile>;
  onChange: (updates: Partial<StartupProfile>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2Startup({ data, onChange, onNext, onBack }: Props) {
  const { data: countries = [] } = useCountries();
  const valid = !!(data.organisationType && data.countryOfTaxResidence && data.sector && data.productDescription && data.stage);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (valid) onNext();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="step-title-row">
        <span className="step-num">2</span>
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Your Startup</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Organisation Type <span className="text-[var(--color-amber)]">*</span></label>
          <select value={data.organisationType ?? ''} onChange={e => onChange({ organisationType: e.target.value })} className="gm-select" required>
            <option value="">— Select —</option>
            {ORGANISATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Sector <span className="text-[var(--color-amber)]">*</span></label>
          <select value={data.sector ?? ''} onChange={e => onChange({ sector: e.target.value })} className="gm-select" required>
            <option value="">— Select —</option>
            {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Country of Tax Residence <span className="text-[var(--color-amber)]">*</span></label>
          <select value={data.countryOfTaxResidence ?? ''} onChange={e => onChange({ countryOfTaxResidence: e.target.value })} className="gm-select" required>
            <option value="">— Select —</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Country of Incorporation</label>
          <select value={data.countryOfIncorporation ?? ''} onChange={e => onChange({ countryOfIncorporation: e.target.value || undefined })} className="gm-select">
            <option value="">— optional —</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="field-label">Product / Service Description <span className="text-[var(--color-amber)]">*</span></label>
        <textarea
          required
          value={data.productDescription ?? ''}
          onChange={e => onChange({ productDescription: e.target.value })}
          className="gm-textarea"
          placeholder="Describe your product or service in 2-3 sentences. Be specific. This helps us match you accurately."
          rows={4}
        />
      </div>

      <div>
        <label className="field-label">Stage <span className="text-[var(--color-amber)]">*</span></label>
        <select value={data.stage ?? ''} onChange={e => onChange({ stage: e.target.value })} className="gm-select" required>
          <option value="">— Select —</option>
          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} className="gm-btn-secondary">← Back</button>
        <button type="submit" disabled={!valid} className="gm-btn-primary">Next →</button>
      </div>
    </form>
  );
}
