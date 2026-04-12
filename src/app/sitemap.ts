import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ai-sanctuary.online'
  
  const routes = [
    '',
    '/playground',
    '/kla',
    '/buy',
    '/tiers',
    '/community',
    '/vault',
    '/sdr',
    '/kla/services',
    '/support',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'always' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  return routes
}
