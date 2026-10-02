'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Crop as CropIcon, Loader2 } from 'lucide-react';
import { UploadBox } from '@/components/tools/UploadBox';
import { ResultPanel, SizeComparison, Stat, StatGrid } from '@/components/tools/ResultPanel';
import { Button } from '@/components/ui/Button';
import { CopyButton, DownloadButton, ResetButton } from '@/components/ui/Actions';
import { ProgressBar, StatusMessage } from '@/components/ui/Feedback';
import { Checkbox, Field, Segmented, Select, Slider, TextArea } from '@/components/ui/Inputs';
import { useToast } from '@/components/ui/Toast';
import { changeExtension, cn, formatBytes, percentSaved, sanitizeFilename } from '@/lib/utils';
import {
  compressImage,
  cropImage,
  dataUrlToBlob,
  extensionForMime,
  fileToDataUrl,
  loadImage,
  processImage,
  watermarkImage,
  type ImageMime,
  type WatermarkOptions,
} from '@/lib/image';
import { imagesToPdf, bytesToBlob } from '@/lib/pdf';
import type { FileListItem } from '@/components/tools/FileList';
import { FileList } from '@/components/tools/FileList';

const MAX_WIDTH_OPTIONS = [
  { value: '0', label: 'Original size' },
  { value: '3840', label: '3840 px (4K)' },
  { value: '2560', label: '2560 px' },
  { value: '1920', label: '1920 px (Full HD)' },
  { value: '1600', label: '1600 px' },
  { value: '1280', label: '1280 px (HD)' },
  { value: '1024', label: '1024 px' },
  { value: '800', label: '800 px (web small)' },
];

/* ======================================================================== */
/*  Image Compressor                                                         */
/* ======================================================================== */

