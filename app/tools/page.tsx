import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/content/Breadcrumbs';
import { ToolsExplorer } from '@/components/tools/ToolsExplorer';
import { AdPlaceholder } from '@/components/ui/AdPlaceholder';
import { buildMetadata } from '@/lib/seo';
import { toolCount } from '@/lib/tools';

export const metadata: Metadata = buildMetadata({
  title: `All ${toolCount} Free Online Tools`,
  description: `Browse all ${toolCount} free online tools at ToolNova AI: image compressors, PDF mergers, text formatters, AI writers, file utilities and developer helpers — no sign-up required.`,
  path: '/tools',
});

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs items={[{ name: 'All tools', href: '/tools' }]} />

      <header className="mb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          All {toolCount} tools
        </h1>
        <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-muted">
          Search or filter by category. Every tool runs in your browser unless it is clearly marked as
          using a secure server route — and none of them needs an account.
        </p>
      </header>

      <ToolsExplorer initialQuery={q ?? ''} />

      <AdPlaceholder slot="between-sections" className="mt-12" />
    </div>
  );
}
