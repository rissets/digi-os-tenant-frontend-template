import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { uiCopy } from "@/src/lib/i18n";
import type { SearchResponse } from "@/src/lib/types";
import { WmInput } from "./watermelon-provider";

export function SearchView({ data, query, locale }: { data: SearchResponse | null; query: string; locale?: string }) {
  const copy = uiCopy(locale);
  return <section className="mx-auto max-w-[var(--content-width)] px-5 py-[clamp(4.5rem,9vw,8.5rem)]"><div className="mb-14 grid items-end gap-5 md:grid-cols-[1fr_.65fr]"><p className="text-[.68rem] font-black uppercase tracking-[.18em] text-[var(--brand-primary)] md:col-span-2">{copy.searchTitle}</p><h1 className="font-[family-name:var(--font-display)] text-[clamp(3.2rem,8vw,8rem)] font-black leading-[.9] tracking-[-.06em]">{copy.findInformation}</h1><p className="max-w-md text-[var(--muted)]">{copy.searchDescription}</p></div><form className="mb-14 grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-black/15 p-3" action="/search"><Search/><WmInput className="border-0 focus:ring-0" name="q" defaultValue={query} minLength={2} placeholder={copy.searchPlaceholder} aria-label={copy.keyword}/><button className="inline-flex min-h-12 items-center rounded-xl bg-[var(--brand-primary)] px-5 font-black text-white">{copy.search}</button></form>{data && <div><p className="mb-4 text-sm text-[var(--muted)]">{data.count} {copy.resultsFor} “{data.query}”</p>{data.results.map((item) => <Link href={item.url} className="grid grid-cols-[100px_1fr_auto] items-center gap-5 border-t border-black/10 py-6" key={`${item.type}-${item.slug}`}><span className="text-[.62rem] font-black uppercase tracking-wider text-[var(--brand-primary)]">{item.type}</span><div><h2 className="font-[family-name:var(--font-display)] text-2xl font-black">{item.title}</h2><p className="mt-1 text-sm text-[var(--muted)]">{item.excerpt}</p></div><ArrowRight/></Link>)}</div>}</section>;
}
