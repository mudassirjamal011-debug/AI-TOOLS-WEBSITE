/**
 * Pure text utilities. No DOM, no React — safe to unit test in Node.
 * (Everything here is erasable TypeScript so `node --experimental-strip-types` can run it.)
 */

/* ------------------------------------------------------------------ stats */

export interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  uniqueWords: number;
  readingMinutes: number;
  speakingMinutes: number;
  longestWord: string;
  averageWordLength: number;
}

const WORD_RE = /[^\s]+/g;

export function countWords(text: string): number {
  if (!text) return 0;
  const tokens = text.match(WORD_RE) ?? [];
  // Ignore tokens made only of punctuation (e.g. a lone em dash).
  return tokens.filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
}

export function countSentences(text: string): number {
  if (!text?.trim()) return 0;
  const matches = text.match(/[^.!?\n]+[.!?]+(\s|$)|[^.!?\n]+$/g) ?? [];
  return matches.filter((match) => match.trim().length > 0).length;
}

export function countParagraphs(text: string): number {
  if (!text?.trim()) return 0;
  return text
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .filter((block) => block.trim().length > 0).length;
}

export function uniqueWords(text: string): number {
  if (!text?.trim()) return 0;
  const set = new Set<string>();
  for (const token of text.toLowerCase().match(WORD_RE) ?? []) {
    const cleaned = token.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
    if (cleaned) set.add(cleaned);
  }
  return set.size;
}

export function textStats(text: string): TextStats {
  const characters = Array.from(text ?? '').length;
  const charactersNoSpaces = Array.from((text ?? '').replace(/\s/g, '')).length;
  const words = countWords(text);
  const tokens = (text ?? '').match(WORD_RE) ?? [];
  let longestWord = '';
  let totalLength = 0;
  for (const token of tokens) {
    const cleaned = token.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
    if (!cleaned) continue;
    totalLength += Array.from(cleaned).length;
    if (Array.from(cleaned).length > Array.from(longestWord).length) longestWord = cleaned;
  }

  return {
    characters,
    charactersNoSpaces,
    words,
    sentences: countSentences(text),
    paragraphs: countParagraphs(text),
    lines: text ? text.replace(/\r\n?/g, '\n').split('\n').length : 0,
    uniqueWords: uniqueWords(text),
    readingMinutes: words === 0 ? 0 : Math.max(1, Math.round(words / 200)),
    speakingMinutes: words === 0 ? 0 : Math.max(1, Math.round(words / 130)),
    longestWord,
    averageWordLength: words === 0 ? 0 : Number((totalLength / words).toFixed(2)),
  };
}

