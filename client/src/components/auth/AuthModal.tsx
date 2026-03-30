import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type Tab = 'signin' | 'signup';

export default function AuthModal() {
  const { closeAuthModal } = useAuth();
  const [tab, setTab] = useState<Tab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (tab === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setMessage('Check your email for a confirmation link.');
      }
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeAuthModal}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm glass-card rounded-2xl p-6 shadow-2xl">
        {/* Close */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-eu-blue)] flex items-center justify-center text-white font-bold text-sm mb-3">
            EU
          </div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            {tab === 'signin' ? 'Sign in to continue' : 'Create your account'}
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            AI-powered grant matching requires an account
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-lg p-1 mb-5">
          {(['signin', 'signup'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); setMessage(''); }}
              className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${
                tab === t
                  ? 'bg-[var(--color-eu-blue)] text-white'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              }`}
            >
              {t === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-[var(--color-border)] bg-white/5 px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-eu-blue-lighter)] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-[var(--color-border)] bg-white/5 px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-eu-blue-lighter)] transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {message && (
            <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-[var(--color-eu-blue)] hover:bg-[var(--color-eu-blue-lighter)] text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            {loading ? 'Please wait…' : tab === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
