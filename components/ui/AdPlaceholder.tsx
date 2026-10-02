import { cn } from '@/lib/utils';
import { siteConfig } from '@/lib/site';

type AdSlot =
  | 'header-banner'
  | 'between-sections'
  | 'below-result'
  | 'sidebar'
  | 'before-related'
  | 'blog-inline';

const labels: Record<AdSlot, string> = {
  'header-banner': 'Leaderboard · 728×90',
  'between-sections': 'In-content · 336×280',
  'below-result': 'In-content · 300×250',
  sidebar: 'Sidebar · 300×600',
  'before-related': 'In-content · 728×90',
  'blog-inline': 'In-article · 336×280',
};

const heights: Record<AdSlot, string> = {
  'header-banner': 'min-h-[90px]',
  'between-sections': 'min-h-[280px]',
  'below-result': 'min-h-[250px]',
  sidebar: 'min-h-[600px]',
  'before-related': 'min-h-[90px]',
  'blog-inline': 'min-h-[280px]',
};

/**
 * Ad slot placeholder.
 *
 * This component deliberately renders an empty, labelled box rather than a fake
 * advert. To monetise, drop your Google AdSense snippet (or any other network)
 * inside <AdManager /> below — the layout already reserves the correct space,
 * so ads will not shift content or cover any tool control.
 */
export function AdPlaceholder({
  slot,
  className,
  label = 'Advertisement',
}: {
  slot: AdSlot;
  className?: string;
  label?: string;
}) {
  return (
    <aside
      aria-label={`${label} slot`}
      data-ad-slot={slot}
      className={cn(
        'not-prose my-6 flex w-full flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-line/15 bg-surface/40 px-4 py-3 text-center',
        heights[slot],
        className
      )}
    >
      <AdManager slot={slot} />
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted/80">{label}</span>
      <span className="text-[10px] text-muted/60">{labels[slot]}</span>
    </aside>
  );
}

/**
 * Insertion point for real ad code.
 *
 * Nothing is rendered until NEXT_PUBLIC_ADS_ENABLED=true and a client id is
 * configured, which keeps the page clean rather than showing a fake banner.
 * Add your network script in app/layout.tsx and render <ins className="adsbygoogle" />
 * here when enabled.
 */
export function AdManager({ slot }: { slot: AdSlot }) {
  if (!siteConfig.ads.enabled || !siteConfig.ads.client) return null;

  return (
    <div
      data-ad-client={siteConfig.ads.client}
      data-ad-slot-id={slot}
      className="w-full"
      suppressHydrationWarning
    >
      {/* AdSense / network units are injected here at runtime. */}
    </div>
  );
}
