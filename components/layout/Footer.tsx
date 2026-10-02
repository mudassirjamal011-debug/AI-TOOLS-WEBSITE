import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { categories } from '@/lib/categories';
import { popularTools, toolCount } from '@/lib/tools';
import { siteConfig } from '@/lib/site';
import { Logo } from './Logo';

const company = [
  { label: 'About ToolNova AI', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Guides & Blog', href: '/blog' },
  { label: 'All tools', href: '/tools' },
];

const legal = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Cookie Policy', href: '/cookie-policy' },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-line/10 bg-surface/30">
      <div className="container-page py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              {toolCount} free tools for images, PDFs, text, files and developers. Fast, private and
              built to work on any device.
            </p>
            <p className="mt-4 flex items-start gap-2 rounded-xl border border-line/10 bg-surface/60 p-3 text-xs leading-relaxed text-muted">
              <ShieldCheck aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              {siteConfig.privacyNote}
            </p>
          </div>

          <nav aria-labelledby="footer-categories">
            <h2 id="footer-categories" className="text-sm font-semibold text-fg">
              Categories
            </h2>
            <ul className="mt-4 space-y-2.5">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link href={`/categories/${category.slug}`} className="text-sm text-muted transition-colors hover:text-fg">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-popular">
            <h2 id="footer-popular" className="text-sm font-semibold text-fg">
              Popular tools
            </h2>
            <ul className="mt-4 space-y-2.5">
              {popularTools.slice(0, 6).map((tool) => (
                <li key={tool.slug}>
                  <Link href={`/tools/${tool.slug}`} className="text-sm text-muted transition-colors hover:text-fg">
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold text-fg">Company</h2>
            <ul className="mt-4 space-y-2.5">
              {company.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-muted transition-colors hover:text-fg">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h2 className="mt-6 text-sm font-semibold text-fg">Legal</h2>
            <ul className="mt-3 space-y-2.5">
              {legal.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-muted transition-colors hover:text-fg">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line/10 pt-6 sm:flex-row">
          <p className="text-xs text-muted">
            © {year} {siteConfig.name}. Free online tools, built for speed and privacy.
          </p>
          <p className="text-xs text-muted">
            Made for people who just need the job done — no sign-up, no install.
          </p>
        </div>
      </div>
    </footer>
  );
}
