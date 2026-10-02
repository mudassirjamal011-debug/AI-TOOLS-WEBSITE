import {
  AlignLeft,
  Braces,
  CaseSensitive,
  Clock,
  Crop as CropIcon,
  Droplets,
  FileArchive,
  FileDown,
  FileKey,
  FileStack,
  FileText,
  FileType2,
  Files,
  FileSearch,
  Fingerprint,
  Hash,
  Image as ImageIcon,
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
  type LucideIcon,
} from 'lucide-react';
import type { CategorySlug } from './categories';

export type ProcessingLocation = 'browser' | 'server';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ToolDef {
  slug: string;
  name: string;
  category: CategorySlug;
  /** One-line card description. */
  tagline: string;
  /** Meta description (150–160 chars). */
  description: string;
  icon: LucideIcon;
  keywords: string[];
  popular?: boolean;
  /** Where the actual work happens — drives the privacy badge. */
  processing: ProcessingLocation;
  /** "Free", "No upload", "Requires API key" … */
  badge?: string;
  /** Accepted file types for upload-based tools. */
  accepts?: string;
  maxFileSizeMb?: number;
  multiple?: boolean;
  /** Long-form intro paragraphs rendered on the tool page. */
  intro: string[];
  howTo: string[];
  faq: FaqItem[];
  related: string[];
  /** JSON-LD: what the tool outputs. */
  outputFormats?: string[];
}

