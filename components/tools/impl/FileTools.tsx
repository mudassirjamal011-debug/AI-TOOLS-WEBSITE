'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Loader2, QrCode, ShieldCheck } from 'lucide-react';
import { UploadBox, UploadButton } from '@/components/tools/UploadBox';
import { ResultPanel, Stat, StatGrid } from '@/components/tools/ResultPanel';
import { Button } from '@/components/ui/Button';
import { CopyButton, DownloadButton, ResetButton } from '@/components/ui/Actions';
import { ProgressBar, StatusMessage } from '@/components/ui/Feedback';
import { Checkbox, Field, Segmented, Select, Slider, TextArea } from '@/components/ui/Inputs';
import { useToast } from '@/components/ui/Toast';
import { FileList, type FileListItem } from '@/components/tools/FileList';
import { formatBytes, percentSaved } from '@/lib/utils';
import { decodeBase64, encodeBase64 } from '@/lib/text';
import { HASH_ALGORITHMS, hashFile, type HashAlgorithm } from '@/lib/hash';

/* ======================================================================== */
/*  ZIP Creator                                                              */
/* ======================================================================== */

const LEVELS = [
  { value: '0', label: 'Store — fastest, no compression' },
  { value: '1', label: 'Level 1 — fastest compression' },
  { value: '6', label: 'Level 6 — balanced (default)' },
  { value: '9', label: 'Level 9 — smallest file, slowest' },
];

