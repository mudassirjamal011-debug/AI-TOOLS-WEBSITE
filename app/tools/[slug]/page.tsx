import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { ToolRunner } from '@/components/tools/ToolRunner';
import { buildMetadata } from '@/lib/seo';
import { tools } from '@/lib/tools';

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = tools.find((entry) => entry.slug === slug);
  if (!tool) {
    return buildMetadata({
      title: 'Tool not found',
      description: 'The tool you were looking for does not exist on ToolNova AI.',
      path: `/tools/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${tool.name} — Free Online Tool`,
    description: tool.description,
    path: `/tools/${tool.slug}`,
    keywords: tool.keywords,
  });
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = tools.find((entry) => entry.slug === slug);
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <ToolRunner slug={tool.slug} />
    </ToolLayout>
  );
}
