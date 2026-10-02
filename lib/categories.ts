import {
  Braces,
  FileStack,
  Image as ImageIcon,
  Sparkles,
  Wrench,
  FileArchive,
  type LucideIcon,
} from 'lucide-react';

export type CategorySlug =
  | 'image-tools'
  | 'pdf-tools'
  | 'text-tools'
  | 'ai-tools'
  | 'file-tools'
  | 'developer-tools';

export interface CategoryDef {
  slug: CategorySlug;
  name: string;
  shortName: string;
  icon: LucideIcon;
  title: string;
  description: string;
  /** Long-form copy for the category landing page. */
  intro: string[];
  /** Short FAQ shown on the category page (also emitted as FAQPage structured data). */
  faq: { question: string; answer: string }[];
  accent: 'red' | 'purple' | 'magenta';
}

export const categories: CategoryDef[] = [
  {
    slug: 'image-tools',
    name: 'Image Tools',
    shortName: 'Image',
    icon: ImageIcon,
    title: 'Free Online Image Tools',
    description:
      'Compress, resize, convert and crop images directly in your browser. No uploads, no sign-up, no quality nonsense.',
    intro: [
      'Our image tools run entirely on your device using the HTML5 canvas API. That means your photos never leave your computer when you compress, resize, convert or crop them — and there is no queue, no waiting for a server, and no file size limit imposed by us beyond what your own browser can handle.',
      'Whether you are preparing product photos for an online store, shrinking screenshots for a bug report, or converting a batch of JPEGs to WebP for a faster website, these tools give you full control over quality, dimensions and output format.',
    ],
    accent: 'purple',
    faq: [
      {
        question: 'Are the image tools really free?',
        answer:
          'Yes. Compressing, resizing, converting, cropping and watermarking are free with no daily limit and no account. The site is supported by clearly labelled advertising.',
      },
      {
        question: 'Do I need to upload my photos?',
        answer:
          'No. Every image tool runs in your browser using the canvas API, so your photos are decoded, processed and re-encoded on your own device.',
      },
      {
        question: 'Will compression make my photos look bad?',
        answer:
          'At 70–85% quality the difference is usually invisible on screen, especially on a phone. The tools show you exact file sizes so you can decide how far to push it.',
      },
    ]
  },
  {
    slug: 'pdf-tools',
    name: 'PDF Tools',
    shortName: 'PDF',
    icon: FileStack,
    title: 'Free Online PDF Tools',
    description:
      'Merge, split, compress and extract from PDF documents with real client-side processing — your documents stay on your machine.',
    intro: [
      'PDF is the most portable document format in the world, and also one of the most annoying to edit without paid software. These tools use pdf-lib and pdf.js — the same open-source engines that power many commercial editors — to merge, split, compress and read PDFs right inside your browser tab.',
      'Because processing is local, you can safely work with contracts, invoices, tax documents and anything else you would rather not send to a stranger\'s server.',
    ],
    accent: 'red',
    faq: [
      {
        question: 'Is it safe to merge or split sensitive PDFs here?',
        answer:
          'Processing happens locally with pdf-lib, so your documents are never uploaded. That makes these tools suitable for contracts, invoices and financial files.',
      },
      {
        question: 'Can I work with password-protected PDFs?',
        answer:
          'No. Encrypted PDFs must be unlocked before any tool can read them. Remove the protection in your own PDF reader first.',
      },
      {
        question: 'Will merging or splitting change the quality of my pages?',
        answer:
          'No. Pages are copied as objects, so text stays selectable and images keep their original resolution. Only the PDF Compressor re-renders pages, and it warns you before it does.',
      },
    ]
  },
  {
    slug: 'text-tools',
    name: 'Text Tools',
    shortName: 'Text',
    icon: Braces,
    title: 'Free Online Text Tools',
    description:
      'Count words, fix casing, clean up messy text and validate JSON instantly as you type.',
    intro: [
      'Writers, developers and students all need the same handful of text operations: how long is this? why is this capitalised like that? why is this JSON broken? Our text tools answer those questions live, character by character, without a single network request.',
      'Everything updates as you type, works offline once the page is loaded, and supports copy, download and reset with a single click or keyboard shortcut.',
    ],
    accent: 'magenta',
    faq: [
      {
        question: 'Does the text I paste get stored anywhere?',
        answer:
          'No. Counting, case conversion, formatting and JSON validation all run in the page. Reload and your text is gone, because it was never saved.',
      },
      {
        question: 'How accurate is the word count?',
        answer:
          'It counts whitespace-separated tokens after trimming punctuation, which matches what most editors and submission systems report. Hyphenated words count as one word.',
      },
      {
        question: 'Can I use these tools offline?',
        answer:
          'Once the page has loaded, yes — the text tools make no further network requests, so they keep working if your connection drops.',
      },
    ]
  },
  {
    slug: 'ai-tools',
    name: 'AI Tools',
    shortName: 'AI',
    icon: Sparkles,
    title: 'AI Writing Tools',
    description:
      'Draft, summarise and title your content with a provider you control. No API key configured? The tool tells you honestly instead of faking an answer.',
    intro: [
      'AI tools on ToolNova are wired to a secure server-side route. Your prompt is sent from the server to the configured AI provider; the API key never reaches the browser and is never exposed in the page source.',
      'If the site administrator has not configured an AI provider, the tool shows a clear configuration message instead of inventing a response. We would rather tell you the truth than pretend a template was written by a model.',
    ],
    accent: 'purple',
    faq: [
      {
        question: 'Why do the AI tools need a server?',
        answer:
          'Calling a language model requires an API key. Keeping the call on the server means the key never appears in the browser, in page source or in network responses.',
      },
      {
        question: 'What happens if no AI provider is configured?',
        answer:
          'The tool shows "AI service is not configured yet." and generates nothing. We do not return template text and pretend a model wrote it.',
      },
      {
        question: 'Is my prompt stored or used for training?',
        answer:
          'ToolNova keeps no logs of prompts or outputs. Your text is forwarded to the configured provider for the sole purpose of producing the response, subject to that provider\'s own policy.',
      },
    ]
  },
  {
    slug: 'file-tools',
    name: 'File Tools',
    shortName: 'Files',
    icon: FileArchive,
    title: 'Free Online File Tools',
    description:
      'Zip files, generate QR codes, encode Base64 and verify checksums — all calculated locally in your browser.',
    intro: [
      'These utilities handle the unglamorous but constant jobs: bundling files before you email them, turning a URL into a scannable QR code, encoding a binary file into text, and verifying that a download arrived intact.',
      'Checksums and hashes are computed with the browser\'s built-in Web Crypto API, so verification is both fast and trustworthy.',
    ],
    accent: 'red',
    faq: [
      {
        question: 'Why is my ZIP file not much smaller?',
        answer:
          'ZIP compression is lossless, so media that is already compressed (JPEG, MP4, MP3, other ZIPs) has little redundancy left. Text, CSV and logs compress very well.',
      },
      {
        question: 'Can I password-protect an archive?',
        answer:
          'Not yet. Encryption for ZIP archives is on the roadmap, so please do not use this tool for confidential bundles today.',
      },
      {
        question: 'Are checksums computed locally?',
        answer:
          'Yes, with the browser\'s Web Crypto API. Files are hashed on your device and never uploaded.',
      },
    ]
  },
  {
    slug: 'developer-tools',
    name: 'Developer Tools',
    shortName: 'Dev',
    icon: Wrench,
    title: 'Free Developer Utilities',
    description:
      'Test regular expressions, encode URLs, decode JWTs, convert timestamps and transform CSV — instant, offline and keyboard friendly.',
    intro: [
      'A small set of utilities we wanted while building ToolNova itself. Every one of them updates live, explains what it did, and fails loudly with a readable error instead of silently doing nothing.',
      'Nothing you paste is transmitted anywhere. Regex, JWT payloads and tokens are handled entirely in the page.',
    ],
    accent: 'magenta',
    faq: [
      {
        question: 'Which regex flavour does the tester use?',
        answer:
          'JavaScript (ECMAScript), the same engine your browser runs. Lookbehind works in modern browsers; some other engines\' extensions do not.',
      },
      {
        question: 'Do you verify JWT signatures?',
        answer:
          'No. Verification needs the signing key, which you should never paste into any website. The decoder only reads the header and payload.',
      },
      {
        question: 'Is anything I paste sent to a server?',
        answer:
          'No. Regex testing, URL encoding, JWT decoding, timestamps, CSV conversion and hashing all run entirely in the browser.',
      },
    ]
  },
];

export const categoryMap: Record<CategorySlug, CategoryDef> = categories.reduce(
  (acc, category) => {
    acc[category.slug] = category;
    return acc;
  },
  {} as Record<CategorySlug, CategoryDef>
);

export function getCategory(slug: string): CategoryDef | undefined {
  return categories.find((category) => category.slug === slug);
}
