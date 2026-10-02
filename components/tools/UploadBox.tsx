'use client';

import { useCallback, useId, useRef, useState } from 'react';
import { FileUp, UploadCloud } from 'lucide-react';
import { cn, formatBytes } from '@/lib/utils';
import { StatusMessage } from '@/components/ui/Feedback';
import { Button } from '@/components/ui/Button';

function matchesAccept(file: File, accept: string): boolean {
  const patterns = accept
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
  if (patterns.length === 0 || patterns.includes('*/*')) return true;

  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  return patterns.some((pattern) => {
    if (pattern.endsWith('/*')) {
      return type.startsWith(pattern.slice(0, -1));
    }
    if (pattern.startsWith('.')) {
      return name.endsWith(pattern);
    }
    return type === pattern;
  });
}

export interface UploadBoxProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMb?: number;
  label?: string;
  hint?: string;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
  /** Rendered inside the box, below the default copy. */
  children?: React.ReactNode;
}

export function UploadBox({
  onFiles,
  accept = '*/*',
  multiple = false,
  maxSizeMb = 100,
  label = 'Drop your file here',
  hint,
  disabled,
  compact = false,
  className,
  children,
}: UploadBoxProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      const incoming = Array.from(fileList);

      const unsupported = incoming.filter((file) => !matchesAccept(file, accept));
      if (unsupported.length > 0) {
        setError(
          `Unsupported file format: ${unsupported.map((file) => file.name).join(', ')}. Please choose a supported file.`
        );
        return;
      }

      const tooLarge = incoming.filter((file) => file.size > maxSizeMb * 1024 * 1024);
      if (tooLarge.length > 0) {
        setError(
          `File is too large: ${tooLarge.map((file) => file.name).join(', ')}. Maximum size is ${maxSizeMb} MB.`
        );
        return;
      }

      setError(null);
      onFiles(multiple ? incoming : incoming.slice(0, 1));
    },
    [accept, maxSizeMb, multiple, onFiles]
  );

  const openPicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (disabled) return;
          handleFiles(event.dataTransfer?.files ?? null);
        }}
        className={cn(
          'group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center transition-all duration-200',
          compact ? 'px-4 py-6' : 'px-6 py-10',
          dragging
            ? 'scale-[1.01] border-brand-purple bg-brand-gradient-soft'
            : 'border-line/20 bg-surface/50 hover:border-brand-purple/50 hover:bg-surface-2/60',
          disabled && 'pointer-events-none opacity-60'
        )}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="sr-only"
          onChange={(event) => {
            handleFiles(event.target.files);
            // Reset so selecting the same file again still fires a change event.
            event.target.value = '';
          }}
        />

        <span
          aria-hidden
          className={cn(
            'flex items-center justify-center rounded-2xl bg-brand-gradient-soft text-brand-purple transition-transform duration-200',
            compact ? 'h-10 w-10' : 'h-14 w-14',
            dragging && 'scale-110'
          )}
        >
          {dragging ? (
            <FileUp className={compact ? 'h-5 w-5' : 'h-6 w-6'} />
          ) : (
            <UploadCloud className={compact ? 'h-5 w-5' : 'h-6 w-6'} />
          )}
        </span>

        <p className={cn('mt-3 font-display font-bold text-fg', compact ? 'text-sm' : 'text-base')}>
          {dragging ? 'Release to upload' : label}
        </p>
        <p className="mt-1 text-xs text-muted">
          {hint ?? `Drag & drop ${multiple ? 'files' : 'a file'} here, or choose from your device`}
        </p>

        <Button type="button" size={compact ? 'sm' : 'md'} variant="primary" onClick={openPicker} className="mt-4">
          {multiple ? 'Choose files' : 'Choose file'}
        </Button>

        <p className="mt-3 text-[11px] text-muted/80">
          Max {maxSizeMb} MB{multiple ? ' per file' : ''} · processed on your device
        </p>

        {children ? <div className="mt-3 w-full">{children}</div> : null}
      </div>

      {error ? (
        <StatusMessage tone="error" title="Upload problem">
          {error}
        </StatusMessage>
      ) : null}
    </div>
  );
}

/** Small helper used by tools that only need a bare "add file" button. */
export function UploadButton({
  onFiles,
  accept = '*/*',
  multiple = false,
  maxSizeMb = 100,
  children,
  variant = 'outline',
  size = 'sm',
  className,
}: UploadBoxProps & { variant?: 'outline' | 'secondary' | 'primary' | 'ghost'; size?: 'sm' | 'md' }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  return (
    <>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          const valid = files.filter(
            (file) => matchesAccept(file, accept) && file.size <= maxSizeMb * 1024 * 1024
          );
          if (valid.length) onFiles(valid);
          event.target.value = '';
        }}
      />
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={() => inputRef.current?.click()}
      >
        {children ?? 'Choose file'}
      </Button>
    </>
  );
}

export { matchesAccept, formatBytes };
