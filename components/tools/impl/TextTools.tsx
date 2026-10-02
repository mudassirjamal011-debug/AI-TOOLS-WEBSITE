'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowDownAZ, Braces, Shuffle, Sparkles, Undo2 } from 'lucide-react';
import { ResultPanel, Stat, StatGrid } from '@/components/tools/ResultPanel';
import { Button } from '@/components/ui/Button';
import { CopyButton, DownloadButton, ResetButton } from '@/components/ui/Actions';
import { StatusMessage } from '@/components/ui/Feedback';
import { Checkbox, Field, Segmented, Slider, TextArea } from '@/components/ui/Inputs';
import { useToast } from '@/components/ui/Toast';
import { formatNumber } from '@/lib/utils';
import {
  formatJson,
  generateLorem,
  generatePassword,
  minifyJson,
  passwordEntropy,
  removeDuplicateLines,
  removeEmptyLines,
  removeExtraSpaces,
  removeLineBreaks,
  removePunctuation,
  reverseLines,
  reverseText,
  slugify,
  sortLines,
  textStats,
  toAlternatingCase,
  toCamelCase,
  toKebabCase,
  toLowerCaseText,
  toPascalCase,
  toSentenceCase,
  toSnakeCase,
  toTitleCase,
  toUpperCaseText,
  trimLines,
  validateJson,
  wordFrequency,
  type JsonResult,
} from '@/lib/text';

/* ======================================================================== */
/*  Word Counter                                                             */
/* ======================================================================== */