export const tools: ToolDef[] = [
  /* ------------------------------------------------------------------ */
  /*  IMAGE TOOLS                                                        */
  /* ------------------------------------------------------------------ */
  {
    slug: 'image-compressor',
    name: 'Image Compressor',
    category: 'image-tools',
    tagline: 'Shrink JPG, PNG and WebP files with a quality slider — no upload needed.',
    description:
      'Compress JPG, PNG and WebP images free online. Drag and drop a photo, choose a quality level and download a smaller file. 100% private, processed in your browser.',
    icon: ImageDown,
    keywords: [
      'image compressor',
      'compress image',
      'reduce image size',
      'photo compressor',
      'shrink jpg',
      'optimize png',
    ],
    popular: true,
    processing: 'browser',
    badge: 'No upload',
    accepts: 'image/*',
    maxFileSizeMb: 60,
    intro: [
      'The ToolNova Image Compressor re-encodes your photo inside the browser using the HTML5 canvas API, then reports exactly how many bytes you saved. Lower the quality slider and watch the projected output size change before you commit to a download.',
      'Because the work happens on your device, there is no upload queue, no waiting for a remote server and no risk of your images being stored somewhere else. Large photos of 10–40 MB are handled comfortably on modern phones and laptops.',
    ],
    howTo: [
      'Upload your image by clicking the drop zone or dragging a file onto it.',
      'Drag the quality slider to choose how aggressive the compression should be.',
      'Optionally limit the maximum width for screen-sized output.',
      'Click Compress and compare the original and compressed sizes.',
      'Download the compressed image or reset the tool to start over.',
    ],
    faq: [
      {
        question: 'Does compressing an image reduce its quality?',
        answer:
          'Yes — lossy compression (JPEG and WebP) trades a small amount of visual detail for a much smaller file. At 70–85% quality the difference is usually invisible on screen. The tool shows you exact file sizes so you can judge the trade-off yourself.',
      },
      {
        question: 'Are my images uploaded to a server?',
        answer:
          'No. The image is decoded, resized and re-encoded locally with the canvas API. Nothing is transmitted, which is why the tool keeps working even if you go offline after the page loads.',
      },
      {
        question: 'What image formats are supported?',
        answer:
          'You can upload JPEG, PNG, WebP, GIF, BMP and most formats your browser can decode. Output can be written as JPEG, PNG or WebP, depending on which gives the smaller file.',
      },
      {
        question: 'Is there a file size limit?',
        answer:
          'The tool accepts files up to 60 MB. The practical limit is your device memory — very large camera RAW files converted to JPEG may take a few seconds on older phones.',
      },
    ],
    related: ['image-resizer', 'image-converter', 'image-cropper', 'image-to-pdf'],
    outputFormats: ['JPEG', 'PNG', 'WebP'],
  },
  {
    slug: 'image-resizer',
    name: 'Image Resizer',
    category: 'image-tools',
    tagline: 'Change image dimensions in pixels with optional aspect ratio lock.',
    description:
      'Resize images online free. Set an exact width and height in pixels, lock the aspect ratio to avoid distortion and download the resized photo instantly in your browser.',
    icon: Scaling,
    keywords: ['image resizer', 'resize image', 'change image dimensions', 'scale photo', 'resize jpg'],
    popular: true,
    processing: 'browser',
    badge: 'No upload',
    accepts: 'image/*',
    maxFileSizeMb: 60,
    intro: [
      'Set an exact pixel width and height, or change one side and let the aspect ratio lock fill in the other. A live preview shows the real output dimensions, the resulting megapixels and the change in file size.',
      'Resizing is the fastest way to make a photo smaller without touching its visual quality — ideal for email attachments, marketplace listings, CMS upload limits and profile pictures.',
    ],
    howTo: [
      'Upload the image you want to resize.',
      'Enter a new width, a new height, or both.',
      'Keep "Lock aspect ratio" on to prevent the image from stretching.',
      'Click Resize Image and check the preview.',
      'Download the resized file as PNG, JPEG or WebP.',
    ],
    faq: [
      {
        question: 'Will resizing distort my photo?',
        answer:
          'Not while the aspect ratio lock is enabled. Turn it off only when you specifically want to stretch or squeeze an image to unusual dimensions.',
      },
      {
        question: 'Can I make an image larger?',
        answer:
          'Yes, but upscaling cannot invent detail — the result is interpolated and may look soft. For big enlargements, start from the highest resolution original you have.',
      },
      {
        question: 'Which output format should I choose?',
        answer:
          'JPEG for photos, PNG for screenshots and graphics with flat colours or transparency, WebP when you want the smallest file and your audience uses a modern browser.',
      },
      {
        question: 'Does it work on my phone?',
        answer:
          'Yes. The controls are sized for touch, the preview scales to the screen width and the processed file is saved straight to your downloads folder.',
      },
    ],
    related: ['image-compressor', 'image-converter', 'image-cropper', 'image-to-pdf'],
    outputFormats: ['JPEG', 'PNG', 'WebP'],
  },
  {
    slug: 'image-converter',
    name: 'Image Converter',
    category: 'image-tools',
    tagline: 'Convert between JPG, PNG and WebP in one click.',
    description:
      'Convert images to JPG, PNG or WebP online for free. Upload a photo, pick an output format, set the quality and download the converted file — processed locally in your browser.',
    icon: ImageIcon,
    keywords: ['image converter', 'jpg to png', 'png to jpg', 'convert to webp', 'jpg to webp', 'heic converter'],
    popular: true,
    processing: 'browser',
    badge: 'No upload',
    accepts: 'image/*',
    maxFileSizeMb: 60,
    intro: [
      'Drop in any image your browser can open and convert it to JPEG, PNG or WebP. When you convert to a lossy format you also get a quality slider and, when converting to JPEG, a background colour picker to replace transparency.',
      'WebP typically produces files 25–35% smaller than an equivalent JPEG, which makes it the best default for websites. PNG remains the right choice for screenshots, logos and anything that needs a transparent background.',
    ],
    howTo: [
      'Upload the image you want to convert.',
      'Choose the output format: JPG, PNG or WebP.',
      'Adjust the quality slider for JPG and WebP output.',
      'Click Convert Image.',
      'Download the converted file.',
    ],
    faq: [
      {
        question: 'What happens to transparent backgrounds?',
        answer:
          'PNG and WebP keep transparency. JPEG cannot store transparency, so when you convert to JPEG the transparent area is filled with the background colour you select (white by default).',
      },
      {
        question: 'Which formats can I upload?',
        answer:
          'Anything your browser can decode: JPEG, PNG, WebP, GIF, BMP and AVIF on supporting browsers. Output is limited to JPG, PNG and WebP for maximum compatibility.',
      },
      {
        question: 'Is the conversion lossless?',
        answer:
          'PNG output is lossless. JPEG and WebP are lossy by design; raising the quality slider to 90–100% makes the loss practically invisible while still saving space over a PNG.',
      },
      {
        question: 'Can I convert several images at once?',
        answer:
          'Batch conversion is on the roadmap. Today each conversion handles one image, but the tool resets instantly so a series of files takes only a few clicks.',
      },
    ],
    related: ['image-compressor', 'image-resizer', 'image-to-base64', 'image-to-pdf'],
    outputFormats: ['JPG', 'PNG', 'WebP'],
  },
  {
    slug: 'image-cropper',
    name: 'Image Cropper',
    category: 'image-tools',
    tagline: 'Drag an interactive crop box and export exact pixel dimensions.',
    description:
      'Crop images online free with a draggable, resizable crop box and preset aspect ratios. Upload a photo, position the crop area and download the result — all inside your browser.',
    icon: CropIcon,
    keywords: ['image cropper', 'crop image', 'crop photo online', 'circle crop', 'square crop'],
    processing: 'browser',
    badge: 'No upload',
    accepts: 'image/*',
    maxFileSizeMb: 60,
    intro: [
      'Drag anywhere on the image to draw a crop box, then move it or pull any of the eight handles to fine-tune. Lock the selection to common shapes such as 1:1, 16:9, 4:3 or 3:2 when you need exact social media or print proportions.',
      'The crop is applied on a canvas at full source resolution, so a 4000 px photo cropped to a square still exports at full quality rather than being scaled down from the preview.',
    ],
    howTo: [
      'Upload the image you want to crop.',
      'Drag on the image to draw a crop area, then adjust the handles.',
      'Optionally choose an aspect ratio preset such as 1:1 or 16:9.',
      'Click Crop Image.',
      'Preview the cropped result and download it.',
    ],
    faq: [
      {
        question: 'Does cropping reduce image quality?',
        answer:
          'Cropping removes pixels rather than resampling them, so the remaining area keeps its original quality. Exporting as JPEG re-encodes once; use PNG if you want a mathematically lossless result.',
      },
      {
        question: 'Can I crop to an exact size like 1080×1080?',
        answer:
          'Yes. Choose the 1:1 preset and then type an exact width into the size fields — the height follows automatically while the ratio is locked.',
      },
      {
        question: 'Does it work with touch screens?',
        answer:
          'Yes. You can draw, drag and resize the crop box with your finger; the handles are enlarged on touch devices.',
      },
      {
        question: 'What is the maximum image size?',
        answer:
          'Files up to 60 MB are accepted. Very large images are displayed scaled down in the editor but are always cropped at full resolution.',
      },
    ],
    related: ['image-resizer', 'image-compressor', 'image-converter', 'image-watermark'],
    outputFormats: ['PNG', 'JPEG'],
  },
  {
    slug: 'image-to-pdf',
    name: 'Image to PDF',
    category: 'image-tools',
    tagline: 'Turn one or many images into a single PDF document.',
    description:
      'Convert JPG, PNG and WebP images to PDF free online. Reorder the pages, choose page size and orientation, then download a single PDF built in your browser.',
    icon: FileDown,
    keywords: ['image to pdf', 'jpg to pdf', 'png to pdf', 'photos to pdf', 'combine images pdf'],
    popular: true,
    processing: 'browser',
    badge: 'No upload',
    accepts: 'image/*',
    maxFileSizeMb: 60,
    multiple: true,
    intro: [
      'Turn a folder of scans, receipts or screenshots into one tidy PDF. Add as many images as you like, drag them into the order you need, then choose A4 or US Letter with portrait or landscape orientation.',
      'Each image is fitted to the page while keeping its aspect ratio, so nothing is stretched. The finished PDF is assembled with pdf-lib entirely on your device.',
    ],
    howTo: [
      'Upload one or more images.',
      'Reorder them with the arrow buttons until the page order is right.',
      'Choose a page size and orientation.',
      'Click Create PDF.',
      'Download the generated document.',
    ],
    faq: [
      {
        question: 'How many images can I add?',
        answer:
          'There is no fixed limit — add as many as your device memory allows. A few dozen typical phone photos work fine.',
      },
      {
        question: 'Can I mix portrait and landscape images?',
        answer:
          'Yes. Each image is scaled to fit inside the chosen page size, so mixed orientations simply produce pages with different margins.',
      },
      {
        question: 'What page sizes are available?',
        answer: 'A4 and US Letter, in portrait or landscape.',
      },
      {
        question: 'Is the PDF searchable?',
        answer:
          'No. This tool embeds the images; it does not run OCR. Text inside your images will not be selectable in the resulting PDF.',
      },
    ],
    related: ['pdf-merger', 'image-compressor', 'image-converter', 'pdf-compressor'],
    outputFormats: ['PDF'],
  },
  {
    slug: 'image-watermark',
    name: 'Image Watermark',
    category: 'image-tools',
    tagline: 'Stamp text or a logo onto your images before you publish them.',
    description:
      'Add a text watermark to images online for free. Control the text, size, angle, opacity, colour and position, then download the watermarked image from your browser.',
    icon: Droplets,
    keywords: ['watermark image', 'add watermark', 'photo watermark', 'copyright stamp', 'logo overlay'],
    processing: 'browser',
    badge: 'No upload',
    accepts: 'image/*',
    maxFileSizeMb: 60,
    intro: [
      'Protect your photographs, mockups and portfolio pieces with a visible watermark before you post them anywhere. Type your text or brand name, then tune font size, rotation, opacity, colour and one of nine anchor positions.',
      'The watermark is drawn onto a full-resolution canvas, so the exported file looks crisp on retina screens and keeps the original image dimensions.',
    ],
    howTo: [
      'Upload the image you want to watermark.',
      'Type the watermark text.',
      'Choose size, angle, opacity, colour and position.',
      'Click Apply Watermark and review the preview.',
      'Download the watermarked image.',
    ],
    faq: [
      {
        question: 'Can I watermark with my logo instead of text?',
        answer:
          'Text watermarking is available today. Logo (image) watermarking is planned for a future release.',
      },
      {
        question: 'Is the watermark easy to remove?',
        answer:
          'A visible watermark is a deterrent, not encryption. For stronger protection, place the mark across the subject, use a lower opacity tiled pattern, and publish only reduced-resolution copies.',
      },
      {
        question: 'Does it resize my image?',
        answer:
          'No. The watermark is drawn at the original resolution and the file is exported at the same dimensions.',
      },
      {
        question: 'Can I tile the watermark across the whole photo?',
        answer:
          'Yes — enable the tiled option to repeat the text diagonally across the entire image, which is much harder to crop out.',
      },
    ],
    related: ['image-converter', 'image-compressor', 'image-to-pdf', 'image-cropper'],
    outputFormats: ['PNG', 'JPEG'],
  },
  {
    slug: 'image-to-base64',
    name: 'Image to Base64',
    category: 'image-tools',
    tagline: 'Encode an image to a Base64 data URI, or decode one back to a file.',
    description:
      'Convert an image to a Base64 data URI or decode Base64 back into an image, free and instantly. Useful for CSS, JSON payloads, emails and API testing.',
    icon: FileType2,
    keywords: ['image to base64', 'base64 to image', 'data uri encoder', 'image data url', 'base64 image decoder'],
    processing: 'browser',
    badge: 'No upload',
    accepts: 'image/*',
    maxFileSizeMb: 20,
    intro: [
      'Paste a Base64 string to see the image and download it as a real file, or upload an image to get a ready-to-use data URI for CSS, HTML or JSON payloads.',
      'Both directions run locally. The decoder validates the string first, so a truncated or malformed payload produces a clear error instead of a broken image icon.',
    ],
    howTo: [
      'Upload an image to encode it, or paste a Base64 or data URI string to decode it.',
      'Review the preview and the generated output.',
      'Copy the result to your clipboard or download it.',
      'Use Reset to clear both panes and start again.',
    ],
    faq: [
      {
        question: 'When should I use a Base64 image?',
        answer:
          'For small icons and inline assets where saving an HTTP request matters. Base64 makes files about 33% larger, so it is a poor choice for photographs.',
      },
      {
        question: 'Do I need the data:image/... prefix?',
        answer:
          'The tool accepts both raw Base64 and full data URIs when decoding, and lets you copy either format when encoding.',
      },
      {
        question: 'What is the maximum size?',
        answer:
          'Uploads up to 20 MB. Very long Base64 strings can be slow to render in a text area, so we recommend keeping encoded images under a few megabytes.',
      },
      {
        question: 'Is anything uploaded?',
        answer: 'No — encoding and decoding use the browser FileReader API only.',
      },
    ],
    related: ['base64-encoder', 'image-converter', 'image-compressor', 'file-hash'],
    outputFormats: ['Base64', 'Image file'],
  },

  /* ------------------------------------------------------------------ */
  /*  PDF TOOLS                                                          */
  /* ------------------------------------------------------------------ */
  {
    slug: 'pdf-merger',
    name: 'PDF Merger',
    category: 'pdf-tools',
    tagline: 'Combine multiple PDFs into one document and reorder the pages.',
    description:
      'Merge PDF files online free. Upload several PDFs, drag them into the order you want, remove any you no longer need and download a single combined document.',
    icon: Files,
    keywords: ['merge pdf', 'combine pdf', 'pdf merger', 'join pdf files', 'pdf combiner'],
    popular: true,
    processing: 'browser',
    badge: 'No upload',
    accepts: 'application/pdf,.pdf',
    maxFileSizeMb: 200,
    multiple: true,
    intro: [
      'Combine contracts, invoices, reports and scans into one clean document. Files appear as cards you can reorder with the arrow buttons or remove individually, and a page count updates as you go.',
      'Merging happens locally with pdf-lib: your documents are read into memory in the browser, concatenated, and handed back to you as a download. Nothing is transmitted.',
    ],
    howTo: [
      'Upload two or more PDF files.',
      'Use the arrow buttons to put them in the order you want.',
      'Remove any file you added by mistake.',
      'Click Merge PDFs.',
      'Download the merged document.',
    ],
    faq: [
      {
        question: 'How many PDFs can I merge at once?',
        answer:
          'As many as your device memory allows — a few dozen typical documents is fine. Total size is capped at 200 MB to keep the browser responsive.',
      },
      {
        question: 'Are my documents uploaded anywhere?',
        answer:
          'No. The files never leave your browser; merging is done with client-side JavaScript.',
      },
      {
        question: 'Does merging preserve links and bookmarks?',
        answer:
          'Page content, fonts, images and internal links are preserved. Document-level outlines and form fields from the source files are not carried over.',
      },
      {
        question: 'What if one of my PDFs is password protected?',
        answer:
          'Encrypted PDFs cannot be opened without the password. Remove the protection first, then merge the unlocked copies.',
      },
    ],
    related: ['pdf-splitter', 'pdf-compressor', 'image-to-pdf', 'pdf-to-text'],
    outputFormats: ['PDF'],
  },
  {
    slug: 'pdf-splitter',
    name: 'PDF Splitter',
    category: 'pdf-tools',
    tagline: 'Extract a page range, or split a PDF into single pages.',
    description:
      'Split a PDF online for free. Enter a page range such as 1-5, 8, 11-13, or split every page into its own document, then download the result instantly.',
    icon: Scissors,
    keywords: ['split pdf', 'extract pdf pages', 'pdf page range', 'separate pdf', 'pdf extractor'],
    popular: true,
    processing: 'browser',
    badge: 'No upload',
    accepts: 'application/pdf,.pdf',
    maxFileSizeMb: 200,
    intro: [
      'Enter any combination of pages and ranges — "1-3, 7, 10-12" — and the tool builds a new PDF containing exactly those pages, in that order. Repetitions are allowed, so you can duplicate a page if you need to.',
      'Switch to split mode to turn every page into its own file and download them one by one. Page numbers are validated against the real document before anything runs.',
    ],
    howTo: [
      'Upload the PDF you want to split.',
      'Choose range mode or "every page separately".',
      'Type the pages you need, for example 1-4, 9, 12-15.',
      'Click Split PDF.',
      'Download the extracted document or the individual pages.',
    ],
    faq: [
      {
        question: 'What page range syntax is supported?',
        answer:
          'Comma-separated numbers and ranges: 1-5, 8, 11-13. Ranges that run backwards are ignored, and duplicates are allowed.',
      },
      {
        question: 'Can I extract just one page?',
        answer: 'Yes — enter a single number such as 7.',
      },
      {
        question: 'Is there a page limit?',
        answer:
          'Documents up to 200 MB are accepted. Very long documents (several hundred pages) may take a few seconds to process.',
      },
      {
        question: 'Does splitting change the quality of the pages?',
        answer:
          'No. Pages are copied as-is, so text, vector graphics and images keep their original resolution.',
      },
    ],
    related: ['pdf-merger', 'pdf-to-image', 'pdf-compressor', 'pdf-to-text'],
    outputFormats: ['PDF'],
  },
  {
    slug: 'pdf-to-image',
    name: 'PDF to Images',
    category: 'pdf-tools',
    tagline: 'Render any PDF page to a PNG or JPEG image at the resolution you pick.',
    description:
      'Convert PDF pages to PNG or JPG images free online. Upload a PDF, choose the page, set the resolution and download a crisp image — rendered in your own browser.',
    icon: FileSearch,
    keywords: ['pdf to image', 'pdf to png', 'pdf to jpg', 'convert pdf page to image', 'pdf screenshot'],
    processing: 'browser',
    badge: 'No upload',
    accepts: 'application/pdf,.pdf',
    maxFileSizeMb: 200,
    intro: [
      'pdf.js rasterises the page you choose onto a canvas, and you control the output scale — from a quick 1× preview up to a 4× print-quality render. Export as PNG for crisp text or JPEG for smaller files.',
      'Rendering is done locally, so the page you convert never leaves your device.',
    ],
    howTo: [
      'Upload your PDF file.',
      'Select the page you want to convert.',
      'Choose the output format and resolution.',
      'Click Convert to Image.',
      'Download the generated image.',
    ],
    faq: [
      {
        question: 'Which resolution should I choose?',
        answer:
          '1× matches the PDF page size and is fine for viewing. 2× is good for presentations; 3–4× is best for printing or for zooming into detailed diagrams.',
      },
      {
        question: 'Can I convert every page at once?',
        answer:
          'Yes — switch to "All pages" and each page is exported as its own image file.',
      },
      {
        question: 'Why does rendering take a moment?',
        answer:
          'Rasterising a vector PDF requires drawing it pixel by pixel. Higher scale factors take longer; the progress bar shows the real status.',
      },
      {
        question: 'Is the text in the image selectable?',
        answer:
          'No, the output is a picture of the page. Use the PDF to Text tool if you need editable text.',
      },
    ],
    related: ['pdf-splitter', 'pdf-to-text', 'pdf-compressor', 'image-compressor'],
    outputFormats: ['PNG', 'JPEG'],
  },
  {
    slug: 'pdf-compressor',
    name: 'PDF Compressor',
    category: 'pdf-tools',
    tagline: 'Re-render pages as optimised images to shrink a PDF.',
    description:
      'Compress PDF files online for free. Reduce resolution and image quality to produce a much smaller PDF, entirely inside your browser with pdf.js and pdf-lib.',
    icon: FileDown,
    keywords: ['compress pdf', 'reduce pdf size', 'pdf optimizer', 'shrink pdf', 'smaller pdf'],
    processing: 'browser',
    badge: 'No upload',
    accepts: 'application/pdf,.pdf',
    maxFileSizeMb: 200,
    intro: [
      'The most reliable way to shrink a PDF is to rasterise its pages at a lower resolution and rebuild the document as a compact, image-based PDF. That is exactly what this tool does: pdf.js renders each page to a canvas, and pdf-lib reassembles them into a new file.',
      'Pick a scale factor (how many pixels per page) and a JPEG quality. A 40 MB scan-heavy document usually drops below 5 MB at 1× scale and 70% quality. Be aware that rasterised text is no longer selectable, so keep an uncompressed copy if you need to search or edit later.',
    ],
    howTo: [
      'Upload the PDF you want to compress.',
      'Choose the resolution scale and image quality.',
      'Click Compress PDF and watch the per-page progress.',
      'Compare the original and compressed sizes.',
      'Download the compressed PDF.',
    ],
    faq: [
      {
        question: 'How much smaller will my PDF get?',
        answer:
          'Documents dominated by scanned images typically shrink by 70–90%. PDFs that are mostly vector text and already optimised will shrink far less.',
      },
      {
        question: 'Will the text still be selectable?',
        answer:
          'No. Compression rasterises each page into an image, so text becomes part of the picture. Keep your original if you need to search, copy or edit the content later.',
      },
      {
        question: 'Why not just strip metadata?',
        answer:
          'Metadata is usually only a few kilobytes. Almost all of a large PDF\'s weight is images, so re-rendering them at a sensible resolution is what actually makes a difference.',
      },
      {
        question: 'Is my document uploaded?',
        answer: 'No. Rendering and rebuilding both happen in your browser tab.',
      },
    ],
    related: ['pdf-merger', 'pdf-splitter', 'pdf-to-image', 'image-compressor'],
    outputFormats: ['PDF'],
  },
  {
    slug: 'pdf-to-text',
    name: 'PDF to Text',
    category: 'pdf-tools',
    tagline: 'Extract selectable text from a PDF, page by page.',
    description:
      'Extract text from a PDF online for free. Upload a document, read the extracted text in your browser and copy or download it as a .txt file.',
    icon: FileText,
    keywords: ['pdf to text', 'extract text from pdf', 'pdf text extractor', 'copy text from pdf', 'pdf to txt'],
    processing: 'browser',
    badge: 'No upload',
    accepts: 'application/pdf,.pdf',
    maxFileSizeMb: 200,
    intro: [
      'Upload a PDF and the tool walks through every page, pulling out the text layer with pdf.js and joining the lines back together in reading order. The result appears in an editor where you can copy it or save it as .txt.',
      'This only works for PDFs that contain a real text layer. Scanned documents are images, so they need OCR — we will tell you honestly when a page contains no extractable text rather than returning an empty box and pretending it worked.',
    ],
    howTo: [
      'Upload your PDF file.',
      'Click Extract Text.',
      'Review the extracted content in the editor.',
      'Copy it to your clipboard or download it as a .txt file.',
      'Use Clear to empty the editor and start over.',
    ],
    faq: [
      {
        question: 'Why is the extracted text empty?',
        answer:
          'The PDF is most likely a scan — a picture of a page with no text layer. Nothing can be extracted without OCR, and this tool does not fake it. Try a text-based PDF or run OCR first.',
      },
      {
        question: 'Will the formatting be preserved?',
        answer:
          'Line breaks and reading order are preserved as well as the PDF layout allows. Complex multi-column layouts may need manual tidying.',
      },
      {
        question: 'Does it work with password-protected PDFs?',
        answer:
          'No. Encrypted files cannot be read until the protection is removed.',
      },
      {
        question: 'Is the file uploaded?',
        answer: 'No. Extraction runs locally via pdf.js inside your browser.',
      },
    ],
    related: ['pdf-to-image', 'pdf-splitter', 'pdf-compressor', 'text-formatter'],
    outputFormats: ['TXT'],
  },

  /* ------------------------------------------------------------------ */
  /*  TEXT TOOLS                                                         */
  /* ------------------------------------------------------------------ */
  {
    slug: 'word-counter',
    name: 'Word Counter',
    category: 'text-tools',
    tagline: 'Count words, characters, sentences, paragraphs and reading time live.',
    description:
      'Count words and characters online for free. Live word count, character count with and without spaces, sentences, paragraphs and estimated reading time as you type.',
    icon: Type,
    keywords: ['word counter', 'character counter', 'count words online', 'reading time calculator', 'text statistics'],
    popular: true,
    processing: 'browser',
    badge: 'Live',
    intro: [
      'Paste or type your text and every statistic updates on each keystroke: words, characters, characters excluding whitespace, sentences, paragraphs, unique words and estimated reading and speaking time.',
      'Handy for essays with word limits, meta descriptions, tweets, video scripts and translation quotes. Everything is calculated in the page — your writing is never sent anywhere.',
    ],
    howTo: [
      'Type or paste your text into the editor.',
      'Read the live counters above the editor.',
      'Switch on keyword density if you need the most frequent words.',
      'Copy the text or download it as a .txt file.',
      'Click Clear to empty the editor.',
    ],
    faq: [
      {
        question: 'How is reading time calculated?',
        answer:
          'We divide the word count by 200 words per minute, the standard estimate for adult non-fiction reading, and round up to the nearest minute.',
      },
      {
        question: 'What counts as a word?',
        answer:
          'Any run of characters separated by whitespace, after trimming punctuation. Numbers and hyphenated words count as single words.',
      },
      {
        question: 'Does it count emoji and non-Latin scripts?',
        answer:
          'Yes. Characters are counted with Unicode-aware splitting, so accented letters and CJK text are handled correctly.',
      },
      {
        question: 'Is my text stored?',
        answer: 'No. Nothing is saved or transmitted; reload the page and the editor is empty.',
      },
    ],
    related: ['case-converter', 'text-formatter', 'json-formatter', 'lorem-ipsum'],
    outputFormats: ['TXT'],
  },
  {
    slug: 'case-converter',
    name: 'Case Converter',
    category: 'text-tools',
    tagline: 'Switch text between UPPERCASE, lowercase, Title Case and Sentence case.',
    description:
      'Convert text case online for free. Instantly transform text to UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, kebab-case or Alternating case.',
    icon: CaseSensitive,
    keywords: ['case converter', 'uppercase', 'lowercase', 'title case', 'sentence case', 'camelcase converter'],
    popular: true,
    processing: 'browser',
    badge: 'Live',
    intro: [
      'Nine transformations, applied instantly: UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case and Alternating case.',
      'Title Case uses smart capitalisation, leaving small words such as "and", "of" and "the" in lowercase unless they start the phrase. Sentence case repairs capitalisation after full stops while leaving intentional acronyms alone.',
    ],
    howTo: [
      'Type or paste your text into the editor.',
      'Click any transformation button.',
      'Check the live counts to confirm the result.',
      'Copy the converted text.',
      'Click Clear to start again.',
    ],
    faq: [
      {
        question: 'Which conversions are available?',
        answer:
          'UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case and Alternating case.',
      },
      {
        question: 'How does Title Case decide which words to capitalise?',
        answer:
          'Every word is capitalised except a short list of articles, conjunctions and prepositions — unless they are the first or last word of the title.',
      },
      {
        question: 'Can I undo a conversion?',
        answer:
          'Yes. Each step is reversible in the sense that you can apply another transformation, and the Clear button restores an empty editor. Keep a copy of your original if it is important.',
      },
      {
        question: 'Is my text uploaded?',
        answer: 'No, all transformations run in the browser.',
      },
    ],
    related: ['text-formatter', 'word-counter', 'json-formatter', 'lorem-ipsum'],
    outputFormats: ['TXT'],
  },
  {
    slug: 'text-formatter',
    name: 'Text Formatter',
    category: 'text-tools',
    tagline: 'Clean up messy text: trim spaces, drop duplicate lines, sort or reverse.',
    description:
      'Format and clean text online for free. Remove extra spaces and blank lines, delete duplicate lines, sort lines A-Z, reverse text and remove line breaks in one click.',
    icon: AlignLeft,
    keywords: ['text formatter', 'remove extra spaces', 'remove duplicate lines', 'sort lines', 'reverse text', 'text cleaner'],
    processing: 'browser',
    badge: 'Live',
    intro: [
      'A toolkit for text that arrived in bad shape. Trim leading and trailing whitespace, collapse runs of spaces, strip empty or duplicated lines, sort alphabetically, reverse the order, remove all line breaks, or strip punctuation and accents.',
      'Every operation is a single click and each one is undoable with the Undo button, which keeps the last 25 states — so you can experiment without losing your work.',
    ],
    howTo: [
      'Paste your text into the editor.',
      'Apply any combination of the formatting buttons.',
      'Use Undo if a step went too far.',
      'Copy the cleaned text or download it as a .txt file.',
      'Click Clear to start over.',
    ],
    faq: [
      {
        question: 'What does "remove duplicate lines" keep?',
        answer:
          'The first occurrence of each unique line, preserving the original order. Enable sorting first if you want a sorted, deduplicated list.',
      },
      {
        question: 'Can I apply several operations at once?',
        answer:
          'Yes — operations stack in the order you click them, and the Undo button walks back through each step.',
      },
      {
        question: 'Does sorting respect numbers?',
        answer:
          'Sorting is alphabetical and case-insensitive by default. Toggle case-sensitive sorting when capitalisation matters.',
      },
      {
        question: 'Is there a size limit?',
        answer:
          'The editor handles a few hundred thousand characters comfortably; very large pastes may feel slower on older phones.',
      },
    ],
    related: ['case-converter', 'word-counter', 'json-formatter', 'csv-to-json'],
    outputFormats: ['TXT'],
  },
  {
    slug: 'json-formatter',
    name: 'JSON Formatter',
    category: 'text-tools',
    tagline: 'Pretty-print, minify and validate JSON with real error messages.',
    description:
      'Format, minify and validate JSON online for free. Paste your JSON, see it pretty-printed with syntax errors and exact line numbers, then copy or download the result.',
    icon: Braces,
    keywords: ['json formatter', 'json validator', 'pretty print json', 'minify json', 'json viewer', 'json lint'],
    popular: true,
    processing: 'browser',
    badge: 'Live',
    intro: [
      'Pretty-print with 2-space indentation, minify to a single line, or validate without changing anything. When the JSON is invalid you get the parser\'s real message together with the line and column where it broke.',
      'The validator also warns about common problems that are syntactically legal but usually wrong — duplicate keys and trailing commas in a JSON5 paste.',
    ],
    howTo: [
      'Paste or type your JSON into the editor.',
      'Click Format to pretty-print, Minify to compact, or Validate to only check it.',
      'Read the error panel if the JSON is invalid.',
      'Copy the result or download it as a .json file.',
      'Click Clear to empty both panes.',
    ],
    faq: [
      {
        question: 'How are errors reported?',
        answer:
          'We show the message returned by the JSON parser, plus the line and column number when the browser provides it, and a caret pointing at the offending character.',
      },
      {
        question: 'Does formatting change my data?',
        answer:
          'No. Key order and values are preserved; only whitespace changes. Duplicate keys are reported but not silently dropped.',
      },
      {
        question: 'What is the difference between formatting and minifying?',
        answer:
          'Formatting adds indentation and line breaks for humans. Minifying removes all unnecessary whitespace to make the payload as small as possible.',
      },
      {
        question: 'Is my JSON uploaded anywhere?',
        answer: 'No. Parsing and stringifying happen entirely in your browser.',
      },
    ],
    related: ['csv-to-json', 'text-formatter', 'base64-encoder', 'regex-tester'],
    outputFormats: ['JSON'],
  },
  {
    slug: 'lorem-ipsum',
    name: 'Lorem Ipsum Generator',
    category: 'text-tools',
    tagline: 'Generate placeholder paragraphs, sentences or words for your layout.',
    description:
      'Generate Lorem Ipsum placeholder text online for free. Choose paragraphs, sentences or words, set the amount and copy clean filler text instantly.',
    icon: AlignLeft,
    keywords: ['lorem ipsum', 'placeholder text', 'dummy text generator', 'filler text', 'lorem generator'],
    processing: 'browser',
    badge: 'Instant',
    intro: [
      'Produce a few words or a few thousand, as paragraphs, sentences or a plain word list. The classic Cicero-derived vocabulary is used, so your mockups look like real copy without distracting anyone with actual content.',
      'Copy the result with one click, or download it as a .txt file to drop into a project.',
    ],
    howTo: [
      'Choose whether you want paragraphs, sentences or words.',
      'Set how many you need.',
      'Click Generate (or regenerate for a fresh variation).',
      'Copy the text or download it.',
      'Reset to return to the default settings.',
    ],
    faq: [
      {
        question: 'Where does the text come from?',
        answer:
          'From the traditional Lorem Ipsum vocabulary, assembled randomly on your device each time you generate.',
      },
      {
        question: 'Can I start with "Lorem ipsum dolor sit amet"?',
        answer: 'Yes — enable the classic opening option to begin every paragraph set with the familiar phrase.',
      },
      {
        question: 'Is there a limit?',
        answer: 'You can generate up to 100 paragraphs, 200 sentences or 2,000 words in one go.',
      },
      {
        question: 'Does it work offline?',
        answer: 'Yes, once the page has loaded the generator needs no network connection.',
      },
    ],
    related: ['word-counter', 'text-formatter', 'case-converter', 'password-generator'],
    outputFormats: ['TXT'],
  },
  {
    slug: 'password-generator',
    name: 'Password Generator',
    category: 'text-tools',
    tagline: 'Create strong random passwords with the character sets you choose.',
    description:
      'Generate strong random passwords online for free. Pick a length and character sets, see a real entropy estimate, and copy a password created with your browser\'s crypto RNG.',
    icon: Lock,
    keywords: ['password generator', 'random password', 'strong password', 'secure password generator', 'passphrase generator'],
    processing: 'browser',
    badge: 'No upload',
    intro: [
      'Passwords are generated with crypto.getRandomValues — the same cryptographic random source browsers use for TLS — never with Math.random. Choose the length and which character sets to include, and read an honest entropy estimate for the result.',
      'Nothing is transmitted or stored: the password exists only in your browser until you copy it.',
    ],
    howTo: [
      'Choose the password length.',
      'Tick the character sets you want to include.',
      'Click Generate Password.',
      'Read the strength estimate and copy the password.',
      'Store it in your password manager, then reset the tool.',
    ],
    faq: [
      {
        question: 'Is the password sent to your server?',
        answer:
          'No. It is generated locally with the Web Crypto API and never leaves your device.',
      },
      {
        question: 'How strong is a generated password?',
        answer:
          'Strength depends on length and character set size. A 16-character password from all four sets has roughly 104 bits of entropy, which is far beyond practical brute force.',
      },
      {
        question: 'Do you store generated passwords?',
        answer: 'No. We have no way to see them and keep no logs of any kind.',
      },
      {
        question: 'Should I exclude ambiguous characters?',
        answer:
          'If you will ever read the password aloud or type it from paper, yes — excluding 0/O and l/1/I avoids most transcription mistakes.',
      },
    ],
    related: ['file-hash', 'lorem-ipsum', 'base64-encoder', 'qr-code-generator'],
    outputFormats: ['Text'],
  },

  /* ------------------------------------------------------------------ */
  /*  AI TOOLS                                                           */
  /* ------------------------------------------------------------------ */
  {
    slug: 'ai-text-generator',
    name: 'AI Text Generator',
    category: 'ai-tools',
    tagline: 'Draft articles, posts and emails using a provider you configure.',
    description:
      'Generate text with AI using your own API provider. Set a prompt, tone and length, then get a real model response through a secure server-side route — never a fake result.',
    icon: Sparkles,
    keywords: ['ai text generator', 'ai writer', 'ai content generator', 'free ai writing tool', 'ai paragraph generator'],
    popular: true,
    processing: 'server',
    badge: 'API key required',
    intro: [
      'Describe what you need, choose a tone and a target length, and the tool sends the request to a secure server route which forwards it to the configured AI provider. The API key lives in an environment variable on the server and is never exposed to the browser.',
      'If no provider is configured, the tool tells you so plainly instead of returning a canned sentence that pretends to be AI output. We consider that an important part of being trustworthy.',
    ],
    howTo: [
      'Write a clear prompt describing what you want.',
      'Pick a tone and an approximate length.',
      'Click Generate.',
      'Review the response, then copy it or clear the pane.',
      'If you see "AI service is not configured yet", set AI_API_KEY on the server.',
    ],
    faq: [
      {
        question: 'Is the AI response generated for real?',
        answer:
          'Yes, when a provider is configured. Requests are sent server-side to the configured model and the answer is streamed back verbatim. We never fabricate output.',
      },
      {
        question: 'Why do I see "AI service is not configured yet"?',
        answer:
          'Because the deployment has no AI_API_KEY environment variable. Set AI_API_KEY (plus AI_API_BASE_URL and AI_API_MODEL if you use a non-OpenAI provider) and restart the server.',
      },
      {
        question: 'Is my API key exposed in the browser?',
        answer:
          'No. The key is read only inside a Node.js route handler on the server. It never appears in the page source, network responses or client bundles.',
      },
      {
        question: 'Which providers are supported?',
        answer:
          'Any OpenAI-compatible chat completions endpoint, including OpenAI, Groq, OpenRouter, Together, Fireworks and a local Ollama or LM Studio server.',
      },
    ],
    related: ['ai-summarizer', 'ai-title-generator', 'word-counter', 'text-formatter'],
  },
  {
    slug: 'ai-summarizer',
    name: 'AI Summarizer',
    category: 'ai-tools',
    tagline: 'Condense long text into a short, faithful summary.',
    description:
      'Summarise text with AI through a secure server-side API. Paste an article or report, choose a summary style and get a real model-generated summary you can copy.',
    icon: Wand2,
    keywords: ['ai summarizer', 'summarize text', 'text summarizer', 'article summarizer', 'ai summary tool'],
    popular: true,
    processing: 'server',
    badge: 'API key required',
    intro: [
      'Paste an article, report or meeting note and choose how you want it condensed: a short paragraph, a set of bullet points, or a one-line takeaway. The request is handled by the same secure server route as the AI Text Generator.',
      'The summary comes from the configured model, not from a sentence-trimming trick. If the model is unavailable or unconfigured, you will see an honest error message and nothing else.',
    ],
    howTo: [
      'Paste the text you want summarised.',
      'Choose a summary style and length.',
      'Click Summarise.',
      'Copy the summary to your clipboard.',
      'Clear both panes when you are done.',
    ],
    faq: [
      {
        question: 'What is the maximum input length?',
        answer:
          'The tool accepts up to 15,000 characters. Longer documents should be summarised in sections, since every model has a context limit of its own.',
      },
      {
        question: 'Does the summary stay faithful to the source?',
        answer:
          'The model is instructed to use only the information in your text. As with any AI output, check important facts before publishing.',
      },
      {
        question: 'Is my text stored?',
        answer:
          'Your text is forwarded to the configured AI provider to produce the summary. It is not logged by ToolNova.',
      },
      {
        question: 'What if no API key is configured?',
        answer: 'The tool shows "AI service is not configured yet." and does not generate anything.',
      },
    ],
    related: ['ai-text-generator', 'ai-title-generator', 'word-counter', 'pdf-to-text'],
  },
  {
    slug: 'ai-title-generator',
    name: 'AI Title & Meta Generator',
    category: 'ai-tools',
    tagline: 'Generate SEO titles and meta descriptions for a page or post.',
    description:
      'Generate SEO titles and meta descriptions with AI through a secure server route. Enter your topic, get real model output with character counts that fit search results.',
    icon: FileSearch,
    keywords: ['seo title generator', 'meta description generator', 'ai seo tool', 'blog title generator', 'meta tag generator'],
    processing: 'server',
    badge: 'API key required',
    intro: [
      'Give the tool a topic or a draft and it returns several title options and meta descriptions, each with a character count so you can see whether it will be truncated in search results.',
      'As with every AI tool here, output comes from the configured provider through a server-side route. Without a key you get a clear configuration message rather than invented copy.',
    ],
    howTo: [
      'Enter your topic, keyword or draft copy.',
      'Choose how many suggestions you want.',
      'Click Generate.',
      'Review the character counts and pick the best option.',
      'Copy the title and description you want to use.',
    ],
    faq: [
      {
        question: 'How long should a meta description be?',
        answer:
          'Around 150–160 characters. Anything longer is usually cut off in search results, so the tool flags suggestions that run over.',
      },
      {
        question: 'Do you guarantee better rankings?',
        answer:
          'No, and nobody honestly can. Good titles and descriptions improve click-through, which is one signal among many.',
      },
      {
        question: 'Can I use it without an API key?',
        answer:
          'No. The tool requires a configured provider and says so clearly instead of producing placeholder text.',
      },
      {
        question: 'Which providers work?',
        answer: 'Any OpenAI-compatible chat completions API configured through AI_API_KEY and AI_API_BASE_URL.',
      },
    ],
    related: ['ai-text-generator', 'ai-summarizer', 'word-counter', 'case-converter'],
  },

  /* ------------------------------------------------------------------ */
  /*  FILE TOOLS                                                         */
  /* ------------------------------------------------------------------ */
  {
    slug: 'zip-files',
    name: 'ZIP File Creator',
    category: 'file-tools',
    tagline: 'Bundle files into a ZIP archive with real deflate compression.',
    description:
      'Create a ZIP file online for free. Add any files, set the compression level and download a real ZIP archive built locally in your browser — no uploads.',
    icon: FileArchive,
    keywords: ['zip files online', 'create zip', 'file compressor', 'zip archive creator', 'compress files'],
    popular: true,
    processing: 'browser',
    badge: 'No upload',
    accepts: '*/*',
    maxFileSizeMb: 500,
    multiple: true,
    intro: [
      'Add as many files as you need — documents, images, spreadsheets, anything — and download them as a single ZIP archive. Compression level is adjustable, from Store (fastest) to Maximum (smallest).',
      'Archives are produced with JSZip in your browser. Already-compressed formats such as MP4, ZIP and JPEG will not shrink much, which is normal and not a bug.',
    ],
    howTo: [
      'Add one or more files.',
      'Remove anything you no longer want in the archive.',
      'Choose a compression level.',
      'Click Create ZIP.',
      'Download the archive.',
    ],
    faq: [
      {
        question: 'Why did my file barely get smaller?',
        answer:
          'ZIP compression is lossless, so media that is already compressed (JPEG, MP4, MP3, other ZIPs) has little redundancy left to remove. Text, CSV and logs compress very well.',
      },
      {
        question: 'How many files can I add?',
        answer:
          'There is no fixed limit; the practical ceiling is your device memory. A few hundred typical files works fine.',
      },
      {
        question: 'Can I password-protect the archive?',
        answer:
          'Not yet — encryption for ZIP is on the roadmap. Until then, do not use this tool for confidential archives.',
      },
      {
        question: 'Are my files uploaded?',
        answer: 'No. The archive is assembled in your browser and downloaded directly.',
      },
    ],
    related: ['file-hash', 'base64-encoder', 'pdf-merger', 'image-to-pdf'],
    outputFormats: ['ZIP'],
  },
  {
    slug: 'qr-code-generator',
    name: 'QR Code Generator',
    category: 'file-tools',
    tagline: 'Turn a URL, text, vCard or Wi-Fi login into a scannable QR code.',
    description:
      'Generate QR codes free online for URLs, text, emails, phone numbers, Wi-Fi credentials and vCards. Customise the size and colours, then download PNG or SVG.',
    icon: QrCode,
    keywords: ['qr code generator', 'create qr code', 'free qr code', 'wifi qr code', 'qr code for url'],
    popular: true,
    processing: 'browser',
    badge: 'No upload',
    intro: [
      'Type any URL, note, phone number, email address, Wi-Fi credentials or vCard and get a QR code immediately. Adjust the pixel size, margin, error correction level and colours (keeping enough contrast for reliable scanning).',
      'Download as PNG for documents and screens, or as SVG when you need a crisp, infinitely scalable code for print.',
    ],
    howTo: [
      'Choose the content type: URL, text, email, phone, Wi-Fi or vCard.',
      'Fill in the fields and watch the code update live.',
      'Adjust the size, error correction and colours if needed.',
      'Download the QR code as PNG or SVG.',
      'Reset to start a new code.',
    ],
    faq: [
      {
        question: 'Do QR codes expire?',
        answer:
          'No. A QR code is just an encoded picture of your data — it keeps working forever, even if you change the content behind the URL later.',
      },
      {
        question: 'Which error correction level should I use?',
        answer:
          'M (15%) suits most uses. Choose Q or H when the code will be printed small, placed over an image, or scanned from a distance.',
      },
      {
        question: 'Can I use brand colours?',
        answer:
          'Yes, but keep strong contrast between foreground and background and never invert to a light-on-dark code unless you test it with a real scanner first.',
      },
      {
        question: 'Is my data uploaded?',
        answer: 'No. The code is generated in the browser and never transmitted.',
      },
    ],
    related: ['base64-encoder', 'url-encoder', 'zip-files', 'image-converter'],
    outputFormats: ['PNG', 'SVG'],
  },
  {
    slug: 'base64-encoder',
    name: 'Base64 Encoder / Decoder',
    category: 'file-tools',
    tagline: 'Encode and decode Base64 text or files, with URL-safe mode.',
    description:
      'Encode or decode Base64 online for free. Convert text or any file to Base64 and back instantly in your browser, with optional URL-safe alphabet and line wrapping.',
    icon: FileKey,
    keywords: ['base64 encoder', 'base64 decoder', 'encode base64', 'decode base64', 'base64 file converter'],
    processing: 'browser',
    badge: 'No upload',
    accepts: '*/*',
    maxFileSizeMb: 25,
    intro: [
      'Encode plain text or an entire file to Base64, and decode Base64 back into readable text or a downloadable file. Toggle the URL-safe alphabet (+/ replaced by -_) when the result has to travel in a URL or filename.',
      'Unicode is handled properly: text is encoded as UTF-8 bytes first, so accented characters, emoji and non-Latin scripts round-trip correctly instead of producing mojibake.',
    ],
    howTo: [
      'Type or paste text to encode it, or upload a file to encode its bytes.',
      'Switch to Decode mode to reverse the operation.',
      'Enable URL-safe mode if the output goes into a URL.',
      'Copy the result or download it as a file.',
      'Clear both panes to start again.',
    ],
    faq: [
      {
        question: 'Why encode with Base64 at all?',
        answer:
          'It lets binary data travel through systems that only accept text — JSON payloads, HTML attributes, email bodies, basic auth headers.',
      },
      {
        question: 'How much bigger does it get?',
        answer: 'About 33%: every 3 bytes of input become 4 characters of output.',
      },
      {
        question: 'Is Base64 encryption?',
        answer:
          'No. It is an encoding, trivially reversible by anyone. Never use it to hide secrets.',
      },
      {
        question: 'Does it handle emoji and accented text?',
        answer: 'Yes. Text is converted to UTF-8 before encoding and decoded back to a string afterwards.',
      },
    ],
    related: ['file-hash', 'url-encoder', 'image-to-base64', 'json-formatter'],
    outputFormats: ['Text', 'File'],
  },
  {
    slug: 'file-hash',
    name: 'File Checksum Generator',
    category: 'file-tools',
    tagline: 'Calculate SHA-1, SHA-256 and SHA-512 checksums for any file.',
    description:
      'Generate file checksums online for free. Compute SHA-1, SHA-256 and SHA-512 hashes locally with the Web Crypto API to verify that a download arrived intact.',
    icon: Fingerprint,
    keywords: ['checksum generator', 'file hash', 'sha256 file', 'md5 checksum', 'verify file integrity'],
    processing: 'browser',
    badge: 'No upload',
    accepts: '*/*',
    maxFileSizeMb: 500,
    multiple: true,
    intro: [
      'Drop a file in and get its SHA-1, SHA-256 and SHA-512 digests, computed with the browser\'s native Web Crypto implementation. Compare a published checksum against the one you calculated to confirm a file is authentic and complete.',
      'Files are read and hashed locally in chunks, so even large archives work without blocking the interface. MD5 and CRC32 are not offered by Web Crypto and are deliberately not faked.',
    ],
    howTo: [
      'Upload one or more files.',
      'Tick the algorithms you want.',
      'Click Calculate Checksums.',
      'Compare the digests with the ones published by the file author.',
      'Copy a digest or clear the list.',
    ],
    faq: [
      {
        question: 'Why is there no MD5?',
        answer:
          'Web Crypto does not expose MD5 or CRC32. Rather than implementing a broken or slow substitute, the tool offers the SHA family, which is what modern software publishes anyway.',
      },
      {
        question: 'Are my files uploaded?',
        answer: 'No. Hashing runs entirely in your browser; the file never leaves your device.',
      },
      {
        question: 'What does matching a checksum prove?',
        answer:
          'That your copy is byte-for-byte identical to the file the publisher hashed. It confirms integrity, not intent — always download from sources you trust.',
      },
      {
        question: 'How large a file can I hash?',
        answer:
          'Up to 500 MB per file. Files are streamed in 8 MB chunks to keep memory use low.',
      },
    ],
    related: ['zip-files', 'base64-encoder', 'hash-generator', 'password-generator'],
    outputFormats: ['Text'],
  },

  /* ------------------------------------------------------------------ */
  /*  DEVELOPER TOOLS                                                    */
  /* ------------------------------------------------------------------ */
  {
    slug: 'regex-tester',
    name: 'Regex Tester',
    category: 'developer-tools',
    tagline: 'Test regular expressions live with highlighted matches and groups.',
    description:
      'Test regular expressions online for free. Write a pattern and flags, see every match, capture group and replacement preview update instantly, plus a plain-English explanation.',
    icon: Regex,
    keywords: ['regex tester', 'regular expression tester', 'regex online', 'javascript regex', 'regex101 alternative'],
    popular: true,
    processing: 'browser',
    badge: 'Live',
    intro: [
      'Type a pattern, pick your flags, and every match in the test string is highlighted immediately — including capture groups and named groups. Add a replacement string to preview the result of String.replace.',
      'Invalid patterns show the parser\'s real error message rather than silently matching nothing, and catastrophic patterns are run under a guard so a runaway regex cannot freeze the tab.',
    ],
    howTo: [
      'Enter a regular expression between the slashes.',
      'Choose the flags you need (g, i, m, s, u, y).',
      'Paste the text you want to test against.',
      'Read the match list, groups and replacement preview.',
      'Copy the pattern or reset the tester.',
    ],
    faq: [
      {
        question: 'Which regex flavour is this?',
        answer:
          'JavaScript (ECMAScript), the same engine your browser uses. Lookbehind is supported in modern browsers; some other engines\' extensions are not.',
      },
      {
        question: 'How do I use named capture groups?',
        answer:
          'Write (?<name>...) in the pattern; named groups appear individually in the results panel and can be referenced in the replacement as $<name>.',
      },
      {
        question: 'Why does my pattern match nothing?',
        answer:
          'Check the flags first — without g you only get the first match, and without i matching is case-sensitive. If the pattern is invalid the error message appears under the input.',
      },
      {
        question: 'Can it freeze my browser?',
        answer:
          'We cap the number of matches and wrap execution in a try/catch, so bad patterns produce an error instead of hanging the page.',
      },
    ],
    related: ['json-formatter', 'url-encoder', 'jwt-decoder', 'csv-to-json'],
  },
  {
    slug: 'url-encoder',
    name: 'URL Encoder / Decoder',
    category: 'developer-tools',
    tagline: 'Percent-encode URLs, query strings and form data safely.',
    description:
      'Encode and decode URLs online for free. Percent-encode text for use in a URL, or decode an encoded URL back to readable text, plus a query string parser and builder.',
    icon: Link2,
    keywords: ['url encoder', 'url decoder', 'percent encoding', 'encodeuri', 'query string parser'],
    processing: 'browser',
    badge: 'Live',
    intro: [
      'Paste a URL or a fragment of text and switch between encodeURIComponent and encodeURI semantics, decode encoded strings, and break a query string into an editable table of parameters.',
      'Everything runs locally, and the encoder highlights characters that must be escaped so you can see exactly what changed.',
    ],
    howTo: [
      'Paste or type the string you want to convert.',
      'Choose Encode or Decode.',
      'Pick component or full-URI mode for encoding.',
      'Use the query string table to inspect or edit parameters.',
      'Copy the result and clear the inputs.',
    ],
    faq: [
      {
        question: 'What is the difference between encodeURI and encodeURIComponent?',
        answer:
          'encodeURI leaves characters that are legal in a full URL (such as /, ? and #) untouched. encodeURIComponent escapes everything reserved, which is what you want for a value placed inside a query parameter.',
      },
      {
        question: 'Why are spaces sometimes "+" and sometimes "%20"?',
        answer:
          'In application/x-www-form-urlencoded bodies, spaces become "+". In a URL path or query they should be "%20".',
      },
      {
        question: 'Can it parse a whole query string?',
        answer:
          'Yes — paste a URL and the parameter table fills in automatically, including repeated keys.',
      },
      {
        question: 'Is the data uploaded?',
        answer: 'No, encoding and decoding are pure client-side JavaScript.',
      },
    ],
    related: ['base64-encoder', 'regex-tester', 'jwt-decoder', 'json-formatter'],
  },
  {
    slug: 'jwt-decoder',
    name: 'JWT Decoder',
    category: 'developer-tools',
    tagline: 'Decode a JWT header and payload and check expiry times.',
    description:
      'Decode JWT tokens online for free. Paste a token to see its header, payload claims and expiry, decoded locally in your browser without ever transmitting the token.',
    icon: KeyRound,
    keywords: ['jwt decoder', 'decode jwt', 'jwt parser', 'json web token', 'jwt claims'],
    processing: 'browser',
    badge: 'No upload',
    intro: [
      'Paste a JSON Web Token and see its header, its claims and the human-readable issue, expiry and not-before timestamps. Expired or not-yet-valid tokens are flagged clearly.',
      'Decoding only reads the token — it does not verify the signature, because verification requires the secret or public key, which must never be pasted into a website. We state that explicitly rather than implying the token is validated.',
    ],
    howTo: [
      'Paste your JWT into the input field.',
      'Click Decode Token.',
      'Inspect the header, payload and timestamps.',
      'Copy the decoded header or payload as formatted JSON.',
      'Clear the field when you are done.',
    ],
    faq: [
      {
        question: 'Do you verify the signature?',
        answer:
          'No. Signature verification needs the signing secret or public key, which you should never paste into any website. This tool decodes and displays the contents only.',
      },
      {
        question: 'Is my token sent to a server?',
        answer: 'No. Decoding happens in your browser; the token never leaves your device.',
      },
      {
        question: 'What are iat, exp and nbf?',
        answer:
          'Issued at, expires at and not before — Unix timestamps in seconds. The tool renders each of them as a readable date in your local timezone.',
      },
      {
        question: 'Why does decoding fail?',
        answer:
          'The string is not a well-formed JWT. A valid token has three Base64URL segments separated by dots.',
      },
    ],
    related: ['base64-encoder', 'json-formatter', 'hash-generator', 'regex-tester'],
  },
  {
    slug: 'timestamp-converter',
    name: 'Unix Timestamp Converter',
    category: 'developer-tools',
    tagline: 'Convert between Unix timestamps and human-readable dates.',
    description:
      'Convert Unix timestamps to dates and dates to timestamps online for free. See UTC and your local timezone side by side, with a live clock you can freeze.',
    icon: Clock,
    keywords: ['unix timestamp', 'timestamp converter', 'epoch converter', 'date to timestamp', 'time converter'],
    processing: 'browser',
    badge: 'Live',
    intro: [
      'Convert in both directions: paste a Unix timestamp to get every common date format, or pick a date and time to get its timestamp in seconds or milliseconds.',
      'UTC and your local timezone are shown together, along with ISO 8601, RFC 2822 and a relative description such as "3 days ago".',
    ],
    howTo: [
      'Choose a direction: timestamp to date, or date to timestamp.',
      'Enter the value or pick a date and time.',
      'Read the conversions, including UTC and local time.',
      'Copy the format you need.',
      'Reset to return to the current time.',
    ],
    faq: [
      {
        question: 'Seconds or milliseconds?',
        answer:
          'Both are accepted when converting to a date. The tool detects the magnitude and tells you which one it used; you can also force a unit.',
      },
      {
        question: 'How are timezones handled?',
        answer:
          'Results are shown in your device timezone and in UTC simultaneously, so you can compare without mental arithmetic.',
      },
      {
        question: 'What about dates before 1970?',
        answer:
          'Negative timestamps are supported; they simply represent dates before the Unix epoch.',
      },
      {
        question: 'Why does the current time keep changing?',
        answer:
          'The live clock updates every second. Press Freeze to hold a value while you copy it.',
      },
    ],
    related: ['jwt-decoder', 'regex-tester', 'url-encoder', 'json-formatter'],
  },
  {
    slug: 'csv-to-json',
    name: 'CSV to JSON',
    category: 'developer-tools',
    tagline: 'Convert CSV to JSON and back, with a live preview table.',
    description:
      'Convert CSV to JSON online for free. Paste CSV data, pick a delimiter and header handling, preview it as a table and export formatted or minified JSON.',
    icon: Table2,
    keywords: ['csv to json', 'json to csv', 'csv converter', 'csv parser', 'csv viewer'],
    processing: 'browser',
    badge: 'No upload',
    accepts: '.csv,.tsv,text/csv,text/plain',
    maxFileSizeMb: 25,
    intro: [
      'Paste CSV or TSV data (or upload a file) and get properly typed JSON: numbers, booleans and nulls are detected automatically, and quoted fields containing commas, quotes or newlines are parsed correctly.',
      'The reverse direction is supported too — paste an array of objects and export it as CSV with the delimiter and header row of your choice.',
    ],
    howTo: [
      'Paste your CSV data or upload a .csv file.',
      'Choose the delimiter and whether the first row is a header.',
      'Preview the parsed rows in the table.',
      'Copy the JSON or download it as a .json file.',
      'Switch direction to convert JSON back to CSV.',
    ],
    faq: [
      {
        question: 'How are quoted fields handled?',
        answer:
          'Quotes may wrap fields that contain the delimiter, line breaks or escaped double quotes (""), following the standard CSV escaping rules.',
      },
      {
        question: 'Are numbers converted to real numbers?',
        answer:
          'Yes — values that look like numbers, booleans or null become JSON numbers, booleans and null. Turn off type inference if you want everything kept as strings.',
      },
      {
        question: 'Can I convert JSON back to CSV?',
        answer: 'Yes. Paste an array of objects and the tool derives the columns from the union of all keys.',
      },
      {
        question: 'Is my data uploaded?',
        answer: 'No, parsing runs in your browser.',
      },
    ],
    related: ['json-formatter', 'text-formatter', 'regex-tester', 'base64-encoder'],
    outputFormats: ['JSON', 'CSV'],
  },
  {
    slug: 'hash-generator',
    name: 'Hash Generator',
    category: 'developer-tools',
    tagline: 'Hash any text with SHA-1, SHA-256, SHA-384 and SHA-512.',
    description:
      'Generate SHA hashes from text online for free. Type or paste text and get SHA-1, SHA-256, SHA-384 and SHA-512 digests instantly using the Web Crypto API.',
    icon: Hash,
    keywords: ['hash generator', 'sha256 generator', 'text hash', 'sha512 online', 'crypto hash tool'],
    processing: 'browser',
    badge: 'No upload',
    intro: [
      'Type or paste text and receive SHA-1, SHA-256, SHA-384 and SHA-512 digests in hexadecimal, with Base64 output available for each one. Hashing uses the browser\'s Web Crypto implementation, so results match what your server will produce.',
      'Uppercase/lowercase output and a salt field are both supported, and every digest has its own copy button.',
    ],
    howTo: [
      'Type or paste the text you want to hash.',
      'Optionally add a salt that is prefixed to the input.',
      'Read the generated digests.',
      'Copy any digest individually.',
      'Clear the input to start again.',
    ],
    faq: [
      {
        question: 'Should I use SHA-256 to hash passwords?',
        answer:
          'No. Password storage needs a slow, salted key-derivation function such as Argon2id, scrypt or bcrypt. Fast hashes like SHA-256 are for integrity checks, not passwords.',
      },
      {
        question: 'Is my text uploaded?',
        answer: 'No. Hashing happens in your browser with the Web Crypto API.',
      },
      {
        question: 'Why is there no MD5?',
        answer:
          'Web Crypto does not provide MD5. The tool offers the SHA-2 family instead of shipping an inaccurate implementation.',
      },
      {
        question: 'Does whitespace matter?',
        answer: 'Yes — every character counts, including trailing newlines. The tool shows the exact byte length being hashed.',
      },
    ],
    related: ['file-hash', 'base64-encoder', 'jwt-decoder', 'password-generator'],
    outputFormats: ['Text'],
  },
];

