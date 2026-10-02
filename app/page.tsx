import Link from 'next/link';
import {
  ArrowRight,
  Blocks,
  Gauge,
  Layers,
  MousePointerClick,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ToolSearch } from '@/components/search/ToolSearch';
import { ButtonLink } from '@/components/ui/Button';
import { ToolCard } from '@/components/tools/ToolCard';
import { AdPlaceholder } from '@/components/ui/AdPlaceholder';
import { SectionHeading } from '@/components/content/SectionHeading';
import { Faq } from '@/components/content/Faq';
import { JsonLd } from '@/components/seo/JsonLd';
import { categories } from '@/lib/categories';
import { popularTools, tools, toolCount } from '@/lib/tools';
import { blogPosts, formatDate, readingTimeOf } from '@/lib/blog';
import { absoluteUrl, siteConfig } from '@/lib/site';

const features = [
  {
    icon: Zap,
    title: 'Instant results',
    body: 'Most tools work the moment you drop a file in — no upload queue, no waiting for a server, no email-with-a-link dance.',
  },
  {
    icon: ShieldCheck,
    title: 'Private by default',
    body: 'Images, PDFs and files are processed in your browser. They are not uploaded to us, because we have nowhere to put them.',
  },
  {
    icon: Gauge,
    title: 'Built for speed',
    body: 'Code-split pages, lazy-loaded engines and no tracking scripts. The first tool is usable in well under a second on a decent connection.',
  },
  {
    icon: Blocks,
    title: 'One tool, one job',
    body: 'Every page does exactly one thing and explains how it works. No funnels, no upsells, no account required to download your file.',
  },
  {
    icon: MousePointerClick,
    title: 'Honest about limits',
    body: 'If something needs an API key or a server, the tool says so plainly instead of showing you a fake result.',
  },
  {
    icon: Layers,
    title: 'Works everywhere',
    body: 'Responsive layouts, large touch targets and keyboard support on phones, tablets, laptops and desktops.',
  },
];

const homeFaq = [
  {
    question: 'Is ToolNova AI really free?',
    answer:
      'Yes. Every tool on this site is free, needs no account and has no daily quota. The site is ad-supported, and ad slots are clearly labelled so you always know what is a tool and what is advertising.',
  },
  {
    question: 'Do you upload my files to a server?',
    answer:
      'For the image, PDF, text, file and developer tools: no. Processing happens in your browser with the canvas API, pdf-lib, pdf.js and the Web Crypto API. Only the AI tools send a request, and that goes from our server to the configured AI provider — never straight from your browser.',
  },
  {
    question: 'Why do the AI tools say “AI service is not configured yet”?',
    answer:
      'Because this deployment has no AI_API_KEY configured. We would rather show you an honest configuration message than fabricate text and pretend a language model wrote it.',
  },
  {
    question: 'Which file types are supported?',
    answer:
      'Images: JPEG, PNG, WebP, GIF, BMP and anything else your browser can decode, with JPG, PNG and WebP output. PDFs up to 200 MB. Text and JSON of any practical size. Archives, QR codes, Base64 and checksums accept any file type within the stated size limits.',
  },
  {
    question: 'Can I use these tools on my phone?',
    answer:
      'Yes. Every tool page is responsive, drag-and-drop is backed up by a normal file picker, and controls are sized for touch. The layout switches to a single column with a compact bottom navigation on small screens.',
  },
];

