import { createClient } from '@supabase/supabase-js';

// Runtime config injected by the Express server into window.__RUNTIME_CONFIG__
// takes precedence over build-time VITE_ env vars so the live site always works
// even when the build was done without env vars set.
declare global {
  interface Window {
    __RUNTIME_CONFIG__?: { SUPABASE_URL?: string; SUPABASE_ANON_KEY?: string };
  }
}

const runtimeConfig = typeof window !== 'undefined' ? window.__RUNTIME_CONFIG__ : undefined;

const supabaseUrl =
  runtimeConfig?.SUPABASE_URL ||
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  '';

const supabaseAnonKey =
  runtimeConfig?.SUPABASE_ANON_KEY ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[supabase] Missing credentials — auth will not work');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
);
