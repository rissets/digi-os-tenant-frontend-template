import type { MotionPrimitiveName, WatermelonComponentName } from "@/src/lib/component-catalog";

export type TenantProfile = {
  tenantKey: string;
  designVersion: string;
  archetype: "precision-grid" | "kinetic-orbit" | "warm-editorial" | "bold-collage";
  personality: string[];
  audience: string[];
  primaryGoal: string;
  displayFont: string;
  bodyFont: string;
  cornerStyle: "soft" | "sharp" | "mixed";
  heroComposition: "split" | "centered" | "editorial";
  cardTreatment: "glass" | "solid" | "outline";
  motionLevel: "calm" | "expressive" | "minimal";
  visualSeed: number;
  motif: "waves" | "blobs" | "grid" | "rays";
  experience: {
    navigation: "minimal" | "mega" | "editorial" | "floating";
    hero: "split" | "manifesto" | "magazine" | "immersive";
    sectionRhythm: "even" | "alternating" | "editorial" | "collage";
    gallery: "masonry" | "filmstrip" | "editorial" | "grid";
    footer: "compact" | "mega" | "editorial" | "contact-led";
    chatLauncher: "pill" | "orb" | "minimal";
    motionPrimitives: MotionPrimitiveName[];
    watermelonComponents: WatermelonComponentName[];
  };
  customLabels: {
    work: string;
    insights: string;
    contact: string;
  };
};

// This file is the presentation seam for the AI agent. Business content always
// comes from Django; the agent may change layout, motion and component choices.
export const tenantProfile: TenantProfile = {
  tenantKey: "generic",
  designVersion: "1.0.0",
  archetype: "precision-grid",
  personality: ["clear", "credible", "adaptive"],
  audience: ["customers", "partners"],
  primaryGoal: "start-conversation",
  displayFont: "'Arial Narrow', 'Inter Tight', system-ui, sans-serif",
  bodyFont: "Inter, ui-sans-serif, system-ui, sans-serif",
  cornerStyle: "mixed",
  heroComposition: "split",
  cardTreatment: "outline",
  motionLevel: "calm",
  visualSeed: 17,
  motif: "grid",
  experience: {
    navigation: "mega",
    hero: "split",
    sectionRhythm: "alternating",
    gallery: "masonry",
    footer: "mega",
    chatLauncher: "pill",
    motionPrimitives: ["animated-background", "animated-group", "border-trail", "in-view", "magnetic", "marquee", "scroll-progress", "spotlight", "text-effect", "tilt"],
    watermelonComponents: ["announcement", "badge", "bento-grid", "button", "card", "contact-card", "feature-card", "footer", "form", "hero", "logo-cloud", "navigation-menu", "stats-card", "testimonial"],
  },
  customLabels: { work: "Selected work", insights: "Insights", contact: "Start a conversation" },
};
