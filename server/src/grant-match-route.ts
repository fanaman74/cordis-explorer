import { Router } from 'express';
import type { Request, Response } from 'express';
import { matchProfile } from './grant-matcher.js';
import type { StartupProfile } from './types.js';

export const grantMatchRouter = Router();

grantMatchRouter.post('/', async (req: Request, res: Response) => {
  const profile = req.body as StartupProfile;

  // Basic validation
  if (!profile.productDescription || !profile.countryOfTaxResidence) {
    res.status(400).json({ error: 'Missing required fields: productDescription and countryOfTaxResidence' });
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured on server' });
    return;
  }

  try {
    const results = await matchProfile(profile);
    res.json({ results });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Matching failed';
    res.status(502).json({ error: message });
  }
});