export function WordCounter() {
  const [text, setText] = useState('');
  const [showDensity, setShowDensity] = useState(false);
  const stats = useMemo(() => textStats(text), [text]);
  const frequency = useMemo(() => (showDensity ? wordFrequency(text, 12) : []), [showDensity, text]);

  return (
    <div className="space-y-4">
      <StatGrid className="sm:grid-cols-3 lg:grid-cols-4">
        <Stat label="Words" value={formatNumber(stats.words)} highlight />
        <Stat label="Characters" value={formatNumber(stats.characters)} />
        <Stat label="No spaces" value={formatNumber(stats.charactersNoSpaces)} />
        <Stat label="Sentences" value={formatNumber(stats.sentences)} />
        <Stat label="Paragraphs" value={formatNumber(stats.paragraphs)} />
        <Stat label="Unique words" value={formatNumber(stats.uniqueWords)} />
        <Stat label="Reading time" value={`${stats.readingMinutes} min`} hint="200 wpm" />
        <Stat label="Speaking time" value={`${stats.speakingMinutes} min`} hint="130 wpm" />
      </StatGrid>

      <Field label="Your text" htmlFor="word-counter-input" hint="Counts update as you type.">
        <TextArea
          id="word-counter-input"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Type or paste your text here…"
          className="min-h-[220px]"
          aria-describedby="word-counter-summary"
        />
      </Field>

      <p id="word-counter-summary" className="sr-only" aria-live="polite">
        {stats.words} words, {stats.characters} characters, {stats.sentences} sentences,{' '}
        {stats.paragraphs} paragraphs.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <CopyButton value={text} label="Copy text" />
        <DownloadButton
          blob={text ? new Blob([text], { type: 'text/plain' }) : null}
          filename="toolnova-text.txt"
          label="Download .txt"
          variant="outline"
        />
        <ResetButton onClick={() => setText('')} label="Clear" />
        <div className="ml-auto">
          <Checkbox checked={showDensity} onChange={setShowDensity} label="Show keyword density" />
        </div>
      </div>

      {showDensity ? (
        <ResultPanel title="Most used words">
          {frequency.length === 0 ? (
            <p className="text-sm text-muted">Add more text to see keyword density.</p>
          ) : (
            <ul className="space-y-1.5">
              {frequency.map((entry) => (
                <li key={entry.word} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 truncate text-sm text-fg">{entry.word}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                    <span
                      className="block h-full rounded-full bg-brand-gradient"
                      style={{ width: `${Math.min(100, (entry.count / frequency[0].count) * 100)}%` }}
                    />
                  </span>
                  <span className="w-8 shrink-0 text-right text-xs tabular-nums text-muted">
                    {entry.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </ResultPanel>
      ) : null}

      {text ? (
        <StatGrid className="sm:grid-cols-3">
          <Stat label="Lines" value={formatNumber(stats.lines)} />
          <Stat label="Longest word" value={stats.longestWord || '—'} />
          <Stat label="Avg. word length" value={`${stats.averageWordLength || 0}`} />
        </StatGrid>
      ) : null}
    </div>
  );
}

/* ======================================================================== */
/*  Case Converter                                                           */
/* ======================================================================== */

const CASE_ACTIONS: { label: string; apply: (text: string) => string }[] = [
  { label: 'UPPERCASE', apply: toUpperCaseText },
  { label: 'lowercase', apply: toLowerCaseText },
  { label: 'Title Case', apply: toTitleCase },
  { label: 'Sentence case', apply: toSentenceCase },
  { label: 'camelCase', apply: toCamelCase },
  { label: 'PascalCase', apply: toPascalCase },
  { label: 'snake_case', apply: toSnakeCase },
  { label: 'kebab-case', apply: toKebabCase },
  { label: 'aLtErNaTiNg', apply: toAlternatingCase },
];

export function CaseConverter() {
  const { toast } = useToast();
  const [text, setText] = useState('');
  const stats = useMemo(() => textStats(text), [text]);

  const apply = (label: string, fn: (value: string) => string) => {
    if (!text) {
      toast({ title: 'Please enter some text first.', variant: 'warning' });
      return;
    }
    setText(fn(text));
    toast({ title: `Converted to ${label}`, variant: 'success' });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {CASE_ACTIONS.map((action) => (
          <Button
            key={action.label}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => apply(action.label, action.apply)}
          >
            {action.label}
          </Button>
        ))}
      </div>

      <Field label="Your text" htmlFor="case-input">
        <TextArea
          id="case-input"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Type or paste text, then choose a transformation…"
          className="min-h-[220px]"
        />
      </Field>

      <StatGrid className="sm:grid-cols-3">
        <Stat label="Words" value={formatNumber(stats.words)} />
        <Stat label="Characters" value={formatNumber(stats.characters)} />
        <Stat label="Sentences" value={formatNumber(stats.sentences)} />
      </StatGrid>

      <div className="flex flex-wrap gap-2">
        <CopyButton value={text} label="Copy text" />
        <DownloadButton
          blob={text ? new Blob([text], { type: 'text/plain' }) : null}
          filename="toolnova-case.txt"
          label="Download .txt"
          variant="outline"
        />
        <ResetButton onClick={() => setText('')} label="Clear" />
      </div>
    </div>
  );
}

/* ======================================================================== */
/*  Text Formatter                                                           */
/* ======================================================================== */

interface HistoryEntry {
  value: string;
  label: string;
}

export function TextFormatter() {
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [caseSensitive, setCaseSensitive] = useState(false);

  const run = (label: string, fn: (value: string) => string) => {
    if (!text) {
      toast({ title: 'Please enter some text first.', variant: 'warning' });
      return;
    }
    const next = fn(text);
    if (next === text) {
      toast({ title: 'Nothing changed', description: 'This operation had no effect on your text.', variant: 'info' });
      return;
    }
    setHistory((current) => [...current.slice(-24), { value: text, label }]);
    setText(next);
  };

  const undo = () => {
    setHistory((current) => {
      if (current.length === 0) return current;
      const last = current[current.length - 1];
      setText(last.value);
      toast({ title: 'Reverted last change', variant: 'info' });
      return current.slice(0, -1);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => run('Trim lines', trimLines)}>
          Trim each line
        </Button>
        <Button size="sm" variant="outline" onClick={() => run('Remove extra spaces', removeExtraSpaces)}>
          Remove extra spaces
        </Button>
        <Button size="sm" variant="outline" onClick={() => run('Remove empty lines', removeEmptyLines)}>
          Remove empty lines
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => run('Remove duplicate lines', (value) => removeDuplicateLines(value, caseSensitive))}
        >
          Remove duplicate lines
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => run('Sort A→Z', (value) => sortLines(value, false, caseSensitive))}
        >
          <ArrowDownAZ aria-hidden className="h-4 w-4" />
          Sort A→Z
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => run('Sort Z→A', (value) => sortLines(value, true, caseSensitive))}
        >
          Sort Z→A
        </Button>
        <Button size="sm" variant="outline" onClick={() => run('Reverse line order', reverseLines)}>
          Reverse lines
        </Button>
        <Button size="sm" variant="outline" onClick={() => run('Reverse text', reverseText)}>
          Reverse text
        </Button>
        <Button size="sm" variant="outline" onClick={() => run('Remove line breaks', (value) => removeLineBreaks(value, ' '))}>
          Remove line breaks
        </Button>
        <Button size="sm" variant="outline" onClick={() => run('Remove punctuation', removePunctuation)}>
          Remove punctuation
        </Button>
        <Button size="sm" variant="outline" onClick={() => run('Slugify', slugify)}>
          Slugify
        </Button>
      </div>

      <Field label="Your text" htmlFor="format-input" hint="Each click is undoable.">
        <TextArea
          id="format-input"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Paste messy text here…"
          className="min-h-[260px] font-mono text-sm"
        />
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <Checkbox checked={caseSensitive} onChange={setCaseSensitive} label="Case-sensitive dedupe & sort" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={undo} disabled={history.length === 0}>
          <Undo2 aria-hidden className="h-4 w-4" />
          Undo {history.length > 0 ? `(${history.length})` : ''}
        </Button>
        <CopyButton value={text} label="Copy text" />
        <DownloadButton
          blob={text ? new Blob([text], { type: 'text/plain' }) : null}
          filename="toolnova-formatted.txt"
          label="Download .txt"
          variant="outline"
        />
        <ResetButton
          onClick={() => {
            setText('');
            setHistory([]);
          }}
          label="Clear"
        />
      </div>
    </div>
  );
}

/* ======================================================================== */
/*  JSON Formatter                                                           */
/* ======================================================================== */

export function JsonFormatter() {
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [result, setResult] = useState<JsonResult | null>(null);
  const [indent, setIndent] = useState('2');

  const runFormat = () => {
    const response = formatJson(input, Number(indent));
    setResult(response);
    if (response.ok && response.value !== undefined) {
      setOutput(response.value);
      toast({
        title: 'JSON formatted',
        description: response.warnings?.length ? response.warnings[0] : undefined,
        variant: response.warnings?.length ? 'warning' : 'success',
      });
    } else {
      setOutput('');
      toast({ title: 'Invalid JSON', description: response.error, variant: 'error' });
    }
  };

  const runMinify = () => {
    const response = minifyJson(input);
    setResult(response);
    if (response.ok && response.value !== undefined) {
      setOutput(response.value);
      toast({ title: 'JSON minified', variant: 'success' });
    } else {
      setOutput('');
      toast({ title: 'Invalid JSON', description: response.error, variant: 'error' });
    }
  };

  const runValidate = () => {
    const response = validateJson(input);
    setResult(response);
    if (response.ok) {
      toast({ title: 'Valid JSON', description: 'No syntax errors found.', variant: 'success' });
    } else {
      toast({ title: 'Invalid JSON', description: response.error, variant: 'error' });
    }
  };

  const clear = () => {
    setInput('');
    setOutput('');
    setResult(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={runFormat}>
          <Braces aria-hidden className="h-4 w-4" />
          Format
        </Button>
        <Button variant="secondary" onClick={runMinify}>
          Minify
        </Button>
        <Button variant="outline" onClick={runValidate}>
          Validate
        </Button>
        <div className="ml-auto w-36">
          <Field label="" htmlFor="json-indent">
            <select
              id="json-indent"
              value={indent}
              onChange={(event) => setIndent(event.target.value)}
              aria-label="Indentation"
              className="h-11 w-full rounded-xl border border-line/12 bg-surface/70 px-3 text-sm text-fg"
            >
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
              <option value="tab">Tab</option>
            </select>
          </Field>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Input JSON" htmlFor="json-input">
          <TextArea
            id="json-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder='{ "name": "ToolNova", "tools": 31 }'
            className="min-h-[280px] font-mono text-xs"
            spellCheck={false}
          />
        </Field>
        <Field label="Result" htmlFor="json-output">
          <TextArea
            id="json-output"
            value={output}
            onChange={(event) => setOutput(event.target.value)}
            placeholder="Formatted or minified JSON appears here…"
            className="min-h-[280px] font-mono text-xs"
            spellCheck={false}
            readOnly
          />
        </Field>
      </div>

      {result && !result.ok ? (
        <StatusMessage tone="error" title="Invalid JSON">
          <p>{result.error}</p>
          {result.line ? (
            <p className="mt-1 font-mono text-xs">
              Line {result.line}
              {result.column ? `, column ${result.column}` : ''}
              {result.snippet ? ` → ${result.snippet}` : ''}
            </p>
          ) : null}
        </StatusMessage>
      ) : null}

      {result?.ok && result.warnings?.length ? (
        <StatusMessage tone="warning" title="Valid, but check this">
          {result.warnings.join(' ')}
        </StatusMessage>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <CopyButton value={output} label="Copy result" />
        <DownloadButton
          blob={output ? new Blob([output], { type: 'application/json' }) : null}
          filename="toolnova-data.json"
          label="Download .json"
          variant="outline"
        />
        <ResetButton onClick={clear} label="Clear" />
      </div>
    </div>
  );
}

/* ======================================================================== */
/*  Lorem Ipsum                                                              */
/* ======================================================================== */

export function LoremIpsum() {
  const { toast } = useToast();
  const [unit, setUnit] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
  const [count, setCount] = useState(3);
  const [classicStart, setClassicStart] = useState(true);
  const [text, setText] = useState('');

  const max = unit === 'paragraphs' ? 100 : unit === 'sentences' ? 200 : 2000;

  useEffect(() => {
    setCount((current) => Math.min(current, max));
  }, [max]);

  const generate = () => {
    const value = generateLorem(count, unit, classicStart);
    setText(value);
    toast({ title: 'Placeholder text generated', variant: 'success' });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Generate" htmlFor="lorem-unit">
          <Segmented
            label="Unit"
            value={unit}
            onChange={setUnit}
            options={[
              { value: 'paragraphs', label: 'Paragraphs' },
              { value: 'sentences', label: 'Sentences' },
              { value: 'words', label: 'Words' },
            ]}
          />
        </Field>
        <Slider
          label="Amount"
          value={count}
          onChange={setCount}
          min={1}
          max={max}
          valueLabel={String(count)}
        />
      </div>

      <Checkbox
        checked={classicStart}
        onChange={setClassicStart}
        label="Start with “Lorem ipsum dolor sit amet”"
      />

      <div className="flex flex-wrap gap-2">
        <Button onClick={generate}>
          <Sparkles aria-hidden className="h-4 w-4" />
          Generate
        </Button>
        <Button variant="outline" onClick={generate}>
          <Shuffle aria-hidden className="h-4 w-4" />
          Regenerate
        </Button>
        <CopyButton value={text} label="Copy text" />
        <DownloadButton
          blob={text ? new Blob([text], { type: 'text/plain' }) : null}
          filename="toolnova-lorem.txt"
          label="Download .txt"
          variant="outline"
        />
        <ResetButton onClick={() => setText('')} label="Clear" />
      </div>

      <Field label="Result" htmlFor="lorem-output">
        <TextArea
          id="lorem-output"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Your placeholder text appears here…"
          className="min-h-[240px]"
        />
      </Field>
    </div>
  );
}

/* ======================================================================== */
/*  Password Generator                                                       */
/* ======================================================================== */

export function PasswordGenerator() {
  const { toast } = useToast();
  const [length, setLength] = useState(16);
  const [lower, setLower] = useState(true);
  const [upper, setUpper] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(true);
  const [password, setPassword] = useState('');

  const entropy = useMemo(() => passwordEntropy(password), [password]);
  const strength =
    entropy >= 100 ? 'Excellent' : entropy >= 70 ? 'Strong' : entropy >= 50 ? 'Good' : entropy > 0 ? 'Weak' : '—';

  const generate = () => {
    if (!lower && !upper && !numbers && !symbols) {
      toast({
        title: 'Select at least one character set',
        variant: 'warning',
      });
      return;
    }
    setPassword(
      generatePassword({
        length,
        lowercase: lower,
        uppercase: upper,
        numbers,
        symbols,
        excludeAmbiguous,
      })
    );
  };

  const reset = () => {
    setPassword('');
    setLength(16);
    setLower(true);
    setUpper(true);
    setNumbers(true);
    setSymbols(true);
    setExcludeAmbiguous(true);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-line/10 bg-surface-2/50 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <code
            className="min-w-0 flex-1 break-all rounded-xl border border-line/10 bg-surface px-3 py-3 font-mono text-sm text-fg"
            aria-live="polite"
            aria-label="Generated password"
          >
            {password || 'Press “Generate password”'}
          </code>
          <CopyButton value={password} size="md" label="Copy" />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
          <span>
            Strength: <strong className="text-fg">{strength}</strong>
          </span>
          <span>
            Entropy: <strong className="text-fg">{entropy} bits</strong>
          </span>
          <span>Length: {password.length || 0}</span>
        </div>
      </div>

      <Slider
        label="Password length"
        value={length}
        onChange={setLength}
        min={6}
        max={64}
        valueLabel={`${length} chars`}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Checkbox checked={lower} onChange={setLower} label="Lowercase (a–z)" />
        <Checkbox checked={upper} onChange={setUpper} label="Uppercase (A–Z)" />
        <Checkbox checked={numbers} onChange={setNumbers} label="Numbers (0–9)" />
        <Checkbox checked={symbols} onChange={setSymbols} label="Symbols (!@#$…)" />
        <div className="sm:col-span-2">
          <Checkbox
            checked={excludeAmbiguous}
            onChange={setExcludeAmbiguous}
            label="Exclude similar characters (0, O, l, 1, I)"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={generate}>
          <Shuffle aria-hidden className="h-4 w-4" />
          Generate password
        </Button>
        <ResetButton onClick={reset} variant="outline" />
      </div>

      <StatusMessage tone="info">
        Passwords are generated with your browser&apos;s cryptographic random number generator and never
        leave your device. Nothing is stored or logged.
      </StatusMessage>
    </div>
  );
}