export function ImageCompressor() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [quality, setQuality] = useState(70);
  const [maxWidth, setMaxWidth] = useState('0');
  const [keepTransparency, setKeepTransparency] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    blob: Blob;
    url: string;
    width: number;
    height: number;
    mime: string;
  } | null>(null);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setQuality(70);
    setMaxWidth('0');
    setKeepTransparency(false);
  };

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const compress = async () => {
    if (!file) {
      toast({ title: 'Please select a file.', variant: 'warning' });
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const output = await compressImage(file, {
        quality: quality / 100,
        maxWidth: maxWidth === '0' ? null : Number(maxWidth),
        keepTransparency,
      });
      setResult(output);
      const saved = percentSaved(file.size, output.blob.size);
      toast({
        title: saved > 0 ? `Compressed by ${saved.toFixed(1)}%` : 'Compression complete',
        description:
          saved > 0
            ? `${formatBytes(file.size)} → ${formatBytes(output.blob.size)}`
            : 'This image was already well optimised.',
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

  return (
    <div className="space-y-5">
      {!file ? (
        <UploadBox
          accept="image/*"
          maxSizeMb={60}
          onFiles={(files) => {
            setResult(null);
            setFile(files[0]);
          }}
          label="Drop an image to compress"
          hint="JPG, PNG, WebP, GIF, BMP — up to 60 MB"
        />
      ) : (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <figure className="overflow-hidden rounded-2xl border border-line/10 bg-surface-2/50">
              <div className="flex items-center justify-between border-b border-line/10 px-3 py-2 text-xs font-semibold text-muted">
                Original
                <span className="tabular-nums">{formatBytes(file.size)}</span>
              </div>
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Original image preview" className="max-h-64 w-full object-contain" />
              ) : null}
            </figure>

            <figure className="overflow-hidden rounded-2xl border border-line/10 bg-surface-2/50">
              <div className="flex items-center justify-between border-b border-line/10 px-3 py-2 text-xs font-semibold text-muted">
                Compressed
                <span className="tabular-nums">{result ? formatBytes(result.blob.size) : '—'}</span>
              </div>
              <div className="flex min-h-[8rem] items-center justify-center">
                {busy ? (
                  <span className="flex items-center gap-2 py-10 text-sm text-muted">
                    <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> Compressing…
                  </span>
                ) : result ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={result.url}
                    alt="Compressed image preview"
                    className="max-h-64 w-full object-contain"
                  />
                ) : (
                  <span className="px-4 py-10 text-center text-sm text-muted">
                    Press Compress to see the result.
                  </span>
                )}
              </div>
            </figure>
          </div>

          <div className="rounded-2xl border border-line/10 bg-surface/60 p-4">
            <div className="grid gap-5 sm:grid-cols-2">
              <Slider
                label="Quality"
                value={quality}
                onChange={setQuality}
                min={10}
                max={100}
                step={1}
                valueLabel={`${quality}%`}
              />
              <Field label="Maximum width" htmlFor="compress-max-width">
                <Select
                  id="compress-max-width"
                  value={maxWidth}
                  onChange={(event) => setMaxWidth(event.target.value)}
                >
                  {MAX_WIDTH_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="mt-4">
              <Checkbox
                checked={keepTransparency}
                onChange={setKeepTransparency}
                label="Keep transparency (WebP or PNG output only)"
              />
            </div>
          </div>

          {result ? (
            <ResultPanel title="Result" tone="success">
              <SizeComparison original={file.size} result={result.blob.size} />
              <StatGrid className="mt-3">
                <Stat label="Format" value={extensionForMime(result.mime).toUpperCase()} />
                <Stat label="Dimensions" value={`${result.width} × ${result.height}`} />
                <Stat
                  label="Saved"
                  value={`${formatBytes(Math.max(0, file.size - result.blob.size))}`}
                  highlight
                />
              </StatGrid>
              <div className="mt-4 flex flex-wrap gap-2">
                <DownloadButton
                  blob={result.blob}
                  filename={changeExtension(sanitizeFilename(file.name), extensionForMime(result.mime))}
                  label="Download compressed image"
                />
                <CopyButton value={() => `${formatBytes(file.size)} → ${formatBytes(result.blob.size)}`} label="Copy stats" />
                <ResetButton onClick={reset} label="Reset tool" />
              </div>
            </ResultPanel>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button onClick={compress} loading={busy} disabled={!file}>
              {busy ? 'Compressing…' : 'Compress image'}
            </Button>
            <Button variant="outline" onClick={() => document.getElementById('replace-image')?.click()}>
              Replace image
            </Button>
            <ResetButton onClick={reset} variant="outline" />
          </div>
          <input
            id="replace-image"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              const next = event.target.files?.[0];
              if (next) {
                setResult(null);
                setFile(next);
              }
              event.target.value = '';
            }}
          />
        </div>
      )}
    </div>
  );
}

/* ======================================================================== */
/*  Image Resizer                                                            */
/* ======================================================================== */

export function ImageResizer() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lock, setLock] = useState(true);
  const [format, setFormat] = useState<ImageMime | 'auto'>('auto');
  const [quality, setQuality] = useState(90);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; url: string; width: number; height: number; mime: string } | null>(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    loadImage(file)
      .then((image) => {
        setNatural({ width: image.width, height: image.height });
        setWidth(image.width);
        setHeight(image.height);
      })
      .catch(() => toast({ title: 'That file could not be read as an image.', variant: 'error' }));
    return () => URL.revokeObjectURL(url);
  }, [file, toast]);

  const ratio = natural && natural.height ? natural.width / natural.height : 1;

  const updateWidth = (value: number) => {
    const next = Number.isFinite(value) ? Math.max(1, Math.round(value)) : 0;
    setWidth(next);
    if (lock) setHeight(Math.max(1, Math.round(next / ratio)));
  };

  const updateHeight = (value: number) => {
    const next = Number.isFinite(value) ? Math.max(1, Math.round(value)) : 0;
    setHeight(next);
    if (lock) setWidth(Math.max(1, Math.round(next * ratio)));
  };

  const resize = async () => {
    if (!file) {
      toast({ title: 'Please select a file.', variant: 'warning' });
      return;
    }
    if (!width || !height) {
      toast({ title: 'Please enter a valid width and height.', variant: 'warning' });
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const output = await processImage(file, {
        format,
        quality: quality / 100,
        maxWidth: width,
        maxHeight: height,
      });
      setResult(output);
      toast({ title: 'Image resized', variant: 'success' });
    } catch (error) {
      toast({
        title: 'Resize failed',
        description: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        variant: 'error',
      });
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setNatural(null);
    setResult(null);
    setWidth(0);
    setHeight(0);
    setLock(true);
    setFormat('auto');
    setQuality(90);
  };

  return (
    <div className="space-y-5">
      {!file ? (
        <UploadBox
          accept="image/*"
          maxSizeMb={60}
          onFiles={(files) => setFile(files[0])}
          label="Drop an image to resize"
          hint="JPG, PNG, WebP — up to 60 MB"
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <figure className="overflow-hidden rounded-2xl border border-line/10 bg-surface-2/50">
              <figcaption className="border-b border-line/10 px-3 py-2 text-xs font-semibold text-muted">
                Original {natural ? `· ${natural.width} × ${natural.height}` : ''}
              </figcaption>
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Original image" className="max-h-56 w-full object-contain" />
              ) : null}
            </figure>
            <figure className="overflow-hidden rounded-2xl border border-line/10 bg-surface-2/50">
              <figcaption className="border-b border-line/10 px-3 py-2 text-xs font-semibold text-muted">
                Result {result ? `· ${result.width} × ${result.height}` : ''}
              </figcaption>
              <div className="flex min-h-[8rem] items-center justify-center">
                {busy ? (
                  <Loader2 aria-hidden className="h-5 w-5 animate-spin text-muted" />
                ) : result ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={result.url} alt="Resized image" className="max-h-56 w-full object-contain" />
                ) : (
                  <span className="px-4 text-center text-sm text-muted">Your resized image appears here.</span>
                )}
              </div>
            </figure>
          </div>

          <div className="rounded-2xl border border-line/10 bg-surface/60 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Width (px)" htmlFor="resize-width">
                <input
                  id="resize-width"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={width || ''}
                  onChange={(event) => updateWidth(Number(event.target.value))}
                  className="h-11 w-full rounded-xl border border-line/12 bg-surface/70 px-3.5 text-[0.9375rem] text-fg"
                />
              </Field>
              <Field label="Height (px)" htmlFor="resize-height">
                <input
                  id="resize-height"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={height || ''}
                  onChange={(event) => updateHeight(Number(event.target.value))}
                  className="h-11 w-full rounded-xl border border-line/12 bg-surface/70 px-3.5 text-[0.9375rem] text-fg"
                />
              </Field>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Output format" htmlFor="resize-format">
                <Select
                  id="resize-format"
                  value={format}
                  onChange={(event) => setFormat(event.target.value as ImageMime | 'auto')}
                >
                  <option value="auto">Same as original</option>
                  <option value="image/jpeg">JPG</option>
                  <option value="image/png">PNG</option>
                  <option value="image/webp">WebP</option>
                </Select>
              </Field>
              <Slider
                label="Quality"
                value={quality}
                onChange={setQuality}
                min={30}
                max={100}
                valueLabel={`${quality}%`}
              />
            </div>

            <div className="mt-4">
              <Checkbox checked={lock} onChange={setLock} label="Lock aspect ratio" />
            </div>
          </div>

          {result ? (
            <ResultPanel title="Result" tone="success">
              <SizeComparison original={file.size} result={result.blob.size} />
              <div className="mt-4 flex flex-wrap gap-2">
                <DownloadButton
                  blob={result.blob}
                  filename={changeExtension(sanitizeFilename(file.name), extensionForMime(result.mime))}
                  label="Download resized image"
                />
                <ResetButton onClick={reset} label="Reset tool" />
              </div>
            </ResultPanel>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button onClick={resize} loading={busy}>
              {busy ? 'Resizing…' : 'Resize image'}
            </Button>
            <ResetButton onClick={reset} variant="outline" />
          </div>
        </>
      )}
    </div>
  );
}

