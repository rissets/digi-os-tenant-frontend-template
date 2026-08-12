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
const args = ["--approve", "--no-skills", ...skillArgs, "--provider", "rissets", "--model", model, "--thinking", manifest.ai.thinkingLevel || "high", "--no-session", "-p", "@TENANT_AGENT_BRIEF.md", "This autonomous production generation was explicitly approved by the tenant owner at onboarding submission; DESIGN_APPROVAL.md records that approval. Do not pause, ask a question, or wait for another design choice. Select the strongest recommended direction and complete all phases in this same run. Follow the explicitly loaded skills in order. UI UX Pro Max must determine the initial category-specific design system, Taste must produce TASTE_AUDIT.md, Superpowers must produce IMPLEMENTATION_PLAN.md before edits, and threejs-animation must produce MOTION_DECISION.json. Read DESIGN_APPROVAL.md, tenant-onboarding.json, research-dossier.json, design-direction.json, src/generated/tenant-profile.ts, and TENANT_AGENT_BRIEF.md. The complete src/generated/** tree is immutable and will be restored byte-for-byte by the harness; never edit it. Materially rewrite src/tenant/** plus supporting React/Tailwind source so navigation, hero, proof/USP, testimonials, CTA, gallery, collection/detail pages, footer, typography, image language, responsive structure, and motion match this business and are unlike a shared template. Add three purposeful reduced-motion-safe SVG systems or a justified lazy Three.js scene. Preserve every public API route and both locales. Run npm run check, fix failures, and write AI_GENERATION_REPORT.md plus generation-report.json. JSON/config-only, palette-only, and edits outside the tenant presentation boundary fail."];
const child = spawn(process.env.PI_EXECUTABLE || "pi", args, { cwd: process.cwd(), env: { ...process.env, PI_CODING_AGENT_DIR: path.resolve(".pi/agent") }, stdio: "inherit", shell: false });
child.on("exit", (code) => process.exit(code ?? 1));
