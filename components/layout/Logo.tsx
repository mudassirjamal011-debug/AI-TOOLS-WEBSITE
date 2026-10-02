'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ onClick, className }: { onClick?: () => void; className?: string }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="ToolNova AI — home"
      className={cn('group flex shrink-0 items-center gap-2.5', className)}
    >
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient shadow-[0_8px_20px_-8px_rgba(192,38,211,0.9)]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          className="h-5 w-5 text-white"
          strokeWidth={2.1}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z" opacity="0.9" />
          <path d="M12 11.5 15.5 9.5M12 11.5v4M12 11.5 8.5 9.5" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.0625rem] font-extrabold tracking-tight text-fg">
          ToolNova<span className="gradient-text"> AI</span>
        </span>
        <span className="mt-0.5 hidden text-[10px] font-medium uppercase tracking-[0.16em] text-muted sm:block">
          Free online tools
        </span>
      </span>
    </Link>
  );
}
