'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, SearchX, Sparkles, X } from 'lucide-react';
import { catalog } from '@/lib/catalog';
import { categories } from '@/lib/categories';
import { getToolIcon } from './ToolIconMap';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/Feedback';
import { ResetButton } from '@/components/ui/Actions';

export function ToolsExplorer({ initialQuery = '' }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<string>('all');

  const term = query.trim().toLowerCase();

  const results = useMemo(() => {
    return catalog.filter((entry) => {
      if (category !== 'all' && entry.category !== category) return false;
      if (!term) return true;
      return (
        entry.name.toLowerCase().includes(term) ||
        entry.tagline.toLowerCase().includes(term) ||
        entry.keywords.some((keyword) => keyword.includes(term)) ||
        entry.category.replace(/-/g, ' ').includes(term)
      );
    });
  }, [category, term]);

  const reset = () => {
    setQuery('');
    setCategory('all');
  };

  return (
    <div>
      <div className="flex flex-col gap-4 rounded-2xl border border-line/10 bg-surface/60 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <label htmlFor="tools-filter" className="sr-only">
            Filter tools by name or keyword
          </label>
          <input
            id="tools-filter"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${catalog.length} tools…`}
            className="h-11 w-full rounded-xl border border-line/12 bg-surface/70 px-3.5 text-[0.9375rem] text-fg outline-none transition-colors placeholder:text-muted/80 focus:border-brand-purple/60 [&::-webkit-search-cancel-button]:hidden"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted" aria-live="polite">
            {results.length} tool{results.length === 1 ? '' : 's'}
          </span>
          <ResetButton onClick={reset} label="Reset" variant="outline" />
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar" role="tablist" aria-label="Filter by category">
        {[{ slug: 'all', name: 'All tools' }, ...categories].map((entry) => {
          const active = category === entry.slug;
          return (
            <button
              key={entry.slug}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setCategory(entry.slug)}
              className={cn(
                'shrink-0 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors',
                active
                  ? 'border-transparent bg-brand-gradient text-white'
                  : 'border-line/12 bg-surface/60 text-muted hover:border-brand-purple/40 hover:text-fg'
              )}
            >
              {entry.name}
            </button>
          );
        })}
      </div>

      {results.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={<SearchX aria-hidden className="h-6 w-6" />}
          title="No tools found"
          description={`Nothing matches “${query.trim()}”. Try a broader word like “pdf”, “image”, “text” or “convert”.`}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <ResetButton onClick={reset} label="Clear filters" />
              <Link
                href="/"
                className="inline-flex h-9 items-center rounded-xl border border-line/12 px-3 text-sm font-semibold text-fg transition-colors hover:bg-surface-2"
              >
                Back to home
              </Link>
            </div>
          }
        />
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((entry) => {
            const Icon = getToolIcon(entry.slug);
            return (
              <Link
                key={entry.slug}
                href={`/tools/${entry.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-line/10 bg-surface/70 p-5 transition-all hover:-translate-y-0.5 hover:border-brand-purple/40 hover:shadow-lift"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 -top-24 h-32 bg-brand-gradient-soft opacity-0 blur-2xl transition-opacity group-hover:opacity-100"
                />
                <div className="relative flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient-soft text-fg ring-1 ring-inset ring-line/10">
                    <Icon aria-hidden className="h-5 w-5" />
                  </span>
                  {entry.popular ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-gradient px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      <Sparkles aria-hidden className="h-3 w-3" />
                      Popular
                    </span>
                  ) : null}
                </div>
                <h2 className="relative mt-4 font-display text-[1.0625rem] font-bold leading-snug">
                  {entry.name}
                </h2>
                <p className="relative mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">
                  {entry.tagline}
                </p>
                <span className="relative mt-4 inline-flex items-center gap-1 text-xs font-semibold text-fg">
                  Use tool
                  <ArrowRight
                    aria-hidden
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {query || category !== 'all' ? (
        <p className="mt-6 text-center text-xs text-muted">
          Showing filtered results.{' '}
          <button type="button" onClick={reset} className="font-semibold text-brand-purple hover:underline">
            <X aria-hidden className="mr-1 inline h-3 w-3" />
            Clear filters
          </button>
        </p>
      ) : null}
    </div>
  );
}
