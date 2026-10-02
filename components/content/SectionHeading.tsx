import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  action,
  className,
  id,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'center' | 'left';
  action?: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        action && 'sm:flex-row sm:items-end sm:justify-between sm:gap-6',
        className
      )}
    >
      <div className={cn(align === 'center' && 'mx-auto max-w-2xl', 'max-w-2xl')}>
        {eyebrow ? <span className="eyebrow mb-3">{eyebrow}</span> : null}
        <h2 id={id} className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-muted sm:text-base">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
