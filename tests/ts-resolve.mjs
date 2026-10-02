/**
 * Test-only ESM resolve hooks:
 *  - lets Node import the extension-less relative specifiers used across lib/
 *    (which the Next.js bundler resolves natively);
 *  - maps the browser URL that pdf.js uses for its worker
 *    ('/pdf.worker.min.mjs') onto the copy in /public.
 */
import * as nodePath from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const root = nodePath.resolve(nodePath.dirname(fileURLToPath(import.meta.url)), '..');

export async function resolve(specifier, context, nextResolve) {
  if (specifier.includes('pdf.worker.min.mjs')) {
    return {
      url: pathToFileURL(nodePath.resolve(root, 'public/pdf.worker.min.mjs')).href,
      shortCircuit: true,
      format: 'module',
    };
  }

  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if (specifier.startsWith('./') || specifier.startsWith('../')) {
      if (!specifier.endsWith('.ts') && !specifier.endsWith('.tsx')) {
        return nextResolve(`${specifier}.ts`, context);
      }
    }
    throw error;
  }
}
