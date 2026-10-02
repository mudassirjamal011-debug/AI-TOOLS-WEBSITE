import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface Crumb {
  name: string;
  href: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const trail = [{ name: 'Home', href: '/' }, ...items];

  return (
    <nav aria-label="Breadcrumb" className="mb-5">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-muted sm:text-[0.8125rem]">
        {trail.map((crumb, index) => {
          const isLast = index === trail.length - 1;
          return (
            <li key={`${crumb.href}-${crumb.name}`} className="flex items-center gap-1">
              {index > 0 ? (
                <ChevronRight aria-hidden className="h-3.5 w-3.5 shrink-0 opacity-50" />
              ) : null}
              {isLast ? (
                <span aria-current="page" className="font-medium text-fg">
                  {index === 0 ? (
                    <span className="inline-flex items-center gap-1">
                      <Home aria-hidden className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only">{crumb.name}</span>
                    </span>
                  ) : (
                    crumb.name
                  )}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="inline-flex items-center gap-1 rounded transition-colors hover:text-fg"
                >
                  {index === 0 ? <Home aria-hidden className="h-3.5 w-3.5" /> : null}
                  <span className={index === 0 ? 'sr-only sm:not-sr-only' : undefined}>{crumb.name}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
