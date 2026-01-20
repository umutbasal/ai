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
  // Set HOME to test directory so semgrep can write log files
  process.env.HOME = TEST_DIR;
  mkdirSync(join(TEST_DIR, ".semgrep"), { recursive: true });
});

describe("Semgrep Installation", () => {
  test("semgrep should be installed", async () => {
    const result = await $`which semgrep`.quiet();
    expect(result.exitCode).toBe(0);
  });

  test("semgrep should run basic command", async () => {
    const testFile = setupTestFile("py/sample.py");
    const result =
      await $`semgrep --metrics=off -e 'print(...)' --lang python ${testFile}`.quiet();
    expect(result.exitCode).toBe(0);
  });
});

describe("Basic Pattern Matching", () => {
  test("inline pattern - find function calls", async () => {
    const testFile = setupTestFile("py/sample.py");
    const result =
      await $`semgrep --metrics=off -e 'print(...)' --lang python ${testFile}`.text();
    expect(result).toContain("print");
  });

  test("inline pattern - find assignments", async () => {
    const testFile = setupTestFile("py/sample.py");
    const result =
      await $`semgrep --metrics=off -e '$X = $Y' --lang python ${testFile}`.text();
    expect(result).toContain("=");
  });

  test("rule file - basic rule", async () => {
    const testFile = setupTestFile("py/sample.py");
    const ruleFile = join(TEST_DIR, "rule.yml");
    writeTestFile(
      ruleFile,
      `
rules:
  - id: test-rule
    languages:
      - python
    message: Test rule
    pattern: print(...)
    severity: INFO
`,
    );
    const result = await $`semgrep --metrics=off --config ${ruleFile} ${testFile}`.quiet();
    expect(result.exitCode).toBe(0);
  });
});

describe("Language Detection", () => {
  test("Python detection", async () => {
    const testFile = setupTestFile("py/sample.py");
    const ruleFile = join(TEST_DIR, "rule.yml");
    writeTestFile(
      ruleFile,
      `rules:
  - id: test-def
    languages:
      - python
    message: Function definition
    pattern: |
      def $FUNC(...):
        ...
    severity: INFO
`,
    );
    const result =
      await $`semgrep --metrics=off --config ${ruleFile} ${testFile}`.text();
    expect(result).toContain("test-def");
  });

  test("JavaScript detection", async () => {
    const testFile = setupTestFile("js/sample.js");
    const result =
      await $`semgrep --metrics=off -e 'function $FUNC(...)' --lang javascript ${testFile}`.text();
    expect(result).toContain("function");
  });

  test("Go detection", async () => {
    const testFile = setupTestFile("go/sample.go");
    const result =
      await $`semgrep --metrics=off -e 'func $FUNC(...)' --lang go ${testFile}`.text();
    expect(result).toContain("func");
  });
});

describe("Output Formats", () => {
  test("JSON output", async () => {
    const testFile = setupTestFile("py/sample.py");
    const result =
      await $`semgrep --metrics=off -e 'print(...)' --lang python --json ${testFile}`.text();
    const json = JSON.parse(result);
    expect(json.results).toBeDefined();
    expect(Array.isArray(json.results)).toBe(true);
  });

  test("SARIF output", async () => {
    const testFile = setupTestFile("py/sample.py");
    const result =
      await $`semgrep --metrics=off -e 'print(...)' --lang python --sarif ${testFile}`.text();
    const json = JSON.parse(result);
    expect(json.version).toBeDefined();
    expect(json.runs).toBeDefined();
  });
});

describe("Severity Filtering", () => {
  test("filter by severity", async () => {
    const testFile = setupTestFile("py/sample.py");
    const ruleFile = join(TEST_DIR, "rule.yml");
    writeTestFile(
      ruleFile,
      `rules:
  - id: error-rule
    languages:
      - python
    message: Error rule
    pattern: print(...)
    severity: ERROR
  - id: info-rule
    languages:
      - python
    message: Info rule
    pattern: |
      def $FUNC(...):
        ...
    severity: INFO
`,
    );
    const result =
      await $`semgrep --metrics=off --config ${ruleFile} --severity ERROR ${testFile}`.text();
    expect(result).toContain("error-rule");
    expect(result).not.toContain("info-rule");
  });
});
