import { Router } from 'express';
import type { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from './auth-middleware.js';

export const watchlistRouter = Router();

function getAdmin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// GET /api/watchlist — list saved calls for the authenticated user
watchlistRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  const supabase = getAdmin();
  const { data, error } = await supabase
    .from('call_watchlist')
    .select('*')
    .eq('user_id', req.userId!)
    .order('created_at', { ascending: false });

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ items: data });
});

// POST /api/watchlist — add a call
watchlistRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  const { call_id, call_title, cluster, deadline } = req.body as {
    call_id: string;
    call_title: string;
    cluster?: string;
    deadline?: string;
  };
  if (!call_id || !call_title) {
    res.status(400).json({ error: 'call_id and call_title are required' });
    return;
  }

  const supabase = getAdmin();
  const { error } = await supabase
    .from('call_watchlist')
    .upsert(
      { user_id: req.userId!, call_id, call_title, cluster, deadline },
      { onConflict: 'user_id,call_id' },
    );

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ ok: true });
});

// DELETE /api/watchlist/:callId — remove a call
watchlistRouter.delete('/:callId', requireAuth, async (req: Request, res: Response) => {
  const supabase = getAdmin();
  const { error } = await supabase
    .from('call_watchlist')
    .delete()
    .eq('user_id', req.userId!)
    .eq('call_id', req.params.callId);

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ ok: true });
});

// POST /api/watchlist/check-deadlines — internal cron endpoint (protected by shared secret)
watchlistRouter.post('/check-deadlines', async (req: Request, res: Response) => {
  const secret = req.headers['x-cron-secret'];
  if (secret !== process.env.CRON_SECRET) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const supabase = getAdmin();
  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('call_watchlist')
    .select('user_id, call_id, call_title, deadline')
    .lte('deadline', in30)
    .gte('deadline', now.toISOString().slice(0, 10));

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ alerts: data });
});
