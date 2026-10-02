import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/content/Breadcrumbs';
import { SectionHeading } from '@/components/content/SectionHeading';
import { AdPlaceholder } from '@/components/ui/AdPlaceholder';
import { buildMetadata } from '@/lib/seo';
import { blogPosts, formatDate, readingTimeOf } from '@/lib/blog';
import { getToolIcon } from '@/components/tools/ToolIconMap';
import { getTool } from '@/lib/tools';

export const metadata: Metadata = buildMetadata({
  title: 'Guides & Blog — Practical How-Tos for Files and Content',
  description:
    'Short, practical guides on compressing images, converting formats, merging PDFs, counting words, formatting JSON and reducing file size without losing quality.',
  path: '/blog',
});

export default function BlogIndexPage() {
  const [latest, ...rest] = blogPosts;

  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs items={[{ name: 'Guides', href: '/blog' }]} />

      <SectionHeading
        align="left"
        eyebrow="Guides"
        title="How-tos for the jobs these tools do"
        description="Written for people who need to get something done now: how much quality you can drop, which format to pick, and why some files refuse to get smaller."
        className="mb-8"
      />

      {/* Featured post */}
      <article className="group overflow-hidden rounded-3xl border border-line/10 bg-surface/60 transition-all hover:border-brand-purple/40">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <time dateTime={latest.publishedAt}>{formatDate(latest.publishedAt)}</time>
              <span aria-hidden>·</span>
              <span>{readingTimeOf(latest)} min read</span>
              <span aria-hidden>·</span>
              <span>{latest.tags.join(' · ')}</span>
            </div>
            <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
              <Link href={`/blog/${latest.slug}`} className="hover:underline">
                {latest.title}
              </Link>
            </h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">{latest.description}</p>
            <Link
              href={`/blog/${latest.slug}`}
              className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Read the guide
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-2xl border border-line/10 bg-surface-2/50 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">Key takeaways</h3>
            <ul className="mt-3 space-y-2">
              {latest.takeaways.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-muted">
                  <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gradient" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </article>

      <AdPlaceholder slot="between-sections" />

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((post) => {
          const firstTool = post.relatedTools[0];
          const tool = firstTool ? getTool(firstTool) : undefined;
          const Icon = firstTool ? getToolIcon(firstTool) : undefined;
          return (
            <article
              key={post.slug}
              className="group flex flex-col rounded-2xl border border-line/10 bg-surface/60 p-5 transition-all hover:-translate-y-0.5 hover:border-brand-purple/40 hover:shadow-soft"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                <span aria-hidden>·</span>
                <span>{readingTimeOf(post)} min read</span>
              </div>
              <h2 className="mt-2 font-display text-lg font-bold leading-snug">
                <Link href={`/blog/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">
                {post.description}
              </p>
              <div className="mt-4 flex items-center justify-between gap-2">
                {tool && Icon ? (
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition-colors hover:text-fg"
                  >
                    <Icon aria-hidden className="h-3.5 w-3.5" />
                    {tool.name}
                  </Link>
                ) : (
                  <span />
                )}
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-purple"
                >
                  Read
                  <ArrowRight
                    aria-hidden
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
