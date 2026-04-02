import { Router } from 'express';
import type { Request, Response } from 'express';
import { matchProfile } from './grant-matcher.js';
import type { StartupProfile } from './types.js';
import { requireAuth } from './auth-middleware.js';
import { checkAndIncrementUsage } from './usage.js';
import type { ToolName } from './usage.js';

export const grantMatchRouter = Router();

const VALID_TOOLS = new Set<ToolName>(['grant_search', 'profile_match', 'grant_match']);

grantMatchRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  const { _tool, ...profile } = req.body as StartupProfile & { _tool?: string };
  const tool: ToolName = VALID_TOOLS.has(_tool as ToolName) ? (_tool as ToolName) : 'grant_match';

  // Basic validation
  if (!(profile as StartupProfile).productDescription || !(profile as StartupProfile).countryOfTaxResidence) {
    res.status(400).json({ error: 'Missing required fields: productDescription and countryOfTaxResidence' });
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured on server' });
    return;
  }

  try {
    await checkAndIncrementUsage(req.userId!, tool);
    const { results, filteredCalls } = await matchProfile(profile as StartupProfile);
    res.json({ results, filteredCalls });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Matching failed';
    const statusCode = (err as any).statusCode ?? 502;
    res.status(statusCode).json({ error: message });
  }
});
