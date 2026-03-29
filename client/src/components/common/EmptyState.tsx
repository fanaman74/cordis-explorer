interface EmptyStateProps {
  title: string;
  description?: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="text-4xl mb-4 opacity-40">
        {/* magnifying glass icon using CSS */}
        <svg className="w-12 h-12 mx-auto text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-[var(--color-text-secondary)]">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">{description}</p>
      )}
    </div>
  );
}
