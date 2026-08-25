import type { Metadata } from 'next';

export const SITE_CONFIG = {
  name: 'Omnikon',
  legalName: 'Omnikon Organization',
  title: 'Omnikon — Premier Developer Ecosystem & Cyberpunk Tech Hub',
  description:
    'Omnikon is an elite developer organization, open-source project ecosystem, hackathon accelerator, and technical knowledge hub for modern builders.',
  url: 'https://www.omnikonhub.com',
  ogImage: 'https://www.omnikonhub.com/assets/og-image.png',
  githubUrl: 'https://github.com/Omnikon-Org',
  discordUrl: 'https://discord.gg/omnikon',
  twitterHandle: '@OmnikonHub',
  adSensePublisherId: 'ca-pub-8663425706426895',
};

export function constructMetadata({
  title = SITE_CONFIG.title,
  description = SITE_CONFIG.description,
  image = SITE_CONFIG.ogImage,
  canonicalUrl,
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
} = {}): Metadata {
  const fullTitle = title.includes('Omnikon') ? title : `${title} | Omnikon`;

  return {
    title: fullTitle,
    description,
    keywords: [
      'Omnikon',
      'Developer Hub',
      'Open Source Ecosystem',
      'Next.js',
      'TypeScript',
      'Hackathons',
      'Engineering Tutorials',
      'Developer Community',
    ],
    authors: [{ name: 'Omnikon Core Team', url: SITE_CONFIG.url }],
    creator: SITE_CONFIG.legalName,
    publisher: SITE_CONFIG.legalName,
    metadataBase: new URL(SITE_CONFIG.url),
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl || SITE_CONFIG.url,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: SITE_CONFIG.twitterHandle,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
    other: {
      'google-adsense-account': SITE_CONFIG.adSensePublisherId,
    },
  };
}

export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.legalName,
    alternateName: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/assets/logo.png`,
    sameAs: [SITE_CONFIG.githubUrl, SITE_CONFIG.discordUrl],
  };
}

export function generateBreadcrumbJsonLd(items: { name: string; item: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((crumb, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: crumb.name,
      item: crumb.item.startsWith('http') ? crumb.item : `${SITE_CONFIG.url}${crumb.item}`,
    })),
  };
}
