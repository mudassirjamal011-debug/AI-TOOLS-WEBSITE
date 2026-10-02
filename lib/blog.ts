export interface BlogBlock {
  heading?: string;
  paragraphs?: string[];
  list?: string[];
  ordered?: boolean;
  note?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  readingMinutes: number;
  tags: string[];
  author: string;
  takeaways: string[];
  blocks: BlogBlock[];
  faq: { question: string; answer: string }[];
  relatedTools: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'how-to-compress-images-without-losing-quality',
    title: 'How to Compress Images Without Losing Quality',
    description:
      'A practical guide to shrinking image files while keeping them sharp: when to use lossy vs lossless compression, which quality settings actually look identical, and how to pick the right format.',
    publishedAt: '2025-11-04',
    readingMinutes: 7,
    tags: ['Images', 'Performance', 'Guides'],
    author: 'ToolNova AI Team',
    takeaways: [
      'Quality loss comes from re-encoding, not from compression itself.',
      'JPEG at 75–85% is visually indistinguishable for most photos.',
      'WebP is usually 25–35% smaller than an equivalent JPEG.',
      'Resize first — dimensions save far more bytes than quality tweaks.',
    ],
    blocks: [
      {
        paragraphs: [
          'Every image on a page is a trade-off between sharpness and bytes. The good news is that the trade-off is not as brutal as it sounds: most photos contain far more detail than any screen can display, and modern encoders are extremely good at throwing away what nobody will notice.',
          'This guide explains what actually happens when you compress an image, which settings are safe, and how to get a file from 6 MB down to 400 KB without anyone noticing the difference.',
        ],
      },
      {
        heading: 'Lossy vs lossless: what is really being discarded',
        paragraphs: [
          'Lossless compression (PNG, WebP lossless) rearranges the data so it takes fewer bytes, then restores it exactly. Nothing is lost, but the savings are modest — typically 5–20% on a photographic image.',
          'Lossy compression (JPEG, WebP lossy, AVIF) goes further. It converts the image into frequency blocks, then discards the high-frequency detail that human vision is least sensitive to. This is why a JPEG at 60% quality shows blocky artefacts around sharp edges and text: those are exactly the high frequencies being thrown away.',
          'The practical rule: use lossy for photographs and lossless for screenshots, logos, diagrams and anything with crisp text.',
        ],
      },
      {
        heading: 'The quality sweet spot',
        paragraphs: [
          'For photographs, the difference between 100% and 85% JPEG quality is almost always invisible, while the file is roughly half the size. Between 85% and 75% the difference is still very hard to spot at normal viewing distance. Below 70% you start to see smudging in gradients such as skies and skin tones.',
        ],
        list: [
          '95–100%: archiving and further editing. Barely any compression benefit.',
          '80–90%: portfolio images and hero photography. Safe for large displays.',
          '70–80%: the default for websites. Excellent balance of size and quality.',
          '50–70%: thumbnails, avatars and previews where size matters most.',
          'Below 50%: only for placeholder images or extreme bandwidth limits.',
        ],
      },
      {
        heading: 'Resize before you compress',
        paragraphs: [
          'Dimensions dominate file size. A 4000 × 3000 photo contains 12 million pixels; the same image at 1600 × 1200 contains under two million — an 85% pixel reduction before the encoder does anything at all.',
          'If the image will only ever be displayed at 1200 px wide, export it at 1200–2400 px (the extra resolution covers retina screens) and then apply quality compression. This two-step approach routinely beats aggressive quality reduction on the full-size original.',
        ],
      },
      {
        heading: 'Choose the right format',
        list: [
          'JPEG: universal support, great for photos, no transparency, lossy only.',
          'PNG: lossless, supports transparency, ideal for UI, screenshots and logos. Poor choice for photographs.',
          'WebP: 25–35% smaller than JPEG with the same perceived quality, supports transparency and animation. Supported by every current browser.',
          'AVIF: even smaller at equal quality, but encoding is slow and support, while now broad, is not universal.',
        ],
      },
      {
        heading: 'A workflow that works',
        ordered: true,
        list: [
          'Start from the highest quality original you have — never from an already compressed copy.',
          'Resize to the largest size you will actually display (multiply by 2 for retina).',
          'Export as WebP at 80% quality, or JPEG at 80% if you need maximum compatibility.',
          'Compare the result at 100% zoom and at display size.',
          'If it still looks identical, push the quality down another 5–10% and repeat.',
        ],
      },
      {
        note:
          'Tools such as the ToolNova Image Compressor and Image Resizer perform both steps in your browser, so you can iterate a few times without waiting for uploads.',
      },
    ],
    faq: [
      {
        question: 'Can I compress an image without losing any quality at all?',
        answer:
          'Yes, with lossless compression — but the savings are small on photographs. Meaningful reductions always involve discarding some information; the trick is discarding information nobody can see.',
      },
      {
        question: 'Does compressing the same JPEG repeatedly damage it?',
        answer:
          'Yes. Each generation re-applies the lossy transform, so artefacts accumulate. Always go back to the original before re-exporting.',
      },
      {
        question: 'Does image compression hurt SEO?',
        answer:
          'The opposite. Smaller images mean faster pages, and page speed is a ranking factor. Compressed images also load better on mobile connections, which reduces bounce rates.',
      },
      {
        question: 'What is a good file size for a website image?',
        answer:
          'Under 200 KB for hero images and under 100 KB for content images is a sensible target. Thumbnails should be well under 30 KB.',
      },
    ],
    relatedTools: ['image-compressor', 'image-resizer', 'image-converter', 'image-to-pdf'],
  },
  {
    slug: 'how-to-convert-jpg-to-webp',
    title: 'How to Convert JPG to WebP (and When You Should)',
    description:
      'Everything you need to know about moving your images from JPEG to WebP: real-world size savings, browser support, transparency and how to convert without losing quality.',
    publishedAt: '2025-11-18',
    readingMinutes: 6,
    tags: ['Images', 'WebP', 'Guides'],
    author: 'ToolNova AI Team',
    takeaways: [
      'WebP files are typically 25–35% smaller than JPEG at equal perceived quality.',
      'WebP supports transparency and animation — JPEG does not.',
      'Browser support is now essentially universal.',
      'Keep a JPEG or PNG fallback only if you serve very old clients.',
    ],
    blocks: [
      {
        paragraphs: [
          'WebP was released by Google in 2010, but it is only in the last few years that it became a sensible default. Today every major browser — Chrome, Edge, Firefox, Safari and their mobile equivalents — supports it, which removes the last real argument against switching.',
        ],
      },
      {
        heading: 'Why WebP wins on size',
        paragraphs: [
          'WebP uses a modern predictive coding scheme: instead of compressing each block in isolation, it predicts pixel values from neighbouring blocks and encodes only the difference. It also supports an alpha channel at a fraction of PNG\'s cost, and lossless mode that beats PNG on most images.',
          'In practice, converting a photographic JPEG to WebP at a quality setting that looks the same usually lands between 25% and 35% smaller. On images with large flat areas — illustrations, UI screenshots, diagrams — the savings can exceed 50%.',
        ],
      },
      {
        heading: 'When JPEG is still the better choice',
        list: [
          'You need to support very old browsers or unusual embedded clients.',
          'Your publishing pipeline cannot serve two formats and your audience is unknown.',
          'The image will be printed by a service that only accepts JPEG.',
          'You are archiving originals — keep the original format untouched.',
        ],
      },
      {
        heading: 'How to convert',
        ordered: true,
        list: [
          'Open the ToolNova Image Converter in your browser.',
          'Upload the JPG file (drag and drop works too).',
          'Choose WebP as the output format.',
          'Set the quality — start at 80 and lower it while the image still looks right.',
          'Download the WebP file and compare it side by side with the original.',
        ],
        note:
          'Conversion happens locally, so you can convert dozens of images without uploading anything to a server.',
      },
      {
        heading: 'Serving WebP on a website',
        paragraphs: [
          'The modern approach is the HTML <picture> element, which lets the browser pick the first format it understands. Put WebP first and JPEG second, and every browser gets the best file it can handle with no JavaScript involved.',
        ],
      },
    ],
    faq: [
      {
        question: 'Is WebP quality worse than JPEG?',
        answer:
          'At the same file size, WebP generally looks better. At the same quality setting, WebP is smaller. You can convert at a high quality setting and still come out ahead.',
      },
      {
        question: 'Does WebP support transparency?',
        answer:
          'Yes. WebP has a full alpha channel, so it can replace PNG for transparent graphics at a much smaller size.',
      },
      {
        question: 'Can I open WebP files on Windows and macOS?',
        answer:
          'Yes. Both operating systems open WebP natively in their built-in preview apps, and every major image editor supports it.',
      },
      {
        question: 'Will converting to WebP break my existing site?',
        answer:
          'Only if you replace files without updating references or if you must support browsers older than about 2020. Keep the original filenames and test one page first.',
      },
    ],
    relatedTools: ['image-converter', 'image-compressor', 'image-resizer', 'image-to-base64'],
  },
  {
    slug: 'how-to-merge-pdf-files',
    title: 'How to Merge PDF Files (Without Installing Anything)',
    description:
      'Step-by-step instructions for combining several PDFs into one document, including how to control page order, what happens to links and bookmarks, and how to keep files private.',
    publishedAt: '2025-12-02',
    readingMinutes: 5,
    tags: ['PDF', 'Productivity', 'Guides'],
    author: 'ToolNova AI Team',
    takeaways: [
      'Merging copies pages into a new document; it does not modify your originals.',
      'Page order is whatever order you arrange the files in.',
      'Local tools keep sensitive documents off third-party servers.',
      'Encrypted PDFs must be unlocked before they can be merged.',
    ],
    blocks: [
      {
        paragraphs: [
          'Combining PDFs is one of those tasks that sounds like it should require Acrobat Pro, and does not. Whether you are assembling a contract with annexes, a report with appendices, or a set of scanned receipts for expenses, the mechanics are the same: collect the files, put them in order, and write one new document.',
        ],
      },
      {
        heading: 'How merging actually works',
        paragraphs: [
          'A PDF is a collection of objects — pages, fonts, images, annotations — plus a cross-reference table that indexes them. Merging loads the objects from each source document into a new file and rebuilds the index so the pages point at the right resources.',
          'This is why merging preserves fonts and images exactly: nothing is re-rendered, it is copied. It is also why a merged file can occasionally be larger than the sum of its parts when two documents embed two copies of the same font.',
        ],
      },
      {
        heading: 'Merge with ToolNova',
        ordered: true,
        list: [
          'Open the PDF Merger tool.',
          'Upload two or more PDF files — drag them in together or add them one at a time.',
          'Use the up and down arrows on each file card until the order matches the document you want.',
          'Remove any file you added by mistake with the trash button.',
          'Click Merge PDFs, then download the combined document.',
        ],
      },
      {
        heading: 'Keeping documents private',
        paragraphs: [
          'Most "free PDF merger" websites upload your documents to their servers, process them there, and delete them later — a policy you have to take on trust. A browser-based merger never transmits the file at all, which is a much stronger guarantee than any policy page.',
          'For contracts, medical records, tax documents or anything subject to a confidentiality agreement, use a local tool.',
        ],
      },
      {
        heading: 'Troubleshooting',
        list: [
          'Password-protected file: remove the protection first, then merge the unlocked copy.',
          'Wrong order: reorder the file cards before merging — fixing it afterwards means splitting and re-merging.',
          'Huge output: run the result through the PDF Compressor, or compress the source images first.',
          'Missing bookmarks: document-level outlines are not carried over; rebuild them in your PDF editor if you need them.',
        ],
      },
    ],
    faq: [
      {
        question: 'How many PDFs can I merge?',
        answer:
          'As many as your device memory allows. Dozens of typical documents are fine; the tool accepts up to 200 MB in total.',
      },
      {
        question: 'Will merging change the quality of my pages?',
        answer: 'No. Pages are copied as objects, so text stays selectable and images keep their resolution.',
      },
      {
        question: 'Do the original files get modified?',
        answer: 'No. Merging always produces a new document and leaves your source files untouched.',
      },
      {
        question: 'Can I merge a PDF with images?',
        answer: 'Convert the images to PDF first with the Image to PDF tool, then merge the results.',
      },
    ],
    relatedTools: ['pdf-merger', 'pdf-splitter', 'pdf-compressor', 'image-to-pdf'],
  },
  {
    slug: 'how-to-count-words-online',
    title: 'How to Count Words Online (and Why the Numbers Differ)',
    description:
      'Word counts vary between tools. Here is how words, characters, sentences and reading time are actually calculated, plus how to hit a strict word limit every time.',
    publishedAt: '2025-12-16',
    readingMinutes: 5,
    tags: ['Writing', 'Text', 'Guides'],
    author: 'ToolNova AI Team',
    takeaways: [
      'Most counters split on whitespace, which is why hyphenation changes counts.',
      'Character counts with and without spaces differ a lot — check which one a form wants.',
      'Reading time is normally word count ÷ 200 wpm.',
      'Tools differ on punctuation-only tokens; strip them before counting.',
    ],
    blocks: [
      {
        paragraphs: [
          'Ask three word counters for the length of the same paragraph and you may get three slightly different answers. The differences are not bugs — they come from different definitions of what counts as a word.',
        ],
      },
      {
        heading: 'What counts as a word',
        paragraphs: [
          'The standard approach is to split the text on whitespace and count the resulting tokens, after discarding empty ones. Under that rule "state-of-the-art" is one word, "1,000" is one word, and a lone em dash is also one word unless you filter it out.',
          'ToolNova trims punctuation from the edges of each token and ignores tokens that contain no letters or digits, which matches what most editors and submission systems report.',
        ],
      },
      {
        heading: 'Characters, with and without spaces',
        paragraphs: [
          'Character counts are the one place where a mismatch really bites. Social platforms and meta description fields almost always count spaces; some academic forms do not. The difference on a 5,000-word essay is roughly 800 characters, so always check which definition your target uses.',
          'Note also that Unicode matters: "é" can be one character or two code units depending on how it was typed. Modern counters count code points, which is what you expect as a human.',
        ],
      },
      {
        heading: 'Sentences and paragraphs',
        paragraphs: [
          'Sentence counting splits on terminal punctuation (. ! ?) followed by whitespace or the end of the text. Abbreviations such as "e.g." and "Dr." inflate the count slightly, which is normal and consistent across tools.',
          'Paragraphs are separated by one or more blank lines. Single line breaks within a paragraph are not counted as new paragraphs.',
        ],
      },
      {
        heading: 'Reading and speaking time',
        list: [
          '200 wpm — standard silent reading for adult non-fiction.',
          '130 wpm — reading aloud or presenting.',
          '250+ wpm — skimming familiar material.',
          'ToolNova uses 200 wpm for reading time and 130 wpm for speaking time.',
        ],
      },
      {
        heading: 'Hitting a strict word limit',
        ordered: true,
        list: [
          'Paste your text into the Word Counter.',
          'Check the live word count as you edit.',
          'Turn on keyword density to find repeated words you can cut.',
          'Trim filler adverbs first — they rarely change meaning.',
          'Recount after every round of edits rather than estimating.',
        ],
      },
    ],
    faq: [
      {
        question: 'Why does my word count differ from Microsoft Word?',
        answer:
          'Word counts hyphenated words and certain punctuation differently, and includes headers, footnotes and text boxes depending on your settings.',
      },
      {
        question: 'Do numbers count as words?',
        answer: 'Yes. "2026" is one word and four characters.',
      },
      {
        question: 'How accurate is the reading time?',
        answer:
          'It is an estimate based on 200 words per minute. Technical or dense material takes longer to read than dialogue or marketing copy.',
      },
      {
        question: 'Is my text saved when I use the counter?',
        answer: 'No. Counting happens in your browser and nothing is stored or sent anywhere.',
      },
    ],
    relatedTools: ['word-counter', 'text-formatter', 'case-converter', 'json-formatter'],
  },
  {
    slug: 'how-to-format-json',
    title: 'How to Format and Validate JSON (With Real Error Messages)',
    description:
      'Learn how to pretty-print, minify and validate JSON, read parse errors by line and column, and avoid the five mistakes that break JSON files most often.',
    publishedAt: '2026-01-06',
    readingMinutes: 6,
    tags: ['JSON', 'Development', 'Guides'],
    author: 'ToolNova AI Team',
    takeaways: [
      'Pretty-printing only changes whitespace — never values or key order.',
      'Parse errors include a position; read the character before it.',
      'Trailing commas, single quotes and comments are the usual culprits.',
      'Validate before you ship a config file or API payload.',
    ],
    blocks: [
      {
        paragraphs: [
          'JSON has only six structural rules, but breaking any one of them produces an error message that points at a position rather than at the mistake. Knowing how to read those messages turns a frustrating five minutes into five seconds.',
        ],
      },
      {
        heading: 'The five mistakes that break JSON',
        list: [
          'A trailing comma after the last property or array element.',
          'Single quotes around strings — JSON requires double quotes.',
          'Unquoted keys — {name: "Ana"} is JavaScript, not JSON.',
          'Comments (// or /* */) — not part of the JSON specification.',
          'Smart quotes and non-breaking spaces pasted from a word processor.',
        ],
      },
      {
        heading: 'Reading a parse error',
        paragraphs: [
          'A typical message reads "Unexpected token } in JSON at position 214". The reported position is where the parser gave up, which is usually just after the real problem. Open the file, jump to that offset, and look backwards — you will almost always find a missing comma, an extra comma, or an unclosed bracket.',
          'ToolNova\'s JSON Formatter converts that offset into a line and column and shows the surrounding text, so you can see the mistake instead of counting characters.',
        ],
      },
      {
        heading: 'Formatting vs minifying',
        paragraphs: [
          'Formatting (pretty-printing) adds indentation and line breaks for humans reading a config file or debugging an API response. Minifying strips all insignificant whitespace to make a payload smaller over the network. Neither changes the data.',
          'For a production API response, minify. For anything a human will read, format.',
        ],
      },
      {
        heading: 'A validation habit worth building',
        ordered: true,
        list: [
          'Paste the JSON into the formatter.',
          'Click Validate and read any error with its line and column.',
          'Fix the reported line, then validate again — errors often cascade from one typo.',
          'Format it and diff it against a version you know is correct.',
          'Minify only at the very end, just before you ship.',
        ],
      },
    ],
    faq: [
      {
        question: 'Is formatting safe for my data?',
        answer: 'Yes. Only whitespace changes; keys, order and values are preserved exactly.',
      },
      {
        question: 'Does JSON allow duplicate keys?',
        answer:
          'Syntactically yes, but most parsers keep only the last one. The formatter reports duplicates so you can fix them before they cause a subtle bug.',
      },
      {
        question: 'What is the difference between JSON and JavaScript objects?',
        answer:
          'JSON is a text format with strict rules: double-quoted keys and strings, no trailing commas, no comments, no functions or undefined.',
      },
      {
        question: 'How large a file can the validator handle?',
        answer:
          'Several megabytes comfortably in a modern browser. Very large files may feel slow in a text area; validate them with a command-line tool instead.',
      },
    ],
    relatedTools: ['json-formatter', 'csv-to-json', 'base64-encoder', 'regex-tester'],
  },
  {
    slug: 'how-to-reduce-image-file-size',
    title: 'How to Reduce Image File Size: 10 Techniques That Actually Work',
    description:
      'Ten concrete ways to make images smaller — from resizing and format choice to colour depth, metadata stripping and lazy loading — ranked by how much they save.',
    publishedAt: '2026-01-27',
    readingMinutes: 8,
    tags: ['Images', 'Performance', 'Guides'],
    author: 'ToolNova AI Team',
    takeaways: [
      'Resizing saves more than any other single technique.',
      'Format choice is the second biggest win.',
      'Stripping metadata is free savings of 5–40 KB per image.',
      'Lazy loading improves perceived speed without touching file size.',
    ],
    blocks: [
      {
        paragraphs: [
          'If a page feels slow, images are usually why. Here are ten techniques, ordered roughly by how much they save, with an honest note on the cost of each.',
        ],
      },
      {
        heading: '1. Resize to the display size',
        paragraphs: [
          'The single biggest win. Serving a 4000 px photo into a 800 px slot wastes roughly 96% of its pixels. Export at twice the display width for retina screens and no more.',
        ],
      },
      {
        heading: '2. Choose a modern format',
        paragraphs: [
          'WebP or AVIF instead of JPEG, WebP or AVIF instead of PNG for graphics with transparency. Expect 25–50% savings with no visible change.',
        ],
      },
      {
        heading: '3. Tune the quality setting',
        paragraphs: [
          'Most encoders are conservative. Dropping from 95 to 80 usually halves the file with no visible difference on a photograph.',
        ],
      },
      {
        heading: '4. Strip metadata',
        paragraphs: [
          'EXIF data, colour profiles, GPS coordinates and thumbnail previews add 5–40 KB to every photo. Re-encoding through a canvas removes them automatically.',
        ],
      },
      {
        heading: '5. Crop away what nobody sees',
        paragraphs: [
          'Fewer pixels means fewer bytes. Tight crops also make the subject larger, which usually improves the composition at the same time.',
        ],
      },
      {
        heading: '6. Reduce colour depth',
        paragraphs: [
          'Flat illustrations and logos rarely need 16.7 million colours. A 256-colour PNG is dramatically smaller and looks identical.',
        ],
      },
      {
        heading: '7. Use progressive or interlaced encoding',
        paragraphs: [
          'This does not shrink the file, but it renders a low-quality version first, so the page feels faster.',
        ],
      },
      {
        heading: '8. Serve responsive images',
        paragraphs: [
          'Use srcset so phones download a 480 px image instead of a 1600 px one. This is a delivery technique, but it has the largest real-world impact on mobile data use.',
        ],
      },
      {
        heading: '9. Lazy load below-the-fold images',
        paragraphs: [
          'Add loading="lazy" to images further down the page. The bytes are still there, but they are only fetched when the reader scrolls to them.',
        ],
      },
      {
        heading: '10. Cache and compress in transit',
        paragraphs: [
          'Serve images with long cache headers and Brotli or gzip. This affects transfer size rather than file size, but it is free.',
        ],
      },
      {
        heading: 'Putting it together',
        ordered: true,
        list: [
          'Crop to the composition you want.',
          'Resize to twice the display width.',
          'Convert to WebP at 78–82% quality.',
          'Re-encode through a canvas to strip metadata.',
          'Add width/height attributes and loading="lazy" in your HTML.',
        ],
      },
    ],
    faq: [
      {
        question: 'What is a good target size for a blog image?',
        answer: 'Under 150 KB for content images and under 250 KB for hero images is a realistic target.',
      },
      {
        question: 'Does reducing image size hurt print quality?',
        answer:
          'Yes, if you go too far. For print you need roughly 300 dpi at the physical size, so a 30 cm wide print needs about 3500 px. Keep a full-resolution master.',
      },
      {
        question: 'Can I automate all of this?',
        answer:
          'Yes. Build tools such as sharp or ImageMagick, and most CMS image pipelines, apply resizing, format conversion and quality settings automatically on upload.',
      },
      {
        question: 'Do I still need JPEG if I use WebP?',
        answer:
          'Usually as a fallback only. With a <picture> element the browser picks WebP when it can and JPEG otherwise.',
      },
    ],
    relatedTools: ['image-compressor', 'image-resizer', 'image-converter', 'image-cropper'],
  },
];

export const blogMap: Record<string, BlogPost> = blogPosts.reduce<Record<string, BlogPost>>(
  (acc, post) => {
    acc[post.slug] = post;
    return acc;
  },
  {}
);

export function getPost(slug: string): BlogPost | undefined {
  return blogMap[slug];
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function readingTimeOf(post: BlogPost): number {
  const words = post.blocks.reduce((total, block) => {
    const text = [
      ...(block.paragraphs ?? []),
      ...(block.list ?? []),
      block.note ?? '',
      block.heading ?? '',
    ].join(' ');
    return total + text.split(/\s+/).filter(Boolean).length;
  }, 0);
  return Math.max(1, Math.round(words / 200));
}
