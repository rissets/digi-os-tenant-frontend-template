"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { uiCopy } from "@/src/lib/i18n";
import type { ContactFormSchema } from "@/src/lib/types";
import { cn } from "@/src/lib/utils";
import { WmInput, WmSelect, WmTextarea } from "./watermelon-provider";

export function ContactForm({ schema, eyebrow = "Direct line", locale }: { schema: ContactFormSchema; eyebrow?: string; locale?: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const copy = uiCopy(locale);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState("sending"); setMessage("");
    const form = new FormData(event.currentTarget); const payload: Record<string, unknown> = {}; const consent: Record<string, boolean> = {};
    for (const field of schema.fields) payload[field.key] = field.type === "consent" ? form.get(field.key) === "on" : form.get(field.key);
    for (const field of schema.fields.filter((item) => item.type === "consent")) consent[field.key] = payload[field.key] === true;
    const response = await fetch(`/api/forms/${encodeURIComponent(schema.key)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ payload, consent, source: "tenant-frontend" }) });
    const result = await response.json();
    if (response.ok) { setState("sent"); setMessage(schema.success_message); event.currentTarget.reset(); } else { setState("error"); setMessage(result.detail || copy.sendError); }
  }
  return <div className="rounded-[calc(var(--radius)*1.2)] bg-[var(--brand-primary)]/7 p-[clamp(1.6rem,4vw,3.5rem)]"><div className="mb-10 max-w-3xl"><p className="mb-4 text-[.68rem] font-black uppercase tracking-[.18em] text-[var(--brand-primary)]">{eyebrow}</p><h2 className="font-[family-name:var(--font-display)] text-[clamp(2.3rem,4.8vw,4.8rem)] font-black leading-[.95] tracking-[-.055em]">{schema.title}</h2><p className="mt-4 text-[var(--muted)]">{schema.description}</p></div><form onSubmit={submit} className="grid gap-5 md:grid-cols-2">{schema.fields.map((field) => { const label = <span className="text-[.68rem] font-black uppercase tracking-wider">{field.label}</span>; if (field.type === "consent") return <label className="flex gap-3 md:col-span-2" key={field.key}><input className="mt-1 size-4 accent-[var(--brand-primary)]" name={field.key} type="checkbox" required={field.required}/><span className="text-sm">{field.label}</span></label>; if (field.type === "textarea") return <label className="grid gap-2 md:col-span-2" key={field.key}>{label}<WmTextarea name={field.key} required={field.required} rows={5}/></label>; if (field.type === "select") return <label className="grid gap-2" key={field.key}>{label}<WmSelect name={field.key} required={field.required}><option value="">{copy.select}</option>{field.options.map((option) => <option key={option}>{option}</option>)}</WmSelect></label>; return <label className="grid gap-2" key={field.key}>{label}<WmInput name={field.key} type={field.type === "phone" ? "tel" : field.type} required={field.required}/></label>; })}<button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 font-black text-white disabled:opacity-50 md:col-span-2" type="submit" disabled={state === "sending"}>{state === "sending" ? copy.sending : <>{copy.sendMessage}<ArrowRight size={17}/></>}</button>{message && <p className={cn("flex items-center gap-2 text-sm md:col-span-2", state === "sent" ? "text-emerald-700" : "text-red-700")} role="status">{state === "sent" && <CheckCircle2/>}{message}</p>}</form></div>;
}
