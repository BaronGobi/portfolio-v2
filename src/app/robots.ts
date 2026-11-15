import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/site";

/** /robots.txt: everything may be crawled; point crawlers at the sitemap. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
