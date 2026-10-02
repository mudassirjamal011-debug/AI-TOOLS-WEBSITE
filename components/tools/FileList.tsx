'use client';

import { ArrowDown, ArrowUp, FileText, Trash2 } from 'lucide-react';
import { cn, formatBytes } from '@/lib/utils';

export interface FileListItem {
  id: string;
  file: File;
  /** Optional data URL preview for images. */
  preview?: string;
  meta?: string;
}

export function FileList({
  items,
  onRemove,
  onMoveUp,
  onMoveDown,
  className,
  emptyLabel = 'No files selected yet.',
}: {
  items: FileListItem[];
  onRemove: (id: string) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  className?: string;
  emptyLabel?: string;
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line/15 px-4 py-6 text-center text-sm text-muted">
        {emptyLabel}
      </p>
    );
  }

  return (
    <ul className={cn('space-y-2', className)}>
      {items.map((item, index) => (
        <li
          key={item.id}
          className="flex items-center gap-3 rounded-xl border border-line/10 bg-surface/70 p-2.5 pr-3 transition-colors hover:bg-surface-2/60"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-2">
            {item.preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.preview} alt="" className="h-full w-full object-cover" />
            ) : (
              <FileText aria-hidden className="h-4 w-4 text-muted" />
            )}
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-fg">{item.file.name}</span>
            <span className="block text-xs text-muted">
              {formatBytes(item.file.size)}
              {item.meta ? ` · ${item.meta}` : ''}
            </span>
          </span>

          <span className="flex shrink-0 items-center gap-1">
            {onMoveUp ? (
              <button
                type="button"
                onClick={() => onMoveUp(index)}
                disabled={index === 0}
                aria-label={`Move ${item.file.name} up`}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-line/10 text-muted transition hover:bg-surface hover:text-fg disabled:opacity-30"
              >
                <ArrowUp aria-hidden className="h-3.5 w-3.5" />
              </button>
            ) : null}
            {onMoveDown ? (
              <button
                type="button"
                onClick={() => onMoveDown(index)}
                disabled={index === items.length - 1}
                aria-label={`Move ${item.file.name} down`}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-line/10 text-muted transition hover:bg-surface hover:text-fg disabled:opacity-30"
              >
                <ArrowDown aria-hidden className="h-3.5 w-3.5" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              aria-label={`Remove ${item.file.name}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line/10 text-muted transition hover:bg-red-500/10 hover:text-red-500"
            >
              <Trash2 aria-hidden className="h-3.5 w-3.5" />
            </button>
          </span>
        </li>
      ))}
    </ul>
  );
}