export default function HomePage() {
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `All ${siteConfig.name} tools`,
    numberOfItems: toolCount,
    itemListElement: tools.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: tool.name,
      url: absoluteUrl(`/tools/${tool.slug}`),
      description: tool.tagline,
    })),
  };

  return (
    <>
      <JsonLd data={itemList} />

      {/* ------------------------------------------------------------ hero */}
      <section className="relative overflow-hidden">
        <div className="bg-aurora pointer-events-none absolute inset-0 -z-10" />
        <div className="bg-mesh pointer-events-none absolute inset-0 -z-10 opacity-60" />

        <div className="container-page pb-14 pt-12 sm:pb-20 sm:pt-16 lg:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow animate-fade-in">
              <Sparkles aria-hidden className="h-3.5 w-3.5 text-brand-purple" />
              {toolCount} free tools · no sign-up
            </span>

            <h1 className="mt-5 animate-fade-up font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Powerful AI &amp; Online Tools —{' '}
              <span className="gradient-text animate-gradient-pan">Fast, Simple &amp; Free</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl animate-fade-up text-base leading-relaxed text-muted sm:text-lg">
              Convert, compress, generate and optimize your files and content with simple online tools.
              Most of them run entirely in your browser, so your files never leave your device.
            </p>

            <div className="mt-8 animate-fade-up">
              <ToolSearch variant="hero" placeholder={`Search ${toolCount} tools…`} />
            </div>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 animate-fade-up sm:flex-row">
              <ButtonLink href="#all-tools" size="lg" className="w-full sm:w-auto">
                Explore Tools
                <ArrowRight aria-hidden className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="#popular-tools" size="lg" variant="outline" className="w-full sm:w-auto">
                Popular Tools
                <ArrowRight aria-hidden className="h-4 w-4" />
              </ButtonLink>
            </div>

            <dl className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Tools', value: String(toolCount) },
                { label: 'Categories', value: String(categories.length) },
                { label: 'Uploads', value: 'None' },
                { label: 'Sign-up', value: 'Never' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-line/10 bg-surface/60 px-3 py-3">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                    {stat.label}
                  </dt>
                  <dd className="mt-0.5 font-display text-xl font-bold text-fg">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <div className="container-page">
        <AdPlaceholder slot="header-banner" />
      </div>

      {/* ------------------------------------------------------- categories */}
      <section id="categories" className="container-page scroll-mt-24 py-10 sm:py-14">
        <SectionHeading
          eyebrow="Browse by category"
          title="Six categories, one clear job each"
          description="Pick a category to see every tool in it, with instructions and answers to the questions people actually ask."
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const Icon = category.icon;
            const count = tools.filter((tool) => tool.category === category.slug).length;
            return (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-line/10 bg-surface/60 p-5 transition-all hover:-translate-y-0.5 hover:border-brand-purple/40 hover:shadow-lift"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-gradient-soft opacity-0 blur-2xl transition-opacity group-hover:opacity-100"
                />
                <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <h3 className="relative mt-4 font-display text-lg font-bold">{category.name}</h3>
                <p className="relative mt-1.5 text-sm leading-relaxed text-muted">{category.description}</p>
                <p className="relative mt-3 inline-flex items-center gap-1 text-xs font-semibold text-fg">
                  {count} tool{count === 1 ? '' : 's'}
                  <ArrowRight
                    aria-hidden
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                  />
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ----------------------------------------------------- popular tools */}
      <section id="popular-tools" className="scroll-mt-24 bg-surface/30 py-12 sm:py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Most used"
            title="Popular tools"
            description="The tools people open most often — each one runs in your browser and needs no account."
            action={
              <ButtonLink href="/tools" variant="outline" size="sm">
                View all {toolCount} tools
                <ArrowRight aria-hidden className="h-4 w-4" />
              </ButtonLink>
            }
          />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {popularTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- all tools */}
      <section id="all-tools" className="container-page scroll-mt-24 py-12 sm:py-16">
        <SectionHeading
          eyebrow="Everything"
          title={`All ${toolCount} tools`}
          description="Grouped by category. Every tool page includes step-by-step instructions, FAQs and honest notes about what the tool can and cannot do."
        />

        <div className="mt-10 space-y-12">
          {categories.map((category) => {
            const categoryTools = tools.filter((tool) => tool.category === category.slug);
            return (
              <div key={category.slug} id={`category-${category.slug}`} className="scroll-mt-24">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2.5 font-display text-xl font-bold">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-white">
                      <category.icon aria-hidden className="h-4 w-4" />
                    </span>
                    {category.name}
                  </h3>
                  <Link
                    href={`/categories/${category.slug}`}
                    className="text-sm font-semibold text-brand-purple hover:underline"
                  >
                    Open {category.shortName} category →
                  </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {categoryTools.map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="container-page">
        <AdPlaceholder slot="between-sections" />
      </div>

      {/* ---------------------------------------------------------- features */}
      <section className="container-page py-12 sm:py-16">
        <SectionHeading
          eyebrow="Why ToolNova"
          title="Tools that respect your time and your data"
          description="Built the way we want tools to work: quick, private, and honest when something is not possible."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-line/10 bg-surface/60 p-5 transition-colors hover:border-brand-purple/30"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft text-brand-purple">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{feature.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------- guides */}
      <section className="bg-surface/30 py-12 sm:py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Guides"
            title="Learn how to get the most out of your files"
            description="Short, practical guides written for real work — not filler content."
            action={
              <ButtonLink href="/blog" variant="outline" size="sm">
                All guides
                <ArrowRight aria-hidden className="h-4 w-4" />
              </ButtonLink>
            }
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {blogPosts.slice(0, 3).map((post) => (
              <article
                key={post.slug}
                className="group rounded-2xl border border-line/10 bg-surface/70 p-5 transition-all hover:-translate-y-0.5 hover:shadow-soft"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                  <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                  <span aria-hidden>·</span>
                  <span>{readingTimeOf(post)} min read</span>
                </div>
                <h3 className="mt-2 font-display text-base font-bold leading-snug">
                  <Link href={`/blog/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{post.description}</p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-purple"
                >
                  Read guide
                  <ArrowRight
                    aria-hidden
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- faq */}
      <section className="container-page py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            eyebrow="FAQ"
            title="Questions people ask first"
            description="If something here is wrong or unclear, tell us through the contact page — we read everything."
          />
          <Faq items={homeFaq} className="mt-6" />
        </div>
      </section>

      {/* ---------------------------------------------------------- privacy */}
      <section className="container-page pb-4">
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-line/10 bg-surface/60 px-6 py-8 text-center">
          <ShieldCheck aria-hidden className="h-7 w-7 text-emerald-500" />
          <h2 className="font-display text-lg font-bold">Your files stay on your device</h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted">{siteConfig.privacyNote}</p>
          <div className="mt-1 flex flex-wrap justify-center gap-3 text-sm">
            <Link href="/privacy-policy" className="font-semibold text-brand-purple hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="font-semibold text-brand-purple hover:underline">
              Terms of Service
            </Link>
            <Link href="/about" className="font-semibold text-brand-purple hover:underline">
              About ToolNova AI
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
