'use client';

import { useEffect, useMemo, useState } from 'react';
import { Clock, Hash, KeyRound, Table2 } from 'lucide-react';
import { UploadButton } from '@/components/tools/UploadBox';
import { ResultPanel, Stat, StatGrid } from '@/components/tools/ResultPanel';
import { Button } from '@/components/ui/Button';
import { CopyButton, ResetButton } from '@/components/ui/Actions';
import { StatusMessage } from '@/components/ui/Feedback';
import { Checkbox, Field, Segmented, Select, TextArea, TextInput } from '@/components/ui/Inputs';
import { useToast } from '@/components/ui/Toast';
import { cn, formatNumber } from '@/lib/utils';
import { csvToJson, jsonToCsv, testRegex } from '@/lib/text';
import { HASH_ALGORITHMS, hashText } from '@/lib/hash';

/* ======================================================================== */
/*  Regex Tester                                                             */
/* ======================================================================== */

const FLAGS = [
  { flag: 'g', label: 'global' },
  { flag: 'i', label: 'ignore case' },
  { flag: 'm', label: 'multiline' },
  { flag: 's', label: 'dotAll' },
  { flag: 'u', label: 'unicode' },
  { flag: 'y', label: 'sticky' },
];

export function RegexTester() {
  const [pattern, setPattern] = useState('(\\w+)@(\\w+\\.\\w+)');
  const [flags, setFlags] = useState<string[]>(['g', 'i']);
  const [input, setInput] = useState('Contact us at hello@toolnova.ai or support@example.com today.');
  const [replacement, setReplacement] = useState('[$1]');

  const flagString = flags.join('');
  const result = useMemo(
    () => testRegex(pattern, flagString, input, replacement),
    [pattern, flagString, input, replacement]
  );

  const highlighted = useMemo(() => {
    if (!pattern || result.error || result.matches.length === 0) return null;
    const parts: React.ReactNode[] = [];
    let cursor = 0;
    result.matches.slice(0, 200).forEach((match, index) => {
      if (match.index > cursor) parts.push(input.slice(cursor, match.index));
      parts.push(
        <mark
          key={`${match.index}-${index}`}
          className="rounded bg-brand-gradient-soft px-0.5 text-fg ring-1 ring-brand-purple/30"
        >
          {match.match}
        </mark>
      );
      cursor = match.index + match.match.length;
    });
    if (cursor < input.length) parts.push(input.slice(cursor));
    return parts;
  }, [input, pattern, result.error, result.matches]);

  const toggleFlag = (flag: string) => {
    setFlags((current) =>
      current.includes(flag) ? current.filter((entry) => entry !== flag) : [...current, flag]
    );
  };

  const reset = () => {
    setPattern('(\\w+)@(\\w+\\.\\w+)');
    setFlags(['g', 'i']);
    setInput('Contact us at hello@toolnova.ai or support@example.com today.');
    setReplacement('[$1]');
  };

  return (
    <div className="space-y-4">
      <Field label="Regular expression" htmlFor="regex-pattern" error={result.error}>
        <div className="flex items-stretch gap-2">
          <span className="flex items-center rounded-xl border border-line/12 bg-surface-2 px-3 font-mono text-sm text-muted">
            /
          </span>
          <input
            id="regex-pattern"
            value={pattern}
            onChange={(event) => setPattern(event.target.value)}
            spellCheck={false}
            aria-invalid={Boolean(result.error)}
            className={cn(
              'h-11 min-w-0 flex-1 rounded-xl border bg-surface/70 px-3 font-mono text-sm text-fg',
              result.error ? 'border-red-500/60' : 'border-line/12'
            )}
          />
          <span className="flex items-center gap-1 rounded-xl border border-line/12 bg-surface-2 px-3 font-mono text-sm text-muted">
            /{flagString}
          </span>
        </div>
      </Field>

      <div className="flex flex-wrap gap-3">
        {FLAGS.map((entry) => (
          <Checkbox
            key={entry.flag}
            checked={flags.includes(entry.flag)}
            onChange={() => toggleFlag(entry.flag)}
            label={`${entry.flag} — ${entry.label}`}
          />
        ))}
      </div>

      <Field label="Test string" htmlFor="regex-input">
        <TextArea
          id="regex-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="min-h-[150px] font-mono text-sm"
          spellCheck={false}
        />
      </Field>

      <Field
        label="Replacement (optional)"
        htmlFor="regex-replacement"
        hint="Supports $1, $<name> and $& like String.replace()."
      >
        <TextInput
          id="regex-replacement"
          value={replacement}
          onChange={(event) => setReplacement(event.target.value)}
          className="font-mono text-sm"
          spellCheck={false}
        />
      </Field>

      <StatGrid className="sm:grid-cols-3">
        <Stat label="Matches" value={formatNumber(result.count)} highlight />
        <Stat label="Time" value={`${result.executionMs} ms`} />
        <Stat label="Pattern" value={`/${pattern}/${flagString}`} />
      </StatGrid>

      {result.error ? (
        <StatusMessage tone="error" title="Invalid regular expression">
          {result.error}
        </StatusMessage>
      ) : null}

      {highlighted ? (
        <ResultPanel title="Highlighted matches">
          <p className="whitespace-pre-wrap break-words rounded-xl border border-line/10 bg-surface-2/50 p-3 font-mono text-sm leading-relaxed text-fg">
            {highlighted}
          </p>
        </ResultPanel>
      ) : null}

      {!result.error && result.matches.length > 0 ? (
        <ResultPanel title="Match details">
          <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {result.matches.slice(0, 100).map((match, index) => (
              <li key={`${match.index}-${index}`} className="rounded-xl border border-line/10 bg-surface/60 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <code className="break-all font-mono text-sm text-fg">{match.match}</code>
                  <span className="text-xs text-muted">index {match.index}</span>
                </div>
                {match.groups.length > 0 ? (
                  <div className="mt-2 space-y-1">
                    {match.groups.map((group, groupIndex) => (
                      <p key={groupIndex} className="text-xs text-muted">
                        Group {groupIndex + 1}: <code className="font-mono text-fg">{group ?? 'undefined'}</code>
                      </p>
                    ))}
                  </div>
                ) : null}
                {Object.keys(match.namedGroups).length > 0 ? (
                  <div className="mt-2 space-y-1">
                    {Object.entries(match.namedGroups).map(([key, value]) => (
                      <p key={key} className="text-xs text-muted">
                        {key}: <code className="font-mono text-fg">{value ?? 'undefined'}</code>
                      </p>
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </ResultPanel>
      ) : null}

      {replacement && result.replaced !== undefined ? (
        <ResultPanel title="Replacement preview">
          <pre className="whitespace-pre-wrap break-words rounded-xl border border-line/10 bg-surface-2/50 p-3 font-mono text-sm text-fg">
            {result.replaced}
          </pre>
          <div className="mt-3">
            <CopyButton value={result.replaced} label="Copy result" />
          </div>
        </ResultPanel>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <CopyButton value={`/${pattern}/${flagString}`} label="Copy pattern" />
        <ResetButton onClick={reset} label="Reset" />
      </div>
    </div>
  );
}

/* ======================================================================== */
/*  URL Encoder / Decoder                                                    */
/* ======================================================================== */

export function UrlEncoder() {
  const { toast } = useToast();
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [scope, setScope] = useState<'component' | 'full'>('component');
  const [input, setInput] = useState('https://example.com/search?q=toolnova ai & page=2');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const convert = () => {
    setError(null);
    if (!input) {
      toast({ title: 'Please enter a value first.', variant: 'warning' });
      return;
    }
    try {
      setOutput(
        mode === 'encode'
          ? scope === 'component'
            ? encodeURIComponent(input)
            : encodeURI(input)
          : decodeURIComponent(input)
      );
    } catch {
      setError(
        'That string is not valid percent-encoded URL data. Switch to Encode, or check for stray % characters.'
      );
      setOutput('');
    }
  };

  const params = useMemo(() => {
    if (mode !== 'decode') return [];
    const queryIndex = output.indexOf('?');
    if (queryIndex === -1) return [];
    const search = new URLSearchParams(output.slice(queryIndex + 1));
    return Array.from(search.entries());
  }, [mode, output]);

  const reset = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Segmented
          label="Mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'encode', label: 'Encode' },
            { value: 'decode', label: 'Decode' },
          ]}
        />
        {mode === 'encode' ? (
          <Segmented
            label="Scope"
            value={scope}
            onChange={setScope}
            options={[
              { value: 'component', label: 'Component' },
              { value: 'full', label: 'Full URL' },
            ]}
          />
        ) : (
          <div />
        )}
      </div>

      <Field label={mode === 'encode' ? 'Text or URL to encode' : 'Encoded URL to decode'} htmlFor="url-input">
        <TextArea
          id="url-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="min-h-[130px] font-mono text-xs"
          spellCheck={false}
        />
      </Field>

      <div className="flex flex-wrap gap-2">
        <Button onClick={convert}>{mode === 'encode' ? 'Encode' : 'Decode'}</Button>
        <CopyButton value={output} label="Copy result" disabled={!output} />
        <ResetButton onClick={reset} label="Clear" />
      </div>

      {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}

      <Field label="Result" htmlFor="url-output">
        <TextArea
          id="url-output"
          value={output}
          readOnly
          onFocus={(event) => event.currentTarget.select()}
          className="min-h-[130px] font-mono text-xs"
        />
      </Field>

      {params.length > 0 ? (
        <ResultPanel title="Query parameters">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-muted">
                  <th scope="col" className="pb-2 pr-4">
                    Key
                  </th>
                  <th scope="col" className="pb-2">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/10">
                {params.map(([key, value], index) => (
                  <tr key={`${key}-${index}`}>
                    <td className="py-2 pr-4 font-mono text-xs text-fg">{key}</td>
                    <td className="py-2 break-all font-mono text-xs text-muted">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ResultPanel>
      ) : null}
    </div>
  );
}

/* ======================================================================== */
/*  JWT Decoder                                                              */
/* ======================================================================== */

interface DecodedJwt {
  header: unknown;
  payload: Record<string, unknown>;
  signature: string;
  expired: boolean;
  notYetValid: boolean;
}

function base64UrlToJson(segment: string): unknown {
  let value = segment.replace(/-/g, '+').replace(/_/g, '/');
  while (value.length % 4 !== 0) value += '=';
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return JSON.parse(new TextDecoder().decode(bytes));
}

export function JwtDecoder() {
  const { toast } = useToast();
  const [token, setToken] = useState('');
  const [decoded, setDecoded] = useState<DecodedJwt | null>(null);
  const [error, setError] = useState<string | null>(null);

  const decode = () => {
    setError(null);
    setDecoded(null);
    const value = token.trim().replace(/^Bearer\s+/i, '');
    if (!value) {
      toast({ title: 'Please paste a JWT.', variant: 'warning' });
      return;
    }
    const parts = value.split('.');
    if (parts.length !== 3 || !parts[0] || !parts[1]) {
      setError('That is not a valid JWT. A token has three Base64URL segments separated by dots.');
      return;
    }
    try {
      const header = base64UrlToJson(parts[0]);
      const payload = base64UrlToJson(parts[1]) as Record<string, unknown>;
      const now = Math.floor(Date.now() / 1000);
      const exp = typeof payload.exp === 'number' ? payload.exp : null;
      const nbf = typeof payload.nbf === 'number' ? payload.nbf : null;
      setDecoded({
        header,
        payload,
        signature: parts[2],
        expired: exp !== null && exp < now,
        notYetValid: nbf !== null && nbf > now,
      });
      toast({ title: 'Token decoded', variant: 'success' });
    } catch {
      setError('The header or payload is not valid JSON. Check that you copied the whole token.');
    }
  };

  const formatClaim = (key: string, value: unknown): string => {
    if (['iat', 'exp', 'nbf'].includes(key) && typeof value === 'number') {
      return `${value} — ${new Date(value * 1000).toLocaleString()}`;
    }
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
  };

  const reset = () => {
    setToken('');
    setDecoded(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <Field label="JSON Web Token" htmlFor="jwt-input" hint="Nothing is uploaded — decoding happens in your browser.">
        <TextArea
          id="jwt-input"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature"
          className="min-h-[120px] font-mono text-xs"
          spellCheck={false}
        />
      </Field>

      <div className="flex flex-wrap gap-2">
        <Button onClick={decode}>
          <KeyRound aria-hidden className="h-4 w-4" />
          Decode token
        </Button>
        <ResetButton onClick={reset} label="Clear" />
      </div>

      {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}

      {decoded ? (
        <div className="space-y-4">
          {decoded.expired ? (
            <StatusMessage tone="warning" title="This token has expired">
              The exp claim is in the past.
            </StatusMessage>
          ) : null}
          {decoded.notYetValid ? (
            <StatusMessage tone="warning" title="This token is not valid yet">
              The nbf claim is in the future.
            </StatusMessage>
          ) : null}

          <ResultPanel title="Header">
            <pre className="overflow-x-auto rounded-xl border border-line/10 bg-surface-2/50 p-3 font-mono text-xs text-fg">
              {JSON.stringify(decoded.header, null, 2)}
            </pre>
            <div className="mt-2">
              <CopyButton value={JSON.stringify(decoded.header, null, 2)} label="Copy header" size="sm" />
            </div>
          </ResultPanel>

          <ResultPanel title="Payload">
            <dl className="divide-y divide-line/10 overflow-hidden rounded-xl border border-line/10">
              {Object.entries(decoded.payload).map(([key, value]) => (
                <div key={key} className="flex flex-col gap-1 bg-surface/50 px-3 py-2 sm:flex-row sm:gap-4">
                  <dt className="w-28 shrink-0 font-mono text-xs font-semibold text-muted">{key}</dt>
                  <dd className="min-w-0 break-all font-mono text-xs text-fg">{formatClaim(key, value)}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-2">
              <CopyButton value={JSON.stringify(decoded.payload, null, 2)} label="Copy payload" size="sm" />
            </div>
          </ResultPanel>

          <ResultPanel title="Signature">
            <code className="block break-all rounded-xl border border-line/10 bg-surface-2/50 p-3 font-mono text-xs text-fg">
              {decoded.signature || '(empty — unsigned token)'}
            </code>
            <p className="mt-2 text-xs text-muted">
              Decoding does not verify the signature. Verification needs the secret or public key, which
              should never be pasted into a website.
            </p>
          </ResultPanel>
        </div>
      ) : null}
    </div>
  );
}

/* ======================================================================== */
/*  Unix Timestamp Converter                                                 */
/* ======================================================================== */

export function TimestampConverter() {
  const [mode, setMode] = useState<'toDate' | 'toTimestamp'>('toDate');
  const [timestamp, setTimestamp] = useState(String(Math.floor(Date.now() / 1000)));
  const [dateInput, setDateInput] = useState(() => toLocalInputValue(new Date()));
  const [frozen, setFrozen] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (frozen) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [frozen]);

  const parsedTimestamp = useMemo(() => {
    const value = Number(timestamp.trim());
    if (!Number.isFinite(value) || timestamp.trim() === '') return null;
    // Treat values that look like milliseconds as milliseconds.
    const isMillis = Math.abs(value) > 1e11;
    return isMillis ? value : value * 1000;
  }, [timestamp]);

  const target = useMemo(() => {
    if (mode === 'toDate') {
      return parsedTimestamp !== null ? new Date(parsedTimestamp) : null;
    }
    const parsed = new Date(dateInput);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, [mode, parsedTimestamp, dateInput]);

  const outputs = useMemo(() => {
    if (!target || Number.isNaN(target.getTime())) return null;
    return {
      seconds: Math.floor(target.getTime() / 1000),
      milliseconds: target.getTime(),
      iso: target.toISOString(),
      utc: target.toUTCString(),
      local: target.toLocaleString(),
      relative: relativeTime(target.getTime(), now),
    };
  }, [target, now]);

  const reset = () => {
    const current = Date.now();
    setNow(current);
    setTimestamp(String(Math.floor(current / 1000)));
    setDateInput(toLocalInputValue(new Date(current)));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          label="Direction"
          value={mode}
          onChange={setMode}
          className="max-w-sm"
          options={[
            { value: 'toDate', label: 'Timestamp → date' },
            { value: 'toTimestamp', label: 'Date → timestamp' },
          ]}
        />
        <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-muted">
          <input
            type="checkbox"
            checked={!frozen}
            onChange={(event) => {
              setFrozen(!event.target.checked);
              if (event.target.checked) setNow(Date.now());
            }}
            className="h-4 w-4 accent-brand-purple"
          />
          Live clock
        </label>
      </div>

      <div className="grid gap-4 rounded-2xl border border-line/10 bg-surface/60 p-4 sm:grid-cols-2">
        <Stat label="Current Unix time" value={Math.floor(now / 1000)} hint="seconds" highlight />
        <Stat label="Milliseconds" value={now} hint="ms" />
      </div>

      {mode === 'toDate' ? (
        <Field
          label="Unix timestamp"
          htmlFor="ts-input"
          hint="Seconds or milliseconds — the tool detects which one you mean."
          error={parsedTimestamp === null ? 'Enter a numeric timestamp.' : null}
        >
          <TextInput
            id="ts-input"
            inputMode="numeric"
            value={timestamp}
            onChange={(event) => setTimestamp(event.target.value)}
            className="font-mono"
          />
        </Field>
      ) : (
        <Field
          label="Date and time (your timezone)"
          htmlFor="ts-date"
          error={!target && !!dateInput ? 'That date could not be parsed.' : null}
        >
          <TextInput
            id="ts-date"
            type="datetime-local"
            value={dateInput}
            onChange={(event) => setDateInput(event.target.value)}
          />
        </Field>
      )}

      {outputs ? (
        <ResultPanel title="Conversions">
          <dl className="space-y-2">
            {[
              { label: 'Unix (seconds)', value: String(outputs.seconds) },
              { label: 'Unix (milliseconds)', value: String(outputs.milliseconds) },
              { label: 'ISO 8601', value: outputs.iso },
              { label: 'UTC', value: outputs.utc },
              { label: 'Local time', value: outputs.local },
              { label: 'Relative', value: outputs.relative },
            ].map((row) => (
              <div
                key={row.label}
                className="flex flex-col gap-1 rounded-xl border border-line/10 bg-surface/60 px-3 py-2 sm:flex-row sm:items-center sm:gap-4"
              >
                <dt className="w-44 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted">
                  {row.label}
                </dt>
                <dd className="min-w-0 flex-1 break-all font-mono text-xs text-fg">{row.value}</dd>
                <CopyButton value={row.value} size="sm" variant="ghost" label="Copy" />
              </div>
            ))}
          </dl>
        </ResultPanel>
      ) : (
        <StatusMessage tone="info">Enter a value above to see the conversion.</StatusMessage>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={reset}>
          <Clock aria-hidden className="h-4 w-4" />
          Use current time
        </Button>
      </div>
    </div>
  );
}

function toLocalInputValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

function relativeTime(target: number, now: number): string {
  const diff = Math.round((target - now) / 1000);
  const absolute = Math.abs(diff);
  const units: [number, string][] = [
    [60, 'second'],
    [3600, 'minute'],
    [86400, 'hour'],
    [2592000, 'day'],
    [31536000, 'month'],
    [Number.POSITIVE_INFINITY, 'year'],
  ];
  let value = absolute;
  let unit = 'second';
  for (let index = 0; index < units.length; index += 1) {
    const [limit, name] = units[index];
    if (absolute < limit) {
      const divisor = index === 0 ? 1 : units[index - 1][0];
      value = Math.round(absolute / divisor);
      unit = name;
      break;
    }
  }
  const plural = value === 1 ? '' : 's';
  return diff >= 0 ? `in ${value} ${unit}${plural}` : `${value} ${unit}${plural} ago`;
}

/* ======================================================================== */
/*  CSV ⇄ JSON                                                               */
/* ======================================================================== */

export function CsvConverter() {
  const { toast } = useToast();
  const [direction, setDirection] = useState<'csv-to-json' | 'json-to-csv'>('csv-to-json');
  const [input, setInput] = useState('name,role,active\nAda,Engineer,true\nGrace,Admiral,false');
  const [delimiter, setDelimiter] = useState(',');
  const [hasHeader, setHasHeader] = useState(true);
  const [inferTypes, setInferTypes] = useState(true);
  const [output, setOutput] = useState('');
  const [preview, setPreview] = useState<{ headers: string[]; objects: Record<string, unknown>[] } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const convert = () => {
    setError(null);
    setPreview(null);
    if (!input.trim()) {
      toast({ title: 'Please add some data first.', variant: 'warning' });
      return;
    }
    if (direction === 'csv-to-json') {
      const result = csvToJson(input, { delimiter, hasHeader, inferTypes });
      setOutput(JSON.stringify(result.objects, null, 2));
      setPreview({ headers: result.headers, objects: result.objects });
      toast({ title: 'Converted', description: `${result.objects.length} rows parsed.`, variant: 'success' });
    } else {
      const result = jsonToCsv(input, delimiter);
      if (result.error) {
        setError(result.error);
        setOutput('');
        toast({ title: 'Invalid JSON', description: result.error, variant: 'error' });
        return;
      }
      setOutput(result.csv ?? '');
      setPreview({ headers: result.headers, objects: result.objects });
      toast({ title: 'Converted', description: `${result.objects.length} rows written.`, variant: 'success' });
    }
  };

  const reset = () => {
    setInput('');
    setOutput('');
    setPreview(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          label="Direction"
          value={direction}
          onChange={setDirection}
          className="max-w-sm"
          options={[
            { value: 'csv-to-json', label: 'CSV → JSON' },
            { value: 'json-to-csv', label: 'JSON → CSV' },
          ]}
        />
        <UploadButton
          accept=".csv,.tsv,text/csv,text/plain,application/json"
          maxSizeMb={25}
          onFiles={async (files) => {
            const file = files[0];
            const content = await file.text();
            setInput(content);
            setOutput('');
            setPreview(null);
            toast({ title: 'File loaded', description: file.name, variant: 'success' });
          }}
          variant="outline"
          size="sm"
        >
          Upload file
        </UploadButton>
      </div>

      <div className="grid gap-4 rounded-2xl border border-line/10 bg-surface/60 p-4 sm:grid-cols-3">
        <Field label="Delimiter" htmlFor="csv-delimiter">
          <Select id="csv-delimiter" value={delimiter} onChange={(event) => setDelimiter(event.target.value)}>
            <option value=",">Comma (,)</option>
            <option value=";">Semicolon (;)</option>
            <option value="\t">Tab</option>
            <option value="|">Pipe (|)</option>
          </Select>
        </Field>
        {direction === 'csv-to-json' ? (
          <>
            <div className="flex items-end">
              <Checkbox checked={hasHeader} onChange={setHasHeader} label="First row is a header" />
            </div>
            <div className="flex items-end">
              <Checkbox checked={inferTypes} onChange={setInferTypes} label="Detect numbers & booleans" />
            </div>
          </>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Field
          label={direction === 'csv-to-json' ? 'CSV input' : 'JSON input'}
          htmlFor="csv-input"
        >
          <TextArea
            id="csv-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="min-h-[240px] font-mono text-xs"
            spellCheck={false}
          />
        </Field>
        <Field label="Result" htmlFor="csv-output">
          <TextArea
            id="csv-output"
            value={output}
            readOnly
            onFocus={(event) => event.currentTarget.select()}
            className="min-h-[240px] font-mono text-xs"
          />
        </Field>
      </div>

      {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}

      <div className="flex flex-wrap gap-2">
        <Button onClick={convert}>
          <Table2 aria-hidden className="h-4 w-4" />
          Convert
        </Button>
        <CopyButton value={output} label="Copy result" disabled={!output} />
        <DownloadButtonInline
          value={output}
          filename={direction === 'csv-to-json' ? 'toolnova-data.json' : 'toolnova-data.csv'}
          mime={direction === 'csv-to-json' ? 'application/json' : 'text/csv'}
        />
        <ResetButton onClick={reset} label="Clear" />
      </div>

      {preview && preview.objects.length > 0 ? (
        <ResultPanel title="Preview">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-muted">
                  {preview.headers.map((header) => (
                    <th key={header} scope="col" className="whitespace-nowrap pb-2 pr-4">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line/10">
                {preview.objects.slice(0, 20).map((row, index) => (
                  <tr key={index}>
                    {preview.headers.map((header) => (
                      <td key={header} className="whitespace-nowrap py-2 pr-4 font-mono text-xs text-muted">
                        {String(row[header] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {preview.objects.length > 20 ? (
            <p className="mt-2 text-xs text-muted">Showing the first 20 of {preview.objects.length} rows.</p>
          ) : null}
        </ResultPanel>
      ) : null}
    </div>
  );
}

function DownloadButtonInline({
  value,
  filename,
  mime,
}: {
  value: string;
  filename: string;
  mime: string;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={!value}
      onClick={() => {
        const blob = new Blob([value], { type: mime });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        setTimeout(() => URL.revokeObjectURL(url), 4000);
      }}
    >
      Download
    </Button>
  );
}

/* ======================================================================== */
/*  Hash Generator                                                           */
/* ======================================================================== */

export function HashGenerator() {
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [salt, setSalt] = useState('');
  const [uppercase, setUppercase] = useState(false);
  const [results, setResults] = useState<
    { algorithm: string; hex: string; base64: string }[] | null
  >(null);
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    if (!text) {
      toast({ title: 'Please enter some text to hash.', variant: 'warning' });
      return;
    }
    setBusy(true);
    try {
      const output = await Promise.all(
        HASH_ALGORITHMS.map(async (algorithm) => {
          const value = await hashText(text, algorithm, salt);
          return {
            algorithm,
            hex: uppercase ? value.hex.toUpperCase() : value.hex,
            base64: value.base64,
          };
        })
      );
      setResults(output);
      toast({ title: 'Hashes generated', variant: 'success' });
    } catch (error) {
      toast({
        title: 'Hashing failed',
        description: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        variant: 'error',
      });
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setText('');
    setSalt('');
    setResults(null);
  };

  const byteLength = useMemo(() => new TextEncoder().encode(salt + text).length, [salt, text]);

  return (
    <div className="space-y-4">
      <Field label="Text to hash" htmlFor="hash-input" hint={`${byteLength} bytes will be hashed`}>
        <TextArea
          id="hash-input"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Type or paste text…"
          className="min-h-[140px]"
        />
      </Field>

      <Field label="Salt (optional, prefixed to the input)" htmlFor="hash-salt">
        <TextInput id="hash-salt" value={salt} onChange={(event) => setSalt(event.target.value)} />
      </Field>

      <Checkbox checked={uppercase} onChange={setUppercase} label="Uppercase hexadecimal output" />

      <div className="flex flex-wrap gap-2">
        <Button onClick={generate} loading={busy}>
          <Hash aria-hidden className="h-4 w-4" />
          {busy ? 'Hashing…' : 'Generate hashes'}
        </Button>
        <CopyButton
          value={
            results
              ? results.map((entry) => `${entry.algorithm}: ${entry.hex}`).join('\n')
              : ''
          }
          label="Copy all"
          disabled={!results}
        />
        <ResetButton onClick={reset} label="Clear" />
      </div>

      {results ? (
        <ResultPanel title="Digests">
          <div className="space-y-3">
            {results.map((entry) => (
              <div key={entry.algorithm} className="rounded-xl border border-line/10 bg-surface/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                    {entry.algorithm}
                  </span>
                  <CopyButton value={entry.hex} size="sm" variant="ghost" label="Copy hex" />
                </div>
                <code className="mt-1 block break-all font-mono text-xs text-fg">{entry.hex}</code>
                <code className="mt-1 block break-all font-mono text-[11px] text-muted">
                  base64: {entry.base64}
                </code>
              </div>
            ))}
          </div>
        </ResultPanel>
      ) : (
        <StatusMessage tone="info">
          Hashes are computed with the browser&apos;s Web Crypto API, so they match what your server
          produces. MD5 and CRC32 are not provided by Web Crypto, and we do not fake them.
        </StatusMessage>
      )}
    </div>
  );
}
