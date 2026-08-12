import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { LocationSection } from "@/src/components/location-section";
import { MediaLibrary } from "@/src/components/media-library";
import { SearchView } from "@/src/components/search-view";
import { getCollection, getCollectionItem, getMedia, getPage, getPageResources, getSiteBundle, isCollectionKey, resolvePublicRedirect, searchPublicContent } from "@/src/lib/api";
import { uiCopy } from "@/src/lib/i18n";
import { TenantCmsRenderer, TenantCollectionDetail, TenantCollectionView, TenantPage } from "@/src/tenant/presentation";

type Query = Record<string, string | string[] | undefined>;
type RouteProps = { params: Promise<{ segments?: string[] }>; searchParams: Promise<Query> };
export const dynamic = "force-dynamic";

function pageTitle(value: string | undefined, siteName: string) {
  if (!value) return undefined;
  const suffixes = [` · ${siteName}`, ` | ${siteName}`, ` - ${siteName}`];
  return suffixes.reduce((title, suffix) => title.endsWith(suffix) ? title.slice(0, -suffix.length) : title, value);
}

function value(query: Query, key: string) {
  const raw = query[key];
  return Array.isArray(raw) ? raw[0] : raw;
}

export async function generateMetadata({ params, searchParams }: RouteProps): Promise<Metadata> {
  const [{ segments = [] }, query] = await Promise.all([params, searchParams]);
  const locale = value(query, "locale");
  const bundle = await getSiteBundle(locale);
  const siteName = bundle.site.settings.site_name;
  const copy = uiCopy(locale || bundle.site.locale);
  if (!segments.length) return { title: pageTitle(bundle.homepage?.title, siteName), description: bundle.homepage?.seo?.description || bundle.homepage?.excerpt };
  const [root, slug] = segments;
  if (root === "search") return { title: copy.searchTitle, robots: { index: false, follow: true } };
  if (root === "media") return { title: copy.mediaTitle, description: `${copy.mediaDescription} ${siteName}` };
  if (isCollectionKey(root) && slug) { const item = await getCollectionItem(root, slug, locale); return item ? { title: pageTitle(String(item.title || item.name || item.key), siteName), description: String(item.excerpt || item.summary || item.description || "") } : {}; }
  if (isCollectionKey(root)) return { title: root[0].toUpperCase() + root.slice(1) };
  const page = await getPage(root, locale); return page ? { title: pageTitle(page.title, siteName), description: page.seo?.description || page.excerpt, robots: page.seo?.robots } : {};
}

export default async function TenantRoute({ params, searchParams }: RouteProps) {
  const [{ segments = [] }, query] = await Promise.all([params, searchParams]);
  const locale = value(query, "locale");
  const bundle = await getSiteBundle(locale);
  if (!segments.length) {
    if (!bundle.homepage) notFound();
    const resources = await getPageResources(bundle.homepage, locale);
    return <TenantCmsRenderer page={bundle.homepage} settings={{ ...bundle.site.settings, default_locale: locale || bundle.site.locale || bundle.site.settings.default_locale }} resources={resources}/>;
  }
  const [root, slug] = segments;
  if (root === "search") {
    const q = value(query, "q")?.trim() || "";
    const data = q.length >= 2 ? await searchPublicContent(q, locale).catch(() => null) : null;
    return <TenantPage kind="search"><SearchView data={data} query={q} locale={locale || bundle.site.locale}/></TenantPage>;
  }
  if (root === "media") return <TenantPage kind="media"><MediaLibrary media={await getMedia()} locale={locale || bundle.site.locale}/></TenantPage>;
  if (isCollectionKey(root)) {
    if (slug) { const item = await getCollectionItem(root, slug, locale); if (!item) notFound(); return <TenantCollectionDetail collectionKey={root} item={item} locale={locale || bundle.site.locale}/>; }
    const collection = await getCollection(root, "", locale); return <TenantCollectionView collectionKey={root} items={collection.results} locale={locale || bundle.site.locale}/>;
  }
  const page = await getPage(root, locale);
  if (!page) {
    const match = await resolvePublicRedirect(`/${segments.join("/")}`);
    if (match) redirect(match.target_path);
    notFound();
  }
  const resources = await getPageResources(page, locale);
  const showLocations = page.page_type === "contact" || root === "contact";
  return <><TenantCmsRenderer page={page} settings={{ ...bundle.site.settings, default_locale: locale || bundle.site.locale || bundle.site.settings.default_locale }} resources={resources}/>{showLocations && <TenantPage kind="locations"><LocationSection locations={bundle.site.locations || []} locale={locale || bundle.site.locale}/></TenantPage>}</>;
}
