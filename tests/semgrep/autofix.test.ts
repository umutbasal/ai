import { describe, test, expect, beforeEach } from "bun:test";
import { $ } from "bun";
import {
  mkdirSync,
  copyFileSync,
  rmSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { join } from "path";

const TEST_DIR = join(import.meta.dir, "temp");
const TESTDATA_DIR = join(import.meta.dir, "testdata");

function setupTestFile(sourceFile: string): string {
  const filename = sourceFile.split("/").pop()!;
  const destPath = join(TEST_DIR, filename);
  copyFileSync(join(TESTDATA_DIR, sourceFile), destPath);
  return destPath;
}

function readTestFile(path: string): string {
  return readFileSync(path, "utf-8");
}

function writeTestFile(path: string, content: string): void {
  writeFileSync(path, content, "utf-8");
}

beforeEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
  mkdirSync(TEST_DIR, { recursive: true });
  // Set HOME to test directory so semgrep --metrics=off can write log files
  process.env.HOME = TEST_DIR;
  mkdirSync(join(TEST_DIR, ".semgrep"), { recursive: true });
});

describe("Basic Autofix", () => {
  test("autofix with metavariables", async () => {
    const testFile = setupTestFile("py/sample.py");
    const ruleFile = join(TEST_DIR, "rule.yml");
    writeTestFile(
      ruleFile,
      `
rules:
  - id: use-sys-exit
    languages:
      - python
    message: Use sys.exit
    pattern: exit($X)
    fix: sys.exit($X)
    severity: MEDIUM
`,
    );
    await $`semgrep --metrics=off --config ${ruleFile} --autofix ${testFile}`.quiet();
    const content = readTestFile(testFile);
    expect(content).toContain("sys.exit");
  });

  test("autofix dry run", async () => {
    const testFile = setupTestFile("py/sample.py");
    const ruleFile = join(TEST_DIR, "rule.yml");
    writeTestFile(
      ruleFile,
      `
rules:
  - id: use-sys-exit
    languages:
      - python
    message: Use sys.exit
    pattern: exit($X)
    fix: sys.exit($X)
    severity: MEDIUM
`,
    );
    const result =
      await $`semgrep --metrics=off --config ${ruleFile} --autofix --dryrun ${testFile}`.text();
    expect(result).toContain("sys.exit");
  });
});

describe("Remove Code with Autofix", () => {
  test("remove debug print", async () => {
    const testFile = setupTestFile("py/sample.py");
    const ruleFile = join(TEST_DIR, "rule.yml");
    writeTestFile(
      ruleFile,
      `
rules:
  - id: remove-print
    languages:
      - python
    message: Remove debug print
    pattern: print(...)
    fix: ""
    severity: INFO
`,
    );
    await $`semgrep --metrics=off --config ${ruleFile} --autofix ${testFile}`.quiet();
    const content = readTestFile(testFile);
    expect(content).not.toContain("print(");
  });
});

describe("Fix-Regex", () => {
  test("fix-regex with replacement", async () => {
    const testFile = setupTestFile("py/sample.py");
    const ruleFile = join(TEST_DIR, "rule.yml");
    writeTestFile(
      ruleFile,
      `
rules:
  - id: add-timeout
    languages:
      - python
    patterns:
      - pattern-not: requests.$W(..., timeout=$N, ...)
      - pattern: requests.get(...)
    fix-regex:
      regex: '(.*)\\)'
      replacement: '\\1, timeout=30)'
    message: Add timeout
    severity: MEDIUM
`,
    );
    await $`semgrep --metrics=off --config ${ruleFile} --autofix ${testFile}`.quiet();
    const content = readTestFile(testFile);
    expect(content).toContain("timeout=30");
  });
});

describe("Autofix with Multiple Patterns", () => {
  test("autofix with pattern-either", async () => {
    const testFile = setupTestFile("py/sample.py");
    const ruleFile = join(TEST_DIR, "rule.yml");
    writeTestFile(
      ruleFile,
      `rules:
  - id: fix-multiple
    languages:
      - python
    patterns:
      - pattern-either:
          - pattern: old_func($X)
          - pattern: old_func2($X)
    fix: new_func($X)
    message: Fix function calls
    severity: INFO
`,
    );
    await $`semgrep --metrics=off --config ${ruleFile} --autofix ${testFile}`.quiet();
    const content = readTestFile(testFile);
    expect(content).toContain("new_func");
  });
});
