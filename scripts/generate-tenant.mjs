import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

function value(name, fallback = "") { const index = process.argv.indexOf(`--${name}`); return index >= 0 ? process.argv[index + 1] : fallback; }
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const templateRoot = path.resolve(scriptDir, "..");
const manifestPath = path.resolve(value("manifest"));
const output = path.resolve(value("output"));
if (!value("manifest") || !value("output")) throw new Error("Usage: npm run tenant:generate -- --manifest path/to/onboarding.json --output path/to/site");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
for (const key of ["schemaVersion", "tenant", "business", "brand", "experience", "content", "deployment", "governance", "ai"]) if (!manifest[key]) throw new Error(`Manifest is missing ${key}`);
if (!manifest.tenant.publicApiUrl || !manifest.tenant.name || !manifest.tenant.key) throw new Error("Manifest tenant needs key, name, and publicApiUrl");
if (!path.relative(templateRoot, output).startsWith("..")) throw new Error("Output must be outside the template repository");

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(templateRoot, output, { recursive: true, filter: (source) => !["node_modules", ".next", "coverage"].includes(path.basename(source)) });

const seedInput = `${manifest.tenant.key}:${manifest.business.industry}:${manifest.brand.designSystem?.seed || ""}:${manifest.brand.referenceNotes || ""}`;
const hash = Number.parseInt(createHash("sha256").update(seedInput).digest("hex").slice(0, 8), 16);
const motifs = manifest.brand.preferredMotifs || ["grid"];
const archetypes = ["precision-grid", "kinetic-orbit", "warm-editorial", "bold-collage"];
const selectedArchetype = manifest.brand.archetype || archetypes[hash % archetypes.length];
const selectedCorners = manifest.brand.cornerStyle || (hash % 2 ? "mixed" : "soft");
const selectedCards = manifest.brand.cardTreatment || (hash % 3 === 0 ? "glass" : "outline");
const generatedDesignSystem = { seed: hash, paletteFamily: ["cobalt-cream", "forest-coral", "plum-sand", "ink-lime", "terracotta-sky", "violet-mint", "navy-apricot", "charcoal-lilac"][hash % 8], displayFont: manifest.brand.displayFont || ["Space Grotesk", "DM Serif Display", "Manrope", "Fraunces", "Syne", "Plus Jakarta Sans", "Bodoni Moda", "Outfit"][hash % 8], bodyFont: manifest.brand.bodyFont || ["IBM Plex Sans", "Source Sans 3", "DM Sans", "Work Sans", "Nunito Sans", "Inter", "Public Sans", "Figtree"][hash % 8], typeScale: ["display-led", "editorial-contrast", "compact-utility", "airy-humanist"][hash % 4], density: ["airy", "balanced", "dense"][hash % 3], radius: ["none", "soft", "pill", "mixed"][hash % 4], texture: ["paper", "grain", "blueprint", "flat"][hash % 4], heroPattern: ["split-proof", "manifesto-type", "magazine-crop", "immersive-caption", "stacked-cards", "editorial-index"][hash % 6], navPattern: ["minimal-rail", "mega-directory", "editorial-rule", "floating-island", "side-dock", "marquee-nav"][hash % 6], uspPattern: ["metric-ribbon", "bento-proof", "service-timeline", "icon-led-grid", "horizontal-story", "case-study-strip"][hash % 6], testimonialPattern: ["quote-cards", "single-quote", "logo-proof", "stacked-notes", "avatar-rail", "editorial-pullquote"][hash % 6], ctaPattern: ["contrast-panel", "split-invitation", "magnetic-pill", "full-bleed-band", "contact-led-card", "next-chapter"][hash % 6], footerPattern: ["mega-directory", "contact-led", "editorial-index", "compact-proof", "map-first", "newsletter-studio"][hash % 6], svgMotif: ["orbit", "contour", "spark", "wave", "grid", "ribbon"][hash % 6], motionRecipe: ["slow-drift", "kinetic-reveal", "editorial-scrub", "parallax-calm", "springy", "precision-loop"][hash % 6] };
const designSystem = manifest.brand.designSystem ? { ...generatedDesignSystem, ...manifest.brand.designSystem } : generatedDesignSystem;
const research = manifest.research || { category: manifest.business.industry || "professional-services", visualReferences: [], compositionRules: [], motionRules: [] };
const profileData = {
  tenantKey: manifest.tenant.key,
  designVersion: "2.1.0",
  archetype: selectedArchetype,
  personality: manifest.brand.personality,
  audience: manifest.business.primaryAudience,
  primaryGoal: manifest.business.primaryGoal,
  displayFont: manifest.brand.displayFont || "Inter Tight, ui-sans-serif, system-ui, sans-serif",
  bodyFont: manifest.brand.bodyFont || "Inter, ui-sans-serif, system-ui, sans-serif",
  cornerStyle: selectedCorners,
  heroComposition: manifest.brand.heroComposition || "split",
  cardTreatment: selectedCards,
  motionLevel: manifest.brand.motionLevel,
  visualSeed: hash,
  motif: motifs[hash % motifs.length],
  designSystem,
  research,
  experience: {
    navigation: manifest.experience.navigation,
    hero: manifest.experience.hero,
    sectionRhythm: manifest.experience.sectionRhythm,
    gallery: manifest.experience.gallery,
    footer: manifest.experience.footer,
    chatLauncher: manifest.experience.chatLauncher,
    motionPrimitives: manifest.experience.motionPrimitives,
    watermelonComponents: manifest.experience.watermelonComponents,
  },
  customLabels: manifest.content.customLabels || { work: "Selected work", insights: "Insights", contact: "Start a conversation" },
};
const profile = `import type { MotionPrimitiveName, WatermelonComponentName } from "@/src/lib/component-catalog";\n\nexport type TenantProfile = {\n  tenantKey: string; designVersion: string; archetype: "precision-grid" | "kinetic-orbit" | "warm-editorial" | "bold-collage"; personality: string[]; audience: string[]; primaryGoal: string; displayFont: string; bodyFont: string; cornerStyle: "soft" | "sharp" | "mixed"; heroComposition: "split" | "centered" | "editorial"; cardTreatment: "glass" | "solid" | "outline"; motionLevel: "calm" | "expressive" | "minimal"; visualSeed: number; motif: "waves" | "blobs" | "grid" | "rays"; designSystem: Record<string, string | number>; research: { category: string; visualReferences: string[]; compositionRules: string[]; motionRules: string[] }; experience: { navigation: "minimal" | "mega" | "editorial" | "floating"; hero: "split" | "manifesto" | "magazine" | "immersive"; sectionRhythm: "even" | "alternating" | "editorial" | "collage"; gallery: "masonry" | "filmstrip" | "editorial" | "grid"; footer: "compact" | "mega" | "editorial" | "contact-led"; chatLauncher: "pill" | "orb" | "minimal"; motionPrimitives: MotionPrimitiveName[]; watermelonComponents: WatermelonComponentName[]; patterns?: Record<string, string> }; customLabels: { work: string; insights: string; contact: string };\n};\n\n// Generated from onboarding. AI agents may refine presentation, never source business content.\nexport const tenantProfile: TenantProfile = ${JSON.stringify(profileData, null, 2)};\n`;
await writeFile(path.join(output, "src/generated/tenant-profile.ts"), profile);
const signatureIdentity = { category: research.category, paletteFamily: profileData.designSystem.paletteFamily, displayFont: profileData.designSystem.displayFont || profileData.displayFont, bodyFont: profileData.designSystem.bodyFont || profileData.bodyFont, typeScale: profileData.designSystem.typeScale, density: profileData.designSystem.density, radius: profileData.designSystem.radius, hero: profileData.designSystem.heroPattern, navigation: profileData.designSystem.navPattern, usp: profileData.designSystem.uspPattern, testimonials: profileData.designSystem.testimonialPattern, cta: profileData.designSystem.ctaPattern, footer: profileData.designSystem.footerPattern, gallery: profileData.designSystem.galleryPattern || profileData.experience.gallery, svgMotif: profileData.designSystem.svgMotif, motion: profileData.designSystem.motionRecipe };
const signaturePayload = { tenantKey: manifest.tenant.key, ...signatureIdentity };
const signatureHash = createHash("sha256").update(JSON.stringify(signatureIdentity)).digest("hex");
await writeFile(path.join(output, "src/generated/design-signature.json"), `${JSON.stringify({ ...signaturePayload, signatureHash }, null, 2)}\n`);
await writeFile(path.join(output, "app/tenant.css"), "/* Intentionally empty: presentation uses Tailwind utilities and onboarding-driven React composition. */\n");

