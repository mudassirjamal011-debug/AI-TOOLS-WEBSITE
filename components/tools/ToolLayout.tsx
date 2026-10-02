import Link from 'next/link';
import { ArrowRight, CheckCircle2, Server, ShieldCheck } from 'lucide-react';
import { Breadcrumbs } from '@/components/content/Breadcrumbs';
import { Faq } from '@/components/content/Faq';
import { AdPlaceholder } from '@/components/ui/AdPlaceholder';
import { RelatedTools } from './RelatedTools';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbJsonLd, faqJsonLd, howToJsonLd, toolJsonLd } from '@/lib/seo';
import { categoryMap } from '@/lib/categories';
import { siteConfig } from '@/lib/site';
import { toolsByCategory, type ToolDef } from '@/lib/tools';
import { cn } from '@/lib/utils';

/**
 * Shared shell for every /tools/[slug] page:
 * breadcrumbs → header → tool UI → how-to → content → FAQ → related tools.
 */
export function ToolLayout({
  tool,
  children,
  hideContent = false,
}: {
  tool: ToolDef;
  children: React.ReactNode;
  hideContent?: boolean;
}) {
  const category = categoryMap[tool.category];
  const Icon = tool.icon;
  const path = `/tools/${tool.slug}`;
  const siblings = toolsByCategory(tool.category).filter((entry) => entry.slug !== tool.slug);

  return (
    <div className="container-page py-6 sm:py-8">
      <JsonLd
        data={[
          toolJsonLd(tool, path),
          breadcrumbJsonLd([
            { name: 'Tools', url: '/tools' },
            { name: category?.name ?? 'Category', url: `/categories/${tool.category}` },
            { name: tool.name, url: path },
          ]),
          faqJsonLd(tool.faq),
          howToJsonLd(tool),
        ]}
      />

      <Breadcrumbs
        items={[
          { name: 'All tools', href: '/tools' },
          { name: category?.name ?? 'Category', href: `/categories/${tool.category}` },
          { name: tool.name, href: path },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] xl:gap-10">
        {/* ------------------------------------------------------ main col */}
        <div className="min-w-0">
          <header className="mb-6">
            <div className="flex items-start gap-3.5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-[0_12px_28px_-14px_rgba(192,38,211,0.9)]">
                <Icon aria-hidden className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {tool.name}
                </h1>
                <p className="mt-1.5 max-w-2xl text-[0.9375rem] leading-relaxed text-muted">
                  {tool.tagline}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line/10 bg-surface px-2.5 py-1 text-xs font-medium text-muted">
                <CheckCircle2 aria-hidden className="h-3.5 w-3.5 text-emerald-500" />
                Free · no sign-up
              </span>
              {tool.processing === 'browser' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck aria-hidden className="h-3.5 w-3.5" />
                  Runs in your browser
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-purple/25 bg-brand-purple/10 px-2.5 py-1 text-xs font-medium text-brand-purple">
                  <Server aria-hidden className="h-3.5 w-3.5" />
                  Secure server route
                </span>
              )}
              {tool.badge ? (
                <span className="rounded-full border border-line/10 bg-surface px-2.5 py-1 text-xs font-medium text-muted">
                  {tool.badge}
                </span>
              ) : null}
              <Link
                href={`/categories/${tool.category}`}
                className="rounded-full border border-line/10 bg-surface px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:text-fg"
              >
                {category?.name}
              </Link>
            </div>
          </header>

          {/* Tool interface */}
          <div className="rounded-3xl border border-line/10 bg-surface/50 p-4 shadow-soft sm:p-6">
            {children}
          </div>

          <AdPlaceholder slot="below-result" />

          {!hideContent ? (
            <section aria-labelledby="how-to-use" className="mt-10">
              <h2 id="how-to-use" className="font-display text-xl font-bold sm:text-2xl">
                How to use the {tool.name}
              </h2>
              <ol className="mt-4 space-y-3">
                {tool.howTo.map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <p className="pt-0.5 text-[0.9375rem] leading-relaxed text-muted">{step}</p>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {tool.intro?.length ? (
            <section className="prose-nova mt-10 max-w-none">
              {tool.intro.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </section>
          ) : null}

          <AdPlaceholder slot="before-related" />

          <RelatedTools slugs={tool.related} />

          <section aria-labelledby="tool-faq" className="mt-14">
            <h2 id="tool-faq" className="font-display text-xl font-bold sm:text-2xl">
              Frequently asked questions
            </h2>
            <Faq items={tool.faq} className="mt-4" />
          </section>
        </div>

        {/* ------------------------------------------------------- sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            <AdPlaceholder slot="sidebar" />

            <div className="rounded-2xl border border-line/10 bg-surface/60 p-4">
              <h2 className="text-sm font-semibold text-fg">More {category?.name}</h2>
              <ul className="mt-3 space-y-1">
                {siblings.map((sibling) => {
                  const SiblingIcon = sibling.icon;
                  return (
                    <li key={sibling.slug}>
                      <Link
                        href={`/tools/${sibling.slug}`}
                        className="flex items-center gap-2.5 rounded-xl px-2 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-fg"
                      >
                        <SiblingIcon aria-hidden className="h-4 w-4 shrink-0" />
                        <span className="truncate">{sibling.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <Link
                href={`/categories/${tool.category}`}
                className="mt-3 flex items-center gap-1.5 px-2 text-xs font-semibold text-brand-purple hover:underline"
              >
                View all {category?.name}
                <ArrowRight aria-hidden className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="rounded-2xl border border-line/10 bg-surface/60 p-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-fg">
                <ShieldCheck aria-hidden className="h-4 w-4 text-emerald-500" />
                Privacy
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-muted">{siteConfig.privacyNote}</p>
              <Link
                href="/privacy-policy"
                className="mt-2 inline-block text-xs font-semibold text-brand-purple hover:underline"
              >
                Read the privacy policy
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/** Small helper for consistent tool page section headings. */
export function ToolSectionTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={cn('font-display text-base font-bold sm:text-lg', className)}>{children}</h2>
  );
}
