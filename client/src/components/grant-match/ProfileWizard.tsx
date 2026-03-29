import { useState } from 'react';
import type { StartupProfile, MatchResult } from '../../api/types';
import Step1Contact from './Step1Contact';
import Step2Startup from './Step2Startup';
import Step3Funding from './Step3Funding';
import MatchResults from './MatchResults';
import { useGrantMatch } from '../../hooks/useGrantMatch';

const STEP_LABELS = ['About You', 'Your Startup', 'Funding Readiness'];

export default function ProfileWizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<StartupProfile>>({});
  const { mutate, isPending, isError, error, data: results } = useGrantMatch();

  function update(updates: Partial<StartupProfile>) {
    setData(prev => ({ ...prev, ...updates }));
  }

  function handleSubmit() {
    mutate(data as StartupProfile);
  }

  return (
    <div>
      {/* Progress bar */}
      <div className="flex gap-1.5 mb-2">
        {STEP_LABELS.map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-[3px] rounded-full transition-colors ${
              i < step ? 'bg-[var(--color-eu-blue-lighter)]' : i === step ? 'bg-[var(--color-eu-blue-lighter)] opacity-80' : 'bg-white/10'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-[var(--color-text-muted)] mb-5">
        {STEP_LABELS.map((label, i) => (
          <span key={i}>
            {i > 0 && <span className="mx-1.5">→</span>}
            <span className={i === step ? 'text-[var(--color-text-secondary)]' : i < step ? 'line-through opacity-50' : ''}>
              {label}{i < step ? ' ✓' : ''}
            </span>
          </span>
        ))}
      </p>

      {/* Glass card */}
      <div className="glass-card rounded-xl p-6">
        {step === 0 && <Step1Contact data={data} onChange={update} onNext={() => setStep(1)} />}
        {step === 1 && <Step2Startup data={data} onChange={update} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
        {step === 2 && <Step3Funding data={data} onChange={update} onBack={() => setStep(1)} onSubmit={handleSubmit} isLoading={isPending} />}
      </div>

      {/* Error state */}
      {isError && (
        <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          {error?.message ?? 'Matching failed. Please try again.'}
        </div>
      )}

      {/* Results */}
      {results && results.length >= 0 && (
        <MatchResults profile={data as StartupProfile} results={results as MatchResult[]} />
      )}
    </div>
  );
}
