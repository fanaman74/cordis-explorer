import { useEffect, useState } from 'react';
import ProfileWizard from '../components/grant-match/ProfileWizard';
import ClusterBubbles from '../components/common/ClusterBubbles';

export default function GrantMatchPage() {
  useEffect(() => {
    document.title = 'AI Grant Matching — Find EU Grants for Your Startup | CORDIS Explorer';
    return () => { document.title = 'CORDIS Explorer — Search EU-Funded Research Projects'; };
  }, []);

  const [cluster, setCluster] = useState<string | null>(null);

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

      {/* Cluster interest picker */}
      <div
        className="rounded-2xl p-5 mb-6"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Which Horizon Europe cluster fits your work? <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span>
        </p>
        <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Selecting a cluster helps Claude focus the search on the most relevant funding calls.
        </p>
        <ClusterBubbles selected={cluster} onChange={setCluster} label="" />
      </div>

      <ProfileWizard preferredCluster={cluster} />
    </div>
  );
}
