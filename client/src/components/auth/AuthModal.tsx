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
        className="absolute inset-0"
        style={{ background: 'rgba(34,34,34,0.55)', backdropFilter: 'blur(4px)' }}
        onClick={closeAuthModal}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm rounded-2xl p-7"
        style={{
          background: '#ffffff',
          boxShadow: 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.08) 0px 8px 24px, rgba(0,0,0,0.15) 0px 16px 48px',
        }}
      >
        {/* Close */}
        <button
          onClick={closeAuthModal}
          className="btn-circle absolute top-4 right-4"
          style={{ width: '32px', height: '32px' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Brand mark */}
        <div className="mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm mb-4"
            style={{ background: '#ff385c' }}
          >
            EU
          </div>
          <h2
            className="text-xl font-bold mb-1"
            style={{ color: '#222222', letterSpacing: '-0.18px' }}
          >
            {tab === 'signin' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-sm" style={{ color: '#6a6a6a' }}>
            AI-powered grant matching requires an account
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 rounded-xl p-1 mb-5" style={{ background: '#f2f2f2' }}>
          {(['signin', 'signup'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); setMessage(''); }}
              className="flex-1 text-sm font-semibold py-2 rounded-lg cursor-pointer border-0 transition-all duration-200"
              style={
                tab === t
                  ? { background: '#ffffff', color: '#222222', boxShadow: 'rgba(0,0,0,0.08) 0px 2px 4px' }
                  : { background: 'transparent', color: '#6a6a6a' }
              }
            >
              {t === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="field-label">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="gm-input" />
          </div>
          <div>
            <label className="field-label">Password</label>
            <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="gm-input" />
          </div>

          {error && (
            <p className="text-xs rounded-lg px-3 py-2" style={{ color: '#c13515', background: 'rgba(193,53,21,0.06)', border: '1px solid rgba(193,53,21,0.18)' }}>
              {error}
            </p>
          )}
          {message && (
            <p className="text-xs rounded-lg px-3 py-2" style={{ color: '#167445', background: 'rgba(22,116,69,0.06)', border: '1px solid rgba(22,116,69,0.18)' }}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-1"
            style={{ borderRadius: '8px' }}
          >
            {loading ? 'Please wait…' : tab === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
