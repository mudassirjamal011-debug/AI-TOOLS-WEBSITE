'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log for diagnostics; the visitor only ever sees the friendly message below.
    console.error('[ToolNova AI] Unhandled error:', error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10">
        <AlertTriangle aria-hidden className="h-7 w-7 text-amber-500" />
      </span>
      <h1 className="mt-6 font-display text-2xl font-extrabold sm:text-3xl">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
        The page hit an unexpected error. Your files were not uploaded anywhere, and nothing you typed
        was sent to us. Try again, or head back to the tools list.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>
          <RotateCcw aria-hidden className="h-4 w-4" />
          Try again
        </Button>
        <Button variant="outline" onClick={() => (window.location.href = '/')}>
          Back to home
        </Button>
      </div>

      {error.digest ? (
        <p className="mt-6 font-mono text-[11px] text-muted/70">Reference: {error.digest}</p>
      ) : null}
    </div>
  );
}
