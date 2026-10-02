import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { categoryMap } from '@/lib/categories';
import { getTool } from '@/lib/tools';

export function RelatedTools({ slugs }: { slugs: string[] }) {
  const related = slugs.map(getTool).filter((tool): tool is NonNullable<typeof tool> => Boolean(tool));

  if (related.length === 0) return null;

  return (
    <section aria-labelledby="related-tools" className="mt-14">
      <h2 id="related-tools" className="font-display text-xl font-bold">
        Related tools
      </h2>
      <p className="mt-1 text-sm text-muted">
        People who use this tool usually reach for these next.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="group flex items-start gap-3 rounded-2xl border border-line/10 bg-surface/60 p-4 transition-all hover:-translate-y-0.5 hover:border-brand-purple/40 hover:shadow-soft"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-gradient-soft">
                <Icon aria-hidden className="h-4 w-4 text-fg" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-fg">{tool.name}</span>
                <span className="mt-0.5 block text-xs text-muted">
                  {categoryMap[tool.category]?.name}
                </span>
              </span>
              <ArrowRight
                aria-hidden
                className="mt-1 h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-fg"
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
