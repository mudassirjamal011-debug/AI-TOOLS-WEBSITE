'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Send, Sparkles, Wand2 } from 'lucide-react';
import { ResultPanel } from '@/components/tools/ResultPanel';
import { Button } from '@/components/ui/Button';
import { CopyButton, ResetButton } from '@/components/ui/Actions';
import { StatusMessage } from '@/components/ui/Feedback';
import { Field, Segmented, Select, TextArea } from '@/components/ui/Inputs';
import { useToast } from '@/components/ui/Toast';

type Task = 'generate' | 'summarize' | 'seo';

interface AiResponse {
  ok: boolean;
  text?: string;
  model?: string;
  error?: string;
  code?: string;
}

const NOT_CONFIGURED_MESSAGE = 'AI service is not configured yet.';

/** Polls the server once so the UI can be honest about availability. */
function useAiStatus() {
  const [status, setStatus] = useState<{ loaded: boolean; configured: boolean; model: string | null }>({
    loaded: false,
    configured: false,
    model: null,
  });

  useEffect(() => {
    let cancelled = false;
    fetch('/api/ai')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setStatus({ loaded: true, configured: Boolean(data.configured), model: data.model ?? null });
      })
      .catch(() => {
        if (!cancelled) setStatus({ loaded: true, configured: false, model: null });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}

function AiStatusNotice() {
  const status = useAiStatus();
  if (!status.loaded) return null;

  if (status.configured) {
    return (
      <StatusMessage tone="success" title="AI provider connected">
        Requests are handled server-side with model <strong>{status.model ?? 'configured model'}</strong>.
        Your API key is never exposed to the browser.
      </StatusMessage>
    );
  }

  return (
    <StatusMessage tone="warning" title={NOT_CONFIGURED_MESSAGE}>
      This deployment has no AI provider configured, so no text will be generated. To enable it, set{' '}
      <code>AI_API_KEY</code> (plus <code>AI_API_BASE_URL</code> and <code>AI_API_MODEL</code> for a
      non-OpenAI provider) in the server environment and restart.
    </StatusMessage>
  );
}

function useAiCall() {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const call = useCallback(
    async (task: Task, payload: Record<string, unknown>) => {
      setBusy(true);
      setError(null);
      setOutput('');
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ task, ...payload }),
          signal: controller.signal,
        });
        const data = (await response.json()) as AiResponse;

        if (!response.ok || !data.ok) {
          const message =
            data.code === 'AI_NOT_CONFIGURED' ? NOT_CONFIGURED_MESSAGE : (data.error ?? 'Something went wrong. Please try again.');
          setError({ message, code: data.code });
          toast({ title: 'Request failed', description: message, variant: 'error' });
          return;
        }

        setOutput(data.text ?? '');
        toast({ title: 'Done', description: `Generated with ${data.model ?? 'the configured model'}.`, variant: 'success' });
      } catch (caught) {
        if ((caught as Error).name === 'AbortError') return;
        setError({ message: 'Something went wrong. Please try again.' });
        toast({ title: 'Request failed', description: 'Something went wrong. Please try again.', variant: 'error' });
      } finally {
        setBusy(false);
      }
    },
    [toast]
  );

  const clear = useCallback(() => {
    setOutput('');
    setError(null);
  }, []);

  return { busy, output, error, call, clear };
}

/* ======================================================================== */
/*  AI Text Generator                                                        */
/* ======================================================================== */

const TONES = [
  { value: 'neutral', label: 'Neutral' },
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'persuasive', label: 'Persuasive' },
  { value: 'witty', label: 'Witty' },
  { value: 'concise', label: 'Concise' },
];

