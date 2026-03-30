import type { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Lazy init so dotenv has time to load before first request
let _supabase: SupabaseClient | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  }
  return _supabase;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please sign in to use grant matching.' });
    return;
  }

  const { data: { user }, error } = await getSupabase().auth.getUser(token);

  if (error || !user) {
    res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });
    return;
  }

  next();
}
