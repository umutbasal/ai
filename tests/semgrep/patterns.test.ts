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

describe("Metavariables", () => {
  test("expression metavariables", async () => {
    const testFile = setupTestFile("py/sample.py");
    const result =
      await $`semgrep --metrics=off -e '$X + $Y' --lang python ${testFile}`.text();
    expect(result).toContain("+");
  });

  test("reoccurring metavariables", async () => {
    const testFile = setupTestFile("py/sample.py");
    const ruleFile = join(TEST_DIR, "rule.yml");
    writeTestFile(
      ruleFile,
      `
rules:
  - id: useless-assignment
    languages:
      - python
    patterns:
      - pattern: $X = $Y
      - pattern: $X = $Z
    message: Useless assignment
    severity: INFO
`,
    );
    const result = await $`semgrep --metrics=off --config ${ruleFile} ${testFile}`.text();
    expect(result).toContain("useless-assignment");
  });
});

describe("Ellipsis Operator", () => {
  test("function calls with any arguments", async () => {
    const testFile = setupTestFile("py/sample.py");
    const result =
      await $`semgrep --metrics=off -e 'print(...)' --lang python ${testFile}`.text();
    expect(result).toContain("print");
  });

  test("function calls with specific first argument", async () => {
    const testFile = setupTestFile("py/sample.py");
    const result =
      await $`semgrep --metrics=off -e 'func(1, ...)' --lang python ${testFile}`.text();
    expect(result).toContain("func");
  });

  test("keyword arguments anywhere", async () => {
    const testFile = setupTestFile("py/sample.py");
    const result =
      await $`semgrep --metrics=off -e 'requests.get(..., verify=False, ...)' --lang python ${testFile}`.text();
    expect(result).toContain("requests.get");
  });
});

describe("Pattern Composition", () => {
  test("pattern-either", async () => {
    const ruleFile = join(TEST_DIR, "rule.yml");
    writeTestFile(
      ruleFile,
      `
rules:
  - id: dangerous-eval
    languages:
      - javascript
    patterns:
      - pattern-either:
          - pattern: eval(...)
          - pattern: Function(...)
    message: Dangerous use of eval
    severity: ERROR
`,
    );
    const testFile = setupTestFile("js/sample.js");
    const result = await $`semgrep --metrics=off --config ${ruleFile} ${testFile}`.text();
    expect(result).toContain("dangerous-eval");
  });

  test("pattern-not", async () => {
    const ruleFile = join(TEST_DIR, "rule.yml");
    writeTestFile(
      ruleFile,
      `
rules:
  - id: unsafe-eval
    languages:
      - javascript
    patterns:
      - pattern: eval(...)
      - pattern-not: safe_eval(...)
    message: Unsafe eval
    severity: ERROR
`,
    );
    const testFile = setupTestFile("js/sample.js");
    const result = await $`semgrep --metrics=off --config ${ruleFile} ${testFile}`.text();
    expect(result).toContain("unsafe-eval");
  });

  test("pattern-inside", async () => {
    const ruleFile = join(TEST_DIR, "rule.yml");
    writeTestFile(
      ruleFile,
      `
rules:
  - id: dangerous-inside-function
    languages:
      - python
    patterns:
      - pattern-inside: |
          def $FUNC(...):
            ...
      - pattern: dangerous_call(...)
    message: Dangerous call inside function
    severity: WARNING
`,
    );
    const testFile = setupTestFile("py/sample.py");
    const result = await $`semgrep --metrics=off --config ${ruleFile} ${testFile}`.text();
    expect(result).toContain("dangerous-inside-function");
  });
});

describe("Common Security Patterns", () => {
  test("hardcoded password", async () => {
    const testFile = setupTestFile("py/sample.py");
    const result =
      await $`semgrep --metrics=off -e 'password = "..."' --lang python ${testFile}`.text();
    expect(result).toContain("password");
  });

  test("SQL injection risk", async () => {
    const testFile = setupTestFile("py/sample.py");
    const result =
      await $`semgrep --metrics=off -e 'query(...)' --lang python ${testFile}`.text();
    expect(result).toContain("query");
  });
});

describe("Code Quality Patterns", () => {
  test("debug print statements", async () => {
    const testFile = setupTestFile("py/sample.py");
    const result =
      await $`semgrep --metrics=off -e 'print(...)' --lang python ${testFile}`.text();
    expect(result).toContain("print");
  });

  test("empty except block", async () => {
    const ruleFile = join(TEST_DIR, "rule.yml");
    writeTestFile(
      ruleFile,
      `rules:
  - id: empty-except
    languages:
      - python
    message: Empty except block
    pattern: |
      try:
        ...
      except:
        pass
    severity: WARNING
`,
    );
    const testFile = setupTestFile("py/sample.py");
    const result = await $`semgrep --metrics=off --config ${ruleFile} ${testFile}`.text();
    expect(result).toContain("empty-except");
  });
});