export function AiTextGenerator() {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const { busy, output, error, call, clear } = useAiCall();

  const submit = () => {
    if (!prompt.trim()) {
      clear();
      return;
    }
    void call('generate', { prompt, tone, length });
  };

  const reset = () => {
    setPrompt('');
    setTone('professional');
    setLength('medium');
    clear();
  };

  return (
    <div className="space-y-4">
      <AiStatusNotice />

      <Field label="What should I write?" htmlFor="ai-prompt">
        <TextArea
          id="ai-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="e.g. A short announcement for a free online image compressor aimed at small e-commerce shops."
          className="min-h-[140px]"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tone" htmlFor="ai-tone">
          <Select id="ai-tone" value={tone} onChange={(event) => setTone(event.target.value)}>
            {TONES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Length" htmlFor="ai-length">
          <Segmented
            label="Length"
            value={length}
            onChange={setLength}
            options={[
              { value: 'short', label: 'Short' },
              { value: 'medium', label: 'Medium' },
              { value: 'long', label: 'Long' },
            ]}
          />
        </Field>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={submit} loading={busy} disabled={!prompt.trim()}>
          <Sparkles aria-hidden className="h-4 w-4" />
          {busy ? 'Generating…' : 'Generate'}
        </Button>
        <CopyButton value={output} label="Copy" disabled={!output} />
        <ResetButton onClick={reset} label="Clear" />
      </div>

      {error ? (
        <StatusMessage tone={error.code === 'AI_NOT_CONFIGURED' ? 'warning' : 'error'} title={error.message}>
          {error.code === 'AI_NOT_CONFIGURED'
            ? 'No text was generated because no provider is configured. Set AI_API_KEY on the server to enable this tool.'
            : undefined}
        </StatusMessage>
      ) : null}

      {output ? (
        <ResultPanel title="Generated text" tone="success">
          <div className="whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-fg">{output}</div>
        </ResultPanel>
      ) : (
        !busy &&
        !error && (
          <p className="rounded-xl border border-dashed border-line/15 px-4 py-8 text-center text-sm text-muted">
            Your generated text will appear here.
          </p>
        )
      )}
    </div>
  );
}

/* ======================================================================== */
/*  AI Summarizer                                                            */
/* ======================================================================== */

export function AiSummarizer() {
  const [text, setText] = useState('');
  const [style, setStyle] = useState('bullets');
  const { busy, output, error, call, clear } = useAiCall();

  const reset = () => {
    setText('');
    setStyle('bullets');
    clear();
  };

  return (
    <div className="space-y-4">
      <AiStatusNotice />

      <Field
        label="Text to summarise"
        htmlFor="ai-summary-input"
        hint={`${text.length.toLocaleString()} / 15,000 characters`}
      >
        <TextArea
          id="ai-summary-input"
          value={text}
          onChange={(event) => setText(event.target.value.slice(0, 15000))}
          placeholder="Paste an article, report, meeting note or email thread…"
          className="min-h-[180px]"
        />
      </Field>

      <Field label="Summary style" htmlFor="ai-summary-style">
        <Segmented
          label="Summary style"
          value={style}
          onChange={setStyle}
          options={[
            { value: 'bullets', label: 'Bullet points' },
            { value: 'paragraph', label: 'Paragraph' },
            { value: 'one-line', label: 'One line' },
          ]}
        />
      </Field>

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => void call('summarize', { text, style })}
          loading={busy}
          disabled={!text.trim() || text.length < 40}
        >
          <Wand2 aria-hidden className="h-4 w-4" />
          {busy ? 'Summarising…' : 'Summarise'}
        </Button>
        <CopyButton value={output} label="Copy" disabled={!output} />
        <ResetButton onClick={reset} label="Clear" />
      </div>

      {text.trim().length > 0 && text.trim().length < 40 ? (
        <StatusMessage tone="info">Add a little more text — at least 40 characters.</StatusMessage>
      ) : null}

      {error ? (
        <StatusMessage tone={error.code === 'AI_NOT_CONFIGURED' ? 'warning' : 'error'} title={error.message}>
          {error.code === 'AI_NOT_CONFIGURED'
            ? 'Nothing was summarised because no provider is configured. Set AI_API_KEY on the server to enable this tool.'
            : undefined}
        </StatusMessage>
      ) : null}

      {output ? (
        <ResultPanel title="Summary" tone="success">
          <div className="whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-fg">{output}</div>
          <p className="mt-3 flex items-start gap-2 text-xs text-muted">
            <AlertTriangle aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            AI summaries can miss nuance. Check important facts against the original text before you rely on them.
          </p>
        </ResultPanel>
      ) : (
        !busy &&
        !error && (
          <p className="rounded-xl border border-dashed border-line/15 px-4 py-8 text-center text-sm text-muted">
            Your summary will appear here.
          </p>
        )
      )}
    </div>
  );
}

/* ======================================================================== */
/*  AI Title & Meta Generator                                                */
/* ======================================================================== */

export function AiTitleGenerator() {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [count, setCount] = useState('3');
  const { busy, output, error, call, clear } = useAiCall();

  const reset = () => {
    setTopic('');
    setKeywords('');
    setCount('3');
    clear();
  };

  return (
    <div className="space-y-4">
      <AiStatusNotice />

      <Field label="Page topic or draft copy" htmlFor="ai-topic">
        <TextArea
          id="ai-topic"
          value={topic}
          onChange={(event) => setTopic(event.target.value.slice(0, 15000))}
          placeholder="e.g. A free browser-based PDF merger for freelancers who need to combine invoices."
          className="min-h-[130px]"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Target keywords (optional)" htmlFor="ai-keywords">
          <input
            id="ai-keywords"
            value={keywords}
            onChange={(event) => setKeywords(event.target.value)}
            placeholder="merge pdf, combine invoices"
            className="h-11 w-full rounded-xl border border-line/12 bg-surface/70 px-3.5 text-[0.9375rem] text-fg"
          />
        </Field>
        <Field label="Suggestions" htmlFor="ai-count">
          <Segmented
            label="Number of suggestions"
            value={count}
            onChange={setCount}
            options={[
              { value: '3', label: '3' },
              { value: '5', label: '5' },
              { value: '6', label: '6' },
            ]}
          />
        </Field>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => void call('seo', { topic, keywords, count: Number(count) })}
          loading={busy}
          disabled={!topic.trim()}
        >
          <Send aria-hidden className="h-4 w-4" />
          {busy ? 'Generating…' : 'Generate'}
        </Button>
        <CopyButton value={output} label="Copy" disabled={!output} />
        <ResetButton onClick={reset} label="Clear" />
      </div>

      {error ? (
        <StatusMessage tone={error.code === 'AI_NOT_CONFIGURED' ? 'warning' : 'error'} title={error.message}>
          {error.code === 'AI_NOT_CONFIGURED'
            ? 'No suggestions were produced because no provider is configured. Set AI_API_KEY on the server to enable this tool.'
            : undefined}
        </StatusMessage>
      ) : null}

      {output ? (
        <ResultPanel title="Suggestions" tone="success">
          <div className="whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-fg">{output}</div>
          <p className="mt-3 text-xs text-muted">
            Keep titles under about 60 characters and meta descriptions under 155 so they are not
            truncated in search results.
          </p>
        </ResultPanel>
      ) : (
        !busy &&
        !error && (
          <p className="rounded-xl border border-dashed border-line/15 px-4 py-8 text-center text-sm text-muted">
            Your titles and meta descriptions will appear here.
          </p>
        )
      )}
    </div>
  );
}
