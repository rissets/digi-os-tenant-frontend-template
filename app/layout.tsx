import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import type { CSSProperties, ReactNode } from "react";
import { getActiveChannel, getSiteBundle } from "@/src/lib/api";
import { ChannelWidget } from "@/src/components/channel-widget";
import { tenantProfile } from "@/src/generated/tenant-profile";
import { AnalyticsTracker } from "@/src/components/analytics-tracker";
import { MotionPrimitiveProvider, ScrollProgress } from "@/src/components/motion-primitives";
import { WatermelonProvider } from "@/src/components/watermelon-provider";
import { uiCopy } from "@/src/lib/i18n";
import { TenantFooter, TenantHeader } from "@/src/tenant/presentation";
import "./globals.css";
import "./tenant.css";

export const dynamic = "force-dynamic";

const onboardingStandalone = process.env.ONBOARDING_STANDALONE === "true";

export async function generateMetadata(): Promise<Metadata> {
  if (onboardingStandalone) {
    return {
      metadataBase: new URL(process.env.TENANT_SITE_URL || "http://localhost:3000"),
      title: "Tenant onboarding studio",
      description: "Create a complete tenant frontend manifest and AI generation brief.",
      robots: { index: false, follow: false },
    };
  }
  const { site } = await getSiteBundle();
  const image = site.branding.assets?.default_social_image?.url;
  return {
    metadataBase: new URL(process.env.TENANT_SITE_URL || "http://localhost:3000"),
    title: { default: site.settings.site_name, template: `%s · ${site.settings.site_name}` },
    description: site.settings.description,
    openGraph: { title: site.settings.site_name, description: site.settings.description, images: image ? [image] : [] },
    icons: site.branding.assets?.favicon?.url ? { icon: site.branding.assets.favicon.url } : { icon: "/mark.svg" },
  };
}

export async function generateViewport(): Promise<Viewport> {
  if (onboardingStandalone) {
    return { themeColor: "#111827", colorScheme: "light dark" };
  }
  const { site } = await getSiteBundle();
  return { themeColor: site.branding.primary_color, colorScheme: "light" };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  if (onboardingStandalone) {
    return (
      <html lang="en">
        <body className="m-0 min-h-screen bg-slate-950 font-sans text-slate-100 antialiased">
          <MotionPrimitiveProvider>
            <WatermelonProvider>{children}</WatermelonProvider>
          </MotionPrimitiveProvider>
        </body>
      </html>
    );
  }
  const cookieStore = await cookies();
  const requestedLocale = cookieStore.get("tenant_locale")?.value;
  const [{ site }, channel] = await Promise.all([getSiteBundle(requestedLocale), getActiveChannel().catch(() => null)]);
  const brand = site.branding;
  const locale = requestedLocale || site.locale || site.settings.default_locale;
  const copy = uiCopy(locale);
  const paletteTints: Record<string, string> = { "cobalt-cream": "#3157d5", "forest-coral": "#0f766e", "plum-sand": "#7c3aed", "ink-lime": "#475569", "terracotta-sky": "#c2410c", "violet-mint": "#7c3aed", "navy-apricot": "#1d4ed8", "charcoal-lilac": "#6d28d9" };
  const designTint = paletteTints[String(tenantProfile.designSystem.paletteFamily)] || brand.primary_color;
  const variables = {
    "--brand-primary": brand.primary_color,
    "--brand-secondary": brand.secondary_color,
    "--brand-accent": brand.accent_color,
    "--design-tint": designTint,
    "--surface": brand.surface_color,
    "--ink": brand.text_color,
    "--muted": brand.muted_color,
    "--footer-bg": brand.footer_background || brand.secondary_color,
    "--footer-ink": brand.footer_text_color || "#ffffff",
    "--content-width": `${brand.content_width || 1200}px`,
    "--radius": `${brand.border_radius || 12}px`,
    "--font-display": tenantProfile.displayFont,
    "--font-body": tenantProfile.bodyFont,
  } as CSSProperties;
  const schema = { "@context": "https://schema.org", "@type": "Organization", name: site.settings.legal_name || site.settings.site_name, url: process.env.TENANT_SITE_URL, email: site.settings.contact_email, telephone: site.settings.contact_phone, address: site.settings.address };
  return <html lang={locale} data-archetype={tenantProfile.archetype} data-palette={String(tenantProfile.designSystem.paletteFamily)} data-corners={tenantProfile.cornerStyle} data-cards={tenantProfile.cardTreatment} data-hero={tenantProfile.experience.hero} data-navigation={tenantProfile.experience.navigation} data-sections={tenantProfile.experience.sectionRhythm} data-gallery={tenantProfile.experience.gallery} data-footer={tenantProfile.experience.footer} data-motion={tenantProfile.motionLevel} data-motif={tenantProfile.motif}><body className="m-0 overflow-x-hidden bg-[var(--surface)] font-[family-name:var(--font-body)] text-[var(--ink)] antialiased" style={variables}>
    <MotionPrimitiveProvider><WatermelonProvider>
    <a className="fixed left-2 top-2 z-[200] -translate-y-[150%] bg-slate-950 px-4 py-2 text-white focus:translate-y-0" href="#main-content">{copy.skip}</a>
    <TenantHeader settings={site.settings} branding={site.branding} menus={site.menus} locale={locale}/><main id="main-content">{children}</main><TenantFooter settings={site.settings} branding={site.branding} footer={site.footer} locations={site.locations} locale={locale}/><ChannelWidget channel={channel} locale={locale}/><AnalyticsTracker/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}/>
    <ScrollProgress/>
    </WatermelonProvider></MotionPrimitiveProvider>
  </body></html>;
}
