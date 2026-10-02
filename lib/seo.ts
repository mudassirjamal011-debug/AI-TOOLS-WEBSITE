import type { Metadata } from 'next';
import { absoluteUrl, siteConfig } from './site';
import type { ToolDef } from './tools';
import type { BlogPost } from './blog';

interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  /** Overrides the title template for the home page. */
  absoluteTitle?: boolean;
  noIndex?: boolean;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  keywords?: string[];
}

export function buildMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  noIndex = false,
  image,
  type = 'website',
  publishedTime,
  keywords,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const ogImage = image ? absoluteUrl(image) : absoluteUrl('/opengraph-image.png');

  return {
    title: absoluteTitle ? title : { absolute: title },
    description,
    keywords,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
        },
    openGraph: {
      type: type === 'article' ? 'article' : 'website',
      url,
      title,
      description,
      siteName: siteConfig.name,
      locale: 'en_US',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: siteConfig.twitter,
      creator: siteConfig.twitter,
      images: [ogImage],
    },
  };
}

/* ------------------------------------------------------------------------- */
/*  Structured data                                                          */
/* ------------------------------------------------------------------------- */

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/tools?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    email: siteConfig.email,
    foundingDate: siteConfig.founded,
    logo: absoluteUrl('/logo.png'),
    sameAs: [siteConfig.social.github, siteConfig.social.twitter],
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

export function faqJsonLd(faq: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: { '@type': 'Answer', text: entry.answer },
    })),
  };
}

export function toolJsonLd(tool: ToolDef, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${tool.name} — ${siteConfig.name}`,
    url: absoluteUrl(path),
    description: tool.description,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any (runs in a modern web browser)',
    browserRequirements: 'Requires JavaScript. Works in Chrome, Edge, Firefox and Safari.',
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    featureList: tool.howTo,
    provider: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    ...(tool.outputFormats?.length
      ? { fileFormat: tool.outputFormats.join(', ') }
      : {}),
  };
}

export function howToJsonLd(tool: ToolDef) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to use the ${tool.name}`,
    description: `Step by step instructions for using the free ${tool.name} on ${siteConfig.name}.`,
    step: tool.howTo.map((text, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: text,
      text,
    })),
  };
}

export function articleJsonLd(post: BlogPost, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    url: absoluteUrl(path),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: { '@type': 'Organization', name: post.author, url: siteConfig.url },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
      logo: { '@type': 'ImageObject', url: absoluteUrl('/logo.png') },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(path) },
    keywords: post.tags.join(', '),
  };
}
