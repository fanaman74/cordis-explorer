import type { Participant } from '../../api/types';

interface ParticipantListProps {
  participants: Participant[];
}

export default function ParticipantList({ participants }: ParticipantListProps) {
  if (participants.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
        Participants ({participants.length})
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="text-left py-2 pr-4 text-[var(--color-text-muted)] font-medium">Organisation</th>
              <th className="text-left py-2 pr-4 text-[var(--color-text-muted)] font-medium">Role</th>
              <th className="text-left py-2 text-[var(--color-text-muted)] font-medium">Country</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p, i) => (
              <tr key={i} className="border-b border-[var(--color-border)] border-opacity-50">
                <td className="py-2 pr-4 text-[var(--color-text-primary)]">{p.orgName}</td>
                <td className="py-2 pr-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      p.role.toLowerCase().includes('coordinator')
                        ? 'bg-[color-mix(in_srgb,var(--color-amber)_20%,transparent)] text-[var(--color-amber)]'
                        : 'bg-[var(--color-bg-card)] text-[var(--color-text-secondary)]'
                    }`}
                  >
                    {p.role}
                  </span>
                </td>
                <td className="py-2 text-[var(--color-text-secondary)]">{p.country}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
