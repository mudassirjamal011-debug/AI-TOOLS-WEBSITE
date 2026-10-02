import { NextResponse } from 'next/server';
import {
  AiNotConfiguredError,
  createCompletion,
  getAiConfig,
  type ChatMessage,
} from '@/lib/server/ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Task = 'generate' | 'summarize' | 'seo';

interface AiRequestBody {
  task?: Task;
  prompt?: string;
  tone?: string;
  length?: string;
  style?: string;
  text?: string;
  topic?: string;
  count?: number;
  keywords?: string;
}

const MAX_INPUT = 15000;
const TONES = ['neutral', 'professional', 'friendly', 'persuasive', 'witty', 'concise'];
const LENGTHS = ['short', 'medium', 'long'];
const STYLES = ['paragraph', 'bullets', 'one-line'];

function errorResponse(message: string, status: number, code: string) {
  return NextResponse.json({ ok: false, error: message, code }, { status });
}

export async function POST(request: Request) {
  // Configuration is checked before any work so we never fake a response.
  const config = getAiConfig();
  if (!config.enabled) {
    return errorResponse(
      'AI service is not configured yet. Set the AI_API_KEY environment variable on the server to enable this tool.',
      503,
      'AI_NOT_CONFIGURED'
    );
  }

  let body: AiRequestBody;
  try {
    body = (await request.json()) as AiRequestBody;
  } catch {
    return errorResponse('Invalid request body.', 400, 'INVALID_BODY');
  }

  const task = body.task;
  if (!task || !['generate', 'summarize', 'seo'].includes(task)) {
    return errorResponse('Unknown AI task.', 400, 'UNKNOWN_TASK');
  }

  const messages: ChatMessage[] = [];

  if (task === 'generate') {
    const prompt = (body.prompt ?? '').trim();
    if (!prompt) return errorResponse('Please write a prompt first.', 400, 'EMPTY_PROMPT');
    if (prompt.length > MAX_INPUT) {
      return errorResponse(`Please keep the prompt under ${MAX_INPUT} characters.`, 400, 'TOO_LONG');
    }
    const tone = TONES.includes(body.tone ?? '') ? body.tone : 'neutral';
    const length = LENGTHS.includes(body.length ?? '') ? body.length : 'medium';
    const lengthGuide =
      length === 'short' ? 'about 80–120 words' : length === 'long' ? 'about 350–500 words' : 'about 180–250 words';

    messages.push({
      role: 'system',
      content:
        'You are a careful writing assistant. You answer only what is asked, use the requested tone, and never invent facts, statistics, quotes or citations. If a request needs information you do not have, say so plainly.',
    });
    messages.push({
      role: 'user',
      content: `Write ${lengthGuide}, in a ${tone} tone.\n\nRequest: ${prompt}`,
    });
  }

  if (task === 'summarize') {
    const text = (body.text ?? '').trim();
    if (!text) return errorResponse('Please paste the text you want summarised.', 400, 'EMPTY_TEXT');
    if (text.length > MAX_INPUT) {
      return errorResponse(
        `Please summarise less than ${MAX_INPUT} characters at a time.`,
        400,
        'TOO_LONG'
      );
    }
    const style = STYLES.includes(body.style ?? '') ? body.style : 'bullets';
    const styleGuide =
      style === 'paragraph'
        ? 'a single dense paragraph'
        : style === 'one-line'
          ? 'one sentence of at most 25 words'
          : '5–7 bullet points, each a complete thought';

    messages.push({
      role: 'system',
      content:
        'You summarise faithfully. You use only information present in the supplied text, never add outside facts, and never speculate. If the text is ambiguous, say what is unclear.',
    });
    messages.push({
      role: 'user',
      content: `Summarise the following text as ${styleGuide}.\n\n---\n${text}\n---`,
    });
  }

  if (task === 'seo') {
    const topic = (body.topic ?? '').trim();
    if (!topic) return errorResponse('Please enter a topic or draft.', 400, 'EMPTY_TOPIC');
    if (topic.length > MAX_INPUT) {
      return errorResponse(`Please keep the input under ${MAX_INPUT} characters.`, 400, 'TOO_LONG');
    }
    const count = Math.min(Math.max(Number(body.count) || 3, 1), 6);

    messages.push({
      role: 'system',
      content:
        'You are an SEO copywriter. You write accurate, non-clickbait titles and meta descriptions. You never invent statistics or promises. Titles are under 60 characters, meta descriptions under 155 characters.',
    });
    messages.push({
      role: 'user',
      content: `Suggest exactly ${count} title and meta description pairs for the following page or topic. Return them as a numbered list in the form:\n1. Title: …\n   Meta: …\n\nTopic: ${topic}${
        body.keywords ? `\nTarget keywords: ${body.keywords}` : ''
      }`,
    });
  }

  try {
    const result = await createCompletion({
      messages,
      maxTokens: task === 'seo' ? 700 : 900,
      temperature: task === 'summarize' ? 0.3 : 0.7,
      signal: AbortSignal.timeout(60_000),
    });

    return NextResponse.json({
      ok: true,
      text: result.text,
      model: result.model,
      usage: result.usage ?? null,
    });
  } catch (error) {
    if (error instanceof AiNotConfiguredError) {
      return errorResponse('AI service is not configured yet.', 503, 'AI_NOT_CONFIGURED');
    }
    const message =
      error instanceof Error && error.name === 'TimeoutError'
        ? 'The AI provider took too long to respond. Please try again.'
        : error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.';

    return errorResponse(message, 502, 'AI_PROVIDER_ERROR');
  }
}

/** Lets the UI show the real configuration state without exposing the key. */
export async function GET() {
  const config = getAiConfig();
  return NextResponse.json({
    ok: true,
    configured: config.enabled,
    provider: config.provider,
    model: config.enabled ? config.model : null,
  });
}
