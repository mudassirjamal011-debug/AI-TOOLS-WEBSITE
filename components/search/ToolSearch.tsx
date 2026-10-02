'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CornerDownLeft, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { catalogCount, searchCatalog, type CatalogEntry } from '@/lib/catalog';
import { categoryMap } from '@/lib/categories';
import { getToolIcon } from '@/components/tools/ToolIconMap';

export function ToolSearch({
  variant = 'hero',
  autoFocus = false,
  className,
  placeholder,
  onNavigate,
}: {
  variant?: 'hero' | 'header';
  autoFocus?: boolean;
  className?: string;
  placeholder?: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const listboxId = useId();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo<CatalogEntry[]>(() => (query.trim() ? searchCatalog(query, 8) : []), [query]);
  const isOpen = open && query.trim().length > 0;

  useEffect(() => setActiveIndex(0), [query]);

  // Close on outside click / Escape, and reset state.
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const go = useCallback(
    (slug: string) => {
      setOpen(false);
      setQuery('');
      onNavigate?.();
      router.push(`/tools/${slug}`);
    },
    [router, onNavigate]
  );

  const submit = useCallback(() => {
    if (results[activeIndex]) {
      go(results[activeIndex].slug);
      return;
    }
    if (query.trim()) {
      setOpen(false);
      onNavigate?.();
      router.push(`/tools?q=${encodeURIComponent(query.trim())}`);
    }
  }, [results, activeIndex, query, router, go, onNavigate]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => (results.length ? (index + 1) % results.length : 0));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (results.length ? (index - 1 + results.length) % results.length : 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)} role="search">
      <div
        className={cn(
          'relative flex items-center gap-2 rounded-2xl border bg-surface/80 backdrop-blur-xl transition-all',
          variant === 'hero'
            ? 'h-14 border-line/12 px-4 shadow-lift focus-within:border-brand-purple/60'
            : 'h-10 border-line/12 px-3 focus-within:border-brand-purple/60'
        )}
      >
        <Search aria-hidden className="h-5 w-5 shrink-0 text-muted" />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={isOpen && results[activeIndex] ? `${listboxId}-${activeIndex}` : undefined}
          aria-label="Search tools"
          autoFocus={autoFocus}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder ?? `Search ${catalogCount} tools…`}
          className="h-full min-w-0 flex-1 bg-transparent text-[0.9375rem] text-fg outline-none placeholder:text-muted/80 [&::-webkit-search-cancel-button]:hidden"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="rounded-lg p-1 text-muted transition hover:bg-surface-2 hover:text-fg"
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        ) : null}
        {variant === 'hero' ? (
          <button
            type="button"
            onClick={submit}
            className="hidden shrink-0 items-center gap-1.5 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 sm:inline-flex"
          >
            Search
          </button>
        ) : null}
      </div>

      {isOpen ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Tool search results"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-[70vh] overflow-y-auto rounded-2xl border border-line/10 bg-surface/95 p-2 shadow-lift backdrop-blur-2xl animate-scale-in"
        >
          {results.length === 0 ? (
            <div className="px-3 py-6 text-center">
              <p className="text-sm font-semibold text-fg">No tools found</p>
              <p className="mt-1 text-xs text-muted">
                Nothing matches “{query.trim()}”. Try a shorter word such as “pdf”, “image” or “json”.
              </p>
            </div>
          ) : (
            <>
              {results.map((tool, index) => {
                const Icon = getToolIcon(tool.slug);
                const active = index === activeIndex;
                return (
                  <Link
                    key={tool.slug}
                    id={`${listboxId}-${index}`}
                    role="option"
                    aria-selected={active}
                    href={`/tools/${tool.slug}`}
                    onClick={() => {
                      setOpen(false);
                      setQuery('');
                      onNavigate?.();
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors',
                      active ? 'bg-brand-gradient-soft' : 'hover:bg-surface-2'
                    )}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-fg">
                      <Icon aria-hidden className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-fg">{tool.name}</span>
                      <span className="block truncate text-xs text-muted">
                        {categoryMap[tool.category]?.name}
                      </span>
                    </span>
                    {active ? (
                      <CornerDownLeft aria-hidden className="h-4 w-4 shrink-0 text-muted" />
                    ) : null}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={submit}
                className="mt-1 w-full rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-brand-purple transition hover:bg-surface-2"
              >
                See all results for “{query.trim()}” →
              </button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
