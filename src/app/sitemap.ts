import type { MetadataRoute } from "next";
import { buildSitemapEntries, buildStaticSitemapEntries } from "@/lib/seo/sitemap-data";

export const revalidate = 3600;
export const maxDuration = 30;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    return await buildSitemapEntries();
  } catch {
    return buildStaticSitemapEntries();
  }
}