/** Top-N most frequent words, ignoring stop words. */
export function wordFrequency(text: string, limit = 10): { word: string; count: number }[] {
  const stopWords = new Set(
    ('a an and are as at be but by for from has have he her his i in is it its me my no not of on or our she so than that the their them then there these they this to us was we were what when where which who will with you your')
      .split(' ')
  );
  const counts = new Map<string, number>();
  for (const token of (text ?? '').toLowerCase().match(WORD_RE) ?? []) {
    const cleaned = token.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
    if (cleaned.length < 2 || stopWords.has(cleaned)) continue;
    counts.set(cleaned, (counts.get(cleaned) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
    .slice(0, limit);
}

/* ------------------------------------------------------------------- case */

const TITLE_SMALL_WORDS = new Set([
  'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or',
  'per', 'the', 'to', 'vs', 'via',
]);

export function toUpperCaseText(text: string): string {
  return text.toUpperCase();
}

export function toLowerCaseText(text: string): string {
  return text.toLowerCase();
}

export function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(/(\s+)/)
    .map((chunk, index, all) => {
      if (/^\s+$/.test(chunk)) return chunk;
      const cleaned = chunk.replace(/^[^\p{L}\p{N}]+/u, '');
      const prefix = chunk.slice(0, chunk.length - cleaned.length);
      const isFirst = index === 0;
      const isLast = index === all.length - 1;
      const isSmall = TITLE_SMALL_WORDS.has(cleaned.toLowerCase());
      if (isSmall && !isFirst && !isLast) return prefix + cleaned;
      return prefix + cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    })
    .join('');
}

/**
 * Sentence case: lowercase everything, then capitalise the first letter of each
 * sentence. Tokens that were written in full capitals (acronyms such as NASA,
 * PDF or JSON) are left untouched so intentional capitalisation survives.
 */
export function toSentenceCase(text: string): string {
  const lowered = (text ?? '')
    .split(/(\s+)/)
    .map((token) => {
      if (!/[\p{L}]/u.test(token)) return token;
      const letters = token.replace(/[^\p{L}]/gu, '');
      const isAcronym =
        letters.length >= 2 && letters === letters.toUpperCase() && /[\p{Lu}]/u.test(letters);
      return isAcronym ? token : token.toLowerCase();
    })
    .join('');

  return lowered.replace(
    /(^|[.!?]["'”’)\]]*\s+|\n\s*)(\p{L})/gu,
    (_match, separator, letter) => `${separator}${letter.toUpperCase()}`
  );
}

export function toAlternatingCase(text: string): string {
  let flip = false;
  return Array.from(text)
    .map((char) => {
      const isLetter = /\p{L}/u.test(char);
      if (!isLetter) return char;
      flip = !flip;
      return flip ? char.toLowerCase() : char.toUpperCase();
    })
    .join('');
}

export function toCamelCase(text: string): string {
  const words = splitWords(text);
  if (words.length === 0) return '';
  return words
    .map((word, index) =>
      index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join('');
}

export function toPascalCase(text: string): string {
  return splitWords(text)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

export function toSnakeCase(text: string): string {
  return splitWords(text).join('_').toLowerCase();
}

export function toKebabCase(text: string): string {
  return splitWords(text).join('-').toLowerCase();
}

function splitWords(text: string): string[] {
  return (text ?? '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

/* -------------------------------------------------------------- formatter */

export function trimLines(text: string): string {
  return text.replace(/\r\n?/g, '\n').split('\n').map((line) => line.trim()).join('\n');
}

export function removeExtraSpaces(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n');
}

export function removeEmptyLines(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .join('\n');
}

export function removeDuplicateLines(text: string, caseSensitive = true): string {
  const seen = new Set<string>();
  return text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .filter((line) => {
      const key = caseSensitive ? line : line.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join('\n');
}

export function sortLines(text: string, descending = false, caseSensitive = false): string {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const sorted = lines.slice().sort((a, b) => {
    const left = caseSensitive ? a : a.toLowerCase();
    const right = caseSensitive ? b : b.toLowerCase();
    return left.localeCompare(right);
  });
  return descending ? sorted.reverse().join('\n') : sorted.join('\n');
}

export function reverseLines(text: string): string {
  return text.replace(/\r\n?/g, '\n').split('\n').reverse().join('\n');
}

export function reverseText(text: string): string {
  return Array.from(text).reverse().join('');
}

export function removeLineBreaks(text: string, replacement = ' '): string {
  return text.replace(/\r\n?|\n/g, replacement);
}

export function removePunctuation(text: string): string {
  return text.replace(/[^\p{L}\p{N}\s]/gu, '');
}

export function slugify(text: string): string {
  return (text ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

/* ------------------------------------------------------------------- json */

export interface JsonResult {
  ok: boolean;
  value?: string;
  error?: string;
  line?: number;
  column?: number;
  position?: number;
  snippet?: string;
  warnings?: string[];
}

function positionToLineColumn(text: string, position: number): { line: number; column: number } {
  const upto = text.slice(0, Math.max(0, position));
  const lines = upto.split('\n');
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}

export function parseJsonError(text: string, error: unknown): JsonResult {
  const message = error instanceof Error ? error.message : String(error);
  const posMatch = message.match(/position (\d+)/i);
  const lineMatch = message.match(/line (\d+)/i);
  const columnMatch = message.match(/column (\d+)/i);

  let line: number | undefined;
  let column: number | undefined;
  let position: number | undefined;

  if (posMatch) position = Number(posMatch[1]);
  if (lineMatch) line = Number(lineMatch[1]);
  if (columnMatch) column = Number(columnMatch[1]);

  if (position !== undefined && (line === undefined || column === undefined)) {
    const computed = positionToLineColumn(text, position);
    line = computed.line;
    column = computed.column;
  }

  let snippet: string | undefined;
  if (line !== undefined) {
    const lines = text.split('\n');
    const target = lines[line - 1];
    if (target !== undefined) {
      const start = Math.max(0, (column ?? 1) - 25);
      snippet = target.slice(start, start + 60);
    }
  }

  return { ok: false, error: message, line, column, position, snippet };
}

export function validateJson(input: string): JsonResult {
  const text = (input ?? '').trim();
  if (!text) return { ok: false, error: 'Nothing to validate. Paste some JSON first.' };
  try {
    JSON.parse(text);
    return { ok: true };
  } catch (error) {
    return parseJsonError(text, error);
  }
}

export function formatJson(input: string, indent = 2): JsonResult {
  const text = (input ?? '').trim();
  if (!text) return { ok: false, error: 'Nothing to format. Paste some JSON first.' };
  try {
    const parsed = JSON.parse(text);
    const value = JSON.stringify(parsed, null, indent);
    return { ok: true, value, warnings: duplicateKeyWarnings(text) };
  } catch (error) {
    return parseJsonError(text, error);
  }
}

export function minifyJson(input: string): JsonResult {
  const text = (input ?? '').trim();
  if (!text) return { ok: false, error: 'Nothing to minify. Paste some JSON first.' };
  try {
    const parsed = JSON.parse(text);
    return { ok: true, value: JSON.stringify(parsed), warnings: duplicateKeyWarnings(text) };
  } catch (error) {
    return parseJsonError(text, error);
  }
}

function duplicateKeyWarnings(text: string): string[] {
  const warnings: string[] = [];
  const keys = text.match(/"(?:\\.|[^"\\])*"\s*:/g) ?? [];
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const raw of keys) {
    const key = raw.replace(/\s*:$/, '');
    if (seen.has(key)) duplicates.add(key);
    seen.add(key);
  }
  if (duplicates.size > 0) {
    warnings.push(
      `Duplicate key${duplicates.size > 1 ? 's' : ''} found (${Array.from(duplicates).slice(0, 3).join(', ')}). Most parsers keep only the last value.`
    );
  }
  return warnings;
}

/* -------------------------------------------------------------------- csv */

export interface CsvResult {
  rows: string[][];
  headers: string[];
  objects: Record<string, unknown>[];
  error?: string;
  /** Present when converting JSON → CSV. */
  csv?: string;
}

export function parseCsv(input: string, delimiter = ','): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  const text = (input ?? '').replace(/\r\n?/g, '\n');

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // Drop trailing empty rows from a final newline.
  while (rows.length > 0 && rows[rows.length - 1].every((cell) => cell.trim() === '')) {
    rows.pop();
  }

  return rows;
}

function inferValue(value: string): unknown {
  const trimmed = value.trim();
  if (trimmed === '') return '';
  if (trimmed === 'null') return null;
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (/^-?\d+$/.test(trimmed) && Math.abs(Number(trimmed)) <= Number.MAX_SAFE_INTEGER) {
    return Number(trimmed);
  }
  if (/^-?\d*\.\d+$/.test(trimmed)) return Number(trimmed);
  return value;
}

export function csvToJson(
  input: string,
  options: { delimiter?: string; hasHeader?: boolean; inferTypes?: boolean } = {}
): CsvResult {
  const delimiter = options.delimiter ?? ',';
  const hasHeader = options.hasHeader ?? true;
  const inferTypes = options.inferTypes ?? true;

  const rows = parseCsv(input, delimiter);
  if (rows.length === 0) return { rows: [], headers: [], objects: [] };

  let headers: string[];
  let body: string[][];

  if (hasHeader) {
    headers = rows[0].map((header, index) => header.trim() || `column_${index + 1}`);
    body = rows.slice(1);
  } else {
    const width = Math.max(...rows.map((row) => row.length));
    headers = Array.from({ length: width }, (_, index) => `column_${index + 1}`);
    body = rows;
  }

  const objects = body.map((row) => {
    const record: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      const raw = row[index] ?? '';
      record[header] = inferTypes ? inferValue(raw) : raw;
    });
    return record;
  });

  return { rows, headers, objects };
}

export function jsonToCsv(input: string, delimiter = ','): CsvResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch (error) {
    return {
      rows: [],
      headers: [],
      objects: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }

  const list = Array.isArray(parsed) ? parsed : [parsed];
  if (list.length === 0) return { rows: [], headers: [], objects: [] };

  const headers: string[] = [];
  const objects: Record<string, unknown>[] = [];

  for (const entry of list) {
    if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
      const record = entry as Record<string, unknown>;
      objects.push(record);
      for (const key of Object.keys(record)) {
        if (!headers.includes(key)) headers.push(key);
      }
    } else {
      objects.push({ value: entry });
      if (!headers.includes('value')) headers.push('value');
    }
  }

  const escape = (value: unknown): string => {
    const text = value === null || value === undefined ? '' : String(value);
    return /[",\n\r]/.test(text) || text.includes(delimiter) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const lines = [
    headers.map(escape).join(delimiter),
    ...objects.map((record) => headers.map((header) => escape(record[header])).join(delimiter)),
  ];

  return { rows: [headers], headers, objects, csv: lines.join('\n') };
}

/* ----------------------------------------------------------------- base64 */

export function encodeBase64(text: string, urlSafe = false): string {
  const bytes = new TextEncoder().encode(text ?? '');
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const encoded = typeof btoa === 'function' ? btoa(binary) : Buffer.from(bytes).toString('base64');
  return urlSafe ? encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : encoded;
}

export function decodeBase64(input: string, urlSafe = false): string {
  let value = (input ?? '').trim();
  // Accept full data URIs.
  const dataUriMatch = value.match(/^data:[^;,]*;base64,(.*)$/s);
  if (dataUriMatch) value = dataUriMatch[1];
  if (urlSafe) {
    value = value.replace(/-/g, '+').replace(/_/g, '/');
    while (value.length % 4 !== 0) value += '=';
  }
  const binary = typeof atob === 'function' ? atob(value) : Buffer.from(value, 'base64').toString('binary');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/* ------------------------------------------------------------------ lorem */

const LOREM_WORDS = (
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum curabitur pretium tincidunt lacus nulla gravida orci a odio nullam varius turpis commodo pharetra est eros suscipit magna congue quisque mollis lectus porta convallis vestibulum vulputate nunc feugiat mauris rhoncus aenean sollicitudin erat in interdum ligula ante dapibus vivamus elementum semper nisi aliquam ornare wisi enim ad minim quis nostrud'
).split(' ');

const LOREM_SENTENCE_START = 'Lorem ipsum dolor sit amet';

export function generateLorem(
  count: number,
  unit: 'paragraphs' | 'sentences' | 'words',
  classicStart = true
): string {
  const safeCount = Math.max(1, Math.min(count, 2000));

  const sentence = (index: number): string => {
    const length = 8 + Math.floor(Math.random() * 14);
    const words: string[] = [];
    for (let i = 0; i < length; i += 1) {
      words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
    }
    let text = words.join(' ');
    if (index === 0 && classicStart) text = `${LOREM_SENTENCE_START}, ${text}`;
    return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
  };

  if (unit === 'words') {
    const words: string[] = [];
    for (let i = 0; i < safeCount; i += 1) {
      words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
    }
    let text = words.join(' ');
    if (classicStart) text = `${LOREM_SENTENCE_START}, ${text}`;
    return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
  }

  if (unit === 'sentences') {
    return Array.from({ length: safeCount }, (_, index) => sentence(index)).join(' ');
  }

  return Array.from({ length: safeCount }, (_, index) => {
    const sentences = 3 + Math.floor(Math.random() * 4);
    return Array.from({ length: sentences }, (_, sentenceIndex) =>
      sentence(index === 0 ? sentenceIndex : -1)
    ).join(' ');
  }).join('\n\n');
}

/* --------------------------------------------------------------- password */

export function generatePassword(options: {
  length: number;
  lowercase: boolean;
  uppercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}): string {
  const sets: string[] = [];
  let lowercase = 'abcdefghijklmnopqrstuvwxyz';
  let uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let numbers = '0123456789';
  const symbols = '!@#$%^&*()-_=+[]{};:,.?/';

  if (options.excludeAmbiguous) {
    lowercase = lowercase.replace(/[l]/g, '');
    uppercase = uppercase.replace(/[IO]/g, '');
    numbers = numbers.replace(/[01]/g, '');
  }

  if (options.lowercase) sets.push(lowercase);
  if (options.uppercase) sets.push(uppercase);
  if (options.numbers) sets.push(numbers);
  if (options.symbols) sets.push(symbols);
  if (sets.length === 0) sets.push(lowercase);

  const all = sets.join('');
  const length = Math.max(4, Math.min(options.length, 128));
  const bytes = new Uint32Array(length);
  const cryptoObj = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (cryptoObj?.getRandomValues) {
    cryptoObj.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i += 1) bytes[i] = Math.floor(Math.random() * 2 ** 32);
  }

  const chars: string[] = [];
  // Guarantee at least one character from each selected set.
  sets.forEach((set) => {
    const byte = bytes[chars.length % length];
    chars.push(set[byte % set.length]);
  });

  while (chars.length < length) {
    const byte = bytes[chars.length % length];
    chars.push(all[byte % all.length]);
  }

  // Fisher–Yates shuffle using the same random bytes.
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = bytes[i % length] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}

export function passwordEntropy(password: string): number {
  const pools = [
    /[a-z]/.test(password) ? 26 : 0,
    /[A-Z]/.test(password) ? 26 : 0,
    /\d/.test(password) ? 10 : 0,
    /[^A-Za-z0-9]/.test(password) ? 32 : 0,
  ];
  const poolSize = pools.reduce((total, value) => total + value, 0) || 1;
  return Math.round(Array.from(password).length * Math.log2(poolSize));
}

/* ------------------------------------------------------------------ regex */

export interface RegexResult {
  error?: string;
  matches: { match: string; index: number; groups: string[]; namedGroups: Record<string, string> }[];
  count: number;
  executionMs: number;
  replaced?: string;
}

export function testRegex(
  pattern: string,
  flags: string,
  input: string,
  replacement?: string
): RegexResult {
  const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
  let regex: RegExp;
  try {
    regex = new RegExp(pattern, flags.includes('g') ? flags : `${flags}g`);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error),
      matches: [],
      count: 0,
      executionMs: 0,
    };
  }

  const matches: RegexResult['matches'] = [];
  const globalFlags = flags.includes('g') ? flags : `${flags}g`;
  const scanner = new RegExp(pattern, globalFlags);
  const limit = 5000;
  let result: RegExpExecArray | null;
  let iterations = 0;

  try {
    while ((result = scanner.exec(input)) !== null) {
      if (result[0] === '' && scanner.lastIndex === result.index) scanner.lastIndex += 1;
      matches.push({
        match: result[0],
        index: result.index,
        groups: result.slice(1),
        namedGroups: (result.groups ?? {}) as Record<string, string>,
      });
      iterations += 1;
      if (iterations >= limit) break;
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error),
      matches,
      count: matches.length,
      executionMs: 0,
    };
  }

  let replaced: string | undefined;
  if (replacement !== undefined) {
    try {
      replaced = input.replace(regex, replacement);
    } catch (error) {
      replaced = `Replacement failed: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  const end = typeof performance !== 'undefined' ? performance.now() : Date.now();
  return { matches, count: matches.length, executionMs: Number((end - start).toFixed(2)), replaced };
}
