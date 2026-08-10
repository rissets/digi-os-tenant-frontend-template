"use client";

import { ChevronDown, X } from "lucide-react";
import { createContext, type ButtonHTMLAttributes, type HTMLAttributes, type InputHTMLAttributes, type PropsWithChildren, type SelectHTMLAttributes, type TextareaHTMLAttributes, useContext, useState } from "react";
import { WATERMELON_COMPONENT_CATALOG, type WatermelonComponentName } from "@/src/lib/component-catalog";
import { tenantProfile } from "@/src/generated/tenant-profile";
import { cn } from "@/src/lib/utils";

type RegistryValue = { enabled: ReadonlySet<WatermelonComponentName>; catalog: readonly WatermelonComponentName[] };
const RegistryContext = createContext<RegistryValue>({ enabled: new Set(WATERMELON_COMPONENT_CATALOG), catalog: WATERMELON_COMPONENT_CATALOG });

export function WatermelonProvider({ children }: PropsWithChildren) {
  const enabled = new Set(tenantProfile.experience.watermelonComponents);
  return <RegistryContext.Provider value={{ enabled, catalog: WATERMELON_COMPONENT_CATALOG }}>{children}</RegistryContext.Provider>;
}

export function useWatermelonRegistry() { return useContext(RegistryContext); }

const radius = {
  soft: "rounded-[2rem]",
  sharp: "rounded-none",
  mixed: "rounded-[1.4rem] first:rounded-tl-[3rem]",
}[tenantProfile.cornerStyle];

export function WmButton({ className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn("inline-flex min-h-11 items-center justify-center gap-2 border border-[var(--brand-primary)] bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-extrabold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--brand-secondary)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand-primary)] disabled:pointer-events-none disabled:opacity-50", radius, className)} {...props}>{children}</button>;
}

export function WmBadge({ className, children, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex items-center gap-2 rounded-full border border-current/20 bg-[var(--brand-primary)]/8 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--brand-primary)]", className)} {...props}>{children}</span>;
}

export function WmCard({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const treatment = {
    glass: "border-white/50 bg-white/60 shadow-2xl shadow-slate-950/10 backdrop-blur-xl",
    solid: "border-black/10 bg-[var(--surface)] shadow-xl shadow-slate-950/5",
    outline: "border-black/15 bg-transparent",
  }[tenantProfile.cardTreatment];
  return <div className={cn("border p-6", radius, treatment, className)} {...props}>{children}</div>;
}

export function WmBentoGrid({ className, children }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn("grid auto-rows-[minmax(220px,auto)] grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12", className)}>{children}</div>;
}

export function WmInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("min-h-12 w-full rounded-xl border border-black/15 bg-[var(--surface)] px-4 text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary)]/10", className)} {...props}/>;
}

export function WmTextarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("min-h-36 w-full resize-y rounded-xl border border-black/15 bg-[var(--surface)] px-4 py-3 text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary)]/10", className)} {...props}/>;
}

export function WmSelect({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <span className="relative block"><select className={cn("min-h-12 w-full appearance-none rounded-xl border border-black/15 bg-[var(--surface)] px-4 pr-11 text-[var(--ink)] outline-none transition focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary)]/10", className)} {...props}>{children}</select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" size={18}/></span>;
}

export function WmAccordion({ rows }: { rows: Array<{ id: string; title: string; body: string }> }) {
  return <div className="divide-y divide-black/10 border-y border-black/10">{rows.map((row, index) => <details className="group py-5" key={row.id}><summary className="flex cursor-pointer list-none items-center gap-5 text-lg font-bold"><span className="font-mono text-xs text-[var(--brand-primary)]">{String(index + 1).padStart(2, "0")}</span><span className="flex-1">{row.title}</span><ChevronDown className="transition group-open:rotate-180"/></summary><div className="max-w-3xl pb-2 pl-10 pt-4 text-[var(--muted)]" dangerouslySetInnerHTML={{ __html: row.body }}/></details>)}</div>;
}

export function WmAlert({ title, children }: PropsWithChildren<{ title: string }>) {
  return <div className="grid gap-1 rounded-2xl border border-[var(--brand-primary)]/25 bg-[var(--brand-primary)]/8 p-4" role="status"><strong>{title}</strong><div className="text-sm text-[var(--muted)]">{children}</div></div>;
}

export function WmProgress({ value }: { value: number }) {
  return <div className="h-1.5 overflow-hidden rounded-full bg-black/10" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><span className="block h-full rounded-full bg-[var(--brand-primary)] transition-[width]" style={{ width: `${Math.max(0, Math.min(value, 100))}%` }}/></div>;
}

export function WmTabs({ tabs }: { tabs: Array<{ label: string; content: React.ReactNode }> }) {
  const [active, setActive] = useState(0);
  return <div><div className="flex flex-wrap gap-2 border-b border-black/10" role="tablist">{tabs.map((tab, index) => <button className={cn("border-b-2 px-4 py-3 text-sm font-bold", active === index ? "border-[var(--brand-primary)] text-[var(--brand-primary)]" : "border-transparent text-[var(--muted)]")} role="tab" aria-selected={active === index} onClick={() => setActive(index)} key={tab.label}>{tab.label}</button>)}</div><div className="py-6" role="tabpanel">{tabs[active]?.content}</div></div>;
}

export function WmDialog({ open, title, onClose, children }: PropsWithChildren<{ open: boolean; title: string; onClose: () => void }>) {
  if (!open) return null;
  return <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/70 p-4 backdrop-blur" role="dialog" aria-modal="true" aria-label={title}><WmCard className="relative max-h-[90vh] w-full max-w-3xl overflow-auto bg-white p-0"><button className="absolute right-3 top-3 z-10 grid size-11 place-items-center rounded-full bg-slate-950 text-white" onClick={onClose} aria-label="Close"><X/></button>{children}</WmCard></div>;
}
