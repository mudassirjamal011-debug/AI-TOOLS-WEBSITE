import type { Metadata } from 'next';
import Link from 'next/link';
import { Code2, Cpu, Eye, Server, ShieldCheck, Sparkles } from 'lucide-react';
import { Breadcrumbs } from '@/components/content/Breadcrumbs';
import { SectionHeading } from '@/components/content/SectionHeading';
import { AdPlaceholder } from '@/components/ui/AdPlaceholder';
import { buildMetadata } from '@/lib/seo';
import { categories } from '@/lib/categories';
import { toolCount } from '@/lib/tools';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'About ToolNova AI',
  description:
    'ToolNova AI builds free, fast and private online tools for images, PDFs, text, files and developers. Learn how the tools work, what we do with your data, and what we refuse to fake.',
  path: '/about',
});

const principles = [
  {
    icon: ShieldCheck,
    title: 'Privacy is the default, not a setting',
    body: 'Whenever the browser can do the work, the browser does the work. Images, PDFs, text and files are processed locally, so there is no upload to lose, leak or log.',
  },
  {
    icon: Eye,
    title: 'No fake results, ever',
    body: 'If a feature needs an API key that is not configured, the tool says so. We would rather admit a limitation than show you output that pretends to be something it is not.',
  },
  {
    icon: Cpu,
    title: 'Fast beats clever',
    body: 'Pages are code-split, heavy engines load on demand, and there are no third-party trackers slowing the first paint. A tool should be usable before you finish blinking.',
  },
  {
    icon: Code2,
    title: 'Built on open source',
    body: 'pdf-lib, pdf.js, JSZip, qrcode and the Web Crypto API do the heavy lifting. We stand on well-maintained libraries instead of reimplementing file formats badly.',
  },
  {
    icon: Server,
    title: 'Secrets stay on the server',
    body: 'AI requests are proxied through a server route that reads the key from the environment. No API key is ever shipped to the browser or exposed in page source.',
  },
  {
    icon: Sparkles,
    title: 'Small tools, clearly explained',
    body: 'Every tool has one job, plain instructions, and honest notes about its limits — including the cases where a browser simply cannot do what you want.',
  },
];

export default function AboutPage() {
  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs items={[{ name: 'About', href: '/about' }]} />

      <header className="mb-10 max-w-3xl">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          About {siteConfig.name}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          {siteConfig.name} is a collection of {toolCount} free online tools for the jobs people
          actually need to do: shrink a photo, merge two contracts, tidy a block of text, check a
          checksum. No accounts, no installers, no email-with-a-download-link. Most tools run entirely
          in your browser, which is both faster and a great deal more private than uploading your files
          to a stranger&apos;s server.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {principles.map((principle) => {
          const Icon = principle.icon;
          return (
            <div
              key={principle.title}
              className="rounded-2xl border border-line/10 bg-surface/60 p-5 transition-colors hover:border-brand-purple/30"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft text-brand-purple">
                <Icon aria-hidden className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-base font-bold">{principle.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{principle.body}</p>
            </div>
          );
        })}
      </section>

      <AdPlaceholder slot="between-sections" />

      <section className="mt-12">
        <SectionHeading
          align="left"
          eyebrow="What we build"
          title="Six categories, one job per tool"
          description="Each category page lists every tool in it, with instructions and the questions people ask most."
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group rounded-2xl border border-line/10 bg-surface/60 p-5 transition-all hover:-translate-y-0.5 hover:border-brand-purple/40"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-white">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <h3 className="mt-3 font-display text-base font-bold">{category.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{category.description}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line/10 bg-surface/60 p-6">
          <h2 className="font-display text-xl font-bold">How the tools work</h2>
          <div className="prose-nova mt-3">
            <p>
              Image tools use the HTML5 canvas API: your file is decoded, drawn at the size you asked
              for, and re-encoded with the quality and format you chose. PDF tools use pdf-lib to copy
              and rebuild page objects and pdf.js to rasterise pages when an image or a text layer is
              needed.
            </p>
            <p>
              Text, JSON and CSV tools are pure string and parser work, and file utilities use JSZip and
              the Web Crypto API. The only tools that make a network request are the AI tools, which
              call our own server route, which then calls the configured provider.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-line/10 bg-surface/60 p-6">
          <h2 className="font-display text-xl font-bold">What we do with your data</h2>
          <div className="prose-nova mt-3">
            <p>
              Browser-based tools keep your data on your device — there is nothing for us to store. AI
              requests pass through our server to the provider and are not logged by us beyond the
              anonymous counts we need to keep the service stable.
            </p>
            <p>
              The site is supported by advertising. Ad slots are clearly labelled and are never placed
              over tool controls. We do not sell your files, and we do not run third-party tracking
              scripts on tool pages.
            </p>
            <p>
              Read the{' '}
              <Link href="/privacy-policy" className="font-semibold text-fg underline">
                privacy policy
              </Link>{' '}
              for the full detail, or{' '}
              <Link href="/contact" className="font-semibold text-fg underline">
                contact us
              </Link>{' '}
              if something is unclear.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
