import type { ReactNode } from "react";

import { CmsRenderer } from "@/src/components/cms-renderer";
import { CollectionDetail, CollectionView } from "@/src/components/collection-view";
import { SiteFooter } from "@/src/components/site-footer";
import { SiteHeader } from "@/src/components/site-header";
import type { BrandConfig, CmsPage, CollectionItem, FooterConfig, Menu, PageResources, SiteLocation, SiteSettings } from "@/src/lib/types";

// This default presentation keeps the generic template runnable. The onboarding
// generator replaces this file, and Pi must materially rewrite src/tenant/**.
export function TenantHeader(props: { settings: SiteSettings; branding?: BrandConfig; menus: Menu[]; locale?: string }) {
  return <div data-tenant-chrome="generic"><SiteHeader {...props}/></div>;
}

export function TenantFooter(props: { settings: SiteSettings; branding?: BrandConfig; footer: FooterConfig; locations?: SiteLocation[]; locale?: string }) {
  return <div data-tenant-footer="generic"><SiteFooter {...props}/></div>;
}

export function TenantPage({ children, kind = "content" }: { children: ReactNode; kind?: string }) {
  return <div data-tenant-composition={kind}>{children}</div>;
}

export function TenantCmsRenderer(props: { page: CmsPage; settings: SiteSettings; resources?: PageResources }) {
  return <TenantPage kind={props.page.page_type || "cms"}><CmsRenderer {...props}/></TenantPage>;
}

export function TenantCollectionView(props: { collectionKey: string; items: CollectionItem[]; locale?: string }) {
  return <TenantPage kind={`collection-${props.collectionKey}`}><CollectionView {...props}/></TenantPage>;
}

export function TenantCollectionDetail(props: { collectionKey: string; item: CollectionItem; locale?: string }) {
  return <TenantPage kind={`detail-${props.collectionKey}`}><CollectionDetail {...props}/></TenantPage>;
}

