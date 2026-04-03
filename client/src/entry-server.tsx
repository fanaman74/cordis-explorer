import React from 'react';
import { renderToString } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StaticRouter } from 'react-router-dom/server';
import App from './App';
import { AuthContext } from './contexts/AuthContext';

/**
 * Server-side AuthProvider that always renders as logged-out.
 * Crawlers see the full public UI; real auth hydrates on the client.
 */
function ServerAuthProvider({ children }: { children: React.ReactNode }) {
  const value = {
    user: null,
    session: null,
    loading: false,
    showAuthModal: false,
    openAuthModal: () => {},
    closeAuthModal: () => {},
    signOut: async () => {},
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function render(url: string): string {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const html = renderToString(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <StaticRouter location={url}>
          <ServerAuthProvider>
            <App />
          </ServerAuthProvider>
        </StaticRouter>
      </QueryClientProvider>
    </React.StrictMode>,
  );

  return html;
}
