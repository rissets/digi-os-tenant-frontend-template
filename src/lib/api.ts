import "server-only";
import type { ActiveChannel, CmsPage, CollectionItem, CollectionResponse, ContactFormSchema, MediaAsset, PageResources, RedirectResponse, SearchResponse, SiteBundle, SiteConfig, SiteLocation, SitemapResponse } from "./types";

const DEFAULT_TIMEOUT = 8_000;

function apiBase() {
  const value = process.env.TENANT_API_URL?.replace(/\/$/, "");
  if (!value) throw new Error("TENANT_API_URL is required");
  return value;
}

export async function tenantFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.TENANT_API_TIMEOUT_MS || DEFAULT_TIMEOUT));
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  try {
    const response = await fetch(`${apiBase()}${path.startsWith("/") ? path : `/${path}`}`, {
      ...options,
      headers,
      signal: controller.signal,
      next: options.method && options.method !== "GET" ? undefined : {
        revalidate: Number(process.env.TENANT_REVALIDATE_SECONDS || 30),
        tags: ["tenant-content"],
      },
    });
    if (!response.ok) throw new Error(`Tenant API ${path} returned ${response.status}`);
    return response.json() as Promise<T>;
  } finally {
    clearTimeout(timeout);
  }
}

function withLocale(path: string, locale?: string) {
  if (!locale) return path;
  return `${path}${path.includes("?") ? "&" : "?"}locale=${encodeURIComponent(locale)}`;
}

export const getSiteBundle = (locale?: string) => tenantFetch<SiteBundle>(withLocale("/site-bundle/", locale));
export const getSiteConfig = (locale?: string) => tenantFetch<SiteConfig>(withLocale("/site-config/", locale));
export const getActiveChannel = () => tenantFetch<ActiveChannel>("/channels/active/");
export const getPublicForm = (key: string, locale?: string) => tenantFetch<ContactFormSchema>(withLocale(`/crm/forms/${encodeURIComponent(key)}/`, locale));
export const getContactForm = (locale?: string) => getPublicForm("contact", locale);
export const getLocations = (locale?: string) => tenantFetch<{ locale: string; results: SiteLocation[] }>(withLocale("/locations/", locale));
export const getNavigation = (locale?: string) => tenantFetch<{ locale: string; menus: SiteConfig["menus"] }>(withLocale("/navigation/", locale));
export const getFooter = (locale?: string) => tenantFetch<{ locale: string; footer: SiteConfig["footer"] }>(withLocale("/footer/", locale));
export const getSitemap = () => tenantFetch<SitemapResponse>("/sitemap/");
export const getMedia = (category?: string) => tenantFetch<MediaAsset[]>(category ? `/media/?category=${encodeURIComponent(category)}` : "/media/");
export const searchPublicContent = (query: string, locale?: string) => tenantFetch<SearchResponse>(withLocale(`/search/?q=${encodeURIComponent(query)}`, locale));
export async function resolvePublicRedirect(path: string): Promise<RedirectResponse | null> {
  try { return await tenantFetch<RedirectResponse>(`/redirects/resolve/?path=${encodeURIComponent(path)}`); }
  catch (error) { if (String(error).includes("returned 404")) return null; throw error; }
}

export async function getPage(slug: string, locale?: string): Promise<CmsPage | null> {
  try { return await tenantFetch<CmsPage>(withLocale(`/pages/${encodeURIComponent(slug)}/`, locale)); }
  catch (error) { if (String(error).includes("returned 404")) return null; throw error; }
}

export const COLLECTIONS = {
  blog: "blog",
  portfolio: "portfolio",
  products: "products",
  projects: "projects",
  careers: "careers",
  faq: "faq",
  galleries: "galleries",
  legal: "legal",
} as const;
export type CollectionKey = keyof typeof COLLECTIONS;

export function isCollectionKey(value: string): value is CollectionKey {
  return Object.hasOwn(COLLECTIONS, value);
}

export async function getCollection(key: CollectionKey, query = "", locale?: string): Promise<CollectionResponse<CollectionItem>> {
  return tenantFetch<CollectionResponse<CollectionItem>>(withLocale(`/${COLLECTIONS[key]}/${query}`, locale));
}

export async function getCollectionItem(key: CollectionKey, slug: string, locale?: string): Promise<CollectionItem | null> {
  try { return await tenantFetch<CollectionItem>(withLocale(`/${COLLECTIONS[key]}/${encodeURIComponent(slug)}/`, locale)); }
  catch (error) { if (String(error).includes("returned 404")) return null; throw error; }
}

export async function submitPublicForm(key: string, payload: Record<string, unknown>) {
  return tenantFetch<{ message?: string; id?: string }>(`/crm/forms/${encodeURIComponent(key)}/submissions/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() },
    body: JSON.stringify(payload),
  });
}

export const submitContactForm = (payload: Record<string, unknown>) => submitPublicForm("contact", payload);

export async function sendAnalyticsEvent(payload: Record<string, unknown>) {
  return tenantFetch<{ accepted: boolean; reason?: string }>("/analytics/events/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function getPageResources(page: CmsPage, locale?: string): Promise<PageResources> {
  const types = new Set(page.blocks.map((block) => block.type));
  const requests: Array<Promise<void>> = [];
  const result: PageResources = {};
  const addCollection = (type: string, key: CollectionKey, target: keyof PageResources) => {
    if (types.has(type)) requests.push(getCollection(key, "", locale).then((data) => { (result as Record<string, unknown>)[target] = data.results; }));
  };
  addCollection("blog_list", "blog", "blog");
  addCollection("faq_list", "faq", "faq");
  addCollection("product_list", "products", "products");
  addCollection("project_list", "projects", "projects");
  addCollection("portfolio_list", "portfolio", "portfolio");
  addCollection("career_list", "careers", "careers");
  addCollection("legal_list", "legal", "legal");
  addCollection("gallery", "galleries", "galleries");
  if (types.has("contact_form")) requests.push(getContactForm(locale).then((schema) => { result.form = schema; }).catch(() => { result.form = null; }));
  await Promise.all(requests);
  return result;
}
