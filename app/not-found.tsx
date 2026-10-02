import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { ToolSearch } from '@/components/search/ToolSearch';
import { popularTools } from '@/lib/tools';

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient-soft">
        <FileQuestion aria-hidden className="h-7 w-7 text-brand-purple" />
      </span>
      <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        We could not find that page
      </h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
        The link may be old or mistyped. Search for the tool you need, or start from the full list.
      </p>

      <div className="mt-6 w-full max-w-md">
        <ToolSearch />
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">Back to home</ButtonLink>
        <ButtonLink href="/tools" variant="outline">
          Browse all tools
        </ButtonLink>
      </div>

      <div className="mt-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">Popular tools</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {popularTools.slice(0, 6).map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="rounded-full border border-line/12 bg-surface/60 px-3 py-1.5 text-sm text-muted transition-colors hover:text-fg"
            >
              {tool.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
