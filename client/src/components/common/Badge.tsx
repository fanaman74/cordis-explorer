interface BadgeProps {
  programme?: 'FP7' | 'H2020' | 'HE';
}

const programmeConfig = {
  FP7: { label: 'FP7', bg: 'bg-[var(--color-badge-fp7)]' },
  H2020: { label: 'H2020', bg: 'bg-[var(--color-badge-h2020)]' },
  HE: { label: 'Horizon Europe', bg: 'bg-[var(--color-badge-he)]' },
};

export default function Badge({ programme }: BadgeProps) {
  if (!programme) return null;
  const config = programmeConfig[programme];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white ${config.bg}`}>
      {config.label}
    </span>
  );
}
