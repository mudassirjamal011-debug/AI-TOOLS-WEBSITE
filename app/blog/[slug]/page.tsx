import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CalendarDays, Clock } from 'lucide-react';
import { Breadcrumbs } from '@/components/content/Breadcrumbs';
import { Faq } from '@/components/content/Faq';
import { ToolCard } from '@/components/tools/ToolCard';
import { AdPlaceholder } from '@/components/ui/AdPlaceholder';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildMetadata, articleJsonLd, breadcrumbJsonLd, faqJsonLd } from '@/lib/seo';
import { blogPosts, formatDate, getPost, readingTimeOf } from '@/lib/blog';
import { getTool } from '@/lib/tools';

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) {
    return buildMetadata({
      title: 'Article not found',
      description: 'That guide does not exist on ToolNova AI.',
      path: `/blog/${slug}`,
      noIndex: true,
    });
  }
  return buildMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    type: 'article',
    publishedTime: post.publishedAt,
    keywords: post.tags,
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const headings = post.blocks.filter((block) => block.heading);
  const relatedPosts = blogPosts.filter((entry) => entry.slug !== post.slug).slice(0, 3);
  const relatedTools = post.relatedTools.map(getTool).filter((tool): tool is NonNullable<typeof tool> => Boolean(tool));

  return (
    <div className="container-page py-8 sm:py-10">
      <JsonLd
        data={[
          articleJsonLd(post, `/blog/${post.slug}`),
          breadcrumbJsonLd([
            { name: 'Guides', url: '/blog' },
            { name: post.title, url: `/blog/${post.slug}` },
          ]),
          faqJsonLd(post.faq),
        ]}
      />

      <Breadcrumbs
        items={[
          { name: 'Guides', href: '/blog' },
          { name: post.title, href: `/blog/${post.slug}` },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="min-w-0">
          <header>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays aria-hidden className="h-3.5 w-3.5" />
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock aria-hidden className="h-3.5 w-3.5" />
                {readingTimeOf(post)} min read
              </span>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-line/10 bg-surface px-2 py-0.5 text-[11px] font-semibold"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              {post.title}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted">{post.description}</p>
          </header>

          <aside className="mt-6 rounded-2xl border border-line/10 bg-surface/60 p-4">
            <h2 className="text-sm font-semibold text-fg">Key takeaways</h2>
            <ul className="mt-2 space-y-1.5">
              {post.takeaways.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-relaxed text-muted">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gradient" />
                  {item}
                </li>
              ))}
            </ul>
          </aside>

          <div className="prose-nova mt-8 max-w-none">
            {post.blocks.map((block, index) => (
              <section key={index}>
                {block.heading ? <h2 id={`section-${index}`}>{block.heading}</h2> : null}
                {block.paragraphs?.map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex}>{paragraph}</p>
                ))}
                {block.list ? (
                  block.ordered ? (
                    <ol>
                      {block.list.map((item, itemIndex) => (
                        <li key={itemIndex}>{item}</li>
                      ))}
                    </ol>
                  ) : (
                    <ul>
                      {block.list.map((item, itemIndex) => (
                        <li key={itemIndex}>{item}</li>
                      ))}
                    </ul>
                  )
                ) : null}
                {block.note ? (
                  <div className="rounded-xl border border-brand-purple/25 bg-brand-purple/5 px-4 py-3 text-sm">
                    {block.note}
                  </div>
                ) : null}
              </section>
            ))}
          </div>

          <AdPlaceholder slot="blog-inline" />

          {relatedTools.length > 0 ? (
            <section aria-labelledby="post-tools" className="mt-10">
              <h2 id="post-tools" className="font-display text-xl font-bold">
                Try the tools from this guide
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {relatedTools.slice(0, 4).map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </section>
          ) : null}

          <section aria-labelledby="post-faq" className="mt-10">
            <h2 id="post-faq" className="font-display text-xl font-bold">
              Frequently asked questions
            </h2>
            <Faq items={post.faq} className="mt-4" />
          </section>

          <section aria-labelledby="more-guides" className="mt-12">
            <h2 id="more-guides" className="font-display text-xl font-bold">
              Keep reading
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {relatedPosts.map((entry) => (
                <Link
                  key={entry.slug}
                  href={`/blog/${entry.slug}`}
                  className="group rounded-2xl border border-line/10 bg-surface/60 p-4 transition-all hover:-translate-y-0.5 hover:border-brand-purple/40"
                >
                  <p className="text-xs text-muted">
                    {formatDate(entry.publishedAt)} · {readingTimeOf(entry)} min
                  </p>
                  <p className="mt-1.5 text-sm font-semibold leading-snug text-fg">{entry.title}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-purple">
                    Read
                    <ArrowRight
                      aria-hidden
                      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            <nav aria-label="On this page" className="rounded-2xl border border-line/10 bg-surface/60 p-4">
              <h2 className="text-sm font-semibold text-fg">On this page</h2>
              <ul className="mt-3 space-y-1.5">
                {headings.map((block, index) => (
                  <li key={`${block.heading}-${index}`}>
                    <a
                      href={`#section-${post.blocks.indexOf(block)}`}
                      className="block text-xs leading-relaxed text-muted transition-colors hover:text-fg"
                    >
                      {block.heading}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <AdPlaceholder slot="sidebar" />

            <div className="rounded-2xl border border-line/10 bg-surface/60 p-4">
              <h2 className="text-sm font-semibold text-fg">Written by</h2>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                {post.author} — we build and maintain every tool on this site, and we test the advice in
                these guides against the tools they describe.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
