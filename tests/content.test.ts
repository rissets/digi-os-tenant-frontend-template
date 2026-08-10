import { describe, expect, it } from "vitest";
import { cleanRichText, itemImage, itemTitle } from "@/src/lib/content";
import { onboardingSchema } from "@/src/lib/onboarding";
import { safeExternalUrl } from "@/src/lib/utils";

describe("public content safety", () => {
  it("removes executable rich text while preserving editorial markup", () => {
    const value = cleanRichText('<p>Hello <strong>team</strong></p><script>alert(1)</script><a href="javascript:alert(1)">bad</a>');
    expect(value).toContain("<strong>team</strong>");
    expect(value).not.toContain("script");
    expect(value).not.toContain("javascript:");
  });

  it("rejects unsafe navigation protocols", () => {
    expect(safeExternalUrl("javascript:alert(1)")).toBe("#");
    expect(safeExternalUrl("/contact")).toBe("/contact");
  });

  it("normalizes heterogeneous collection items", () => {
    const item = { slug: "alpha", title: "Alpha", cover: { id: "1", url: "https://cdn.example/a.jpg" } };
    expect(itemTitle(item)).toBe("Alpha");
    expect(itemImage(item)?.url).toContain("a.jpg");
  });
});

describe("onboarding contract", () => {
  it("rejects a manifest that lets AI rewrite tenant content", () => {
    const result = onboardingSchema.safeParse({ schemaVersion: "2.0", governance: { allowAiContentChanges: true } });
    expect(result.success).toBe(false);
  });
});
