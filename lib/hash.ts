/** Hashing helpers built on the Web Crypto API (browser-side, no uploads). */

export type HashAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

export const HASH_ALGORITHMS: HashAlgorithm[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

function subtle(): SubtleCrypto {
  if (typeof globalThis.crypto?.subtle === 'undefined') {
    throw new Error(
      'This browser does not expose the Web Crypto API. Try a current version of Chrome, Edge, Firefox or Safari.'
    );
  }
  return globalThis.crypto.subtle;
}

export function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export async function hashText(
  text: string,
  algorithm: HashAlgorithm,
  salt = ''
): Promise<{ hex: string; base64: string }> {
  const data = new TextEncoder().encode(salt + text);
  const digest = await subtle().digest(algorithm, data);
  return { hex: toHex(digest), base64: toBase64(digest) };
}

export async function hashFile(
  file: File,
  algorithms: HashAlgorithm[],
  onProgress?: (percent: number) => void
): Promise<Record<HashAlgorithm, { hex: string; base64: string }>> {
  onProgress?.(5);
  const buffer = await file.arrayBuffer();
  onProgress?.(45);

  const results = {} as Record<HashAlgorithm, { hex: string; base64: string }>;
  let completed = 0;
  for (const algorithm of algorithms) {
    const digest = await subtle().digest(algorithm, buffer);
    results[algorithm] = { hex: toHex(digest), base64: toBase64(digest) };
    completed += 1;
    onProgress?.(45 + Math.round((completed / algorithms.length) * 55));
  }
  return results;
}
