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
const args = ["--approve", "--provider", "rissets", "--model", model, "--thinking", manifest.ai.thinkingLevel || "high", "--no-session", "-p", "@TENANT_AGENT_BRIEF.md", "Implement the complete tenant-specific frontend now. You may change any presentation code, but preserve the public API and content constraints. Finish by running npm run check and fixing every failure."];
const child = spawn("pi", args, { cwd: process.cwd(), env: { ...process.env, PI_CODING_AGENT_DIR: path.resolve(".pi/agent") }, stdio: "inherit", shell: false });
child.on("exit", (code) => process.exit(code ?? 1));
