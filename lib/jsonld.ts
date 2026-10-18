import { type Service, site } from './content'
import type { ArticleMeta } from './journal'
import { SITE_URL } from './seo'

const ORG_ID = `${SITE_URL}/#org`

export const organizationLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'HomeAndConstructionBusiness',
  '@id': ORG_ID,
  name: site.name,
  legalName: site.legalName,
  url: SITE_URL,
  logo: `${SITE_URL}/images/fitin-logo.png`,
  image: `${SITE_URL}/opengraph-image`,
  description: site.description,
  email: site.email,
  telephone: site.phone,
  areaServed: site.cities.map((name) => ({ '@type': 'City', name })),
  address: { '@type': 'PostalAddress', addressCountry: 'PK', ...(site.address && { streetAddress: site.address }) },
})

export const breadcrumbLd = (items: [string, string][]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE_URL}${path}` })),
})

export const articleLd = (m: ArticleMeta) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: m.title,
  description: m.description,
  datePublished: m.date,
  dateModified: m.updated ?? m.date,
  image: [`${SITE_URL}${m.cover}`],
  author: { '@type': 'Organization', name: 'Fitin Editorial', url: SITE_URL },
  publisher: { '@id': ORG_ID },
  mainEntityOfPage: `${SITE_URL}/journal/${m.slug}`,
})

export const serviceLd = (s: Service) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: s.name,
  serviceType: s.name,
  description: s.summary,
  provider: { '@id': ORG_ID },
  areaServed: site.cities.map((name) => ({ '@type': 'City', name })),
  url: `${SITE_URL}/services/${s.slug}`,
})
