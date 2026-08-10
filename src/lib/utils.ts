export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function textFrom(item: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
}

export function formatDate(value?: string, locale = "id-ID") {
  if (!value) return "";
  try { return new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(value)); }
  catch { return value; }
}

export function safeExternalUrl(value?: string) {
  if (!value) return "#";
  if (value.startsWith("/") || value.startsWith("#") || /^https?:\/\//.test(value) || /^mailto:|^tel:/.test(value)) return value;
  return "#";
}
