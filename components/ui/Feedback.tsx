'use client';

import { AlertTriangle, CheckCircle2, Info, Loader2, XCircle } from 'lucide-react';
import { cn, clamp } from '@/lib/utils';
import type { ReactNode } from 'react';

/* ---------------------------------------------------------------- spinner */

export function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted" role="status">
      <Loader2 aria-hidden className={cn('h-4 w-4 animate-spin', className)} />
      {label ? <span>{label}</span> : <span className="sr-only">Loading</span>}
    </span>
  );
}

/* ------------------------------------------------------------- progressbar */

export function ProgressBar({
  value,
  label,
  showValue = true,
  className,
}: {
  value: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}) {
  const safeValue = clamp(Math.round(value), 0, 100);
  return (
    <div className={cn('w-full', className)}>
      {label || showValue ? (
        <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-muted">
          <span>{label}</span>
          {showValue ? <span className="tabular-nums">{safeValue}%</span> : null}
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuenow={safeValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
        className="h-2 w-full overflow-hidden rounded-full bg-surface-2"
      >
        <div
          className="h-full rounded-full bg-brand-gradient transition-[width] duration-300 ease-out"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}

/* --------------------------------------------------------- status messages */

type StatusTone = 'error' | 'success' | 'warning' | 'info';

const toneStyles: Record<StatusTone, string> = {
  error: 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-300',
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  info: 'border-brand-purple/30 bg-brand-purple/10 text-brand-purple dark:text-purple-300',
};

const toneIcons: Record<StatusTone, ReactNode> = {
  error: <XCircle aria-hidden className="h-4 w-4 shrink-0" />,
  success: <CheckCircle2 aria-hidden className="h-4 w-4 shrink-0" />,
  warning: <AlertTriangle aria-hidden className="h-4 w-4 shrink-0" />,
  info: <Info aria-hidden className="h-4 w-4 shrink-0" />,
};

export function StatusMessage({
  tone,
  children,
  title,
  className,
  action,
}: {
  tone: StatusTone;
  children?: ReactNode;
  title?: string;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm animate-fade-in',
        toneStyles[tone],
        className
      )}
    >
      <span className="mt-0.5">{toneIcons[tone]}</span>
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={cn('break-words', title && 'mt-0.5 opacity-95')}>{children}</div> : null}
        {action ? <div className="mt-2">{action}</div> : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ empty state */

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-line/15 bg-surface/40 px-6 py-10 text-center',
        className
      )}
    >
      {icon ? (
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient-soft text-brand-purple">
          {icon}
        </span>
      ) : null}
      <p className="font-display text-base font-semibold text-fg">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------- skeletons */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton h-4 w-full', className)} aria-hidden />;
}
