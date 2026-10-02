'use client';

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

const controlBase =
  'w-full rounded-xl border border-line/12 bg-surface/70 px-3.5 text-[0.9375rem] text-fg placeholder:text-muted/70 transition-colors focus:border-brand-purple/60 disabled:opacity-60';

/* ------------------------------------------------------------------ field */

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
  className,
  required,
  badge,
}: {
  label: string;
  hint?: string;
  error?: string | null;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
  required?: boolean;
  badge?: ReactNode;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={htmlFor} className="text-sm font-medium text-fg">
          {label}
          {required ? <span className="ml-0.5 text-brand-red">*</span> : null}
        </label>
        {badge}
      </div>
      {children}
      {error ? (
        <p className="text-xs font-medium text-red-500" id={htmlFor ? `${htmlFor}-error` : undefined}>
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ input */

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function TextInput({ className, ...props }, ref) {
    return <input ref={ref} className={cn(controlBase, 'h-11', className)} {...props} />;
  }
);

/* --------------------------------------------------------------- textarea */

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function TextArea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(controlBase, 'min-h-[140px] resize-y py-3 leading-6', className)}
        {...props}
      />
    );
  }
);

/* ----------------------------------------------------------------- select */

export interface SelectOption {
  value: string;
  label: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select ref={ref} className={cn(controlBase, 'h-11 appearance-none pr-9', className)} {...props}>
        {children}
      </select>
    );
  }
);

/* ----------------------------------------------------------------- slider */

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  valueLabel,
  id,
  disabled,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  valueLabel?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn('space-y-2', className)}>
      {label ? (
        <div className="flex items-center justify-between gap-3 text-sm">
          <label htmlFor={inputId} className="font-medium text-fg">
            {label}
          </label>
          <span className="rounded-lg bg-surface-2 px-2 py-0.5 text-xs font-semibold tabular-nums text-fg">
            {valueLabel ?? value}
          </span>
        </div>
      ) : null}
      <input
        id={inputId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full outline-none [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-brand-purple [&::-moz-range-thumb]:shadow [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-brand-purple [&::-webkit-slider-thumb]:shadow-md"
        style={{
          background: `linear-gradient(90deg, #ff3a5e 0%, #8b5cf6 ${pct}%, rgb(var(--muted) / 0.28) ${pct}%, rgb(var(--muted) / 0.28) 100%)`,
        }}
        aria-valuetext={valueLabel ?? String(value)}
      />
    </div>
  );
}

/* ----------------------------------------------------------------- switch */

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
  id,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  id?: string;
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        role="switch"
        id={inputId}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 h-6 w-11 shrink-0 rounded-full border border-line/15 transition-colors disabled:opacity-50',
          checked ? 'bg-brand-gradient' : 'bg-surface-2'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-[1.4rem]' : 'translate-x-0.5'
          )}
          style={{ height: '1.125rem', width: '1.125rem' }}
        />
        <span className="sr-only">{label}</span>
      </button>
      <label htmlFor={inputId} className="cursor-pointer select-none text-sm">
        <span className="font-medium text-fg">{label}</span>
        {description ? <span className="mt-0.5 block text-xs text-muted">{description}</span> : null}
      </label>
    </div>
  );
}

/* -------------------------------------------------------------- segmented */

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  size = 'md',
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        'inline-flex w-full flex-wrap gap-1 rounded-xl border border-line/12 bg-surface-2/70 p-1',
        className
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex-1 whitespace-nowrap rounded-lg font-semibold transition-all',
              size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm',
              active
                ? 'bg-fg text-bg shadow-soft dark:bg-white dark:text-black'
                : 'text-muted hover:bg-surface hover:text-fg'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/* --------------------------------------------------------------- checkbox */

export function Checkbox({
  checked,
  onChange,
  label,
  id,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  id?: string;
  disabled?: boolean;
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className="flex items-center gap-2.5">
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4.5 w-4.5 cursor-pointer rounded border-line/25 text-brand-purple accent-brand-purple"
        style={{ height: '1.125rem', width: '1.125rem' }}
      />
      <label htmlFor={inputId} className="cursor-pointer select-none text-sm font-medium text-fg">
        {label}
      </label>
    </div>
  );
}