/* ======================================================================== */
/*  Image Converter                                                          */
/* ======================================================================== */

export function ImageConverter() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [format, setFormat] = useState<ImageMime>('image/webp');
  const [quality, setQuality] = useState(85);
  const [background, setBackground] = useState('#ffffff');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; url: string; width: number; height: number; mime: string } | null>(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setFormat('image/webp');
    setQuality(85);
    setBackground('#ffffff');
  };

  const convert = async () => {
    if (!file) {
      toast({ title: 'Please select a file.', variant: 'warning' });
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const output = await processImage(file, { format, quality: quality / 100, background });
      setResult(output);
      toast({
        title: 'Image converted',
        description: `Now ${extensionForMime(output.mime).toUpperCase()} · ${formatBytes(output.blob.size)}`,
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

  return (
    <div className="space-y-5">
      {!file ? (
        <UploadBox
          accept="image/*"
          maxSizeMb={60}
          onFiles={(files) => setFile(files[0])}
          label="Drop an image to convert"
          hint="Any image your browser can open — up to 60 MB"
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <figure className="overflow-hidden rounded-2xl border border-line/10 bg-surface-2/50">
              <figcaption className="border-b border-line/10 px-3 py-2 text-xs font-semibold text-muted">
                Original · {file.type.replace('image/', '').toUpperCase()}
              </figcaption>
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Original image" className="max-h-56 w-full object-contain" />
              ) : null}
            </figure>
            <figure className="overflow-hidden rounded-2xl border border-line/10 bg-surface-2/50">
              <figcaption className="border-b border-line/10 px-3 py-2 text-xs font-semibold text-muted">
                Converted {result ? `· ${extensionForMime(result.mime).toUpperCase()}` : ''}
              </figcaption>
              <div className="flex min-h-[8rem] items-center justify-center">
                {busy ? (
                  <Loader2 aria-hidden className="h-5 w-5 animate-spin text-muted" />
                ) : result ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={result.url} alt="Converted image" className="max-h-56 w-full object-contain" />
                ) : (
                  <span className="px-4 text-center text-sm text-muted">Your converted image appears here.</span>
                )}
              </div>
            </figure>
          </div>

          <div className="rounded-2xl border border-line/10 bg-surface/60 p-4">
            <Field label="Convert to" htmlFor="convert-format">
              <Segmented
                label="Output format"
                value={format}
                onChange={setFormat}
                options={[
                  { value: 'image/jpeg', label: 'JPG' },
                  { value: 'image/png', label: 'PNG' },
                  { value: 'image/webp', label: 'WebP' },
                ]}
              />
            </Field>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Slider
                label="Quality"
                value={quality}
                onChange={setQuality}
                min={30}
                max={100}
                valueLabel={`${quality}%`}
              />
              {format === 'image/jpeg' ? (
                <Field label="Background for transparent areas" htmlFor="convert-bg">
                  <div className="flex items-center gap-2">
                    <input
                      id="convert-bg"
                      type="color"
                      value={background}
                      onChange={(event) => setBackground(event.target.value)}
                      className="h-11 w-14 cursor-pointer rounded-xl border border-line/12 bg-surface p-1"
                    />
                    <span className="text-sm text-muted">{background}</span>
                  </div>
                </Field>
              ) : null}
            </div>
          </div>

          {result ? (
            <ResultPanel title="Result" tone="success">
              <SizeComparison original={file.size} result={result.blob.size} />
              <div className="mt-4 flex flex-wrap gap-2">
                <DownloadButton
                  blob={result.blob}
                  filename={changeExtension(sanitizeFilename(file.name), extensionForMime(result.mime))}
                  label="Download converted image"
                />
                <ResetButton onClick={reset} label="Reset tool" />
              </div>
            </ResultPanel>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button onClick={convert} loading={busy}>
              {busy ? 'Converting…' : 'Convert image'}
            </Button>
            <ResetButton onClick={reset} variant="outline" />
          </div>
        </>
      )}
    </div>
  );
}

/* ======================================================================== */
/*  Image Cropper                                                            */
/* ======================================================================== */

type Handle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

const RATIOS = [
  { value: 'free', label: 'Free' },
  { value: '1', label: '1:1' },
  { value: '1.7778', label: '16:9' },
  { value: '1.3333', label: '4:3' },
  { value: '1.5', label: '3:2' },
  { value: '0.5625', label: '9:16' },
];

export function ImageCropper() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [ratio, setRatio] = useState('free');
  const [format, setFormat] = useState<ImageMime>('image/png');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; url: string; width: number; height: number } | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ type: 'move' | Handle; startX: number; startY: number; start: typeof crop } | null>(
    null
  );
  const scaleRef = useRef(1);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    loadImage(file)
      .then((image) => {
        setNatural({ width: image.width, height: image.height });
        const size = Math.min(image.width, image.height) * 0.8;
        setCrop({
          x: Math.round((image.width - size) / 2),
          y: Math.round((image.height - size) / 2),
          width: Math.round(size),
          height: Math.round(size),
        });
      })
      .catch(() => toast({ title: 'That file could not be read as an image.', variant: 'error' }));
    return () => URL.revokeObjectURL(url);
  }, [file, toast]);

  // Keep the selection inside the image and honour the aspect ratio.
  const clampCrop = useCallback(
    (next: { x: number; y: number; width: number; height: number }) => {
      if (!natural) return next;
      const ratioValue = ratio === 'free' ? null : Number(ratio);
      let { x, y, width, height } = next;

      width = Math.max(20, Math.min(width, natural.width));
      height = Math.max(20, Math.min(height, natural.height));

      if (ratioValue) {
        if (width / height > ratioValue) height = Math.round(width / ratioValue);
        else width = Math.round(height * ratioValue);
        if (height > natural.height) {
          height = natural.height;
          width = Math.round(height * ratioValue);
        }
        if (width > natural.width) {
          width = natural.width;
          height = Math.round(width / ratioValue);
        }
      }

      x = Math.max(0, Math.min(x, natural.width - width));
      y = Math.max(0, Math.min(y, natural.height - height));
      return { x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) };
    },
    [natural, ratio]
  );

  const onPointerDown = (type: 'move' | Handle) => (event: React.PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
    dragRef.current = { type, startX: event.clientX, startY: event.clientY, start: crop };
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || !natural) return;
    const scale = scaleRef.current || 1;
    const dx = (event.clientX - drag.startX) / scale;
    const dy = (event.clientY - drag.startY) / scale;

    if (drag.type === 'move') {
      setCrop(clampCrop({ ...drag.start, x: drag.start.x + dx, y: drag.start.y + dy }));
      return;
    }

    let { x, y, width, height } = drag.start;
    if (drag.type.includes('e')) width = drag.start.width + dx;
    if (drag.type.includes('s')) height = drag.start.height + dy;
    if (drag.type.includes('w')) {
      width = drag.start.width - dx;
      x = drag.start.x + dx;
    }
    if (drag.type.includes('n')) {
      height = drag.start.height - dy;
      y = drag.start.y + dy;
    }
    setCrop(clampCrop({ x, y, width, height }));
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  const applyCrop = async () => {
    if (!file) {
      toast({ title: 'Please select a file.', variant: 'warning' });
      return;
    }
    if (crop.width < 20 || crop.height < 20) {
      toast({ title: 'The crop area is too small.', variant: 'warning' });
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const output = await cropImage(file, crop, { format, quality: 0.92 });
      setResult(output);
      toast({ title: 'Image cropped', variant: 'success' });
    } catch (error) {
      toast({
        title: 'Cropping failed',
        description: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        variant: 'error',
      });
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setNatural(null);
    setResult(null);
    setRatio('free');
    setFormat('image/png');
    setCrop({ x: 0, y: 0, width: 0, height: 0 });
  };

  const selectAll = () => {
    if (!natural) return;
    setCrop(clampCrop({ x: 0, y: 0, width: natural.width, height: natural.height }));
  };

  // Measure the rendered image so pointer deltas map to natural pixels.
  const onImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const element = event.currentTarget;
    if (natural) scaleRef.current = element.clientWidth / natural.width;
  };

  const handles: { type: Handle; className: string }[] = [
    { type: 'nw', className: 'left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize' },
    { type: 'n', className: 'left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize' },
    { type: 'ne', className: 'right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize' },
    { type: 'e', className: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2 cursor-ew-resize' },
    { type: 'se', className: 'right-0 bottom-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize' },
    { type: 's', className: 'left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-ns-resize' },
    { type: 'sw', className: 'left-0 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize' },
    { type: 'w', className: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize' },
  ];

  return (
    <div className="space-y-5">
      {!file ? (
        <UploadBox
          accept="image/*"
          maxSizeMb={60}
          onFiles={(files) => setFile(files[0])}
          label="Drop an image to crop"
          hint="Drag on the image to draw a crop box"
        />
      ) : (
        <>
          <div
            ref={stageRef}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            className="relative touch-none select-none overflow-hidden rounded-2xl border border-line/10 bg-[repeating-conic-gradient(#e5e7eb_0%_25%,#ffffff_0%_50%)] bg-[length:20px_20px] p-2 dark:bg-[repeating-conic-gradient(#1b1b22_0%_25%,#101014_0%_50%)]"
          >
            <div className="relative mx-auto w-fit">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="Image to crop"
                  onLoad={onImageLoad}
                  className="block max-h-[60vh] w-auto max-w-full rounded-lg"
                  draggable={false}
                />
              ) : null}

              {natural ? (
                <div
                  role="application"
                  aria-label="Crop area — drag to move, use the handles to resize"
                  tabIndex={0}
                  onPointerDown={onPointerDown('move')}
                  onKeyDown={(event) => {
                    const step = event.shiftKey ? 20 : 4;
                    if (event.key === 'ArrowLeft') setCrop((c) => clampCrop({ ...c, x: c.x - step }));
                    if (event.key === 'ArrowRight') setCrop((c) => clampCrop({ ...c, x: c.x + step }));
                    if (event.key === 'ArrowUp') setCrop((c) => clampCrop({ ...c, y: c.y - step }));
                    if (event.key === 'ArrowDown') setCrop((c) => clampCrop({ ...c, y: c.y + step }));
                  }}
                  className="absolute cursor-move border-2 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
                  style={{
                    left: `${(crop.x / natural.width) * 100}%`,
                    top: `${(crop.y / natural.height) * 100}%`,
                    width: `${(crop.width / natural.width) * 100}%`,
                    height: `${(crop.height / natural.height) * 100}%`,
                  }}
                >
                  <span className="absolute -top-7 left-0 rounded-md bg-black/75 px-2 py-0.5 text-[11px] font-semibold text-white">
                    {crop.width} × {crop.height}
                  </span>
                  {handles.map((handle) => (
                    <span
                      key={handle.type}
                      onPointerDown={onPointerDown(handle.type)}
                      className={cn(
                        'absolute h-4 w-4 rounded-sm border-2 border-white bg-brand-purple shadow',
                        handle.className,
                        'sm:h-3.5 sm:w-3.5'
                      )}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 rounded-2xl border border-line/10 bg-surface/60 p-4 sm:grid-cols-2">
            <Field label="Aspect ratio" htmlFor="crop-ratio">
              <Select id="crop-ratio" value={ratio} onChange={(event) => setRatio(event.target.value)}>
                {RATIOS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Output format" htmlFor="crop-format">
              <Select
                id="crop-format"
                value={format}
                onChange={(event) => setFormat(event.target.value as ImageMime)}
              >
                <option value="image/png">PNG (lossless)</option>
                <option value="image/jpeg">JPG</option>
                <option value="image/webp">WebP</option>
              </Select>
            </Field>
            <div className="flex items-end gap-2 sm:col-span-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select whole image
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!natural) return;
                  const size = Math.min(natural.width, natural.height) / 2;
                  setCrop(
                    clampCrop({
                      x: (natural.width - size) / 2,
                      y: (natural.height - size) / 2,
                      width: size,
                      height: size,
                    })
                  );
                }}
              >
                Reset selection
              </Button>
              <span className="ml-auto text-xs text-muted">
                Crop: {crop.width} × {crop.height} px
              </span>
            </div>
          </div>

          {result ? (
            <ResultPanel title="Cropped result" tone="success">
              <div className="flex flex-col items-center gap-3 sm:flex-row">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.url}
                  alt="Cropped image"
                  className="max-h-48 rounded-xl border border-line/10 object-contain"
                />
                <div className="flex-1">
                  <StatGrid>
                    <Stat label="Size" value={`${result.width} × ${result.height} px`} />
                    <Stat label="File" value={formatBytes(result.blob.size)} />
                  </StatGrid>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <DownloadButton
                      blob={result.blob}
                      filename={changeExtension(sanitizeFilename(file.name), extensionForMime(format))}
                      label="Download cropped image"
                    />
                  </div>
                </div>
              </div>
            </ResultPanel>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button onClick={applyCrop} loading={busy}>
              <CropIcon aria-hidden className="h-4 w-4" />
              {busy ? 'Cropping…' : 'Crop image'}
            </Button>
            <ResetButton onClick={reset} variant="outline" />
          </div>
        </>
      )}
    </div>
  );
}

/* ======================================================================== */
/*  Image to PDF                                                             */
/* ======================================================================== */

export function ImagesToPdfTool() {
  const { toast } = useToast();
  const [items, setItems] = useState<FileListItem[]>([]);
  const [pageSize, setPageSize] = useState<'A4' | 'Letter'>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);

  const addFiles = (files: File[]) => {
    const next = files.map((file) => ({
      id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      preview: URL.createObjectURL(file),
    }));
    setItems((current) => [...current, ...next]);
    setResult(null);
  };

  const remove = (id: string) => {
    setItems((current) => {
      const target = current.find((item) => item.id === id);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return current.filter((item) => item.id !== id);
    });
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

  const create = async () => {
    if (items.length === 0) {
      toast({ title: 'Please select at least one image.', variant: 'warning' });
      return;
    }
    setBusy(true);
    setProgress(0);
    setResult(null);
    try {
      const bytes = await imagesToPdf(
        items.map((item) => item.file),
        { pageSize, orientation },
        (current, total) => setProgress((current / total) * 100)
      );
      setResult({ blob: bytesToBlob(bytes), name: 'toolnova-images.pdf' });
      toast({
        title: 'PDF created',
        description: `${items.length} image${items.length > 1 ? 's' : ''} combined.`,
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Could not create the PDF',
        description: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        variant: 'error',
      });
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    items.forEach((item) => item.preview && URL.revokeObjectURL(item.preview));
    setItems([]);
    setResult(null);
    setProgress(0);
  };

  return (
    <div className="space-y-5">
      <UploadBox
        accept="image/*"
        multiple
        maxSizeMb={60}
        onFiles={addFiles}
        label="Drop images to turn into a PDF"
        hint="Add as many images as you like — they become pages in order"
      />

      {items.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-fg">
              {items.length} image{items.length > 1 ? 's' : ''} selected
            </h3>
            <ResetButton onClick={reset} />
          </div>
          <FileList
            items={items}
            onRemove={remove}
            onMoveUp={(index) => move(index, -1)}
            onMoveDown={(index) => move(index, 1)}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Page size" htmlFor="pdf-page-size">
              <Select
                id="pdf-page-size"
                value={pageSize}
                onChange={(event) => setPageSize(event.target.value as 'A4' | 'Letter')}
              >
                <option value="A4">A4 (210 × 297 mm)</option>
                <option value="Letter">US Letter (8.5 × 11 in)</option>
              </Select>
            </Field>
            <Field label="Orientation" htmlFor="pdf-orientation">
              <Segmented
                label="Orientation"
                value={orientation}
                onChange={setOrientation}
                options={[
                  { value: 'portrait', label: 'Portrait' },
                  { value: 'landscape', label: 'Landscape' },
                ]}
              />
            </Field>
          </div>

          {busy ? <ProgressBar value={progress} label="Building pages" /> : null}

          {result ? (
            <ResultPanel title="Your PDF is ready" tone="success">
              <p className="text-sm text-muted">
                {items.length} page{items.length > 1 ? 's' : ''} · {formatBytes(result.blob.size)}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <DownloadButton blob={result.blob} filename={result.name} label="Download PDF" />
                <ResetButton onClick={reset} label="Reset tool" />
              </div>
            </ResultPanel>
          ) : null}

          <Button onClick={create} loading={busy} fullWidth>
            {busy ? 'Creating PDF…' : 'Create PDF'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/* ======================================================================== */
/*  Image Watermark                                                          */
/* ======================================================================== */

const POSITIONS: { value: WatermarkOptions['position']; label: string }[] = [
  { value: 'top-left', label: 'Top left' },
  { value: 'top-center', label: 'Top centre' },
  { value: 'top-right', label: 'Top right' },
  { value: 'middle-left', label: 'Middle left' },
  { value: 'center', label: 'Centre' },
  { value: 'middle-right', label: 'Middle right' },
  { value: 'bottom-left', label: 'Bottom left' },
  { value: 'bottom-center', label: 'Bottom centre' },
  { value: 'bottom-right', label: 'Bottom right' },
];

export function ImageWatermark() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null);
  const [text, setText] = useState('© Your Name');
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(45);
  const [angle, setAngle] = useState(0);
  const [color, setColor] = useState('#ffffff');
  const [position, setPosition] = useState<WatermarkOptions['position']>('bottom-right');
  const [tiled, setTiled] = useState(false);
  const [shadow, setShadow] = useState(true);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; url: string } | null>(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    loadImage(file)
      .then((image) => {
        setNatural({ width: image.width, height: image.height });
        // Scale the default font size to the image so it looks sensible.
        setFontSize(Math.max(14, Math.round(Math.min(image.width, image.height) * 0.06)));
      })
      .catch(() => toast({ title: 'That file could not be read as an image.', variant: 'error' }));
    return () => URL.revokeObjectURL(url);
  }, [file, toast]);

  const apply = async () => {
    if (!file) {
      toast({ title: 'Please select a file.', variant: 'warning' });
      return;
    }
    if (!text.trim()) {
      toast({ title: 'Please enter the watermark text.', variant: 'warning' });
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const output = await watermarkImage(
        file,
        {
          text: text.trim(),
          fontSize,
          opacity: opacity / 100,
          angle,
          color,
          position,
          tiled,
          shadow,
        },
        { format: 'image/png' }
      );
      setResult(output);
      toast({ title: 'Watermark applied', variant: 'success' });
    } catch (error) {
      toast({
        title: 'Could not apply the watermark',
        description: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        variant: 'error',
      });
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setNatural(null);
    setResult(null);
    setText('© Your Name');
    setOpacity(45);
    setAngle(0);
    setColor('#ffffff');
    setPosition('bottom-right');
    setTiled(false);
    setShadow(true);
  };

  return (
    <div className="space-y-5">
      {!file ? (
        <UploadBox
          accept="image/*"
          maxSizeMb={60}
          onFiles={(files) => setFile(files[0])}
          label="Drop an image to watermark"
          hint="Your image never leaves your device"
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <figure className="overflow-hidden rounded-2xl border border-line/10 bg-surface-2/50">
              <figcaption className="border-b border-line/10 px-3 py-2 text-xs font-semibold text-muted">
                Original {natural ? `· ${natural.width} × ${natural.height}` : ''}
              </figcaption>
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Original image" className="max-h-56 w-full object-contain" />
              ) : null}
            </figure>
            <figure className="overflow-hidden rounded-2xl border border-line/10 bg-surface-2/50">
              <figcaption className="border-b border-line/10 px-3 py-2 text-xs font-semibold text-muted">
                Watermarked
              </figcaption>
              <div className="flex min-h-[8rem] items-center justify-center">
                {busy ? (
                  <Loader2 aria-hidden className="h-5 w-5 animate-spin text-muted" />
                ) : result ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={result.url}
                    alt="Watermarked image"
                    className="max-h-56 w-full object-contain"
                  />
                ) : (
                  <span className="px-4 text-center text-sm text-muted">Your result appears here.</span>
                )}
              </div>
            </figure>
          </div>

          <div className="space-y-4 rounded-2xl border border-line/10 bg-surface/60 p-4">
            <Field label="Watermark text" htmlFor="wm-text">
              <input
                id="wm-text"
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="© Your Name"
                className="h-11 w-full rounded-xl border border-line/12 bg-surface/70 px-3.5 text-[0.9375rem] text-fg"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Slider label="Font size" value={fontSize} onChange={setFontSize} min={10} max={220} valueLabel={`${fontSize} px`} />
              <Slider label="Opacity" value={opacity} onChange={setOpacity} min={5} max={100} valueLabel={`${opacity}%`} />
              <Slider label="Rotation" value={angle} onChange={setAngle} min={-90} max={90} valueLabel={`${angle}°`} />
              <Field label="Colour" htmlFor="wm-color">
                <div className="flex items-center gap-2">
                  <input
                    id="wm-color"
                    type="color"
                    value={color}
                    onChange={(event) => setColor(event.target.value)}
                    className="h-11 w-14 cursor-pointer rounded-xl border border-line/12 bg-surface p-1"
                  />
                  <span className="text-sm text-muted">{color}</span>
                </div>
              </Field>
            </div>

            <Field label="Position" htmlFor="wm-position">
              <Select
                id="wm-position"
                value={position}
                onChange={(event) => setPosition(event.target.value as WatermarkOptions['position'])}
                disabled={tiled}
              >
                {POSITIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>

            <div className="flex flex-wrap gap-5">
              <Checkbox checked={tiled} onChange={setTiled} label="Tile across the whole image" />
              <Checkbox checked={shadow} onChange={setShadow} label="Drop shadow" />
            </div>
          </div>

          {result ? (
            <ResultPanel title="Result" tone="success">
              <Stat label="Output" value={formatBytes(result.blob.size)} />
              <div className="mt-3 flex flex-wrap gap-2">
                <DownloadButton
                  blob={result.blob}
                  filename={changeExtension(sanitizeFilename(file.name), 'png')}
                  label="Download watermarked image"
                />
                <ResetButton onClick={reset} label="Reset tool" />
              </div>
            </ResultPanel>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button onClick={apply} loading={busy}>
              {busy ? 'Applying…' : 'Apply watermark'}
            </Button>
            <ResetButton onClick={reset} variant="outline" />
          </div>
        </>
      )}
    </div>
  );
}

/* ======================================================================== */
/*  Image to Base64                                                          */
/* ======================================================================== */

export function ImageToBase64() {
  const { toast } = useToast();
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dataUri, setDataUri] = useState('');
  const [input, setInput] = useState('');
  const [decodedUrl, setDecodedUrl] = useState<string | null>(null);
  const [decodedBlob, setDecodedBlob] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setBusy(true);
    fileToDataUrl(file)
      .then((result) => setDataUri(result))
      .catch(() => toast({ title: 'That file could not be read.', variant: 'error' }))
      .finally(() => setBusy(false));
    return () => URL.revokeObjectURL(url);
  }, [file, toast]);

  const decode = () => {
    const value = input.trim();
    if (!value) {
      toast({ title: 'Please paste a Base64 string or data URI.', variant: 'warning' });
      return;
    }
    try {
      const blob = dataUrlToBlob(value.includes(',') ? value : `data:image/png;base64,${value}`);
      if (decodedUrl) URL.revokeObjectURL(decodedUrl);
      setDecodedUrl(URL.createObjectURL(blob));
      setDecodedBlob(blob);
      toast({ title: 'Decoded successfully', variant: 'success' });
    } catch {
      toast({
        title: 'That is not valid Base64 image data',
        description: 'Check for truncated characters or missing padding.',
        variant: 'error',
      });
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setDataUri('');
    setInput('');
    if (decodedUrl) URL.revokeObjectURL(decodedUrl);
    setDecodedUrl(null);
    setDecodedBlob(null);
  };

  const rawBase64 = dataUri.includes(',') ? dataUri.split(',')[1] : dataUri;

  return (
    <div className="space-y-5">
      <Segmented
        label="Mode"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'encode', label: 'Image → Base64' },
          { value: 'decode', label: 'Base64 → Image' },
        ]}
      />

      {mode === 'encode' ? (
        <>
          {!file ? (
            <UploadBox
              accept="image/*"
              maxSizeMb={20}
              onFiles={(files) => setFile(files[0])}
              label="Drop an image to encode"
              hint="PNG, JPG, WebP, SVG — up to 20 MB"
            />
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview}
                    alt="Image to encode"
                    className="h-32 rounded-xl border border-line/10 object-contain"
                  />
                ) : null}
                <div>
                  <p className="text-sm font-semibold text-fg">{file.name}</p>
                  <p className="text-xs text-muted">
                    {formatBytes(file.size)} · {formatBytes(dataUri.length)} as Base64
                  </p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={reset}>
                    Choose another image
                  </Button>
                </div>
              </div>

              <Field label="Data URI" htmlFor="b64-uri" hint="Ready to paste into src=&quot;…&quot;, CSS or JSON.">
                <TextArea
                  id="b64-uri"
                  value={dataUri}
                  readOnly
                  className="min-h-[120px] font-mono text-xs"
                  onFocus={(event) => event.currentTarget.select()}
                />
              </Field>

              <div className="flex flex-wrap gap-2">
                <CopyButton value={dataUri} label="Copy data URI" />
                <CopyButton value={rawBase64} label="Copy raw Base64" />
                <DownloadButton
                  blob={new Blob([dataUri], { type: 'text/plain' })}
                  filename={`${sanitizeFilename(file.name)}.txt`}
                  label="Download .txt"
                  variant="outline"
                />
                <ResetButton onClick={reset} />
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <Field label="Base64 or data URI" htmlFor="b64-input">
            <TextArea
              id="b64-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="data:image/png;base64,iVBORw0KGgo…"
              className="min-h-[140px] font-mono text-xs"
            />
          </Field>

          <div className="flex flex-wrap gap-2">
            <Button onClick={decode}>Decode to image</Button>
            <ResetButton onClick={reset} variant="outline" />
          </div>

          {decodedUrl ? (
            <ResultPanel title="Decoded image" tone="success">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={decodedUrl}
                alt="Decoded image"
                className="max-h-64 rounded-xl border border-line/10 object-contain"
              />
              <div className="mt-3">
                <DownloadButton
                  blob={decodedBlob}
                  filename={`toolnova-decoded.${(decodedBlob?.type || 'image/png').split('/')[1] || 'png'}`}
                  label="Download image"
                />
              </div>
            </ResultPanel>
          ) : (
            <StatusMessage tone="info">
              Paste a Base64 string or a full data URI, then press “Decode to image”.
            </StatusMessage>
          )}
        </>
      )}
    </div>
  );
}
