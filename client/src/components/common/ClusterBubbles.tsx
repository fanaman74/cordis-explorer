import { HE_CLUSTERS } from '../../api/query-builder';

interface ClusterBubblesProps {
  selected?: string | null;
  onChange: (cluster: string | null) => void;
  label?: string;
}

export default function ClusterBubbles({ selected, onChange, label = 'HE Cluster' }: ClusterBubblesProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
          {label}
        </p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(HE_CLUSTERS).map(([num, cluster]) => {
          const active = selected === num;
          return (
            <button
              key={num}
              type="button"
              onClick={() => onChange(active ? null : num)}
              title={`Cluster ${num}: ${cluster.label}`}
              className="inline-flex items-center gap-1.5 rounded-full text-xs font-semibold px-2.5 py-1 transition-all duration-150 border cursor-pointer"
              style={{
                background: active ? cluster.color : `${cluster.color}14`,
                color: active ? '#fff' : cluster.color,
                borderColor: active ? cluster.color : `${cluster.color}40`,
                boxShadow: active ? `0 0 0 2px ${cluster.color}30` : 'none',
              }}
            >
              <span
                className="flex items-center justify-center rounded-full text-[9px] font-bold shrink-0"
                style={{
                  width: 14,
                  height: 14,
                  background: active ? 'rgba(255,255,255,0.25)' : `${cluster.color}25`,
                  color: active ? '#fff' : cluster.color,
                }}
              >
                {num}
              </span>
              {cluster.short}
            </button>
          );
        })}
      </div>
    </div>
  );
}
