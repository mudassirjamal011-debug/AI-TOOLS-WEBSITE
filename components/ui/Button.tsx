'use client';

import Link from 'next/link';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'subtle';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const base =
  'relative inline-flex select-none items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 tap-target';

const variants: Record<Variant, string> = {
  primary:
    'bg-brand-gradient text-white shadow-[0_10px_30px_-12px_rgba(192,38,211,0.7)] hover:shadow-[0_14px_40px_-12px_rgba(255,58,94,0.75)] hover:brightness-[1.06]',
  secondary:
    'bg-fg text-bg hover:opacity-90 shadow-soft dark:bg-surface-2 dark:text-fg dark:border dark:border-line/10',
  outline:
    'border border-line/15 bg-surface/60 text-fg hover:border-brand-purple/50 hover:bg-surface-2 backdrop-blur',
  ghost: 'text-muted hover:bg-surface-2 hover:text-fg',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  subtle: 'bg-surface-2 text-fg hover:bg-line/10',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm sm:text-[0.9375rem]',
  lg: 'h-13 px-6 text-base py-3.5',
  icon: 'h-10 w-10',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', loading, fullWidth, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      disabled={disabled || loading}
      aria-busy={loading ? 'true' : undefined}
      {...props}
    >
      {loading ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
});

export interface ButtonLinkProps {
  href: string;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
  prefetch?: boolean;
  'aria-label'?: string;
  onClick?: () => void;
  external?: boolean;
}

export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
  children,
  external,
  onClick,
  ...rest
}: ButtonLinkProps) {
  const classes = cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} onClick={onClick} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} onClick={onClick} {...rest}>
      {children}
    </Link>
  );
}
