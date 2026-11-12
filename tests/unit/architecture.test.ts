/**
 * The code-quality rules of this project, checked on every run (plan.md, section 8c).
 * Each rule reads the source files as text, so a broken rule fails the build
 * with the file named.
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = resolve(import.meta.dirname, "../..");
const MAX_LINES = 650;

function walk(dir: string): string[] {
  return readdirSync(join(ROOT, dir), { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walk(path);
    return /\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

const files = [...walk("src"), ...walk("app")].map((path) => {
  const text = readFileSync(join(ROOT, path), "utf8");
  const imports = [...text.matchAll(/(?:from|import)\s+"([^"]+)"/g)].map(([, spec]) =>
    spec!.startsWith(".") ? relative(ROOT, resolve(ROOT, dirname(path), spec!)) : spec!,
  );
  return { path, text, imports };
});

/** Files under `dir` that import something matching `banned`. */
function offenders(dir: string, banned: (spec: string) => boolean): string[] {
  return files
    .filter((file) => file.path.startsWith(dir))
    .flatMap((file) => file.imports.filter(banned).map((spec) => `${file.path} imports ${spec}`));
}

const isPackage = (spec: string) => !spec.startsWith("src/") && !spec.startsWith("app/");
const inside = (...dirs: string[]) => (spec: string) => dirs.some((dir) => spec.startsWith(dir));
const not = (allowed: (spec: string) => boolean) => (spec: string) => !allowed(spec);

describe("layers", () => {
  it("finds the source files", () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it("the engine is pure: it imports nothing outside itself", () => {
    expect(offenders("src/engine/", not(inside("src/engine/")))).toEqual([]);
  });

  it("content is data: it imports only content, engine types and zod", () => {
    const allowed = (spec: string) => spec === "zod" || inside("src/content/", "src/engine/")(spec);
    expect(offenders("src/content/", not(allowed))).toEqual([]);
  });

  it("the sound cues are pure: they import only the engine", () => {
    expect(offenders("src/audio/cues.ts", not(inside("src/engine/")))).toEqual([]);
  });

  it("drawings do not know the game: they import only React, styles and engine types", () => {
    const allowed = (spec: string) =>
      spec === "react" || inside("src/design/", "src/engine/types")(spec);
    expect(offenders("src/design/", not(allowed))).toEqual([]);
  });

  it("nothing below the screen imports the screen", () => {
    const lower = ["src/engine/", "src/content/", "src/audio/", "src/design/", "src/judge/"];
    expect(lower.flatMap((dir) => offenders(dir, inside("src/ui/", "app/")))).toEqual([]);
  });

  it("the judge stays on the server: the browser code never imports it or the model SDK", () => {
    const browser = ["src/ui/", "src/design/", "src/audio/", "src/engine/", "src/content/"];
    const banned = (spec: string) => spec.startsWith("src/judge/") || spec.startsWith("@anthropic-ai/");
    expect(browser.flatMap((dir) => offenders(dir, banned))).toEqual([]);
  });

  it("only known packages are imported", () => {
    const known = ["react", "next", "zod", "@anthropic-ai/sdk"];
    const unknown = (spec: string) =>
      isPackage(spec) && !known.some((name) => spec === name || spec.startsWith(`${name}/`));
    expect(offenders("", unknown)).toEqual([]);
  });
});

describe("promises of the spec", () => {
  const using = (pattern: RegExp, where: (path: string) => boolean = () => true) =>
    files.filter((file) => where(file.path) && pattern.test(file.text)).map((file) => file.path);

  it("nothing is stored in the browser", () => {
    expect(using(/localStorage|sessionStorage|indexedDB|document\.cookie/)).toEqual([]);
  });

  it("secrets are read only on the server", () => {
    const server = (path: string) => path.startsWith("app/api/") || path.startsWith("src/judge/");
    expect(using(/process\.env/, (path) => !server(path))).toEqual([]);
  });

  it("no key is written into the code", () => {
    expect(using(/sk-ant-|api[_-]?key\s*[:=]\s*["'`]\w/i)).toEqual([]);
  });
});

describe("code hygiene", () => {
  const using = (pattern: RegExp) =>
    files.filter((file) => pattern.test(file.text)).map((file) => file.path);

  it("no type checks are switched off", () => {
    expect(using(/@ts-ignore|@ts-expect-error|@ts-nocheck|eslint-disable|\bas any\b|:\s*any\b/)).toEqual([]);
  });

  it("no debug output or unfinished work is left in", () => {
    expect(using(/console\.(log|debug)|debugger;|\b(TODO|FIXME|XXX)\b/)).toEqual([]);
  });

  it(`no file is longer than ${MAX_LINES} lines`, () => {
    const long = files
      .map((file) => ({ path: file.path, lines: file.text.split("\n").length }))
      .filter((file) => file.lines > MAX_LINES)
      .map((file) => `${file.path} (${file.lines} lines)`);
    expect(long).toEqual([]);
  });
});
