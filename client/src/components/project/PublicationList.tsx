import type { Publication } from '../../api/types';

interface PublicationListProps {
  publications: Publication[];
}

export default function PublicationList({ publications }: PublicationListProps) {
  if (publications.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
        Publications ({publications.length})
      </h3>
      <div className="space-y-3">
        {publications.map((pub, i) => (
          <div key={i} className="glass-card rounded-lg p-4">
            {pub.title && (
              <h4 className="text-[var(--color-text-primary)] font-medium leading-snug">
                {pub.title}
              </h4>
            )}
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--color-text-secondary)]">
              {pub.authors && <span>{pub.authors}</span>}
              {pub.publisher && <span>{pub.publisher}</span>}
              {pub.doi && (
                <a
                  href={pub.doi.startsWith('http') ? pub.doi : `https://doi.org/${pub.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-eu-blue-lighter)] hover:underline font-mono text-xs"
                >
                  {pub.doi}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
