import type { StartupProfile } from '../../api/types';

interface Props {
  data: Partial<StartupProfile>;
  onChange: (updates: Partial<StartupProfile>) => void;
  onNext: () => void;
}

export default function PMStep1({ data, onChange, onNext }: Props) {
  const valid = !!(data.email && data.firstName && data.lastName && data.organisationName);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (valid) onNext();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="step-title-row">
        <span className="step-num">1</span>
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">About You</h2>
      </div>

      <div>
        <label className="field-label">Email <span className="text-[var(--color-amber)]">*</span></label>
        <input
          type="email"
          required
          value={data.email ?? ''}
          onChange={e => onChange({ email: e.target.value })}
          className="gm-input"
          placeholder="you@company.io"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">First Name <span className="text-[var(--color-amber)]">*</span></label>
          <input
            type="text"
            required
            value={data.firstName ?? ''}
            onChange={e => onChange({ firstName: e.target.value })}
            className="gm-input"
            placeholder="Jane"
          />
        </div>
        <div>
          <label className="field-label">Last Name <span className="text-[var(--color-amber)]">*</span></label>
          <input
            type="text"
            required
            value={data.lastName ?? ''}
            onChange={e => onChange({ lastName: e.target.value })}
            className="gm-input"
            placeholder="Smith"
          />
        </div>
      </div>

      <div>
        <label className="field-label">Organisation / Institution <span className="text-[var(--color-amber)]">*</span></label>
        <input
          type="text"
          required
          value={data.organisationName ?? ''}
          onChange={e => onChange({ organisationName: e.target.value })}
          className="gm-input"
          placeholder="Company, university, research institute, or working name"
        />
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={!valid} className="gm-btn-primary">
          Next →
        </button>
      </div>
    </form>
  );
}
