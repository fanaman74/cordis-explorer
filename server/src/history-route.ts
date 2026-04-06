import { Router } from 'express';
import type { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from './auth-middleware.js';

export const historyRouter = Router();

const PAGE_SIZE = 30;

function getAdmin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// GET /api/history
historyRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  const { type, page = '1' } = req.query as Record<string, string>;
  const offset = (Math.max(1, parseInt(page, 10)) - 1) * PAGE_SIZE;

  const supabase = getAdmin();
  let q = supabase
    .from('search_history')
    .select('*', { count: 'exact' })
    .eq('user_id', req.userId!)
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (type) q = q.eq('query_type', type);

  const { data, error, count } = await q;
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ items: data, total: count ?? 0 });
});

// POST /api/history
historyRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  const { query_type, query_params, result_count, results_snapshot } = req.body as {
    query_type: string;
    query_params: Record<string, unknown>;
    result_count: number;
    results_snapshot: unknown[];
  };

  if (!query_type) { res.status(400).json({ error: 'query_type required' }); return; }

  const supabase = getAdmin();
  const { data, error } = await supabase
    .from('search_history')
    .insert({
      user_id: req.userId!,
      query_type,
      query_params: query_params ?? {},
      result_count: result_count ?? 0,
      results_snapshot: (results_snapshot ?? []).slice(0, 8), // cap snapshot at 8
    })
    .select('id')
    .single();

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ id: data.id });
});

// DELETE /api/history/:id
historyRouter.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  const supabase = getAdmin();
  const { error } = await supabase
    .from('search_history')
    .delete()
    .eq('user_id', req.userId!)
    .eq('id', req.params.id);

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ ok: true });
});

// DELETE /api/history  — clear all
historyRouter.delete('/', requireAuth, async (req: Request, res: Response) => {
  const supabase = getAdmin();
  const { error } = await supabase
    .from('search_history')
    .delete()
    .eq('user_id', req.userId!);

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ ok: true });
});
