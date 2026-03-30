import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ADMIN_EMAIL = 'fredanaman@proton.me';

export default function Header() {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('cordis-theme');
    return stored ? stored === 'dark' : true;
  });
  const { user, openAuthModal, signOut } = useAuth();

  useEffect(() => {
    document.documentElement.className = isDark ? 'dark' : 'light';
    localStorage.setItem('cordis-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-[var(--color-text-primary)] no-underline">
          <div className="w-8 h-8 rounded bg-[var(--color-eu-blue)] flex items-center justify-center text-white font-bold text-sm">
            EU
          </div>
          <span className="text-lg font-semibold tracking-tight">CORDIS Explorer</span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDark(!isDark)}
            className="w-9 h-9 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-light)] transition-colors cursor-pointer"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? '\u2600\uFE0F' : '\uD83C\uDF19'}
          </button>
          <a
            href="https://cordis.europa.eu/datalab"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors no-underline"
          >
            About
          </a>
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--color-text-muted)] hidden sm:block max-w-[140px] truncate">
                {user.email}
              </span>
              {user.email === ADMIN_EMAIL && (
                <Link
                  to="/admin"
                  className="text-xs text-red-400 border border-red-500/30 rounded-lg px-3 py-1.5 hover:border-red-500/60 transition-colors no-underline"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={signOut}
                className="text-xs text-[var(--color-text-muted)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 hover:border-red-500/40 hover:text-red-400 transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="text-xs font-semibold bg-[var(--color-eu-blue)] hover:bg-[var(--color-eu-blue-lighter)] text-white rounded-lg px-3 py-1.5 transition-colors"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
