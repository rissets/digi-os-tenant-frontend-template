import { uiCopy } from "@/src/lib/i18n";
import type { MediaAsset } from "@/src/lib/types";
import { GalleryShowcase } from "./gallery-showcase";

export function MediaLibrary({ media, locale }: { media: MediaAsset[]; locale?: string }) {
  const copy = uiCopy(locale); const categories = [...new Set(media.map((item) => item.category).filter(Boolean))];
  return <section className="mx-auto max-w-[var(--content-width)] px-5 py-[clamp(4.5rem,9vw,8.5rem)]"><div className="mb-14 grid items-end gap-5 md:grid-cols-[1fr_.65fr]"><p className="text-[.68rem] font-black uppercase tracking-[.18em] text-[var(--brand-primary)] md:col-span-2">{copy.mediaLibrary} / {String(media.length).padStart(2, "0")}</p><h1 className="font-[family-name:var(--font-display)] text-[clamp(3.2rem,8vw,8rem)] font-black leading-[.9] tracking-[-.06em]">{copy.mediaTitle}</h1><p className="max-w-md text-[var(--muted)]">{copy.mediaLibraryDescription}</p></div>{categories.length > 0 && <div className="mb-10 flex flex-wrap gap-2">{categories.map((category) => <span className="rounded-full bg-[var(--brand-primary)]/10 px-3 py-1 text-[.68rem] font-black uppercase text-[var(--brand-primary)]" key={category}>{category}</span>)}</div>}<GalleryShowcase images={media} locale={locale}/></section>;
}
