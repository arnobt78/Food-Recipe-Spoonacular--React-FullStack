/**
 * TC-0026 — REQ-0025 / CR-0004 / ART-0011
 *
 * Vercel Framework Settings stay on Next.js auto-detect (same as library-managment):
 * do not pin buildCommand, devCommand, installCommand, framework, or outputDirectory
 * in vercel.json — those keys mark the dashboard as Overridden and can disagree
 * with the last production deploy.
 *
 * Node 24.x is pinned in package.json engines so Vercel cannot keep Node 20
 * after the 2026-10-01 EOL cutoff (engines override the dashboard Node setting).
 *
 * Do not add a `$comment` (or other extra) key to vercel.json: Vercel schema
 * rejects unknown properties and would fail the deploy.
 *
 * Security headers remain for REQ-0017 (also set in next.config.js).
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function readJson(relativePath: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(root, relativePath), "utf8")) as Record<
    string,
    unknown
  >;
}

describe("Vercel Next.js defaults + Node 24 (REQ-0025)", () => {
  it("vercel.json does not pin framework command or output keys", () => {
    const vercel = readJson("vercel.json");
    for (const key of [
      "buildCommand",
      "devCommand",
      "installCommand",
      "framework",
      "outputDirectory",
    ]) {
      expect(vercel, key).not.toHaveProperty(key);
    }
  });

  it("vercel.json still ships REQ-0017 security and static-asset headers", () => {
    const vercel = readJson("vercel.json");
    const headers = vercel.headers as Array<{ source: string }> | undefined;
    expect(Array.isArray(headers)).toBe(true);
    expect(headers!.some((h) => h.source === "/_next/static/(.*)")).toBe(true);
    expect(headers!.some((h) => h.source === "/(.*)")).toBe(true);
  });

  it("package.json engines.node is 24.x so Vercel cannot stay on Node 20", () => {
    const pkg = readJson("package.json");
    const engines = pkg.engines as { node?: string } | undefined;
    expect(engines?.node).toBe("24.x");
  });
});
