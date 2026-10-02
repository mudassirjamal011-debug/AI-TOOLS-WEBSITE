import {
  AlignLeft,
  Braces,
  CaseSensitive,
  Clock,
  Crop,
  Droplets,
  FileArchive,
  FileDown,
  FileKey,
  FileSearch,
  FileStack,
  FileText,
  FileType2,
  Files,
  Fingerprint,
  Hash,
  Image,
  ImageDown,
  KeyRound,
  Link2,
  Lock,
  QrCode,
  Regex,
  Scaling,
  Scissors,
  Sparkles,
  Table2,
  Type,
  Wand2,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

/** Client-safe icon lookup so browser components do not pull in the full tool registry. */
const toolIcons: Record<string, LucideIcon> = {
  'image-compressor': ImageDown,
  'image-resizer': Scaling,
  'image-converter': Image,
  'image-cropper': Crop,
  'image-to-pdf': FileDown,
  'image-watermark': Droplets,
  'image-to-base64': FileType2,

  'pdf-merger': Files,
  'pdf-splitter': Scissors,
  'pdf-to-image': FileSearch,
  'pdf-compressor': FileDown,
  'pdf-to-text': FileText,

  'word-counter': Type,
  'case-converter': CaseSensitive,
  'text-formatter': AlignLeft,
  'json-formatter': Braces,
  'lorem-ipsum': AlignLeft,
  'password-generator': Lock,

  'ai-text-generator': Sparkles,
  'ai-summarizer': Wand2,
  'ai-title-generator': FileSearch,

  'zip-files': FileArchive,
  'qr-code-generator': QrCode,
  'base64-encoder': FileKey,
  'file-hash': Fingerprint,

  'regex-tester': Regex,
  'url-encoder': Link2,
  'jwt-decoder': KeyRound,
  'timestamp-converter': Clock,
  'csv-to-json': Table2,
  'hash-generator': Hash,
};

export function getToolIcon(slug: string): LucideIcon {
  return toolIcons[slug] ?? Wrench;
}

export { FileStack };
