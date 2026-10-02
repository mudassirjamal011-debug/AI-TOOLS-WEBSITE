'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Home, LayoutGrid, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/tools', label: 'Tools', icon: LayoutGrid },
  { href: '/blog', label: 'Guides', icon: BookOpen },
  { href: '/contact', label: 'Contact', icon: Mail },
];

/** Compact app-like navigation for phones and small tablets. */
export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Quick navigation"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line/10 bg-bg/90 backdrop-blur-xl md:hidden"
    >
      <ul className="grid grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors',
                  active ? 'text-fg' : 'text-muted'
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-12 items-center justify-center rounded-xl transition-colors',
                    active ? 'bg-brand-gradient-soft text-brand-purple' : 'text-muted'
                  )}
                >
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
