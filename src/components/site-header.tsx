"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronDown, Languages, Menu as MenuIcon, Search, X } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { tenantProfile } from "@/src/generated/tenant-profile";
import { uiCopy } from "@/src/lib/i18n";
import type { BrandConfig, Menu, MenuItem, SiteSettings } from "@/src/lib/types";
import { cn } from "@/src/lib/utils";
import { Magnetic, TextRoll } from "./motion-primitives";

export function BrandMark({ settings, branding, inverted = false }: { settings: SiteSettings; branding?: BrandConfig; inverted?: boolean }) {
  const initials = settings.site_name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("");
  const logo = branding?.assets?.logo?.category === "logo" ? branding.assets.logo : null;
  return <Link href="/" className={cn("inline-flex min-w-0 items-center gap-3", inverted && "text-white")} aria-label={`${settings.site_name} home`}>{logo ? <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-white p-1"><img className="size-full object-contain" src={logo.url} alt={logo.alt_text || settings.site_name}/></span> : <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--brand-secondary)] font-[family-name:var(--font-display)] text-sm font-black tracking-[-.05em] text-white">{initials}</span>}<span className="grid min-w-0 leading-tight"><strong className="max-w-48 truncate font-[family-name:var(--font-display)] text-sm font-black">{settings.site_name}</strong><small className={cn("mt-1 max-w-48 truncate text-[.58rem] font-bold uppercase tracking-[.12em] text-[var(--muted)]", inverted && "text-white/60")}>{settings.organization_type || settings.tagline}</small></span></Link>;
}

function MenuGroup({ item, descendants }: { item: MenuItem; descendants: MenuItem[] }) {
  if (!descendants.length) return <Link className="relative py-2 text-xs font-bold text-[var(--ink)]/75 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-right after:scale-x-0 after:bg-[var(--brand-accent)] after:transition hover:after:origin-left hover:after:scale-x-100" href={item.url} target={item.target}><TextRoll>{item.label}</TextRoll></Link>;
  return <div className="group relative"><button className="flex items-center gap-1 border-0 bg-transparent py-2 text-xs font-bold text-[var(--ink)]/75" type="button">{item.label}<ChevronDown size={14}/></button><div className="pointer-events-none absolute left-1/2 top-[calc(100%+1rem)] grid w-[min(620px,74vw)] -translate-x-1/2 -translate-y-2 grid-cols-2 gap-1 rounded-3xl border border-black/10 bg-[var(--surface)] p-2 opacity-0 shadow-2xl transition group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100"><Link className="row-span-3 grid content-end rounded-2xl bg-[var(--brand-secondary)] p-5 text-white" href={item.url}><strong>{item.label}</strong><span className="mt-1 text-xs text-white/65">{item.description}</span></Link>{descendants.map((child) => <Link className="grid rounded-2xl p-4 hover:bg-[var(--brand-primary)]/8" href={child.url} key={child.id}><strong className="text-sm">{child.label}</strong><span className="mt-1 text-xs text-[var(--muted)]">{child.description}</span></Link>)}</div></div>;
}

export function SiteHeader({ settings, branding, menus, locale: localeProp }: { settings: SiteSettings; branding?: BrandConfig; menus: Menu[]; locale?: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const main = menus.find((menu) => menu.key === "main") || menus[0];
  const items = (main?.items || []).filter((item) => item.parent_id == null && item.show_on_desktop !== false);
  const children = (parent: MenuItem) => (main?.items || []).filter((item) => item.parent_id === parent.id);
  const locale = searchParams.get("locale") || localeProp || settings.default_locale;
  const copy = uiCopy(locale);
  const nextLocale = settings.available_locales.find((item) => item !== locale) || settings.default_locale;
  const query = new URLSearchParams(searchParams.toString()); query.set("locale", nextLocale);
  const localeUrl = `${pathname}?${query.toString()}`;
  const navigation = tenantProfile.experience.navigation;
  const navPattern = String(tenantProfile.designSystem.navPattern || navigation);
  const headerClass = cn(
    "sticky top-0 z-[60] border-b border-black/10 backdrop-blur-2xl",
    navigation === "floating" ? "mx-auto mt-3 max-w-[calc(var(--content-width)+2rem)] rounded-2xl border bg-[var(--surface)]/88 shadow-xl" : "bg-[var(--surface)]/88",
    navigation === "editorial" && "border-b-4 border-[var(--ink)]",
    navPattern === "side-dock" && "lg:ml-6 lg:mr-6 lg:rounded-r-3xl",
    navPattern === "marquee-nav" && "border-b-0 bg-[var(--brand-secondary)] text-white",
  );
  const innerClass = cn("mx-auto flex min-h-[78px] max-w-[var(--content-width)] items-center justify-between gap-5 px-5", navigation === "minimal" && "min-h-16", navigation === "editorial" && "max-w-none px-[max(1.25rem,5vw)]");
  return <header className={headerClass}><div className={innerClass}>
    <BrandMark settings={settings} branding={branding}/>
    <nav className={cn("hidden items-center gap-5 lg:flex", navigation === "minimal" && "gap-8", navigation === "editorial" && "order-first", navPattern === "marquee-nav" && "gap-7 text-white")} aria-label={copy.primaryNavigation}>{items.slice(0, 7).map((item) => <MenuGroup key={item.id} item={item} descendants={children(item)}/>)}</nav>
    <div className="flex items-center gap-2"><Link className="grid size-10 place-items-center rounded-xl border border-black/10" href="/search" aria-label={copy.search}><Search size={18}/></Link>{settings.available_locales.length > 1 && <Link className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-black/10 px-3 text-xs font-black" href={localeUrl} aria-label={`${copy.switchLanguage} ${nextLocale}`}><Languages size={16}/>{locale.toUpperCase()}</Link>}<Magnetic className="hidden sm:inline-flex"><Link className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 text-xs font-black text-white" href={settings.contact_cta?.url || "/contact"}>{settings.contact_cta?.label || copy.contact}<ArrowUpRight size={15}/></Link></Magnetic><button className="grid size-10 place-items-center rounded-xl border border-black/10 lg:hidden" type="button" aria-expanded={open} aria-label={open ? copy.closeMenu : copy.openMenu} onClick={() => setOpen(!open)}>{open ? <X/> : <MenuIcon/>}</button></div>
  </div>{open && <nav className="grid max-h-[calc(100vh-78px)] overflow-auto border-t border-black/10 bg-[var(--surface)] px-5 pb-8 pt-4 lg:hidden" aria-label={copy.mobileNavigation}>{items.flatMap((item) => [item, ...children(item)]).map((item, index) => <Link className={cn("flex items-baseline gap-4 border-b border-black/10 py-3 font-[family-name:var(--font-display)] text-[clamp(1.35rem,7vw,2.3rem)] font-black", item.parent_id && "pl-10 text-lg")} key={item.id} href={item.url} onClick={() => setOpen(false)}><span className="font-mono text-[.62rem] text-[var(--brand-primary)]">{String(index + 1).padStart(2, "0")}</span>{item.label}</Link>)}</nav>}</header>;
}
