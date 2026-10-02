'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, LucideSparkles, Menu, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { categories } from '@/lib/categories';
import { siteConfig } from '@/lib/site';
import { ThemeToggle } from './ThemeToggle';
import { ToolSearch } from '@/components/search/ToolSearch';
import { Logo } from './Logo';

interface NavItem {
  label: string;
  href: string;
}

const primaryNav: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Image Tools', href: '/categories/image-tools' },
  { label: 'PDF Tools', href: '/categories/pdf-tools' },
  { label: 'Text Tools', href: '/categories/text-tools' },
  { label: 'AI Tools', href: '/categories/ai-tools' },
];

const moreNav: NavItem[] = [
  { label: 'File Tools', href: '/categories/file-tools' },
  { label: 'Developer Tools', href: '/categories/developer-tools' },
  { label: 'Blog & Guides', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus when the route changes.
  useEffect(() => {
    setMenuOpen(false);
    setMoreOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!moreOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!moreRef.current?.contains(event.target as Node)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [moreOpen]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-xl focus:bg-brand-gradient focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <header
        className={cn(
          'sticky top-0 z-50 w-full border-b transition-all duration-300',
          scrolled
            ? 'border-line/10 bg-bg/80 backdrop-blur-xl supports-[backdrop-filter]:bg-bg/65'
            : 'border-transparent bg-transparent'
        )}
      >
        <div className="container-page flex h-16 items-center gap-3">
          <Logo />

          {/* ------------------------------------------------ desktop nav */}
          <nav aria-label="Main" className="ml-4 hidden items-center gap-0.5 lg:flex">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive(item.href) ? 'text-fg' : 'text-muted hover:bg-surface-2 hover:text-fg'
                )}
              >
                {item.label}
              </Link>
            ))}

            <div ref={moreRef} className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen((open) => !open)}
                aria-expanded={moreOpen}
                aria-haspopup="true"
                className={cn(
                  'flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  moreOpen || moreNav.some((item) => isActive(item.href))
                    ? 'text-fg'
                    : 'text-muted hover:bg-surface-2 hover:text-fg'
                )}
              >
                More
                <ChevronDown
                  aria-hidden
                  className={cn('h-4 w-4 transition-transform', moreOpen && 'rotate-180')}
                />
              </button>

              {moreOpen ? (
                <div className="absolute left-0 top-[calc(100%+0.5rem)] w-56 animate-scale-in rounded-2xl border border-line/10 bg-surface/95 p-2 shadow-lift backdrop-blur-2xl">
                  {moreNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'block rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                        isActive(item.href) ? 'bg-brand-gradient-soft text-fg' : 'text-muted hover:bg-surface-2 hover:text-fg'
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="my-1 h-px bg-line/10" />
                  <Link
                    href="/tools"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-fg hover:bg-surface-2"
                  >
                    <LucideSparkles aria-hidden className="h-4 w-4 text-brand-purple" />
                    Browse all tools
                  </Link>
                </div>
              ) : null}
            </div>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {/* Desktop inline search */}
            <div className="hidden md:block">
              {searchOpen ? (
                <div className="w-[280px] animate-fade-in lg:w-[340px]">
                  <ToolSearch variant="header" autoFocus placeholder={`Search ${siteConfig.shortName} tools…`} />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Open tool search"
                  className="flex h-10 items-center gap-2 rounded-xl border border-line/12 bg-surface/60 px-3 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-fg"
                >
                  <Search aria-hidden className="h-4 w-4" />
                  <span className="hidden lg:inline">Search tools</span>
                  <kbd className="ml-1 hidden rounded border border-line/15 bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold text-muted lg:inline">
                    /
                  </kbd>
                </button>
              )}
            </div>

            <ThemeToggle />

            <Link
              href="/tools"
              className="hidden h-10 items-center rounded-xl bg-brand-gradient px-4 text-sm font-semibold text-white transition hover:brightness-110 sm:inline-flex"
            >
              All Tools
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-line/12 bg-surface/60 text-fg transition-colors hover:bg-surface-2 lg:hidden"
            >
              {menuOpen ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* -------------------------------------------------- mobile sheet */}
      {menuOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden" id="mobile-menu">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 h-full w-full bg-black/50 backdrop-blur-sm animate-fade-in"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col border-l border-line/10 bg-bg shadow-lift animate-fade-in"
          >
            <div className="flex h-16 items-center justify-between border-b border-line/10 px-4">
              <Logo onClick={() => setMenuOpen(false)} />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-line/12 bg-surface/60 text-fg"
              >
                <X aria-hidden className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <ToolSearch autoFocus={false} placeholder={`Search ${siteConfig.shortName} tools…`} onNavigate={() => setMenuOpen(false)} />

              <nav aria-label="Mobile" className="mt-6 space-y-1">
                {[...primaryNav, ...moreNav].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      'block rounded-xl px-3 py-3 text-[0.9375rem] font-semibold transition-colors',
                      isActive(item.href) ? 'bg-brand-gradient-soft text-fg' : 'text-muted hover:bg-surface-2 hover:text-fg'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <p className="mt-6 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted">
                Categories
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Link
                      key={category.slug}
                      href={`/categories/${category.slug}`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-xl border border-line/10 bg-surface/60 px-3 py-2.5 text-sm font-medium text-fg"
                    >
                      <Icon aria-hidden className="h-4 w-4 text-brand-purple" />
                      {category.shortName}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="safe-bottom border-t border-line/10 px-4 py-3">
              <p className="text-center text-xs text-muted">{siteConfig.privacyNote}</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
