import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ToolDef } from '@/lib/tools';
import { categoryMap } from '@/lib/categories';

const accentRing: Record<string, string> = {
  'image-tools': 'group-hover:border-brand-purple/45',
  'pdf-tools': 'group-hover:border-brand-red/45',
  'text-tools': 'group-hover:border-fuchsia-500/45',
  'ai-tools': 'group-hover:border-violet-500/45',
  'file-tools': 'group-hover:border-rose-500/45',
  'developer-tools': 'group-hover:border-indigo-500/45',
};

export function ToolCard({
  tool,
  variant = 'default',
  className,
}: {
  tool: ToolDef;
  variant?: 'default' | 'compact';
  className?: string;
}) {
  const Icon = tool.icon;
  const category = categoryMap[tool.category];

  return (
    <Link
      href={`/tools/${tool.slug}`}
      aria-label={`${tool.name} — ${tool.tagline}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-line/10 bg-surface/70 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift',
        accentRing[tool.category],
        className
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-24 h-32 bg-brand-gradient-soft opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="relative flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient-soft text-fg ring-1 ring-inset ring-line/10">
          <Icon aria-hidden className="h-5 w-5" />
        </span>
        {tool.popular ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-gradient px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            <Sparkles aria-hidden className="h-3 w-3" />
            Popular
          </span>
        ) : tool.badge ? (
          <span className="rounded-full border border-line/10 bg-surface-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
            {tool.badge}
          </span>
        ) : null}
      </div>

      <h3 className="relative mt-4 font-display text-[1.0625rem] font-bold leading-snug text-fg">
        {tool.name}
      </h3>
      {variant === 'default' ? (
        <p className="relative mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{tool.tagline}</p>
      ) : null}

      <div className="relative mt-4 flex items-center justify-between gap-2 text-xs">
        <span className="text-muted">{category?.shortName ?? 'Tool'}</span>
        <span
          className={cn(
            'inline-flex items-center gap-1 font-semibold text-fg transition-transform duration-200 group-hover:translate-x-0.5'
          )}
        >
          Use tool
          <ArrowRight aria-hidden className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
