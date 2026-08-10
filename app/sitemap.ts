import type { MetadataRoute } from "next";
import { getSitemap } from "@/src/lib/api";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = process.env.TENANT_SITE_URL || "http://localhost:3000";
  const payload = await getSitemap();
  return payload.routes.filter((route) => route.indexable).map((route) => ({ url: new URL(route.path, origin).toString(), lastModified: route.updated_at || route.published_at || payload.generated_at, changeFrequency: route.type === "home" ? "daily" : "weekly", priority: route.path === "/" ? 1 : route.type.endsWith("_detail") ? .7 : .8 }));
}
