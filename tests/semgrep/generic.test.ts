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

describe("Generic Pattern Matching", () => {
  test("basic generic pattern", async () => {
    const testFile = setupTestFile("generic/config.conf");
    const result =
      await $`semgrep --metrics=off -e 'password = ...' --lang generic ${testFile}`.text();
    expect(result).toContain("password");
  });

  test("generic pattern with metavariables", async () => {
    const testFile = setupTestFile("generic/config.conf");
    const result =
      await $`semgrep --metrics=off -e 'password = $PASSWORD' --lang generic ${testFile}`.text();
    expect(result).toContain("password");
  });
});

describe("Configuration File Patterns", () => {
  test("nginx proxy pattern", async () => {
    const ruleFile = join(TEST_DIR, "rule.yml");
    writeTestFile(
      ruleFile,
      `
rules:
  - id: dynamic-proxy
    pattern: proxy_pass $SCHEME://...;
    paths:
      include:
        - "*.conf"
    languages:
      - generic
    severity: MEDIUM
    message: Dynamic proxy scheme
`,
    );
    const testFile = setupTestFile("generic/nginx.conf");
    const result = await $`semgrep --metrics=off --config ${ruleFile} ${testFile}`.text();
    expect(result).toContain("dynamic-proxy");
  });

  test("dockerfile pattern", async () => {
    const ruleFile = join(TEST_DIR, "rule.yml");
    writeTestFile(
      ruleFile,
      `
rules:
  - id: root-user
    pattern: |
      USER root
    languages:
      - generic
    severity: WARNING
    message: Running as root
`,
    );
    const testFile = setupTestFile("generic/Dockerfile");
    const result = await $`semgrep --metrics=off --config ${ruleFile} ${testFile}`.text();
    expect(result).toContain("root-user");
  });
});

describe("Generic Ellipsis Options", () => {
  test("generic_ellipsis_max_span", async () => {
    const ruleFile = join(TEST_DIR, "rule.yml");
    writeTestFile(
      ruleFile,
      `
rules:
  - id: password-config
    pattern: |
      password = $...PASSWORD
    options:
      generic_ellipsis_max_span: 0
    message: Password found
    languages:
      - generic
    severity: WARNING
`,
    );
    const testFile = setupTestFile("generic/config.conf");
    const result = await $`semgrep --metrics=off --config ${ruleFile} ${testFile}`.text();
    expect(result).toContain("password-config");
  });
});

describe("Comment Handling", () => {
  test("generic_comment_style", async () => {
    const ruleFile = join(TEST_DIR, "rule.yml");
    writeTestFile(
      ruleFile,
      `
rules:
  - id: css-color
    pattern: |
      color: blue
    options:
      generic_comment_style: c
    message: Blue color
    languages:
      - generic
    severity: INFO
`,
    );
    const testFile = setupTestFile("generic/style.css");
    const result = await $`semgrep --metrics=off --config ${ruleFile} ${testFile}`.text();
    expect(result).toContain("css-color");
  });
});