export const toolMap: Record<string, ToolDef> = tools.reduce<Record<string, ToolDef>>((acc, tool) => {
  acc[tool.slug] = tool;
  return acc;
}, {});

export function getTool(slug: string): ToolDef | undefined {
  return toolMap[slug];
}

export function toolsByCategory(category: string): ToolDef[] {
  return tools.filter((tool) => tool.category === category);
}

export const popularTools: ToolDef[] = tools.filter((tool) => tool.popular);

export const toolCount = tools.length;

/** Simple, dependency-free fuzzy search used by the header + home search box. */
export function searchTools(query: string, limit = 12): ToolDef[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);

  const scored = tools
    .map((tool) => {
      const haystacks = {
        name: tool.name.toLowerCase(),
        tagline: tool.tagline.toLowerCase(),
        keywords: tool.keywords.join(' ').toLowerCase(),
        category: tool.category.replace(/-/g, ' '),
      };
      let score = 0;

      for (const term of terms) {
        if (!term) continue;
        if (haystacks.name.startsWith(term)) score += 12;
        else if (haystacks.name.includes(term)) score += 8;
        if (haystacks.keywords.includes(term)) score += 5;
        if (haystacks.tagline.includes(term)) score += 3;
        if (haystacks.category.includes(term)) score += 2;
      }
      return { tool, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name));

  return scored.slice(0, limit).map((entry) => entry.tool);
}
