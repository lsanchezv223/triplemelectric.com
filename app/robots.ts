import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/"
      }
    ],
    sitemap: "https://triplemelectric.ca/sitemap.xml",
    host: "https://triplemelectric.ca"
  };
}
