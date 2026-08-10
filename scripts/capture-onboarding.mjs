import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

function value(name, fallback = "") {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

const api = value("api", process.env.TENANT_API_URL)?.replace(/\/$/, "");
const output = path.resolve(value("output", "../onboarding/examples/tenant.json"));
if (!api) throw new Error("Use --api https://tenant.example.com/api/v1");
const response = await fetch(`${api}/site-bundle/`);
if (!response.ok) throw new Error(`site-bundle returned ${response.status}`);
const bundle = await response.json();
const settings = bundle.site.settings;
const motionPrimitives = ["animated-background", "animated-group", "animated-number", "border-trail", "carousel", "cursor", "dock", "glow-effect", "in-view", "magnetic", "marquee", "morphing-dialog", "morphing-popover", "progressive-blur", "scroll-progress", "sliding-number", "spotlight", "text-effect", "text-morph", "text-roll", "text-scramble", "tilt", "toolbar", "transition-panel"];
const watermelonComponents = ["accordion", "alert", "announcement", "avatar", "badge", "bento-grid", "blog-card", "breadcrumb", "button", "button-group", "card", "carousel", "checkbox", "contact-card", "dialog", "drawer", "dropdown-menu", "empty-state", "feature-card", "footer", "form", "hero", "input", "logo-cloud", "navigation-menu", "pagination", "popover", "progress", "radio-group", "select", "skeleton", "slider", "stats-card", "stepper", "switch", "tabs", "team-card", "testimonial", "textarea", "timeline", "toast", "toggle", "tooltip"];
const routes = (bundle.site.menus?.find((menu) => menu.key === "main")?.items || []).map((item) => item.url).filter(Boolean);
const manifest = {
  schemaVersion: "2.0",
  tenant: {
    key: value("key", new URL(api).hostname.split(".")[0]),
    name: settings.site_name,
    publicApiUrl: api,
    siteUrl: value("site-url", `https://${new URL(api).hostname.replace(/^api\./, "")}`),
    defaultLocale: settings.default_locale || bundle.site.locale || "id",
    availableLocales: settings.available_locales || ["id"],
  },
  business: {
    industry: settings.organization_type || "Business services",
    summary: settings.description || settings.tagline,
    primaryAudience: ["decision makers", "prospective customers"],
    primaryGoal: "start-conversation",
    differentiators: [settings.tagline].filter(Boolean),
    serviceArea: settings.address || "",
  },
  brand: {
    personality: ["credible", "clear", "progressive"],
    avoid: ["generic SaaS landing page", "unverified claims"],
    visualDirection: `A distinctive digital expression for ${settings.site_name}, grounded in its brand colors and real content.`,
    preferredMotifs: ["grid", "blobs"],
    motionLevel: "calm",
    archetype: "precision-grid",
    cornerStyle: "mixed",
    heroComposition: "split",
    cardTreatment: "outline",
    displayFont: "Inter Tight, system-ui, sans-serif",
    bodyFont: "Inter, system-ui, sans-serif",
    referenceNotes: "Use motion for hierarchy and feedback, never as decoration that blocks reading.",
  },
  experience: { navigation: "mega", hero: "split", sectionRhythm: "alternating", gallery: "masonry", footer: "mega", chatLauncher: "pill", motionPrimitives, watermelonComponents },
  content: { requiredRoutes: [...new Set(["/", ...routes])], priorityCollections: ["blog", "portfolio", "products", "projects", "galleries"], contactFormKey: "contact", enableActiveChannel: true },
  deployment: { target: "docker", repositoryName: `${value("key", "tenant")}-frontend`, productionDomain: new URL(value("site-url", `https://${new URL(api).hostname}`)).hostname, revalidateSeconds: 30 },
  governance: { allowAiLayoutChanges: true, allowAiContentChanges: false, humanApprovalRequired: true, accessibilityTarget: "WCAG-2.2-AA" },
  ai: { provider: "rissets", primaryModel: "opencode-go/gpt-5.6-luna", models: ["opencode-go/gpt-5.6-luna", "opencode-go/deepseek-v4-pro", "opencode-go/kimi-k2.6", "cmd/deepseek/deepseek-v4-flash"], thinkingLevel: "high" },
};
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Captured onboarding manifest: ${output}`);
