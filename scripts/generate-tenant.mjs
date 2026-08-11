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
const signatureIdentity = { paletteFamily: profileData.designSystem.paletteFamily, displayFont: profileData.displayFont, bodyFont: profileData.bodyFont, typeScale: profileData.designSystem.typeScale, density: profileData.designSystem.density, radius: profileData.designSystem.radius, hero: profileData.designSystem.heroPattern, navigation: profileData.designSystem.navPattern, usp: profileData.designSystem.uspPattern, testimonials: profileData.designSystem.testimonialPattern, cta: profileData.designSystem.ctaPattern, footer: profileData.designSystem.footerPattern, svgMotif: profileData.designSystem.svgMotif, motion: profileData.designSystem.motionRecipe };
const signaturePayload = { tenantKey: manifest.tenant.key, ...signatureIdentity };
const signatureHash = createHash("sha256").update(JSON.stringify(signatureIdentity)).digest("hex");
await writeFile(path.join(output, "src/generated/design-signature.json"), `${JSON.stringify({ ...signaturePayload, signatureHash }, null, 2)}\n`);
await writeFile(path.join(output, "app/tenant.css"), "/* Intentionally empty: presentation uses Tailwind utilities and onboarding-driven React composition. */\n");

const packageJson = JSON.parse(await readFile(path.join(output, "package.json"), "utf8")); packageJson.name = manifest.deployment.repositoryName;
await writeFile(path.join(output, "package.json"), `${JSON.stringify(packageJson, null, 2)}\n`);
const lockPath = path.join(output, "package-lock.json"); const packageLock = JSON.parse(await readFile(lockPath, "utf8")); packageLock.name = manifest.deployment.repositoryName; if (packageLock.packages?.[""]) packageLock.packages[""].name = manifest.deployment.repositoryName;
await writeFile(lockPath, `${JSON.stringify(packageLock, null, 2)}\n`);
await writeFile(path.join(output, ".env.example"), `TENANT_API_URL=${manifest.tenant.publicApiUrl}\nTENANT_SITE_URL=${manifest.tenant.siteUrl}\nTENANT_REVALIDATE_SECONDS=${manifest.deployment.revalidateSeconds}\nTENANT_API_TIMEOUT_MS=8000\n`);
await writeFile(path.join(output, "tenant-onboarding.json"), `${JSON.stringify(manifest, null, 2)}\n`);
await writeFile(path.join(output, "TENANT_AGENT_BRIEF.md"), `# AI frontend brief — ${manifest.tenant.name}\n\n## Mission\n\nBuild a recognisably unique, production-ready public website for **${manifest.tenant.name}** from this repository. The result must not be a recoloured copy of another tenant.\n\n## Commands\n\n- Validate: \`npm run check\`\n- Regenerate deterministically: \`npm run tenant:generate -- --manifest tenant-onboarding.json --output ../regenerated\`\n- Run the coding agent: \`npm run agent:refine -- --model ${manifest.ai.primaryModel}\`\n\n## Data and locale contract\n\n- Read business facts only from \`${manifest.tenant.publicApiUrl}\`; never invent content.\n- Preserve both \`${manifest.tenant.availableLocales.join("`, `")}\` locales and use API-translated content plus the matching frontend UI dictionary.\n- Preserve every public CMS, collection/detail, search, media, location, form, sitemap, redirect, chat/WhatsApp and footer contract.\n\n## Structural art direction\n\n- Navigation: **${manifest.experience.navigation}**\n- Hero: **${manifest.experience.hero}**\n- Section rhythm: **${manifest.experience.sectionRhythm}**\n- Gallery: **${manifest.experience.gallery}**\n- Footer: **${manifest.experience.footer}**\n- Chat launcher: **${manifest.experience.chatLauncher}**\n- Motion primitives available/selected: ${manifest.experience.motionPrimitives.join(", ")}\n- Watermelon component families available/selected: ${manifest.experience.watermelonComponents.join(", ")}\n\nChange the actual React composition, responsive order, typography, crop strategy and interaction model. Tailwind utilities are the styling source; do not add a large vanilla stylesheet or tenant-specific CSS overrides.\n\n## Brand direction\n\n${manifest.brand.visualDirection}\n\nPersonality: ${manifest.brand.personality.join(", ")}\nAvoid: ${manifest.brand.avoid.join(", ")}\nAudience: ${manifest.business.primaryAudience.join(", ")}\nPrimary goal: ${manifest.business.primaryGoal}\nMotifs: ${manifest.brand.preferredMotifs.join(", ")}\n\n## Required coverage\n\nHomepage and pages must support hero, rich text, image/text, video, feature grid, stats, CTA, testimonials, logo cloud, FAQ, blog, products, projects, portfolio, careers, legal, gallery, contact form, locations/map, navigation, footer, live chat or WhatsApp, search, media and all collection detail routes. Use the selected Motion and Watermelon registries where they improve hierarchy.\n\n## Delivery gates\n\nRun lint, typecheck, tests, production build, Docker health, public route checks, API locale checks, and browser QA at desktop/tablet/390px. Respect WCAG 2.2 AA and reduced motion.\n`);
await writeFile(path.join(output, "TENANT_AGENT_BRIEF.md"), [
  `# AI frontend brief — ${manifest.tenant.name}`,
  "",
  "## Mission",
  "",
  `Build a recognisably unique public website for **${manifest.tenant.name}**. This is a code-generation task, not a JSON configuration task.`,
  "",
  "## Mandatory design workflow",
  "",
  "1. Invoke ui-ux-pro-max first and use onboarding, the industry dossier, and the design tokens below.",
  "2. Apply design-taste-frontend for hierarchy, density, typography, and anti-slop rules.",
  "3. Use threejs-animation when a meaningful 3D/procedural visual helps; otherwise add at least three purposeful animated SVG details.",
  "4. Use superpowers for planning, implementation, and verification.",
  "5. Materially rewrite React/Tailwind source: composition, DOM hierarchy, responsive order, typography, image treatment, and motion. Palette-only or JSON-only changes fail.",
  "",
  "## Design system",
  "",
  `- Palette: ${designSystem.paletteFamily}`,
  `- Fonts: ${designSystem.displayFont} / ${designSystem.bodyFont}`,
  `- Type scale / density / radius: ${designSystem.typeScale} / ${designSystem.density} / ${designSystem.radius}`,
  `- Patterns hero/nav/USP/testimonial/CTA/footer: ${designSystem.heroPattern} / ${designSystem.navPattern} / ${designSystem.uspPattern} / ${designSystem.testimonialPattern} / ${designSystem.ctaPattern} / ${designSystem.footerPattern}`,
  `- SVG motif / motion: ${designSystem.svgMotif} / ${designSystem.motionRecipe}`,
  `- Industry dossier: ${research.category}`,
  `- Visual references: ${research.visualReferences.join("; ")}`,
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
  "Finish by writing AI_GENERATION_REPORT.md with changed source files, selected patterns, skills used, animation evidence, locale/API checks, and route/build checks.",
].join("\n") + "\n");
console.log(`Generated ${manifest.tenant.name} frontend at ${output}`);
