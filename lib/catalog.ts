/**
 * A slim, client-safe catalogue of tools.
 *
 * `lib/tools.ts` carries long-form copy and React icon components, which would
 * bloat the client bundle. This file exports only what the browser needs for
 * search and filtering.
 */
import { toolCount, tools, type ToolDef } from './tools';
import type { CategorySlug } from './categories';

export interface CatalogEntry {
  slug: string;
  name: string;
  tagline: string;
  category: CategorySlug;
  keywords: string[];
  popular: boolean;
  processing: ToolDef['processing'];
  badge?: string;
}

export const catalog: CatalogEntry[] = tools.map((tool) => ({
  slug: tool.slug,
  name: tool.name,
  tagline: tool.tagline,
  category: tool.category,
  keywords: tool.keywords,
  popular: Boolean(tool.popular),
  processing: tool.processing,
  badge: tool.badge,
}));

export const catalogCount = toolCount;

export function searchCatalog(query: string, limit = 8): CatalogEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);

  return catalog
    .map((entry) => {
      const haystack = {
        name: entry.name.toLowerCase(),
        tagline: entry.tagline.toLowerCase(),
        keywords: entry.keywords.join(' ').toLowerCase(),
        category: entry.category.replace(/-/g, ' '),
      };
      let score = 0;
      for (const term of terms) {
        if (haystack.name.startsWith(term)) score += 12;
        else if (haystack.name.includes(term)) score += 8;
        if (haystack.keywords.includes(term)) score += 5;
        if (haystack.tagline.includes(term)) score += 3;
        if (haystack.category.includes(term)) score += 2;
      }
      return { entry, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name))
    .slice(0, limit)
    .map((item) => item.entry);
}
