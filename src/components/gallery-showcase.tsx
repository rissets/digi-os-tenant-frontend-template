"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { tenantProfile } from "@/src/generated/tenant-profile";
import { uiCopy } from "@/src/lib/i18n";
import type { MediaAsset } from "@/src/lib/types";
import { cn } from "@/src/lib/utils";
import { WmDialog } from "./watermelon-provider";

export type GalleryImage = MediaAsset & { caption?: string };

export function GalleryShowcase({ images, locale }: { images: GalleryImage[]; locale?: string }) {
  const [active, setActive] = useState<number | null>(null);
  const copy = uiCopy(locale);
  if (!images.length) return <div className="grid min-h-64 place-items-center rounded-3xl border border-dashed border-black/25 text-[var(--muted)]">{copy.noMedia}</div>;
  const move = (amount: number) => setActive((current) => current === null ? null : (current + amount + images.length) % images.length);
  const variant = tenantProfile.experience.gallery;
  return <>
    <div className={cn(
      "gap-4",
      variant === "masonry" && "columns-1 sm:columns-2 lg:columns-3",
      variant === "filmstrip" && "flex snap-x snap-mandatory overflow-x-auto pb-5 [scrollbar-width:none]",
      variant === "editorial" && "grid grid-cols-12",
      variant === "grid" && "grid sm:grid-cols-2 lg:grid-cols-3",
    )}>{images.map((media, index) => <button className={cn(
      "group relative mb-4 overflow-hidden border-0 bg-transparent p-0 text-left",
      variant === "masonry" && "w-full break-inside-avoid rounded-[var(--radius)]",
      variant === "filmstrip" && "min-w-[82%] snap-center rounded-[2rem] sm:min-w-[55%] lg:min-w-[38%]",
      variant === "editorial" && (index % 3 === 0 ? "col-span-12 md:col-span-7" : "col-span-6 md:col-span-5"),
      variant === "grid" && "rounded-[var(--radius)]",
    )} key={media.id || index} type="button" onClick={() => setActive(index)}><figure className="m-0"><img className={cn("w-full object-cover transition duration-700 group-hover:scale-105", variant === "masonry" ? (index % 3 === 0 ? "aspect-[4/5]" : "aspect-[5/4]") : "aspect-[4/3]")} src={media.url} alt={media.alt_text || media.title || ""}/><figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-slate-950/85 to-transparent p-5 pt-16 text-white"><span className="text-[.62rem] font-black uppercase tracking-widest text-white/65">{media.category || "Media"}</span><strong className="max-w-[70%] text-right text-sm">{media.caption || media.title || media.original_name}</strong></figcaption></figure></button>)}</div>
    <WmDialog open={active !== null} title={copy.galleryPreview} onClose={() => setActive(null)}>{active !== null && <div className="relative grid min-h-[70vh] place-items-center bg-slate-950 p-4 sm:p-8"><button className="absolute left-3 top-1/2 z-10 grid size-12 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-white/10 text-white" onClick={() => move(-1)} aria-label={copy.previous}><ChevronLeft/></button><figure className="m-0"><img className="max-h-[68vh] max-w-full object-contain" src={images[active].url} alt={images[active].alt_text || images[active].title || ""}/><figcaption className="mt-4 grid text-center text-white"><strong>{images[active].title}</strong><span className="text-sm text-white/65">{images[active].description || images[active].caption}</span></figcaption></figure><button className="absolute right-3 top-1/2 z-10 grid size-12 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-white/10 text-white" onClick={() => move(1)} aria-label={copy.next}><ChevronRight/></button></div>}</WmDialog>
  </>;
}
