/**
 * Central site configuration.
 *
 * Only values prefixed with NEXT_PUBLIC_ are ever exposed to the browser.
 * Everything else in this file is server-side only.
 */

function normaliseUrl(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  return value.replace(/\/+$/, '');
}

export const siteConfig = {
  name: 'ToolNova AI',
  shortName: 'ToolNova',
  tagline: 'Powerful AI & Online Tools — Fast, Simple & Free',
  description:
    'ToolNova AI gives you fast, free online tools for images, PDFs, text, files and developers. Compress, convert, resize, merge and generate — most tools run privately in your browser.',
  url: normaliseUrl(process.env.NEXT_PUBLIC_SITE_URL, 'https://toolnovaai.vercel.app'),
  locale: 'en_US',
  themeColor: '#08080c',
  twitter: '@toolnovaai',
  email: 'hello@toolnovaai.com',
  founded: '2025',
  social: {
    twitter: 'https://twitter.com/toolnovaai',
    github: 'https://github.com/mudassirjamal011-debug/AI-TOOLS-WEBSITE',
  },
  privacyNote:
    'Your files are processed locally whenever supported and are not uploaded unnecessarily.',
  ads: {
    // Set NEXT_PUBLIC_ADS_ENABLED=true to reserve ad slots in the layout.
    enabled: process.env.NEXT_PUBLIC_ADS_ENABLED === 'true',
    // Google AdSense client id, e.g. ca-pub-XXXXXXXXXXXXXXXX.
    client: process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? '',
  },
} as const;

export type SiteConfig = typeof siteConfig;

/** Absolute URL builder — keeps canonical links, sitemaps and OG tags consistent. */
export function absoluteUrl(path = '/'): string {
  return `${siteConfig.url}${path.startsWith('/') ? path : `/${path}`}`;
}
