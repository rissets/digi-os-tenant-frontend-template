import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, test } from "vitest";

const root = process.cwd();
const work = mkdtempSync(path.join(os.tmpdir(), "tenant-generation-v3-"));
afterAll(() => rmSync(work, { recursive: true, force: true }));

function manifest(key: string, category: "industrial" | "healthcare") {
  const industrial = category === "industrial";
  return {
    schemaVersion: "3.0",
    tenant: { key, name: industrial ? "Forge Motion" : "Harbor Care", publicApiUrl: `https://${key}.example.com/api/v1`, siteUrl: `https://${key}.example.com`, defaultLocale: "id", availableLocales: ["id", "en"] },
    business: { industry: industrial ? "industrial automation" : "preventive healthcare", primaryAudience: industrial ? ["plant directors"] : ["families"], primaryGoal: industrial ? "site assessment" : "book consultation" },
    brand: { personality: industrial ? ["precise", "robust", "technical"] : ["calm", "human", "trusted"], avoid: ["generic"], visualDirection: industrial ? "A technical industrial system with precise geometry and project evidence." : "A warm healthcare editorial experience with clear care pathways.", preferredMotifs: industrial ? ["grid"] : ["waves"], motionLevel: industrial ? "expressive" : "calm", archetype: industrial ? "precision-grid" : "warm-editorial", cornerStyle: industrial ? "sharp" : "mixed", heroComposition: industrial ? "split" : "editorial", cardTreatment: "outline", displayFont: industrial ? "Sora" : "Newsreader", bodyFont: industrial ? "IBM Plex Sans" : "Source Sans 3", referenceNotes: "test", designSystem: industrial ? { category, paletteFamily: "carbon-safety-orange", displayFont: "Sora", bodyFont: "IBM Plex Sans", typeScale: "compact-technical", density: "dense-editorial", radius: "sharp", texture: "blueprint", heroPattern: "technical-canvas", navPattern: "utility-rail", uspPattern: "capability-matrix", testimonialPattern: "result-led-case", ctaPattern: "site-assessment", footerPattern: "capability-directory", galleryPattern: "annotated-project-index", svgMotif: "mechanical", motionRecipe: "blueprint-trace" } : { category, paletteFamily: "sage-ivory", displayFont: "Newsreader", bodyFont: "Source Sans 3", typeScale: "airy-humanist", density: "airy", radius: "soft", texture: "photographic", heroPattern: "trust-appointment", navPattern: "care-directory", uspPattern: "care-pathway", testimonialPattern: "patient-story", ctaPattern: "book-consultation", footerPattern: "location-first", galleryPattern: "human-editorial", svgMotif: "contour", motionRecipe: "gentle-breath" } },
    research: { category, sources: [], visualReferences: [], compositionRules: [], motionRules: [] },
    experience: { navigation: industrial ? "mega" : "editorial", hero: industrial ? "split" : "magazine", sectionRhythm: industrial ? "alternating" : "editorial", gallery: industrial ? "grid" : "editorial", footer: industrial ? "mega" : "contact-led", chatLauncher: "minimal", motionPrimitives: [], watermelonComponents: [] },
    content: { requiredRoutes: ["/"], customLabels: { work: "Work", insights: "Insights", contact: "Contact" } },
    deployment: { target: "docker", repositoryName: `${key}-frontend`, productionDomain: `${key}.example.com`, revalidateSeconds: 30 },
    governance: { allowAiLayoutChanges: true, allowAiContentChanges: false, humanApprovalRequired: true, accessibilityTarget: "WCAG-2.2-AA" },
    ai: { provider: "rissets", primaryModel: "opencode-go/gpt-5.6-luna", models: ["opencode-go/gpt-5.6-luna"], thinkingLevel: "high" },
  };
}

function generate(key: string, category: "industrial" | "healthcare") {
  const input = path.join(work, `${key}.json`);
  const output = path.join(work, key);
  writeFileSync(input, JSON.stringify(manifest(key, category)));
  execFileSync(process.execPath, [path.join(root, "scripts/generate-tenant.mjs"), "--manifest", input, "--output", output]);
  return output;
}

describe("Frontend Generation V3", () => {
  test("creates category-specific tenant-owned compositions", () => {
    const industrial = generate("forge-motion", "industrial");
    const healthcare = generate("harbor-care", "healthcare");
    const industrialSource = readFileSync(path.join(industrial, "src/tenant/presentation.tsx"), "utf8");
    const healthcareSource = readFileSync(path.join(healthcare, "src/tenant/presentation.tsx"), "utf8");
    expect(industrialSource).toContain('const category = "industrial"');
    expect(industrialSource).toContain("TECHNICAL CAPABILITY / SYSTEM PERFORMANCE");
    expect(healthcareSource).toContain('const category = "healthcare"');
    expect(healthcareSource).toContain("CARE PATH / HUMAN OUTCOMES");
    expect(readFileSync(path.join(industrial, "DESIGN_APPROVAL.md"), "utf8")).toContain("Do not pause");
    expect(industrialSource).not.toBe(healthcareSource);
    const industrialSignature = JSON.parse(readFileSync(path.join(industrial, "src/generated/design-signature.json"), "utf8"));
    const healthcareSignature = JSON.parse(readFileSync(path.join(healthcare, "src/generated/design-signature.json"), "utf8"));
    expect(industrialSignature.signatureHash).not.toBe(healthcareSignature.signatureHash);
  });
});
