"use client";

import { FormEvent, useState } from "react";
import { ArrowRight } from "lucide-react";
import { uiCopy } from "@/src/lib/i18n";

export function NewsletterForm({ formKey, locale }: { formKey: string; locale?: string }) {
  const [status, setStatus] = useState(""); const copy = uiCopy(locale);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = event.currentTarget; const email = String(new FormData(form).get("email") || ""); setStatus(copy.sending); const response = await fetch(`/api/forms/${encodeURIComponent(formKey)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ payload: { email, consent: true }, consent: { consent: true, marketing: true }, source: "tenant-footer" }) }); setStatus(response.ok ? copy.subscribed : copy.subscribeError); if (response.ok) form.reset(); }
  return <form className="mt-5 grid grid-cols-[1fr_auto] gap-2" onSubmit={submit}><label><span className="sr-only">{copy.emailAddress}</span><input className="min-h-12 w-full rounded-xl border border-white/25 bg-white/10 px-4 text-white outline-none placeholder:text-white/40 focus:border-white" required type="email" name="email" placeholder="name@company.com"/></label><button className="grid size-12 place-items-center rounded-xl bg-[var(--brand-accent)] text-[var(--footer-bg)]" type="submit" aria-label={copy.subscribe}><ArrowRight/></button>{status && <small className="col-span-2 text-white/60" role="status">{status}</small>}</form>;
}
