import type { MetadataRoute } from 'next';
import { projects } from './portfolio-data';
import { siteUrl } from './site-metadata';

export default function sitemap(): MetadataRoute.Sitemap {
  const projectRoutes = projects.map((project) => ({
    url: `${siteUrl.origin}/work/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    { url: siteUrl.origin, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${siteUrl.origin}/work`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl.origin}/archive`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${siteUrl.origin}/about`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.8 },
    { url: `${siteUrl.origin}/capabilities`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.8 },
    { url: `${siteUrl.origin}/experience`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.7 },
    { url: `${siteUrl.origin}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.7 },
    { url: `${siteUrl.origin}/recommendations`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.7 },
    ...projectRoutes,
  ];
}
