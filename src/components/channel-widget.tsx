"use client";

import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { tenantProfile } from "@/src/generated/tenant-profile";
import { uiCopy } from "@/src/lib/i18n";
import type { ActiveChannel } from "@/src/lib/types";
import { cn } from "@/src/lib/utils";

export function ChannelWidget({ channel, locale }: { channel: ActiveChannel | null; locale?: string }) {
  const [open, setOpen] = useState(false);
  const copy = uiCopy(locale);
  if (!channel?.enabled) return null;
  const position = channel.live_chat?.position === "left" ? "left-4 sm:left-6" : "right-4 sm:right-6";
  const launcher = {
    pill: "rounded-full px-5",
    orb: "size-14 rounded-full px-0 [&>span]:hidden",
    minimal: "rounded-xl px-4 shadow-none",
  }[tenantProfile.experience.chatLauncher];
  if (channel.channel === "whatsapp") {
    const url = channel.whatsapp?.url || `https://wa.me/${channel.whatsapp?.number?.replace(/\D/g, "") || ""}`;
    return <a className={cn("fixed bottom-5 z-[90] inline-flex min-h-14 items-center justify-center gap-3 bg-emerald-600 font-extrabold text-white shadow-2xl transition hover:-translate-y-1 hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600", position, launcher)} href={url} target="_blank" rel="noopener noreferrer"><MessageCircle/><span>{channel.cta_label || "WhatsApp"}</span></a>;
  }
  if (!channel.live_chat?.embed_url) return null;
  return <div className={cn("fixed bottom-5 z-[90]", position)}>
    {open && <div className="absolute bottom-[4.5rem] right-0 h-[min(720px,calc(100vh-7rem))] w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-[1.75rem] border border-black/10 bg-white shadow-[0_32px_100px_rgba(15,23,42,.3)]"><button className="absolute right-3 top-3 z-10 grid size-11 place-items-center rounded-full bg-slate-950/80 text-white shadow-lg backdrop-blur transition hover:scale-105" onClick={() => setOpen(false)} aria-label={copy.chatClose}><X/></button><iframe className="h-full w-full border-0 bg-white" src={channel.live_chat.embed_url} title={channel.live_chat.name} loading="lazy" allow="clipboard-write"/></div>}
    <button className={cn("inline-flex min-h-14 items-center justify-center gap-3 bg-[var(--brand-primary)] font-extrabold text-white shadow-2xl transition hover:-translate-y-1 hover:bg-[var(--brand-secondary)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand-primary)]", launcher)} onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? copy.chatClose : copy.chatOpen}>{open ? <X/> : <MessageCircle/>}<span>{channel.cta_label || "Live chat"}</span></button>
  </div>;
}
