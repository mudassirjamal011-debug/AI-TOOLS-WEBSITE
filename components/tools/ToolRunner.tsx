'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import { Skeleton } from '@/components/ui/Feedback';
import { StatusMessage } from '@/components/ui/Feedback';

/**
 * Each tool is code-split and loaded on demand, so a tool page only downloads
 * the JavaScript for that one tool (plus the shared chrome).
 */
function lazy(loader: () => Promise<{ [key: string]: unknown }>, exportName: string) {
  return dynamic(() => loader().then((mod) => mod[exportName] as ComponentType), {
    ssr: false,
    loading: () => (
      <div className="space-y-3" aria-busy="true" aria-live="polite">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-11 w-40" />
        <span className="sr-only">Loading tool…</span>
      </div>
    ),
  });
}

const image = () => import('./impl/ImageTools');
const pdf = () => import('./impl/PdfTools');
const text = () => import('./impl/TextTools');
const ai = () => import('./impl/AiTools');
const file = () => import('./impl/FileTools');
const dev = () => import('./impl/DevTools');

export const toolComponents: Record<string, ComponentType> = {
  'image-compressor': lazy(image, 'ImageCompressor'),
  'image-resizer': lazy(image, 'ImageResizer'),
  'image-converter': lazy(image, 'ImageConverter'),
  'image-cropper': lazy(image, 'ImageCropper'),
  'image-to-pdf': lazy(image, 'ImagesToPdfTool'),
  'image-watermark': lazy(image, 'ImageWatermark'),
  'image-to-base64': lazy(image, 'ImageToBase64'),

  'pdf-merger': lazy(pdf, 'PdfMerger'),
  'pdf-splitter': lazy(pdf, 'PdfSplitter'),
  'pdf-to-image': lazy(pdf, 'PdfToImage'),
  'pdf-compressor': lazy(pdf, 'PdfCompressor'),
  'pdf-to-text': lazy(pdf, 'PdfToText'),

  'word-counter': lazy(text, 'WordCounter'),
  'case-converter': lazy(text, 'CaseConverter'),
  'text-formatter': lazy(text, 'TextFormatter'),
  'json-formatter': lazy(text, 'JsonFormatter'),
  'lorem-ipsum': lazy(text, 'LoremIpsum'),
  'password-generator': lazy(text, 'PasswordGenerator'),

  'ai-text-generator': lazy(ai, 'AiTextGenerator'),
  'ai-summarizer': lazy(ai, 'AiSummarizer'),
  'ai-title-generator': lazy(ai, 'AiTitleGenerator'),

  'zip-files': lazy(file, 'ZipCreator'),
  'qr-code-generator': lazy(file, 'QrGenerator'),
  'base64-encoder': lazy(file, 'Base64Tool'),
  'file-hash': lazy(file, 'FileHash'),

  'regex-tester': lazy(dev, 'RegexTester'),
  'url-encoder': lazy(dev, 'UrlEncoder'),
  'jwt-decoder': lazy(dev, 'JwtDecoder'),
  'timestamp-converter': lazy(dev, 'TimestampConverter'),
  'csv-to-json': lazy(dev, 'CsvConverter'),
  'hash-generator': lazy(dev, 'HashGenerator'),
};

export function ToolRunner({ slug }: { slug: string }) {
  const Component = toolComponents[slug];

  if (!Component) {
    return (
      <StatusMessage tone="error" title="This tool has no interface yet">
        The tool data exists but its interface has not been registered in ToolRunner. This is a bug,
        not a feature — please report it through the contact page.
      </StatusMessage>
    );
  }

  return <Component />;
}
