'use client';

import { useEffect, useState } from 'react';
import { FileDown } from 'lucide-react';
import { UploadBox } from '@/components/tools/UploadBox';
import { ResultPanel, SizeComparison, Stat, StatGrid } from '@/components/tools/ResultPanel';
import { Button } from '@/components/ui/Button';
import { CopyButton, DownloadButton, ResetButton } from '@/components/ui/Actions';
import { EmptyState, ProgressBar, StatusMessage } from '@/components/ui/Feedback';
import { Checkbox, Field, Segmented, Select, Slider, TextArea } from '@/components/ui/Inputs';
import { useToast } from '@/components/ui/Toast';
import { FileList, type FileListItem } from '@/components/tools/FileList';
import { changeExtension, formatBytes, percentSaved, sanitizeFilename } from '@/lib/utils';
import {
  bytesToBlob,
  compressPdf,
  extractPdfText,
  getPdfPageCount,
  mergePdfs,
  parsePageRanges,
  renderPdfPageToBlob,
  splitPdf,
  splitPdfEveryPage,
} from '@/lib/pdf';

/* ======================================================================== */
/*  PDF Merger                                                               */
/* ======================================================================== */

export function PdfMerger() {
  const { toast } = useToast();
  const [items, setItems] = useState<FileListItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ blob: Blob; pages: number } | null>(null);

  const addFiles = (files: File[]) => {
    const next = files.map((file) => ({
      id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 8)}`,
      file,
    }));
    setItems((current) => [...current, ...next]);
    setResult(null);
  };

  const remove = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
    setResult(null);
  };

  const move = (index: number, direction: -1 | 1) => {
    setItems((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const copy = [...current];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
    setResult(null);
  };

  const merge = async () => {
    if (items.length < 2) {
      toast({ title: 'Please select at least two PDF files.', variant: 'warning' });
      return;
    }
    setBusy(true);
    setProgress(0);
    setResult(null);
    try {
      const bytes = await mergePdfs(
        items.map((item) => item.file),
        (current, total) => setProgress((current / total) * 90)
      );
      setProgress(100);
      const blob = bytesToBlob(bytes);
      // Count pages in the merged document for the confirmation message.
      let pages = 0;
      try {
        pages = await getPdfPageCount(blob);
      } catch {
        pages = 0;
      }
      setResult({ blob, pages });
      toast({
        title: 'PDFs merged',
        description: `${items.length} files combined${pages ? ` into ${pages} pages` : ''}.`,
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Merge failed',
        description: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
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
  };

  return (
    <div className="space-y-5">
      <UploadBox
        accept="application/pdf,.pdf"
        multiple
        maxSizeMb={200}
        onFiles={addFiles}
        label="Drop PDF files to merge"
        hint="Add two or more PDFs — up to 200 MB each"
      />

      {items.length > 0 ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-fg">
              {items.length} file{items.length > 1 ? 's' : ''} ·{' '}
              {formatBytes(items.reduce((total, item) => total + item.file.size, 0))}
            </h3>
            <ResetButton onClick={reset} />
          </div>

          <FileList
            items={items}
            onRemove={remove}
            onMoveUp={(index) => move(index, -1)}
            onMoveDown={(index) => move(index, 1)}
            emptyLabel="No files selected yet."
          />

          {busy ? <ProgressBar value={progress} label="Merging documents" /> : null}

          {result ? (
            <ResultPanel title="Merged document" tone="success">
              <StatGrid>
                <Stat label="Pages" value={result.pages || '—'} />
                <Stat label="Files combined" value={items.length} />
                <Stat label="Size" value={formatBytes(result.blob.size)} highlight />
              </StatGrid>
              <div className="mt-4 flex flex-wrap gap-2">
                <DownloadButton blob={result.blob} filename="toolnova-merged.pdf" label="Download merged PDF" />
                <ResetButton onClick={reset} label="Reset tool" />
              </div>
            </ResultPanel>
          ) : null}

          <Button onClick={merge} loading={busy} disabled={items.length < 2} fullWidth>
            {busy ? 'Merging…' : `Merge ${items.length || ''} PDF${items.length === 1 ? '' : 's'}`}
          </Button>
          {items.length === 1 ? (
            <p className="text-center text-xs text-muted">Add at least one more PDF to enable merging.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/* ======================================================================== */
/*  PDF Splitter                                                             */
/* ======================================================================== */

export function PdfSplitter() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [mode, setMode] = useState<'range' | 'every'>('range');
  const [range, setRange] = useState('1-3');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [single, setSingle] = useState<{ blob: Blob; pages: number } | null>(null);
  const [many, setMany] = useState<{ name: string; blob: Blob }[]>([]);

  useEffect(() => {
    if (!file) return;
    setLoadingInfo(true);
    setPageCount(null);
    setSingle(null);
    setMany([]);
    getPdfPageCount(file)
      .then((count) => {
        setPageCount(count);
        setRange(`1-${Math.min(3, count)}`);
      })
      .catch(() => {
        toast({
          title: 'That PDF could not be read',
          description: 'It may be password protected or damaged.',
          variant: 'error',
        });
        setFile(null);
      })
      .finally(() => setLoadingInfo(false));
  }, [file, toast]);

  const split = async () => {
    if (!file) {
      toast({ title: 'Please select a file.', variant: 'warning' });
      return;
    }
    setBusy(true);
    setProgress(0);
    setSingle(null);
    setMany([]);

    try {
      if (mode === 'range') {
        const pages = parsePageRanges(range, pageCount ?? 0);
        if (pages.length === 0) {
          toast({
            title: 'Invalid page range',
            description: `Enter pages between 1 and ${pageCount ?? 0}, for example 1-3, 7, 10-12.`,
            variant: 'warning',
          });
          setBusy(false);
          return;
        }
        const bytes = await splitPdf(file, pages);
        setProgress(100);
        setSingle({ blob: bytesToBlob(bytes), pages: pages.length });
        toast({
          title: 'PDF split',
          description: `${pages.length} page${pages.length > 1 ? 's' : ''} extracted.`,
          variant: 'success',
        });
      } else {
        const results = await splitPdfEveryPage(file, (current, total) =>
          setProgress((current / total) * 100)
        );
        setMany(
          results.map((entry) => ({
            name: entry.name,
            blob: bytesToBlob(entry.bytes),
          }))
        );
        toast({
          title: 'PDF split',
          description: `${results.length} pages ready to download.`,
          variant: 'success',
        });
      }
    } catch (error) {
      toast({
        title: 'Split failed',
        description: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        variant: 'error',
      });
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPageCount(null);
    setSingle(null);
    setMany([]);
    setProgress(0);
    setMode('range');
    setRange('1-3');
  };

  return (
    <div className="space-y-5">
      {!file ? (
        <UploadBox
          accept="application/pdf,.pdf"
          maxSizeMb={200}
          onFiles={(files) => setFile(files[0])}
          label="Drop a PDF to split"
          hint="Up to 200 MB — the file never leaves your device"
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line/10 bg-surface/60 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft">
              <FileDown aria-hidden className="h-5 w-5 text-brand-purple" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-fg">{file.name}</p>
              <p className="text-xs text-muted">
                {loadingInfo ? 'Reading document…' : `${pageCount ?? '—'} pages · ${formatBytes(file.size)}`}
              </p>
            </div>
            <ResetButton onClick={reset} />
          </div>

          <Field label="Split mode" htmlFor="split-mode">
            <Segmented
              label="Split mode"
              value={mode}
              onChange={setMode}
              options={[
                { value: 'range', label: 'Extract page range' },
                { value: 'every', label: 'Every page separately' },
              ]}
            />
          </Field>

          {mode === 'range' ? (
            <Field
              label="Pages to extract"
              htmlFor="split-range"
              hint={`Use commas and dashes: 1-3, 7, 10-12. This PDF has ${pageCount ?? 0} pages.`}
            >
              <input
                id="split-range"
                value={range}
                onChange={(event) => setRange(event.target.value)}
                placeholder="1-3, 7, 10-12"
                className="h-11 w-full rounded-xl border border-line/12 bg-surface/70 px-3.5 font-mono text-[0.9375rem] text-fg"
              />
            </Field>
          ) : (
            <StatusMessage tone="info">
              Every page will be exported as its own PDF file. You can download them one by one below.
            </StatusMessage>
          )}

          {busy ? <ProgressBar value={progress} label="Splitting" /> : null}

          {single ? (
            <ResultPanel title="Extracted PDF" tone="success">
              <StatGrid>
                <Stat label="Pages" value={single.pages} />
                <Stat label="Size" value={formatBytes(single.blob.size)} highlight />
              </StatGrid>
              <div className="mt-4 flex flex-wrap gap-2">
                <DownloadButton
                  blob={single.blob}
                  filename={`${changeExtension(sanitizeFilename(file.name), 'pdf')}`.replace('.pdf', '-pages.pdf')}
                  label="Download split PDF"
                />
                <ResetButton onClick={reset} label="Reset tool" />
              </div>
            </ResultPanel>
          ) : null}

          {many.length > 0 ? (
            <ResultPanel title={`${many.length} pages ready`} tone="success">
              <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {many.map((entry) => (
                  <li
                    key={entry.name}
                    className="flex items-center justify-between gap-3 rounded-xl border border-line/10 bg-surface/60 px-3 py-2"
                  >
                    <span className="truncate text-xs text-muted">{entry.name}</span>
                    <DownloadButton blob={entry.blob} filename={entry.name} size="sm" label="Download" />
                  </li>
                ))}
              </ul>
              <div className="mt-3">
                <ResetButton onClick={reset} label="Reset tool" />
              </div>
            </ResultPanel>
          ) : null}

          <Button onClick={split} loading={busy} disabled={loadingInfo} fullWidth>
            {busy ? 'Splitting…' : 'Split PDF'}
          </Button>
        </>
      )}
    </div>
  );
}

/* ======================================================================== */
/*  PDF to Images                                                            */
/* ======================================================================== */

const SCALES = [
  { value: '1', label: '1× — screen view' },
  { value: '1.5', label: '1.5×' },
  { value: '2', label: '2× — presentations' },
  { value: '3', label: '3× — print quality' },
  { value: '4', label: '4× — maximum detail' },
];

export function PdfToImage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [page, setPage] = useState(1);
  const [allPages, setAllPages] = useState(false);
  const [scale, setScale] = useState('2');
  const [format, setFormat] = useState<'image/png' | 'image/jpeg'>('image/png');
  const [quality, setQuality] = useState(90);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ name: string; url: string; blob: Blob }[]>([]);

  useEffect(() => {
    if (!file) return;
    setLoadingInfo(true);
    setPageCount(null);
    setResults([]);
    getPdfPageCount(file)
      .then((count) => {
        setPageCount(count);
        setPage(1);
      })
      .catch(() => {
        toast({ title: 'That PDF could not be read.', variant: 'error' });
        setFile(null);
      })
      .finally(() => setLoadingInfo(false));
  }, [file, toast]);

  const convert = async () => {
    if (!file || !pageCount) {
      toast({ title: 'Please select a file.', variant: 'warning' });
      return;
    }
    setBusy(true);
    setProgress(0);
    setResults((current) => {
      current.forEach((entry) => URL.revokeObjectURL(entry.url));
      return [];
    });

    try {
      const targets = allPages
        ? Array.from({ length: pageCount }, (_, index) => index + 1)
        : [page];
      const output: { name: string; url: string; blob: Blob }[] = [];
      const base = changeExtension(sanitizeFilename(file.name), format === 'image/png' ? 'png' : 'jpg');

      for (let index = 0; index < targets.length; index += 1) {
        const rendered = await renderPdfPageToBlob(file, targets[index], {
          scale: Number(scale),
          format,
          quality: quality / 100,
        });
        const name =
          targets.length > 1
            ? base.replace(/\.(png|jpg)$/, `-page-${targets[index]}.$1`)
            : base;
        output.push({ name, url: rendered.url, blob: rendered.blob });
        setProgress(((index + 1) / targets.length) * 100);
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      setResults(output);
      toast({
        title: 'Page rendered',
        description: `${output.length} image${output.length > 1 ? 's' : ''} ready.`,
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Conversion failed',
        description: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        variant: 'error',
      });
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    results.forEach((entry) => URL.revokeObjectURL(entry.url));
    setFile(null);
    setPageCount(null);
    setResults([]);
    setPage(1);
    setAllPages(false);
    setScale('2');
    setFormat('image/png');
    setQuality(90);
  };

  return (
    <div className="space-y-5">
      {!file ? (
        <UploadBox
          accept="application/pdf,.pdf"
          maxSizeMb={200}
          onFiles={(files) => setFile(files[0])}
          label="Drop a PDF to convert"
          hint="Up to 200 MB — rendered locally with pdf.js"
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line/10 bg-surface/60 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft">
              <FileDown aria-hidden className="h-5 w-5 text-brand-purple" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-fg">{file.name}</p>
              <p className="text-xs text-muted">
                {loadingInfo ? 'Reading document…' : `${pageCount ?? '—'} pages · ${formatBytes(file.size)}`}
              </p>
            </div>
            <ResetButton onClick={reset} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Page" htmlFor="pdf-page">
              <Select
                id="pdf-page"
                value={String(page)}
                onChange={(event) => setPage(Number(event.target.value))}
                disabled={allPages || !pageCount}
              >
                {Array.from({ length: pageCount ?? 0 }, (_, index) => (
                  <option key={index + 1} value={index + 1}>
                    Page {index + 1}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Resolution" htmlFor="pdf-scale">
              <Select id="pdf-scale" value={scale} onChange={(event) => setScale(event.target.value)}>
                {SCALES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Output format" htmlFor="pdf-img-format">
              <Segmented
                label="Output format"
                value={format}
                onChange={setFormat}
                options={[
                  { value: 'image/png', label: 'PNG' },
                  { value: 'image/jpeg', label: 'JPG' },
                ]}
              />
            </Field>
            <Slider
              label="JPEG quality"
              value={quality}
              onChange={setQuality}
              min={40}
              max={100}
              valueLabel={`${quality}%`}
            />
          </div>

          <Checkbox checked={allPages} onChange={setAllPages} label="Convert every page" />

          {busy ? <ProgressBar value={progress} label="Rendering pages" /> : null}

          {results.length > 0 ? (
            <ResultPanel title="Rendered images" tone="success">
              <div className="grid gap-3 sm:grid-cols-2">
                {results.map((entry) => (
                  <figure key={entry.name} className="rounded-xl border border-line/10 bg-surface-2/50 p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={entry.url}
                      alt={entry.name}
                      className="max-h-56 w-full rounded-lg object-contain"
                    />
                    <figcaption className="mt-2 flex items-center justify-between gap-2 px-1">
                      <span className="truncate text-xs text-muted">{entry.name}</span>
                      <DownloadButton blob={entry.blob} filename={entry.name} size="sm" label="Download" />
                    </figcaption>
                  </figure>
                ))}
              </div>
              <div className="mt-4">
                <ResetButton onClick={reset} label="Reset tool" />
              </div>
            </ResultPanel>
          ) : null}

          <Button onClick={convert} loading={busy} disabled={loadingInfo} fullWidth>
            {busy ? 'Converting…' : 'Convert to image'}
          </Button>
        </>
      )}
    </div>
  );
}

/* ======================================================================== */
/*  PDF Compressor                                                           */
/* ======================================================================== */

const DPI_OPTIONS = [
  { value: '72', label: '72 dpi — smallest file, screen only' },
  { value: '110', label: '110 dpi — small, readable on screen' },
  { value: '150', label: '150 dpi — balanced (recommended)' },
  { value: '200', label: '200 dpi — high quality' },
  { value: '300', label: '300 dpi — print quality, large file' },
];

export function PdfCompressor() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [dpi, setDpi] = useState('150');
  const [quality, setQuality] = useState(70);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ blob: Blob; pages: number } | null>(null);

  useEffect(() => {
    if (!file) return;
    setResult(null);
    getPdfPageCount(file)
      .then(setPageCount)
      .catch(() => {
        toast({ title: 'That PDF could not be read.', variant: 'error' });
        setFile(null);
      });
  }, [file, toast]);

  const compress = async () => {
    if (!file) {
      toast({ title: 'Please select a file.', variant: 'warning' });
      return;
    }
    setBusy(true);
    setProgress(0);
    setResult(null);
    try {
      const { bytes, pages } = await compressPdf(
        file,
        { dpi: Number(dpi), quality: quality / 100 },
        (current, total) => setProgress((current / total) * 100)
      );
      setResult({ blob: bytesToBlob(bytes), pages });
      const saved = percentSaved(file.size, bytes.byteLength);
      toast({
        title: saved > 0 ? `Compressed by ${saved.toFixed(1)}%` : 'Compression complete',
        description:
          saved > 0
            ? `${formatBytes(file.size)} → ${formatBytes(bytes.byteLength)}`
            : 'This PDF was already compact — try a lower dpi setting.',
        variant: saved > 0 ? 'success' : 'info',
      });
    } catch (error) {
      toast({
        title: 'Compression failed',
        description: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        variant: 'error',
      });
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPageCount(null);
    setResult(null);
    setProgress(0);
    setDpi('150');
    setQuality(70);
  };

  return (
    <div className="space-y-5">
      {!file ? (
        <UploadBox
          accept="application/pdf,.pdf"
          maxSizeMb={200}
          onFiles={(files) => setFile(files[0])}
          label="Drop a PDF to compress"
          hint="Scanned documents shrink the most — up to 200 MB"
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line/10 bg-surface/60 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft">
              <FileDown aria-hidden className="h-5 w-5 text-brand-purple" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-fg">{file.name}</p>
              <p className="text-xs text-muted">
                {pageCount ? `${pageCount} pages · ` : ''}
                {formatBytes(file.size)}
              </p>
            </div>
            <ResetButton onClick={reset} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Resolution" htmlFor="pdf-dpi" hint="Lower dpi means a smaller file.">
              <Select id="pdf-dpi" value={dpi} onChange={(event) => setDpi(event.target.value)}>
                {DPI_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Slider
              label="Image quality"
              value={quality}
              onChange={setQuality}
              min={30}
              max={95}
              valueLabel={`${quality}%`}
            />
          </div>

          <StatusMessage tone="warning" title="Read this first">
            Compression re-renders each page as an image, so text in the compressed PDF is no longer
            selectable. Keep your original file if you need to search or edit it later.
          </StatusMessage>

          {busy ? <ProgressBar value={progress} label="Compressing pages" /> : null}

          {result ? (
            <ResultPanel title="Compressed PDF" tone="success">
              <SizeComparison original={file.size} result={result.blob.size} />
              <StatGrid className="mt-3">
                <Stat label="Pages" value={result.pages} />
                <Stat
                  label="Reduced by"
                  value={`${percentSaved(file.size, result.blob.size).toFixed(1)}%`}
                  highlight
                />
              </StatGrid>
              <div className="mt-4 flex flex-wrap gap-2">
                <DownloadButton
                  blob={result.blob}
                  filename={`${changeExtension(sanitizeFilename(file.name), 'pdf').replace(/\.pdf$/, '')}-compressed.pdf`}
                  label="Download compressed PDF"
                />
                <ResetButton onClick={reset} label="Reset tool" />
              </div>
            </ResultPanel>
          ) : null}

          <Button onClick={compress} loading={busy} fullWidth>
            {busy ? 'Compressing…' : 'Compress PDF'}
          </Button>
        </>
      )}
    </div>
  );
}

/* ======================================================================== */
/*  PDF to Text                                                              */
/* ======================================================================== */

export function PdfToText() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState('');
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [empty, setEmpty] = useState(false);

  const extract = async () => {
    if (!file) {
      toast({ title: 'Please select a file.', variant: 'warning' });
      return;
    }
    setBusy(true);
    setProgress(0);
    setText('');
    setEmpty(false);
    try {
      const result = await extractPdfText(file, (current, total) =>
        setProgress((current / total) * 100)
      );
      setText(result.text);
      setEmpty(result.empty);
      setPageCount(result.pages.length);
      if (result.empty) {
        toast({
          title: 'No extractable text found',
          description: 'This PDF looks like a scanned image, which needs OCR first.',
          variant: 'warning',
        });
      } else {
        toast({
          title: 'Text extracted',
          description: `${result.pages.length} page${result.pages.length > 1 ? 's' : ''} read.`,
          variant: 'success',
        });
      }
    } catch (error) {
      toast({
        title: 'Extraction failed',
        description: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        variant: 'error',
      });
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setFile(null);
    setText('');
    setEmpty(false);
    setPageCount(null);
    setProgress(0);
  };

  return (
    <div className="space-y-5">
      {!file ? (
        <UploadBox
          accept="application/pdf,.pdf"
          maxSizeMb={200}
          onFiles={(files) => setFile(files[0])}
          label="Drop a PDF to extract text"
          hint="Works best with text-based PDFs, not scans"
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line/10 bg-surface/60 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft">
              <FileDown aria-hidden className="h-5 w-5 text-brand-purple" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-fg">{file.name}</p>
              <p className="text-xs text-muted">{formatBytes(file.size)}</p>
            </div>
            <Button onClick={extract} loading={busy} size="sm">
              {busy ? 'Extracting…' : 'Extract text'}
            </Button>
            <ResetButton onClick={reset} />
          </div>

          {busy ? <ProgressBar value={progress} label="Reading pages" /> : null}

          {empty ? (
            <StatusMessage tone="warning" title="No text layer found">
              This PDF appears to be a scan or an image-only document, so there is no text to extract.
              We will not invent an OCR result — run the file through an OCR tool first, or use the PDF
              to Images tool to export the pages.
            </StatusMessage>
          ) : null}

          {text ? (
            <ResultPanel title="Extracted text" tone="success">
              <TextArea
                value={text}
                onChange={(event) => setText(event.target.value)}
                className="min-h-[220px] font-mono text-xs"
                aria-label="Extracted text"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <CopyButton value={text} label="Copy text" />
                <DownloadButton
                  blob={new Blob([text], { type: 'text/plain' })}
                  filename={`${changeExtension(sanitizeFilename(file.name), 'txt')}`}
                  label="Download .txt"
                  variant="outline"
                />
                <ResetButton onClick={reset} label="Reset tool" />
              </div>
              {pageCount ? (
                <p className="mt-2 text-xs text-muted">{pageCount} pages processed.</p>
              ) : null}
            </ResultPanel>
          ) : !busy ? (
            <EmptyState
              title="Nothing extracted yet"
              description="Press “Extract text” to read the text layer of this PDF."
            />
          ) : null}
        </>
      )}
    </div>
  );
}