export function ZipCreator() {
  const { toast } = useToast();
  const [items, setItems] = useState<FileListItem[]>([]);
  const [level, setLevel] = useState('6');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ blob: Blob; name: string; originalTotal: number } | null>(null);

  const addFiles = (files: File[]) => {
    setItems((current) => [
      ...current,
      ...files.map((file) => ({
        id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 8)}`,
        file,
      })),
    ]);
    setResult(null);
  };

  const remove = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
    setResult(null);
  };

  const create = async () => {
    if (items.length === 0) {
      toast({ title: 'Please add at least one file.', variant: 'warning' });
      return;
    }
    setBusy(true);
    setProgress(0);
    setResult(null);
    try {
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();
      const folder = zip.folder('toolnova-files') ?? zip;
      items.forEach((item) => folder.file(item.file.name, item.file));

      const blob = await zip.generateAsync(
        { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: Number(level) } },
        (metadata) => setProgress(metadata.percent)
      );

      const originalTotal = items.reduce((total, item) => total + item.file.size, 0);
      setResult({ blob, name: 'toolnova-files.zip', originalTotal });
      toast({
        title: 'Archive created',
        description: `${items.length} file${items.length > 1 ? 's' : ''} · ${formatBytes(blob.size)}`,
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Could not create the archive',
        description: 'Something went wrong. Please try again with fewer or smaller files.',
        variant: 'error',
      });
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setItems([]);
    setResult(null);
    setProgress(0);
    setLevel('6');
  };

  const totalSize = items.reduce((total, item) => total + item.file.size, 0);

  return (
    <div className="space-y-5">
      <UploadBox
        accept="*/*"
        multiple
        maxSizeMb={500}
        onFiles={addFiles}
        label="Drop files to zip"
        hint="Any file type — up to 500 MB each"
      />

      {items.length > 0 ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-fg">
              {items.length} file{items.length > 1 ? 's' : ''} · {formatBytes(totalSize)}
            </h3>
            <UploadButton accept="*/*" multiple maxSizeMb={500} onFiles={addFiles} variant="outline" size="sm">
              Add more
            </UploadButton>
          </div>

          <FileList items={items} onRemove={remove} />

          <Field label="Compression level" htmlFor="zip-level">
            <Select id="zip-level" value={level} onChange={(event) => setLevel(event.target.value)}>
              {LEVELS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>

          {busy ? <ProgressBar value={progress} label="Compressing" /> : null}

          {result ? (
            <ResultPanel title="Archive ready" tone="success">
              <SizeSummary original={result.originalTotal} result={result.blob.size} />
              <div className="mt-4 flex flex-wrap gap-2">
                <DownloadButton blob={result.blob} filename={result.name} label="Download ZIP" />
                <ResetButton onClick={reset} label="Reset tool" />
              </div>
            </ResultPanel>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button onClick={create} loading={busy}>
              {busy ? 'Creating…' : 'Create ZIP'}
            </Button>
            <ResetButton onClick={reset} variant="outline" />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SizeSummary({ original, result }: { original: number; result: number }) {
  const saved = percentSaved(original, result);
  return (
    <StatGrid>
      <Stat label="Original" value={formatBytes(original)} />
      <Stat label="Archive" value={formatBytes(result)} />
      <Stat
        label="Saved"
        value={`${saved.toFixed(1)}%`}
        highlight={saved > 0}
        hint={saved > 0 ? 'smaller' : 'already compressed'}
      />
    </StatGrid>
  );
}

/* ======================================================================== */
/*  QR Code Generator                                                        */
/* ======================================================================== */

type QrType = 'url' | 'text' | 'email' | 'phone' | 'wifi' | 'vcard';

const QR_TYPES: { value: QrType; label: string }[] = [
  { value: 'url', label: 'URL' },
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'wifi', label: 'Wi-Fi' },
  { value: 'vcard', label: 'vCard' },
];

const ECC_LEVELS = [
  { value: 'L', label: 'L — 7% recovery' },
  { value: 'M', label: 'M — 15% recovery' },
  { value: 'Q', label: 'Q — 25% recovery' },
  { value: 'H', label: 'H — 30% recovery' },
];

export function QrGenerator() {
  const { toast } = useToast();
  const [type, setType] = useState<QrType>('url');
  const [url, setUrl] = useState('https://toolnovaai.com');
  const [text, setText] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [phone, setPhone] = useState('');
  const [ssid, setSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiSecurity, setWifiSecurity] = useState('WPA');
  const [name, setName] = useState('');
  const [org, setOrg] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [vcardPhone, setVcardPhone] = useState('');
  const [vcardEmail, setVcardEmail] = useState('');
  const [vcardUrl, setVcardUrl] = useState('');

  const [size, setSize] = useState(320);
  const [margin, setMargin] = useState(2);
  const [level, setLevel] = useState('M');
  const [dark, setDark] = useState('#0b0b12');
  const [light, setLight] = useState('#ffffff');

  const [png, setPng] = useState<string | null>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payload = useMemo(() => {
    switch (type) {
      case 'url':
        return url.trim();
      case 'text':
        return text.trim();
      case 'email':
        if (!email.trim()) return '';
        return `mailto:${email.trim()}${
          subject.trim() ? `?subject=${encodeURIComponent(subject.trim())}` : ''
        }`;
      case 'phone':
        return phone.trim() ? `tel:${phone.trim().replace(/\s+/g, '')}` : '';
      case 'wifi':
        if (!ssid.trim()) return '';
        return `WIFI:T:${wifiSecurity};S:${ssid.trim()};P:${wifiPassword};;`;
      case 'vcard':
        if (!name.trim()) return '';
        return [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `N:${name.trim()}`,
          `FN:${name.trim()}`,
          org.trim() ? `ORG:${org.trim()}` : '',
          jobTitle.trim() ? `TITLE:${jobTitle.trim()}` : '',
          vcardPhone.trim() ? `TEL:${vcardPhone.trim()}` : '',
          vcardEmail.trim() ? `EMAIL:${vcardEmail.trim()}` : '',
          vcardUrl.trim() ? `URL:${vcardUrl.trim()}` : '',
          'END:VCARD',
        ]
          .filter(Boolean)
          .join('\n');
      default:
        return '';
    }
  }, [
    type,
    url,
    text,
    email,
    subject,
    phone,
    ssid,
    wifiPassword,
    wifiSecurity,
    name,
    org,
    jobTitle,
    vcardPhone,
    vcardEmail,
    vcardUrl,
  ]);

  useEffect(() => {
    let cancelled = false;
    const generate = async () => {
      if (!payload) {
        setPng(null);
        setSvg(null);
        setError(null);
        return;
      }
      setBusy(true);
      setError(null);
      try {
        const QRCode = (await import('qrcode')).default;
        const [dataUrl, svgString] = await Promise.all([
          QRCode.toDataURL(payload, {
            width: size,
            margin,
            errorCorrectionLevel: level as 'L' | 'M' | 'Q' | 'H',
            color: { dark, light },
          }),
          QRCode.toString(payload, {
            type: 'svg',
            width: size,
            margin,
            errorCorrectionLevel: level as 'L' | 'M' | 'Q' | 'H',
            color: { dark, light },
          }),
        ]);
        if (cancelled) return;
        setPng(dataUrl);
        setSvg(svgString);
      } catch {
        if (!cancelled) {
          setError('That content is too long for a QR code. Shorten the text or lower the error correction level.');
          setPng(null);
          setSvg(null);
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    };
    void generate();
    return () => {
      cancelled = true;
    };
  }, [payload, size, margin, level, dark, light]);

  const reset = () => {
    setType('url');
    setUrl('https://toolnovaai.com');
    setText('');
    setEmail('');
    setSubject('');
    setPhone('');
    setSsid('');
    setWifiPassword('');
    setName('');
    setOrg('');
    setJobTitle('');
    setVcardPhone('');
    setVcardEmail('');
    setVcardUrl('');
    setSize(320);
    setMargin(2);
    setLevel('M');
    setDark('#0b0b12');
    setLight('#ffffff');
  };

  const downloadPng = () => {
    if (!png) {
      toast({ title: 'Nothing to download yet.', variant: 'warning' });
      return;
    }
    const anchor = document.createElement('a');
    anchor.href = png;
    anchor.download = 'toolnova-qr-code.png';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    toast({ title: 'QR code downloaded', variant: 'success' });
  };

  return (
    <div className="space-y-5">
      <Segmented
        label="Content type"
        value={type}
        onChange={setType}
        options={QR_TYPES}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {type === 'url' ? (
          <Field label="URL" htmlFor="qr-url" className="sm:col-span-2">
            <input
              id="qr-url"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.com"
              className="h-11 w-full rounded-xl border border-line/12 bg-surface/70 px-3.5 text-[0.9375rem] text-fg"
            />
          </Field>
        ) : null}

        {type === 'text' ? (
          <Field label="Text" htmlFor="qr-text" className="sm:col-span-2">
            <TextArea
              id="qr-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Anything you want to encode…"
              className="min-h-[120px]"
            />
          </Field>
        ) : null}

        {type === 'email' ? (
          <>
            <Field label="Email address" htmlFor="qr-email">
              <input
                id="qr-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="hello@example.com"
                className="h-11 w-full rounded-xl border border-line/12 bg-surface/70 px-3.5 text-[0.9375rem] text-fg"
              />
            </Field>
            <Field label="Subject (optional)" htmlFor="qr-subject">
              <input
                id="qr-subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="h-11 w-full rounded-xl border border-line/12 bg-surface/70 px-3.5 text-[0.9375rem] text-fg"
              />
            </Field>
          </>
        ) : null}

        {type === 'phone' ? (
          <Field label="Phone number" htmlFor="qr-phone" className="sm:col-span-2">
            <input
              id="qr-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+1 555 010 2030"
              className="h-11 w-full rounded-xl border border-line/12 bg-surface/70 px-3.5 text-[0.9375rem] text-fg"
            />
          </Field>
        ) : null}

        {type === 'wifi' ? (
          <>
            <Field label="Network name (SSID)" htmlFor="qr-ssid">
              <input
                id="qr-ssid"
                value={ssid}
                onChange={(event) => setSsid(event.target.value)}
                className="h-11 w-full rounded-xl border border-line/12 bg-surface/70 px-3.5 text-[0.9375rem] text-fg"
              />
            </Field>
            <Field label="Password" htmlFor="qr-wifi-pass">
              <input
                id="qr-wifi-pass"
                value={wifiPassword}
                onChange={(event) => setWifiPassword(event.target.value)}
                className="h-11 w-full rounded-xl border border-line/12 bg-surface/70 px-3.5 text-[0.9375rem] text-fg"
              />
            </Field>
            <Field label="Security" htmlFor="qr-wifi-sec" className="sm:col-span-2">
              <Segmented
                label="Wi-Fi security"
                value={wifiSecurity}
                onChange={setWifiSecurity}
                options={[
                  { value: 'WPA', label: 'WPA/WPA2' },
                  { value: 'WEP', label: 'WEP' },
                  { value: 'nopass', label: 'Open' },
                ]}
              />
            </Field>
          </>
        ) : null}

        {type === 'vcard' ? (
          <>
            <Field label="Full name" htmlFor="qr-name">
              <input
                id="qr-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-11 w-full rounded-xl border border-line/12 bg-surface/70 px-3.5 text-[0.9375rem] text-fg"
              />
            </Field>
            <Field label="Organisation" htmlFor="qr-org">
              <input
                id="qr-org"
                value={org}
                onChange={(event) => setOrg(event.target.value)}
                className="h-11 w-full rounded-xl border border-line/12 bg-surface/70 px-3.5 text-[0.9375rem] text-fg"
              />
            </Field>
            <Field label="Job title" htmlFor="qr-title">
              <input
                id="qr-title"
                value={jobTitle}
                onChange={(event) => setJobTitle(event.target.value)}
                className="h-11 w-full rounded-xl border border-line/12 bg-surface/70 px-3.5 text-[0.9375rem] text-fg"
              />
            </Field>
            <Field label="Phone" htmlFor="qr-vcard-phone">
              <input
                id="qr-vcard-phone"
                value={vcardPhone}
                onChange={(event) => setVcardPhone(event.target.value)}
                className="h-11 w-full rounded-xl border border-line/12 bg-surface/70 px-3.5 text-[0.9375rem] text-fg"
              />
            </Field>
            <Field label="Email" htmlFor="qr-vcard-email">
              <input
                id="qr-vcard-email"
                type="email"
                value={vcardEmail}
                onChange={(event) => setVcardEmail(event.target.value)}
                className="h-11 w-full rounded-xl border border-line/12 bg-surface/70 px-3.5 text-[0.9375rem] text-fg"
              />
            </Field>
            <Field label="Website" htmlFor="qr-vcard-url">
              <input
                id="qr-vcard-url"
                value={vcardUrl}
                onChange={(event) => setVcardUrl(event.target.value)}
                className="h-11 w-full rounded-xl border border-line/12 bg-surface/70 px-3.5 text-[0.9375rem] text-fg"
              />
            </Field>
          </>
        ) : null}
      </div>

      <div className="grid gap-4 rounded-2xl border border-line/10 bg-surface/60 p-4 sm:grid-cols-2">
        <Slider label="Size" value={size} onChange={setSize} min={128} max={1024} step={32} valueLabel={`${size} px`} />
        <Slider label="Quiet zone" value={margin} onChange={setMargin} min={0} max={8} valueLabel={`${margin} modules`} />
        <Field label="Error correction" htmlFor="qr-level">
          <Select id="qr-level" value={level} onChange={(event) => setLevel(event.target.value)}>
            {ECC_LEVELS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Foreground" htmlFor="qr-dark">
            <input
              id="qr-dark"
              type="color"
              value={dark}
              onChange={(event) => setDark(event.target.value)}
              className="h-11 w-full cursor-pointer rounded-xl border border-line/12 bg-surface p-1"
            />
          </Field>
          <Field label="Background" htmlFor="qr-light">
            <input
              id="qr-light"
              type="color"
              value={light}
              onChange={(event) => setLight(event.target.value)}
              className="h-11 w-full cursor-pointer rounded-xl border border-line/12 bg-surface p-1"
            />
          </Field>
        </div>
      </div>

      {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}

      <div className="flex flex-col items-center gap-4 rounded-2xl border border-line/10 bg-surface/60 p-6 sm:flex-row sm:items-start">
        <div className="flex min-h-[180px] min-w-[180px] items-center justify-center rounded-xl border border-line/10 bg-white p-3">
          {busy ? (
            <Loader2 aria-hidden className="h-6 w-6 animate-spin text-muted" />
          ) : png ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={png} alt="Generated QR code" style={{ width: 180, height: 180 }} />
          ) : (
            <QrCode aria-hidden className="h-10 w-10 text-muted" />
          )}
        </div>
        <div className="flex-1 space-y-3">
          <p className="text-sm text-muted">
            {payload ? (
              <>
                Encoded content: <span className="break-all font-mono text-xs text-fg">{payload}</span>
              </>
            ) : (
              'Fill in the fields above to generate a QR code.'
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={downloadPng} disabled={!png}>
              <Download aria-hidden className="h-4 w-4" />
              Download PNG
            </Button>
            <DownloadButton
              blob={svg ? new Blob([svg], { type: 'image/svg+xml' }) : null}
              filename="toolnova-qr-code.svg"
              label="Download SVG"
              variant="outline"
            />
            <CopyButton value={payload} label="Copy content" disabled={!payload} variant="outline" />
            <ResetButton onClick={reset} variant="ghost" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======================================================================== */
/*  Base64 Encoder / Decoder                                                 */
/* ======================================================================== */

export function Base64Tool() {
  const { toast } = useToast();
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [urlSafe, setUrlSafe] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const run = () => {
    setError(null);
    if (!input) {
      toast({ title: 'Please enter or upload something first.', variant: 'warning' });
      return;
    }
    try {
      setOutput(mode === 'encode' ? encodeBase64(input, urlSafe) : decodeBase64(input, urlSafe));
    } catch {
      setError(
        mode === 'decode'
          ? 'That is not valid Base64. Check for missing padding or characters outside the alphabet.'
          : 'Encoding failed. Please try again.'
      );
      setOutput('');
    }
  };

  const encodeFile = async (selected: File) => {
    setFile(selected);
    setError(null);
    try {
      const buffer = await selected.arrayBuffer();
      let binary = '';
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
      let encoded = btoa(binary);
      if (urlSafe) encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      setOutput(encoded);
      toast({
        title: 'File encoded',
        description: `${selected.name} · ${formatBytes(encoded.length)} of Base64`,
        variant: 'success',
      });
    } catch {
      setError('That file could not be read.');
    }
  };

  const reset = () => {
    setInput('');
    setOutput('');
    setError(null);
    setFile(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          label="Mode"
          value={mode}
          onChange={setMode}
          className="max-w-xs"
          options={[
            { value: 'encode', label: 'Encode' },
            { value: 'decode', label: 'Decode' },
          ]}
        />
        <Checkbox checked={urlSafe} onChange={setUrlSafe} label="URL-safe alphabet (-_)" />
      </div>

      <Field label={mode === 'encode' ? 'Text to encode' : 'Base64 to decode'} htmlFor="b64-main-input">
        <TextArea
          id="b64-main-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={mode === 'encode' ? 'Type or paste text…' : 'Paste Base64…'}
          className="min-h-[150px] font-mono text-xs"
          spellCheck={false}
        />
      </Field>

      {mode === 'encode' ? (
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="sr-only"
            onChange={(event) => {
              const selected = event.target.files?.[0];
              if (selected) void encodeFile(selected);
              event.target.value = '';
            }}
          />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            Encode a file instead
          </Button>
          {file ? <span className="text-xs text-muted">{file.name}</span> : null}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button onClick={run}>{mode === 'encode' ? 'Encode' : 'Decode'}</Button>
        <CopyButton value={output} label="Copy result" disabled={!output} />
        <DownloadButton
          blob={output ? new Blob([output], { type: 'text/plain' }) : null}
          filename={mode === 'encode' ? 'toolnova-base64.txt' : 'toolnova-decoded.txt'}
          label="Download"
          variant="outline"
        />
        <ResetButton onClick={reset} label="Clear" />
      </div>

      {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}

      <Field label="Result" htmlFor="b64-main-output">
        <TextArea
          id="b64-main-output"
          value={output}
          readOnly
          onFocus={(event) => event.currentTarget.select()}
          placeholder="Your result appears here…"
          className="min-h-[150px] font-mono text-xs"
        />
      </Field>
    </div>
  );
}

/* ======================================================================== */
/*  File Checksum                                                            */
/* ======================================================================== */

export function FileHash() {
  const { toast } = useToast();
  const [items, setItems] = useState<FileListItem[]>([]);
  const [algorithms, setAlgorithms] = useState<HashAlgorithm[]>(['SHA-256']);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<
    { id: string; name: string; size: number; digests: Record<string, { hex: string; base64: string }> }[]
  >([]);

  const addFiles = (files: File[]) => {
    setItems((current) => [
      ...current,
      ...files.map((file) => ({
        id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 8)}`,
        file,
      })),
    ]);
    setResults([]);
  };

  const remove = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
    setResults((current) => current.filter((entry) => entry.id !== id));
  };

  const calculate = async () => {
    if (items.length === 0) {
      toast({ title: 'Please select a file.', variant: 'warning' });
      return;
    }
    if (algorithms.length === 0) {
      toast({ title: 'Select at least one algorithm.', variant: 'warning' });
      return;
    }
    setBusy(true);
    setProgress(0);
    setResults([]);
    const collected: typeof results = [];
    try {
      for (let index = 0; index < items.length; index += 1) {
        const item = items[index];
        const digests = await hashFile(item.file, algorithms, (percent) =>
          setProgress(((index + percent / 100) / items.length) * 100)
        );
        collected.push({ id: item.id, name: item.file.name, size: item.file.size, digests });
      }
      setResults(collected);
      toast({
        title: 'Checksums calculated',
        description: `${collected.length} file${collected.length > 1 ? 's' : ''} hashed locally.`,
        variant: 'success',
      });
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
    setItems([]);
    setResults([]);
    setProgress(0);
  };

  const toggle = (algorithm: HashAlgorithm) => {
    setAlgorithms((current) =>
      current.includes(algorithm)
        ? current.filter((entry) => entry !== algorithm)
        : [...current, algorithm]
    );
  };

  return (
    <div className="space-y-5">
      <UploadBox
        accept="*/*"
        multiple
        maxSizeMb={250}
        onFiles={addFiles}
        label="Drop files to hash"
        hint="Up to 250 MB per file — hashed with the Web Crypto API"
      />

      {items.length > 0 ? (
        <div className="space-y-4">
          <FileList items={items} onRemove={remove} />

          <div>
            <p className="mb-2 text-sm font-medium text-fg">Algorithms</p>
            <div className="flex flex-wrap gap-4">
              {HASH_ALGORITHMS.map((algorithm) => (
                <Checkbox
                  key={algorithm}
                  checked={algorithms.includes(algorithm)}
                  onChange={() => toggle(algorithm)}
                  label={algorithm}
                />
              ))}
            </div>
          </div>

          {busy ? <ProgressBar value={progress} label="Hashing" /> : null}

          {results.length > 0 ? (
            <ResultPanel title="Checksums" tone="success">
              <div className="space-y-4">
                {results.map((entry) => (
                  <div key={entry.id} className="rounded-xl border border-line/10 bg-surface/60 p-3">
                    <p className="truncate text-sm font-semibold text-fg">{entry.name}</p>
                    <p className="text-xs text-muted">{formatBytes(entry.size)}</p>
                    <dl className="mt-2 space-y-2">
                      {Object.entries(entry.digests).map(([algorithm, value]) => (
                        <div key={algorithm}>
                          <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                            {algorithm}
                          </dt>
                          <dd className="mt-0.5 flex items-start gap-2">
                            <code className="min-w-0 flex-1 break-all font-mono text-[11px] text-fg">
                              {value.hex}
                            </code>
                            <CopyButton value={value.hex} size="sm" variant="ghost" label="Copy" />
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <DownloadButton
                  blob={
                    new Blob(
                      [
                        results
                          .map((entry) =>
                            Object.entries(entry.digests)
                              .map(([algorithm, value]) => `${value.hex}  ${entry.name} (${algorithm})`)
                              .join('\n')
                          )
                          .join('\n'),
                      ],
                      { type: 'text/plain' }
                    )
                  }
                  filename="toolnova-checksums.txt"
                  label="Download all"
                  variant="outline"
                />
                <ResetButton onClick={reset} label="Reset tool" />
              </div>
            </ResultPanel>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button onClick={calculate} loading={busy}>
              <ShieldCheck aria-hidden className="h-4 w-4" />
              {busy ? 'Calculating…' : 'Calculate checksums'}
            </Button>
            <ResetButton onClick={reset} variant="outline" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
