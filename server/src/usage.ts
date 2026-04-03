import { createClient } from '@supabase/supabase-js';

export type ToolName = 'grant_search' | 'profile_match' | 'grant_match' | 'partner_match' | 'search_enhance' | 'partner_search';

export const FREE_LIMIT = 1;

const COL: Record<ToolName, string> = {
  grant_search: 'grant_search_count',
  profile_match: 'profile_match_count',
  grant_match: 'grant_match_count',
  partner_match: 'partner_match_count',
  search_enhance: 'search_enhance_count',
  partner_search: 'partner_search_count',
};

function getAdmin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

/**
 * Checks whether the user is within their free quota for `tool`.
 * If yes, increments the count and returns.
 * If no, throws an error with message 'limit_exceeded'.
 */
export async function checkAndIncrementUsage(userId: string, tool: ToolName): Promise<void> {
  const supabase = getAdmin();
  const col = COL[tool];

  // Ensure a row exists for this user
  await supabase
    .from('user_usage')
    .upsert({ user_id: userId }, { onConflict: 'user_id', ignoreDuplicates: true });

  // Read current count
  const { data, error } = await supabase
    .from('user_usage')
    .select(col)
    .eq('user_id', userId)
    .single();

  if (error) throw new Error(`Usage check failed: ${error.message}`);

  const current: number = (data as unknown as Record<string, number>)[col] ?? 0;

  if (current >= FREE_LIMIT) {
    const err = new Error('limit_exceeded') as Error & { statusCode: number };
    err.statusCode = 402;
    throw err;
  }

  // Increment
  await supabase
    .from('user_usage')
    .update({ [col]: current + 1, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
}
