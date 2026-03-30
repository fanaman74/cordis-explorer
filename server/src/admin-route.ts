import { Router } from 'express';
import type { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from './auth-middleware.js';

export const adminRouter = Router();

const ADMIN_EMAIL = 'fredanaman@proton.me';

let _anonClient: ReturnType<typeof createClient> | null = null;
let _adminClient: ReturnType<typeof createClient> | null = null;

function getAnonClient() {
  if (!_anonClient) {
    _anonClient = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  }
  return _anonClient;
}

function getAdminClient() {
  if (!_adminClient) {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!key || key === 'your_service_role_key_here') return null;
    _adminClient = createClient(process.env.SUPABASE_URL!, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return _adminClient;
}

adminRouter.get('/users', requireAuth, async (req: Request, res: Response) => {
  const token = req.headers.authorization!.slice(7);

  const { data: { user } } = await getAnonClient().auth.getUser(token);
  if (!user || user.email !== ADMIN_EMAIL) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const adminClient = getAdminClient();
  if (!adminClient) {
    res.status(503).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured. Add it to .env from Supabase Dashboard → Project Settings → API.' });
    return;
  }

  const { data, error } = await adminClient.auth.admin.listUsers();
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  const users = data.users.map(u => ({
    id: u.id,
    email: u.email,
    createdAt: u.created_at,
    lastSignInAt: u.last_sign_in_at,
    confirmedAt: u.confirmed_at,
  }));

  res.json({ users });
});
