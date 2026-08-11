import { spawn } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

function value(name, fallback = "") { const index = process.argv.indexOf(`--${name}`); return index >= 0 ? process.argv[index + 1] : fallback; }
if (!process.env.RISSETS_API_KEY) throw new Error("RISSETS_API_KEY is required. Keep it in the process environment, never in the repository.");
await access(path.resolve("TENANT_AGENT_BRIEF.md"));
const manifest = JSON.parse(await readFile(path.resolve("tenant-onboarding.json"), "utf8"));
const allowedModels = manifest.ai.models;
const model = value("model", manifest.ai.primaryModel);
if (!allowedModels.includes(model)) throw new Error(`Model ${model} is not allowed by tenant-onboarding.json`);
const args = ["--approve", "--provider", "rissets", "--model", model, "--thinking", manifest.ai.thinkingLevel || "high", "--no-session", "-p", "@TENANT_AGENT_BRIEF.md", "Before editing, invoke ui-ux-pro-max, design-taste-frontend, threejs-animation when relevant, and superpowers. Read tenant-onboarding.json, src/generated/tenant-profile.ts, src/generated/design-signature.json, and TENANT_AGENT_BRIEF.md. Research the business category using the dossier and onboarding reference notes. Then materially rewrite the React/Tailwind source so this tenant has a distinct layout, font pairing, palette treatment, hero, visual/USP, testimonial, CTA, navbar, footer, gallery composition, and motion language. Add at least three purposeful animated SVG details with reduced-motion behavior (or a meaningful Three.js scene). Preserve every public API route and both locales. Do not stop at JSON/config changes. Finish by running npm run check, fixing every failure, and writing AI_GENERATION_REPORT.md with changed files, selected patterns, skills used, animation evidence, and route checks."];
const child = spawn("pi", args, { cwd: process.cwd(), env: { ...process.env, PI_CODING_AGENT_DIR: path.resolve(".pi/agent") }, stdio: "inherit", shell: false });
child.on("exit", (code) => process.exit(code ?? 1));
