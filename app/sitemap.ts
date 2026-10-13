import type { MetadataRoute } from "next";
import { serviceAreas, services } from "@/lib/site-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://triplemelectric.ca";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: `${baseUrl}/locations`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8
    }
  ];

  const serviceRoutes: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8
  }));

  const locationRoutes: MetadataRoute.Sitemap = serviceAreas.map((area) => ({
      url: `${baseUrl}/locations/${area.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8
  }));

  return [...staticRoutes, ...serviceRoutes, ...locationRoutes];
}
