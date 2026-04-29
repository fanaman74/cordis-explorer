import React from 'react';
import { renderToString } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StaticRouter } from 'react-router-dom/server';
import App from './App';
import { AuthContext } from './contexts/AuthContext';
import { resetHead, renderHead } from './lib/seo';

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

export interface RenderResult {
  html: string;
  head: string;
}

export function render(url: string): RenderResult {
  resetHead();

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

  const head = renderHead();
  return { html, head };
}
