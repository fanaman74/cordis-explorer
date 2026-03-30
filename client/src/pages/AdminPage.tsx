import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface AdminUser {
  id: string;
  email: string;
  createdAt: string;
  lastSignInAt: string | null;
  confirmedAt: string | null;
}

const ADMIN_EMAIL = 'fredanaman@proton.me';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && (!user || user.email !== ADMIN_EMAIL)) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) return;

    async function fetchUsers() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to load users' }));
        setError(err.error);
      } else {
        const data = await res.json();
        setUsers(data.users);
      }
      setFetching(false);
    }

    fetchUsers();
  }, [user]);

  if (loading || !user || user.email !== ADMIN_EMAIL) return null;

  function fmt(iso: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <span className="inline-block bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs font-semibold px-3 py-1 mb-4">
          Admin
        </span>
        <h1 className="text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
          User Management
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          All registered accounts on CORDIS Explorer
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 mb-6">
          {error}
        </div>
      )}

      {fetching && !error ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-[var(--color-eu-blue-lighter)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <p className="text-xs text-[var(--color-text-muted)] mb-3">{users.length} account{users.length !== 1 ? 's' : ''}</p>
          <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-white/[0.02]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Joined</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Last sign in</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Confirmed</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr
                    key={u.id}
                    className={`border-b border-[var(--color-border)] last:border-0 ${i % 2 === 0 ? '' : 'bg-white/[0.015]'}`}
                  >
                    <td className="px-4 py-3 text-[var(--color-text-primary)] font-mono text-xs">
                      {u.email}
                      {u.email === ADMIN_EMAIL && (
                        <span className="ml-2 text-[10px] bg-red-500/15 text-red-400 border border-red-500/20 rounded-full px-1.5 py-0.5">admin</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)] text-xs">{fmt(u.createdAt)}</td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)] text-xs">{fmt(u.lastSignInAt)}</td>
                    <td className="px-4 py-3 text-xs">
                      {u.confirmedAt
                        ? <span className="text-emerald-400">✓ Yes</span>
                        : <span className="text-[var(--color-amber)]">Pending</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
