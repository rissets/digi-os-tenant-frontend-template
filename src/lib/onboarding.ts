import { z } from "zod";
import { MOTION_PRIMITIVE_CATALOG, WATERMELON_COMPONENT_CATALOG } from "./component-catalog";

export const onboardingSchema = z.object({
  schemaVersion: z.literal("2.0"),
  tenant: z.object({ key: z.string().min(2), name: z.string().min(2), publicApiUrl: z.url(), siteUrl: z.url(), defaultLocale: z.enum(["id", "en"]), availableLocales: z.array(z.enum(["id", "en"])).min(1) }),
  business: z.object({ industry: z.string(), summary: z.string(), primaryAudience: z.array(z.string()).min(1), primaryGoal: z.enum(["start-conversation", "sell", "showcase", "educate", "recruit"]), differentiators: z.array(z.string()).min(2), serviceArea: z.string().optional() }),
  brand: z.object({ personality: z.array(z.string()).min(2), avoid: z.array(z.string()).default([]), visualDirection: z.string().min(40), preferredMotifs: z.array(z.enum(["waves", "blobs", "grid", "rays"])).min(1), motionLevel: z.enum(["minimal", "calm", "expressive"]), referenceNotes: z.string().optional(), archetype: z.enum(["precision-grid", "kinetic-orbit", "warm-editorial", "bold-collage"]), cornerStyle: z.enum(["soft", "sharp", "mixed"]), heroComposition: z.enum(["split", "centered", "editorial"]), cardTreatment: z.enum(["glass", "solid", "outline"]), displayFont: z.string().min(2), bodyFont: z.string().min(2) }),
  experience: z.object({ navigation: z.enum(["minimal", "mega", "editorial", "floating"]), hero: z.enum(["split", "manifesto", "magazine", "immersive"]), sectionRhythm: z.enum(["even", "alternating", "editorial", "collage"]), gallery: z.enum(["masonry", "filmstrip", "editorial", "grid"]), footer: z.enum(["compact", "mega", "editorial", "contact-led"]), chatLauncher: z.enum(["pill", "orb", "minimal"]), motionPrimitives: z.array(z.enum(MOTION_PRIMITIVE_CATALOG)).min(8), watermelonComponents: z.array(z.enum(WATERMELON_COMPONENT_CATALOG)).min(12) }),
  content: z.object({ requiredRoutes: z.array(z.string()).min(1), priorityCollections: z.array(z.string()), contactFormKey: z.string().default("contact"), enableActiveChannel: z.boolean().default(true), customLabels: z.object({ work: z.string(), insights: z.string(), contact: z.string() }).optional() }),
  deployment: z.object({ target: z.enum(["docker", "coolify", "dokploy"]), repositoryName: z.string(), productionDomain: z.string(), revalidateSeconds: z.number().int().min(0).max(86400).default(30) }),
  governance: z.object({ allowAiLayoutChanges: z.boolean(), allowAiContentChanges: z.literal(false), humanApprovalRequired: z.boolean(), accessibilityTarget: z.literal("WCAG-2.2-AA") }),
  ai: z.object({ provider: z.literal("rissets"), primaryModel: z.enum(["opencode-go/gpt-5.6-luna", "opencode-go/deepseek-v4-pro", "opencode-go/kimi-k2.6", "cmd/deepseek/deepseek-v4-flash"]), models: z.array(z.enum(["opencode-go/gpt-5.6-luna", "opencode-go/deepseek-v4-pro", "opencode-go/kimi-k2.6", "cmd/deepseek/deepseek-v4-flash"])).min(1), thinkingLevel: z.enum(["low", "medium", "high", "xhigh"]) }),
});

export type TenantOnboarding = z.infer<typeof onboardingSchema>;
