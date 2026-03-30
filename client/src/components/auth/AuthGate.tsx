import { useAuth } from '../../contexts/AuthContext';

interface Props {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function AuthGate({ children, title, description }: Props) {
  const { user, loading, openAuthModal } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-[var(--color-eu-blue-lighter)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-eu-blue)]/10 border border-[var(--color-eu-blue)]/20 flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-[var(--color-eu-blue-lighter)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">
          {title ?? 'Sign in to access this tool'}
        </h3>
        <p className="text-sm text-[var(--color-text-muted)] max-w-xs mb-6">
          {description ?? 'Create a free account to use AI-powered grant matching.'}
        </p>
        <button
          onClick={openAuthModal}
          className="px-6 py-2.5 rounded-lg bg-[var(--color-eu-blue)] hover:bg-[var(--color-eu-blue-lighter)] text-white text-sm font-semibold transition-colors"
        >
          Sign in / Create account
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