const category = String(research.category || designSystem.category || "professional-services");
const categoryComposition = {
  industrial: {
    chrome: "border-l-[clamp(.35rem,1vw,1rem)] border-[var(--brand-accent)] bg-[var(--brand-secondary)] text-white [&_header]:sticky [&_header]:top-0",
    page: "relative overflow-hidden bg-[linear-gradient(90deg,color-mix(in_srgb,var(--brand-primary)_7%,transparent)_1px,transparent_1px)] bg-[size:5vw_100%] before:pointer-events-none before:absolute before:inset-y-0 before:left-[5vw] before:w-px before:bg-[var(--brand-primary)]/15",
    accent: "TECHNICAL CAPABILITY / SYSTEM PERFORMANCE",
    layout: "grid lg:grid-cols-[minmax(0,1fr)_clamp(2rem,7vw,8rem)] [&>div:first-child]:min-w-0",
    rail: true,
  },
  healthcare: {
    chrome: "mx-auto max-w-[1500px] px-3 pt-3 [&_header]:rounded-[2rem] [&_header]:border-transparent [&_header]:shadow-[0_18px_70px_rgba(15,23,42,.08)]",
    page: "mx-auto max-w-[1500px] overflow-hidden rounded-b-[clamp(2rem,6vw,6rem)] bg-[radial-gradient(circle_at_100%_0%,color-mix(in_srgb,var(--brand-accent)_16%,transparent),transparent_38%)]",
    accent: "CARE PATH / HUMAN OUTCOMES",
    layout: "relative",
    rail: false,
  },
  hospitality: {
    chrome: "absolute inset-x-0 top-0 z-[80] text-white [&_header]:bg-transparent [&_header]:text-white [&_header]:border-white/20",
    page: "bg-[var(--footer-bg)] text-[var(--footer-ink)] [&>section:nth-child(even)]:bg-[var(--surface)] [&>section:nth-child(even)]:text-[var(--ink)]",
    accent: "STAY / TASTE / DISCOVER",
    layout: "relative [&_img]:saturate-[1.08]",
    rail: false,
  },
  finance: {
    chrome: "border-b-4 border-[var(--brand-accent)] [&_header]:shadow-sm",
    page: "bg-[linear-gradient(135deg,color-mix(in_srgb,var(--brand-primary)_5%,var(--surface)),var(--surface)_45%)]",
    accent: "TRUST / CLARITY / CONTROL",
    layout: "relative [&>section]:border-b [&>section]:border-black/5",
    rail: false,
  },
  technology: {
    chrome: "mx-auto max-w-[1600px] px-3 pt-3 [&_header]:rounded-full [&_header]:border-white/10 [&_header]:bg-[var(--brand-secondary)]/90 [&_header]:text-white",
    page: "relative bg-[radial-gradient(circle_at_75%_10%,color-mix(in_srgb,var(--brand-accent)_22%,transparent),transparent_32%),var(--brand-secondary)] text-white [&>section:nth-child(n+3)]:bg-[var(--surface)] [&>section:nth-child(n+3)]:text-[var(--ink)]",
    accent: "SYSTEM / SIGNAL / SCALE",
    layout: "relative overflow-hidden",
    rail: false,
  },
  "professional-services": {
    chrome: "border-t-8 border-[var(--brand-primary)] [&_header]:border-b-2 [&_header]:border-[var(--ink)]",
    page: "bg-[linear-gradient(180deg,var(--surface),color-mix(in_srgb,var(--brand-accent)_7%,var(--surface)))]",
    accent: "POINT OF VIEW / SELECTED WORK",
    layout: "relative",
    rail: false,
  },
}[category] || {
  chrome: "border-t-8 border-[var(--brand-primary)]",
  page: "bg-[var(--surface)]",
  accent: "COMPANY / CAPABILITY / CONTACT",
  layout: "relative",
  rail: false,
};

