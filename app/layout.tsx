import type { Metadata, Viewport } from 'next';
// Self-hosted variable fonts (no third-party request, no layout shift).
import '@fontsource-variable/inter';
import '@fontsource-variable/plus-jakarta-sans';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { ToastProvider } from '@/components/ui/Toast';
import { JsonLd } from '@/components/seo/JsonLd';
import { themeBootstrapScript } from '@/components/layout/ThemeToggle';
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Powerful AI & Online Tools, Fast and Free`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  keywords: [
    'online tools',
    'free AI tools',
    'image compressor',
    'pdf tools',
    'text tools',
    'developer tools',
    'file converter',
  ],
  alternates: { canonical: siteConfig.url },
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Powerful AI & Online Tools, Fast and Free`,
    description: siteConfig.description,
    url: siteConfig.url,
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} — Powerful AI & Online Tools, Fast and Free`,
    description: siteConfig.description,
    images: ['/opengraph-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#08080c' },
    { media: '(prefers-color-scheme: light)', color: '#fafafc' },
  ],
  colorScheme: 'light dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Applies the stored theme before first paint — no flash of wrong theme. */}
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body className="min-h-screen bg-bg text-fg antialiased">
        <ToastProvider>
          <a id="top" />
          <Header />
          <main id="main" className="pb-24 md:pb-0">
            {children}
          </main>
          <Footer />
          <MobileBottomNav />
        </ToastProvider>
        <JsonLd data={[websiteJsonLd(), organizationJsonLd()]} />
      </body>
    </html>
  );
}
