import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/constants/seo';
import { TEMPLATE_REGISTRY } from '@/features/experience-engine/core/template-registry';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/studio`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  const experienceRoutes: MetadataRoute.Sitemap = TEMPLATE_REGISTRY.map((template) => ({
    url: `${SITE_URL}/experience/${template.id}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...experienceRoutes];
}