const tenantPresentation = `import type { ReactNode } from "react";
import { CmsRenderer } from "@/src/components/cms-renderer";
import { CollectionDetail, CollectionView } from "@/src/components/collection-view";
import { SiteFooter } from "@/src/components/site-footer";
import { SiteHeader } from "@/src/components/site-header";
import type { BrandConfig, CmsPage, CollectionItem, FooterConfig, Menu, PageResources, SiteLocation, SiteSettings } from "@/src/lib/types";

const category = ${JSON.stringify(category)};
const artDirection = ${JSON.stringify({ hero: designSystem.heroPattern, navigation: designSystem.navPattern, proof: designSystem.uspPattern, gallery: designSystem.galleryPattern, footer: designSystem.footerPattern, motion: designSystem.motionRecipe })};

export function TenantHeader(props: { settings: SiteSettings; branding?: BrandConfig; menus: Menu[]; locale?: string }) {
  return <div className=${JSON.stringify(categoryComposition.chrome)} data-tenant-chrome={artDirection.navigation} data-business-category={category}><SiteHeader {...props}/></div>;
}

export function TenantFooter(props: { settings: SiteSettings; branding?: BrandConfig; footer: FooterConfig; locations?: SiteLocation[]; locale?: string }) {
  return <div className="relative" data-tenant-footer={artDirection.footer} data-business-category={category}><div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 mx-auto max-w-[var(--content-width)] -translate-y-1/2 px-5 font-mono text-[.58rem] font-black uppercase tracking-[.24em] text-[var(--brand-accent)]">${categoryComposition.accent}</div><SiteFooter {...props}/></div>;
}

export function TenantPage({ children, kind = "content" }: { children: ReactNode; kind?: string }) {
  return <div className=${JSON.stringify(categoryComposition.page)} data-tenant-composition={kind} data-hero-pattern={artDirection.hero} data-proof-pattern={artDirection.proof} data-gallery-pattern={artDirection.gallery}><div className=${JSON.stringify(categoryComposition.layout)}><div>{children}</div>${categoryComposition.rail ? '<aside aria-hidden="true" className="hidden border-l border-[var(--brand-primary)]/15 px-3 py-24 font-mono text-[.55rem] font-black uppercase tracking-[.24em] text-[var(--brand-primary)] [writing-mode:vertical-rl] lg:block">' + categoryComposition.accent + '</aside>' : ''}</div></div>;
}

export function TenantCmsRenderer(props: { page: CmsPage; settings: SiteSettings; resources?: PageResources }) { return <TenantPage kind={props.page.page_type || "cms"}><CmsRenderer {...props}/></TenantPage>; }
export function TenantCollectionView(props: { collectionKey: string; items: CollectionItem[]; locale?: string }) { return <TenantPage kind={\`collection-\${props.collectionKey}\`}><CollectionView {...props}/></TenantPage>; }
export function TenantCollectionDetail(props: { collectionKey: string; item: CollectionItem; locale?: string }) { return <TenantPage kind={\`detail-\${props.collectionKey}\`}><CollectionDetail {...props}/></TenantPage>; }
`;
await mkdir(path.join(output, "src/tenant"), { recursive: true });
await writeFile(path.join(output, "src/tenant/presentation.tsx"), tenantPresentation);
await writeFile(path.join(output, "research-dossier.json"), `${JSON.stringify(research, null, 2)}\n`);
await writeFile(path.join(output, "design-direction.json"), `${JSON.stringify({ version: "3.0", category, designSystem, requiredStructuralAxes: 4, requiredChangedAxes: 6 }, null, 2)}\n`);
await writeFile(path.join(output, "DESIGN_APPROVAL.md"), "# Approved autonomous design generation\n\nThe tenant owner approved this generation when onboarding was submitted. Select the strongest category-appropriate direction using UI UX Pro Max and Taste, record the decision, and continue through planning, implementation, verification, and delivery in this same non-interactive run. Do not pause for another design approval or ask a question.\n");

