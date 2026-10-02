/**
 * Server-only AI provider configuration.
 *
 * IMPORTANT: this module is imported exclusively by route handlers that run on
 * the server. The API key is read from process.env at request time and is never
 * serialised into a client bundle, a page payload or an HTML response.
 */

export interface AiConfig {
  enabled: boolean;
  provider: string;
  baseUrl: string;
  model: string;
  apiKey: string;
  missing: string[];
}

export function getAiConfig(): AiConfig {
  const apiKey = process.env.AI_API_KEY?.trim() ?? '';
  const baseUrl = (process.env.AI_API_BASE_URL?.trim() || 'https://api.openai.com/v1').replace(
    /\/+$/,
    ''
  );
  const model = process.env.AI_API_MODEL?.trim() || 'gpt-4o-mini';
  const provider = process.env.AI_API_PROVIDER?.trim() || 'openai-compatible';

  const missing: string[] = [];
  if (!apiKey) missing.push('AI_API_KEY');

  return { enabled: missing.length === 0, provider, baseUrl, model, apiKey, missing };
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiCompletionOptions {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  signal?: AbortSignal;
}

export interface AiCompletionResult {
  text: string;
  model: string;
  usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
}

export class AiNotConfiguredError extends Error {
  constructor() {
    super('AI service is not configured yet.');
    this.name = 'AiNotConfiguredError';
  }
}

/**
 * Calls an OpenAI-compatible chat completions endpoint.
 * Works with OpenAI, Groq, OpenRouter, Together, Fireworks, Ollama, LM Studio…
 */
export async function createCompletion(
  options: AiCompletionOptions
): Promise<AiCompletionResult> {
  const config = getAiConfig();
  if (!config.enabled) throw new AiNotConfiguredError();

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: options.messages,
      max_tokens: options.maxTokens ?? 800,
      temperature: options.temperature ?? 0.7,
    }),
    signal: options.signal,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    let message = `The AI provider returned ${response.status}.`;
    try {
      const parsed = JSON.parse(body) as { error?: { message?: string } };
      if (parsed?.error?.message) message = parsed.error.message;
    } catch {
      /* keep the generic message */
    }
    throw new Error(message);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string }; text?: string }[];
    model?: string;
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  };

  const text = data.choices?.[0]?.message?.content ?? data.choices?.[0]?.text ?? '';
  if (!text.trim()) {
    throw new Error('The AI provider returned an empty response.');
  }

  return {
    text: text.trim(),
    model: data.model ?? config.model,
    usage: data.usage
      ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        }
      : undefined,
  };
}
