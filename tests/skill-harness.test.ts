import { execFileSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, test } from "vitest";

const root = process.cwd();
const work = mkdtempSync(path.join(os.tmpdir(), "tenant-skill-harness-"));

afterAll(() => rmSync(work, { recursive: true, force: true }));

describe("Pi skill harness", () => {
  test("loads pinned skills explicitly and records their order", () => {
    const skillRoot = path.join(work, "skills");
    const names = [
      "ui-ux-pro-max",
      "design-taste-frontend",
      "brainstorming",
      "writing-plans",
      "test-driven-development",
      "verification-before-completion",
      "threejs-animation",
    ];
    for (const name of names) {
      mkdirSync(path.join(skillRoot, name), { recursive: true });
      writeFileSync(path.join(skillRoot, name, "SKILL.md"), `# ${name}\n`);
    }

    writeFileSync(path.join(work, "TENANT_AGENT_BRIEF.md"), "# Test brief\n");
    writeFileSync(path.join(work, "tenant-onboarding.json"), JSON.stringify({ ai: { models: ["test/model"], primaryModel: "test/model", thinkingLevel: "high" } }));
    const capture = path.join(work, "pi-args.json");
    const fakePi = path.join(work, "fake-pi.mjs");
    writeFileSync(fakePi, `#!/usr/bin/env node\nimport { writeFileSync } from "node:fs";\nwriteFileSync(process.env.PI_CAPTURE, JSON.stringify(process.argv.slice(2)));\n`);
    chmodSync(fakePi, 0o755);

    execFileSync(process.execPath, [path.join(root, "scripts/ai-refine.mjs"), "--model", "test/model"], {
      cwd: work,
      env: { ...process.env, RISSETS_API_KEY: "test-key", PI_EXECUTABLE: fakePi, PI_CAPTURE: capture, PI_SKILL_ROOTS: skillRoot },
    });

    const args = JSON.parse(readFileSync(capture, "utf8")) as string[];
    const attestation = JSON.parse(readFileSync(path.join(work, "skill-attestation.json"), "utf8"));
    expect(args).toContain("--no-skills");
    expect(args.filter((arg) => arg === "--skill")).toHaveLength(names.length);
    expect(args.join(" ")).toContain("GENERATION_GAP_BRIEF.md");
    expect(args.join(" ")).toContain("before spending time on audit prose");
    expect(attestation.order).toEqual(names);
    expect(attestation.skills.every((skill: { sha256: string }) => skill.sha256.length === 64)).toBe(true);
  });
});
