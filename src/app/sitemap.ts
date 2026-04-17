import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ai-sanctuary.online'
  
  const routes = [
    '',
    '/playground',
    '/kla',
    '/buy',
    '/tiers',
    '/about',
    '/agents',
    '/agents/join',
    '/blog',
    '/careers',
    '/community',
    '/contact',
    '/docs',
    '/status',
    '/transparency',
    '/privacy',
    '/terms',
    '/cookies',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : route === '/playground' || route === '/buy' ? 0.9 : 0.7,
  }))

  return routes
}
