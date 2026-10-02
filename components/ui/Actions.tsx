'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Copy, Download, RotateCcw } from 'lucide-react';
import { Button, type ButtonProps } from './Button';
import { copyToClipboard, downloadBlob } from '@/lib/utils';
import { useToast } from './Toast';

/** Copy button with a real clipboard write + 2s "Copied" confirmation. */
export function CopyButton({
  value,
  label = 'Copy',
  size = 'sm',
  variant = 'outline',
  disabled,
  className,
  copiedLabel = 'Copied!',
  onCopied,
}: {
  value: string | (() => string);
  label?: string;
  size?: ButtonProps['size'];
  variant?: ButtonProps['variant'];
  disabled?: boolean;
  className?: string;
  copiedLabel?: string;
  onCopied?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toast } = useToast();

  useEffect(() => () => (timer.current ? clearTimeout(timer.current) : undefined), []);

  const handleClick = useCallback(async () => {
    const text = typeof value === 'function' ? value() : value;
    if (!text) {
      toast({ title: 'Nothing to copy', description: 'Add some content first.', variant: 'warning' });
      return;
    }
    const ok = await copyToClipboard(text);
    if (!ok) {
      toast({
        title: 'Copy failed',
        description: 'Your browser blocked clipboard access. Select the text and copy manually.',
        variant: 'error',
      });
      return;
    }
    setCopied(true);
    onCopied?.();
    timer.current = setTimeout(() => setCopied(false), 2000);
  }, [value, toast, onCopied]);

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled}
      className={className}
      aria-live="polite"
    >
      {copied ? <Check aria-hidden className="h-4 w-4" /> : <Copy aria-hidden className="h-4 w-4" />}
      {copied ? copiedLabel : label}
    </Button>
  );
}

/** Download button that triggers a real browser download from a Blob. */
export function DownloadButton({
  blob,
  filename,
  label,
  size = 'md',
  variant = 'primary',
  disabled,
  className,
  onDownloaded,
}: {
  blob: Blob | null;
  filename: string;
  label?: string;
  size?: ButtonProps['size'];
  variant?: ButtonProps['variant'];
  disabled?: boolean;
  className?: string;
  onDownloaded?: () => void;
}) {
  const { toast } = useToast();
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={disabled || !blob}
      className={className}
      onClick={() => {
        if (!blob) {
          toast({ title: 'Nothing to download', variant: 'warning' });
          return;
        }
        try {
          downloadBlob(blob, filename);
          onDownloaded?.();
        } catch {
          toast({
            title: 'Download failed',
            description: 'Something went wrong. Please try again.',
            variant: 'error',
          });
        }
      }}
    >
      <Download aria-hidden className="h-4 w-4" />
      {label ?? 'Download'}
    </Button>
  );
}

export function ResetButton({
  onClick,
  label = 'Reset',
  size = 'sm',
  variant = 'ghost',
  className,
}: {
  onClick: () => void;
  label?: string;
  size?: ButtonProps['size'];
  variant?: ButtonProps['variant'];
  className?: string;
}) {
  return (
    <Button type="button" variant={variant} size={size} onClick={onClick} className={className}>
      <RotateCcw aria-hidden className="h-4 w-4" />
      {label}
    </Button>
  );
}