const packageJson = JSON.parse(await readFile(path.join(output, "package.json"), "utf8")); packageJson.name = manifest.deployment.repositoryName;
await writeFile(path.join(output, "package.json"), `${JSON.stringify(packageJson, null, 2)}\n`);
const lockPath = path.join(output, "package-lock.json"); const packageLock = JSON.parse(await readFile(lockPath, "utf8")); packageLock.name = manifest.deployment.repositoryName; if (packageLock.packages?.[""]) packageLock.packages[""].name = manifest.deployment.repositoryName;
await writeFile(lockPath, `${JSON.stringify(packageLock, null, 2)}\n`);
await writeFile(path.join(output, ".env.example"), `TENANT_API_URL=${manifest.tenant.publicApiUrl}\nTENANT_SITE_URL=${manifest.tenant.siteUrl}\nTENANT_REVALIDATE_SECONDS=${manifest.deployment.revalidateSeconds}\nTENANT_API_TIMEOUT_MS=8000\n`);
await writeFile(path.join(output, "tenant-onboarding.json"), `${JSON.stringify(manifest, null, 2)}\n`);
await writeFile(path.join(output, "TENANT_AGENT_BRIEF.md"), [
  `# AI frontend brief — ${manifest.tenant.name}`,
  "",
  "## Mission",
  "",
  `Build a recognisably unique public website for **${manifest.tenant.name}**. This is a code-generation task, not a JSON configuration task.`,
  "The tenant owner already approved autonomous design generation at onboarding submission. Do not pause or ask for another design approval; select the strongest direction and implement it in this run.",
  "",
  "## Mandatory design workflow",
  "",
  "1. UI UX Pro Max is explicitly loaded by the harness and is the first design authority. Run its design-system search using the exact industry, audience, conversion, and visual-direction data.",
  "2. Taste is explicitly loaded. Write TASTE_AUDIT.md with its brief inference, anti-slop bans, hierarchy, density, and theme/shape/color locks before editing presentation source.",
  "3. Superpowers planning skills are explicitly loaded. Write IMPLEMENTATION_PLAN.md with file-level structural changes before coding.",
  "4. Three.js animation is explicitly loaded for a use/skip decision. Write MOTION_DECISION.json; use Three.js only when spatial/technical meaning justifies its cost, otherwise author at least three purposeful SVG motion systems.",
  "5. Materially rewrite src/tenant/** and supporting Tailwind React components: DOM topology, responsive order, typography, image treatment, navigation, hero, proof, testimonial, CTA, gallery, collection/detail, footer, and motion. Palette-only or JSON-only changes fail.",
  "",
  "## Design system",
  "",
  `- Palette: ${designSystem.paletteFamily}`,
  `- Fonts: ${designSystem.displayFont} / ${designSystem.bodyFont}`,
  `- Type scale / density / radius: ${designSystem.typeScale} / ${designSystem.density} / ${designSystem.radius}`,
  `- Patterns hero/nav/USP/testimonial/CTA/footer: ${designSystem.heroPattern} / ${designSystem.navPattern} / ${designSystem.uspPattern} / ${designSystem.testimonialPattern} / ${designSystem.ctaPattern} / ${designSystem.footerPattern}`,
  `- SVG motif / motion: ${designSystem.svgMotif} / ${designSystem.motionRecipe}`,
  `- Industry dossier: ${research.category}`,
  `- Cited visual references: ${(research.sources || []).map((source) => `${source.name}: ${source.url} (${source.insight})`).join("; ") || research.visualReferences.join("; ")}`,
  `- Composition rules: ${research.compositionRules.join("; ")}`,
  `- Motion rules: ${research.motionRules.join("; ")}`,
  "",
  "Do not reuse another tenant's hero, USP, testimonials, CTA, navbar, footer, font pairing, spacing rhythm, card treatment, or section order. Respect reduced motion and WCAG 2.2 AA.",
  "",
  "## Data and locale contract",
  "",
  `- Read business facts only from ${manifest.tenant.publicApiUrl}; never invent content.`,
  `- Preserve both ${manifest.tenant.availableLocales.join(" and ")} locales and all public CMS, collection/detail, search, media, location, form, sitemap, redirect, chat/WhatsApp and footer contracts.`,
  "",
  "## Required report",
  "",
  "Finish by writing AI_GENERATION_REPORT.md and generation-report.json with changed source files, selected patterns, skill artifacts, animation evidence, locale/API checks, and route/build checks. Do not claim a skill was used unless its required artifact exists.",
].join("\n") + "\n");
console.log(`Generated ${manifest.tenant.name} frontend at ${output}`);
