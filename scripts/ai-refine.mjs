import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { access, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

function value(name, fallback = "") { const index = process.argv.indexOf(`--${name}`); return index >= 0 ? process.argv[index + 1] : fallback; }
if (!process.env.RISSETS_API_KEY) throw new Error("RISSETS_API_KEY is required. Keep it in the process environment, never in the repository.");
await access(path.resolve("TENANT_AGENT_BRIEF.md"));
const manifest = JSON.parse(await readFile(path.resolve("tenant-onboarding.json"), "utf8"));
const allowedModels = manifest.ai.models;
const model = value("model", manifest.ai.primaryModel);
if (!allowedModels.includes(model)) throw new Error(`Model ${model} is not allowed by tenant-onboarding.json`);
const roots = (process.env.PI_SKILL_ROOTS || `${os.homedir()}/.pi/agent/skills:${os.homedir()}/.agents/skills`).split(":").filter(Boolean);
const required = [
  { name: "ui-ux-pro-max", candidates: ["ui-ux-pro-max/SKILL.md"] },
  { name: "design-taste-frontend", candidates: ["design-taste-frontend/SKILL.md", "taste-skill/SKILL.md"] },
  { name: "brainstorming", candidates: ["brainstorming/SKILL.md"] },
  { name: "writing-plans", candidates: ["writing-plans/SKILL.md"] },
  { name: "test-driven-development", candidates: ["test-driven-development/SKILL.md"] },
  { name: "verification-before-completion", candidates: ["verification-before-completion/SKILL.md"] },
  { name: "threejs-animation", candidates: ["threejs-animation/SKILL.md"] },
];
const loadedSkills = [];
for (const skill of required) {
  let selected = "";
  for (const root of roots) {
    for (const candidate of skill.candidates) {
      const file = path.resolve(root, candidate);
      try { await access(file); selected = file; break; } catch { /* keep looking */ }
    }
    if (selected) break;
  }
  if (!selected) throw new Error(`Mandatory Pi skill is missing: ${skill.name}`);
  const contents = await readFile(selected);
  loadedSkills.push({ name: skill.name, path: selected, sha256: createHash("sha256").update(contents).digest("hex") });
}
await writeFile(path.resolve("skill-attestation.json"), `${JSON.stringify({ version: "3.0", generatedBy: "ai-refine-harness", order: loadedSkills.map((skill) => skill.name), skills: loadedSkills }, null, 2)}\n`);
const skillArgs = loadedSkills.flatMap((skill) => ["--skill", skill.path]);
const generationPrompt = [
  "This autonomous production generation was explicitly approved by the tenant owner at onboarding submission; DESIGN_APPROVAL.md records that approval. Do not pause or ask for another design choice.",
  "Follow the explicitly loaded skills in order. UI UX Pro Max is the first design authority. Taste writes TASTE_AUDIT.md. Planning writes IMPLEMENTATION_PLAN.md before edits. threejs-animation writes MOTION_DECISION.json.",
  "Read DESIGN_APPROVAL.md, tenant-onboarding.json, research-dossier.json, design-direction.json, src/generated/tenant-profile.ts, and TENANT_AGENT_BRIEF.md. Treat src/generated/** as immutable.",
  "If GENERATION_GAP_BRIEF.md exists, read it first and fix every named tenant surface before producing reports or running checks. The deterministic worker, not prose, decides whether the rewrite is sufficient.",
  "If QUALITY_REPAIR_BRIEF.md exists, this is a repair pass: preserve the approved art direction, fix every recorded lint/type/test/build failure, run npm run check again, and do not report completion while any gate fails.",
  "The generic template is a data and deployment kernel, not a visual theme. You own the complete render boundary in src/tenant/presentation.tsx, src/tenant/cms-renderer.tsx, src/tenant/site-header.tsx, and src/tenant/site-footer.tsx. Materially rewrite every one of those files before spending time on audit prose. Importing the shared generic CMS/header/footer implementations fails.",
  "Start from the business category, audience, conversion goal, uploaded media roles, and research layout contract. Choose a unique page shell, section order, hero geometry, display/body font pairing, heading treatment, spacing rhythm, image crop language, navigation behavior, proof system, testimonial form, CTA placement, gallery topology, and footer composition.",
  "Do not preserve the template's default two-column section header, equal card grid, shared clamp scale, shared max width, or repeated rounded-card composition unless the business research explicitly justifies that individual choice. A palette swap, label change, wrapper, or extra SVG is not a redesign.",
  "Use the generated next/font variables; visibly differentiate display and body typography. All normal text must meet WCAG AA contrast, large text at least 3:1, controls must retain visible focus, and motion must have a prefers-reduced-motion path.",
  "Implement at least three purposeful reduced-motion-safe SVG or Motion systems; use a lazy Three.js scene only when it explains the business. Preserve every public API route, every CMS block type, media, forms, active channel behavior, and both locales.",
  "Run npm run check and repair failures. Write AI_GENERATION_REPORT.md, generation-report.json, VISUAL_DIVERGENCE_REPORT.json, and CONTRAST_AUDIT.json. The divergence report must enumerate hero/nav/heading/section-order/image/CTA/footer geometry and why each follows onboarding data.",
].join("\n\n");
const args = ["--approve", "--no-skills", ...skillArgs, "--provider", "rissets", "--model", model, "--thinking", manifest.ai.thinkingLevel || "high", "--no-session", "-p", "@TENANT_AGENT_BRIEF.md", generationPrompt];
const child = spawn(process.env.PI_EXECUTABLE || "pi", args, { cwd: process.cwd(), env: { ...process.env, PI_CODING_AGENT_DIR: path.resolve(".pi/agent") }, stdio: "inherit", shell: false });
child.on("exit", (code) => process.exit(code ?? 1));
