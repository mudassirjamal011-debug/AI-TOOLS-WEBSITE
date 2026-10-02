import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Breadcrumbs } from '@/components/content/Breadcrumbs';
import { Faq } from '@/components/content/Faq';
import { ToolCard } from '@/components/tools/ToolCard';
import { AdPlaceholder } from '@/components/ui/AdPlaceholder';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildMetadata, breadcrumbJsonLd, faqJsonLd } from '@/lib/seo';
import { categories, getCategory } from '@/lib/categories';
import { toolsByCategory } from '@/lib/tools';

export function generateStaticParams() {
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) {
    return buildMetadata({
      title: 'Category not found',
      description: 'That tool category does not exist on ToolNova AI.',
      path: `/categories/${slug}`,
      noIndex: true,
    });
  }
  const count = toolsByCategory(category.slug).length;
  return buildMetadata({
    title: `${category.title} — ${count} Free Tools`,
    description: category.description,
    path: `/categories/${category.slug}`,
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const categoryTools = toolsByCategory(category.slug);
  const Icon = category.icon;

  return (
    <div className="container-page py-8 sm:py-10">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Tools', url: '/tools' },
            { name: category.name, url: `/categories/${category.slug}` },
          ]),
          faqJsonLd(category.faq),
        ]}
      />

      <Breadcrumbs
        items={[
          { name: 'All tools', href: '/tools' },
          { name: category.name, href: `/categories/${category.slug}` },
        ]}
      />

      <header className="mb-8">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-[0_12px_28px_-14px_rgba(192,38,211,0.9)]">
            <Icon aria-hidden className="h-7 w-7" />
          </span>
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {category.title}
            </h1>
            <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-muted">
              {category.description}
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <div className="prose-nova max-w-none">
            {category.intro.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <h2 className="mt-10 font-display text-xl font-bold">
            {categoryTools.length} {category.name.toLowerCase()}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {categoryTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>

          <AdPlaceholder slot="below-result" />

          <section aria-labelledby="category-faq" className="mt-10">
            <h2 id="category-faq" className="font-display text-xl font-bold">
              {category.name} — frequently asked questions
            </h2>
            <Faq items={category.faq} className="mt-4" />
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            <AdPlaceholder slot="sidebar" />
            <div className="rounded-2xl border border-line/10 bg-surface/60 p-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-fg">
                <ShieldCheck aria-hidden className="h-4 w-4 text-emerald-500" />
                Privacy
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Tools in this category process your files locally whenever the browser can do the work.
                Nothing is uploaded unless a tool is explicitly marked as using a server route.
              </p>
            </div>
            <div className="rounded-2xl border border-line/10 bg-surface/60 p-4">
              <h2 className="text-sm font-semibold text-fg">Other categories</h2>
              <ul className="mt-3 space-y-1">
                {categories
                  .filter((entry) => entry.slug !== category.slug)
                  .map((entry) => (
                    <li key={entry.slug}>
                      <Link
                        href={`/categories/${entry.slug}`}
                        className="flex items-center justify-between rounded-xl px-2 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-fg"
                      >
                        {entry.name}
                        <ArrowRight aria-hidden className="h-3.5 w-3.5" />
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
