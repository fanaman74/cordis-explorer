/**
 * Shared OpenRouter client — drop-in replacement for the Anthropic SDK calls.
 * OpenRouter is OpenAI-API-compatible; we use plain fetch to avoid adding
 * a new SDK dependency.
 *
 * Set OPENROUTER_API_KEY in .env.
 * Optionally set OPENROUTER_MODEL to override the default model.
 */

const BASE_URL = 'https://openrouter.ai/api/v1';

// Default model — can be overridden per call or via env
export const DEFAULT_MODEL =
  process.env.OPENROUTER_MODEL ?? 'anthropic/claude-sonnet-4-5';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  model?: string;
  max_tokens?: number;
  temperature?: number;
}

export async function chat(
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not configured');

  const body = {
    model: options.model ?? DEFAULT_MODEL,
    messages,
    max_tokens: options.max_tokens ?? 2048,
    temperature: options.temperature ?? 0.2,
  };

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://cordis-explorer.eu',
      'X-Title': 'CORDIS Explorer',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw Object.assign(new Error(`OpenRouter error ${res.status}: ${text}`), { statusCode: res.status });
  }

  const json = await res.json() as {
    choices: Array<{ message: { content: string } }>;
  };

  return json.choices?.[0]?.message?.content ?? '';
}
