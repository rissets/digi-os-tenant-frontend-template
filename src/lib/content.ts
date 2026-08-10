import sanitizeHtml from "sanitize-html";
import type { CollectionItem, MediaAsset } from "./types";
import { textFrom } from "./utils";

export function cleanRichText(value?: string) {
  return sanitizeHtml(value || "", {
    allowedTags: ["p", "br", "strong", "em", "b", "i", "u", "s", "ul", "ol", "li", "blockquote", "h2", "h3", "h4", "a", "code", "pre", "table", "thead", "tbody", "tr", "th", "td"],
    allowedAttributes: { a: ["href", "target", "rel"], "*": ["class"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }, true) },
  });
}

export function itemTitle(item: CollectionItem) {
  return textFrom(item, "title", "name", "question", "position", "heading") || "Untitled";
}

export function itemSummary(item: CollectionItem) {
  return textFrom(item, "excerpt", "summary", "description", "short_description", "answer", "location");
}

export function itemImage(item: CollectionItem): MediaAsset | null {
  for (const key of ["cover", "image", "featured_image", "hero_image", "thumbnail", "logo"]) {
    const value = item[key];
    if (value && typeof value === "object" && "url" in value) return value as MediaAsset;
  }
  return null;
}

export function itemBody(item: CollectionItem) {
  return textFrom(item, "body", "description", "content", "answer", "summary");
}

export function collectionLabel(key: string) {
  return ({ blog: "Insight", portfolio: "Portofolio", products: "Produk", projects: "Proyek", careers: "Karier", faq: "Pertanyaan umum", galleries: "Galeri", legal: "Legal" } as Record<string, string>)[key] || key;
}
