import { Router } from 'express';
import type { Request, Response } from 'express';
import { chat } from './ai-client.js';
import { requireAuth } from './auth-middleware.js';
import { checkAndIncrementUsage } from './usage.js';
import { getCacheKey, getCached, setCache } from './cache.js';

export const searchEnhanceRouter = Router();

interface ProjectSnippet {
  uri: string;
  title: string;
  acronym?: string;
  identifier?: string;
  startDate?: string;
  countries: string[];
  topicLabel?: string;
}

interface EnhancedProject extends ProjectSnippet {
  relevanceScore: number;
  relevanceExplanation: string;
}

async function rerankWithClaude(
  keyword: string,
  projects: ProjectSnippet[],
): Promise<EnhancedProject[]> {
  const list = projects.slice(0, 30).map((p, i) =>
    `${i + 1}. [${p.identifier ?? 'N/A'}] "${p.title}"${p.acronym ? ` (${p.acronym})` : ''} — ${p.startDate?.slice(0, 4) ?? '?'}, ${p.countries.join(', ')}${p.topicLabel ? `, topic: ${p.topicLabel}` : ''}`
  ).join('\n');

  const prompt = `You are an EU research project relevance assistant.

A researcher searched for: "${keyword}"

Below are ${Math.min(projects.length, 30)} CORDIS projects returned by a keyword search. Re-rank them by genuine semantic relevance to the search intent and provide a one-sentence explanation for each.

PROJECTS:
${list}

Return a JSON array with EXACTLY ${Math.min(projects.length, 30)} entries, ordered from most to least relevant. Use the exact 1-based index number from the list above.

JSON format (return ONLY the array, no other text):
[
  { "index": 1, "relevanceScore": 92, "relevanceExplanation": "Directly addresses X because Y." },
  ...
]`;

  const text = await chat([{ role: 'user', content: prompt }], { max_tokens: 3000 });
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('AI returned invalid JSON for re-ranking');

  const ranked: Array<{ index: number; relevanceScore: number; relevanceExplanation: string }> =
    JSON.parse(jsonMatch[0]);

  return ranked
    .filter((r) => r.index >= 1 && r.index <= projects.length)
    .map((r) => {
      const project = projects[r.index - 1];
      return {
        ...project,
        relevanceScore: Math.min(100, Math.max(0, r.relevanceScore)),
        relevanceExplanation: r.relevanceExplanation,
      };
    });
}

searchEnhanceRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  const { keyword, projects } = req.body as { keyword: string; projects: ProjectSnippet[] };

  if (!keyword || !Array.isArray(projects) || projects.length === 0) {
    res.status(400).json({ error: 'keyword and projects[] are required' });
    return;
  }
  if (!process.env.OPENROUTER_API_KEY) {
    res.status(500).json({ error: 'OPENROUTER_API_KEY not configured' });
    return;
  }

  try {
    await checkAndIncrementUsage(req.userId!, 'search_enhance');

    const cacheKey = getCacheKey(`search-enhance:${keyword}:${projects.map(p => p.uri).join(',')}`);
    const cached = getCached(cacheKey);
    if (cached) { res.json(cached); return; }

    const results = await rerankWithClaude(keyword, projects);
    const payload = { results };
    setCache(cacheKey, payload);
    res.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Search enhance failed';
    const statusCode = typeof (err as any).statusCode === 'number' ? (err as any).statusCode : 502;
    res.status(statusCode).json({ error: message });
  }
});
