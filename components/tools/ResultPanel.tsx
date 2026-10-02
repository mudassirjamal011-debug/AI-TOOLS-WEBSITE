'use client';

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export function ResultPanel({
  title,
  children,
  actions,
  tone = 'default',
  className,
  icon,
}: {
  title?: string;
  children?: ReactNode;
  actions?: ReactNode;
  tone?: 'default' | 'success';
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <section
      aria-label={title ? `${title} result` : 'Result'}
      className={cn(
        'rounded-2xl border bg-surface/70 p-4 sm:p-5 animate-fade-up',
        tone === 'success' ? 'border-emerald-500/25' : 'border-line/10',
        className
      )}
    >
      {title ? (
        <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-muted">
            {icon}
            {title}
          </h2>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function StatGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('grid grid-cols-2 gap-2.5 sm:grid-cols-3', className)}>{children}</div>;
}

export function Stat({
  label,
  value,
  hint,
  highlight,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border px-3 py-2.5',
        highlight ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-line/10 bg-surface-2/50'
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p
        className={cn(
          'mt-0.5 truncate font-display text-lg font-bold tabular-nums',
          highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-fg'
        )}
        title={typeof value === 'string' ? value : undefined}
      >
        {value}
      </p>
      {hint ? <p className="mt-0.5 truncate text-[11px] text-muted">{hint}</p> : null}
    </div>
  );
}

/** Comparison row: original → result with the percentage saved. */
export function SizeComparison({
  original,
  result,
}: {
  original: number;
  result: number;
}) {
  const saved = original > 0 ? ((original - result) / original) * 100 : 0;
  return (
    <div className="mt-3 grid grid-cols-3 gap-2.5">
      <Stat label="Original" value={formatSize(original)} />
      <Stat label="Result" value={formatSize(result)} />
      <Stat
        label="Saved"
        value={`${saved.toFixed(saved >= 10 || saved <= -10 ? 1 : 2)}%`}
        highlight={saved > 0}
        hint={saved > 0 ? 'smaller' : saved < 0 ? 'larger' : 'no change'}
      />
    </div>
  );
}

function formatSize(bytes: number): string {
  if (!Number.isFinite(bytes)) return '—';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 100 ? 0 : 1)} ${units[unit]}`;
}
