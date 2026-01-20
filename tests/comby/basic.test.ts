import { describe, test, expect, beforeEach } from "bun:test";
import { $ } from "bun";
import { mkdirSync, copyFileSync, rmSync, readFileSync } from "fs";
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

beforeEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
  mkdirSync(TEST_DIR, { recursive: true });
});

describe("Comby Installation", () => {
  test("comby should be installed", async () => {
    const result = await $`which comby`.quiet();
    expect(result.exitCode).toBe(0);
  });

  test("comby should run basic command", async () => {
    const result = await $`echo 'test' | comby 'test' 'result' -stdin`.text();
    expect(result).toContain("result");
  });
});

describe("Basic Matching and Rewriting", () => {
  test("rename function - preview mode", async () => {
    const testFile = setupTestFile("go/sample.go");
    const result =
      await $`comby 'oldFunc(:[args])' 'newFunc(:[args])' ${testFile}`.text();
    expect(result).toContain("newFunc");
  });

  test("rename function - apply changes", async () => {
    const testFile = setupTestFile("go/sample.go");
    await $`comby 'oldFunc(:[args])' 'newFunc(:[args])' ${testFile} -i`.quiet();
    const content = readTestFile(testFile);
    expect(content).toContain("newFunc");
    expect(content).not.toContain("oldFunc");
  });

  test("rename method call", async () => {
    const testFile = setupTestFile("js/sample.js");
    await $`comby ':[obj].oldMethod(:[args])' ':[obj].newMethod(:[args])' ${testFile} -i`.quiet();
    const content = readTestFile(testFile);
    expect(content).toContain("obj.newMethod");
    expect(content).not.toContain("obj.oldMethod");
  });

  test("diff output", async () => {
    const testFile = setupTestFile("go/sample.go");
    const result =
      await $`comby 'oldFunc(:[args])' 'newFunc(:[args])' ${testFile} -diff`.text();
    expect(result).toContain("-");
    expect(result).toContain("+");
    expect(result).toContain("oldFunc");
    expect(result).toContain("newFunc");
  });
});

describe("Match Holes", () => {
  test(":[hole] - matches everything", async () => {
    const testFile = setupTestFile("js/sample.js");
    await $`comby 'fetch(:[url])' 'fetch(:[url], { timeout: 5000 })' ${testFile} -i`.quiet();
    const content = readTestFile(testFile);
    expect(content).toContain(
      'fetch("https://api.example.com", { timeout: 5000 })',
    );
  });

  test(":[[hole]] - matches identifiers only", async () => {
    const testFile = setupTestFile("py/sample.py");
    await $`comby ':[[var]]' ':[var].lowerCamelCase' ${testFile} -i -matcher .py`.quiet();
    const content = readTestFile(testFile);
    expect(content).toContain("myVariableName");
  });

  test("... - anonymous hole", async () => {
    const testFile = setupTestFile("py/sample.py");
    const result = await $`comby 'func(...)' '' ${testFile} -match-only`.text();
    expect(result).toContain("func(");
  });

  test(":[hole:e] - single expression with stdin", async () => {
    const result =
      await $`echo 'func(a, b)' | comby 'func(:[arg:e], ...)' 'found' .py -stdin -stdout`.text();
    expect(result.trim()).toBe("found");
  });
});

describe("Stdin/Stdout", () => {
  test("pipe input and output", async () => {
    const result =
      await $`echo 'oldFunc(test)' | comby 'oldFunc(:[args])' 'newFunc(:[args])' -stdin -stdout`.text();
    expect(result).toContain("newFunc(test)");
  });

  test("match-only with stdin", async () => {
    const result =
      await $`echo 'printf("hello")' | comby 'printf(:[args])' '' .c -stdin -match-only`.text();
    expect(result).toContain('printf("hello")');
  });

  test("json output with stdin", async () => {
    const result =
      await $`echo 'printf("hello")' | comby 'printf(:[args])' '' .c -stdin -match-only -json-lines`.text();
    const json = JSON.parse(result);
    expect(json.matches).toBeDefined();
    expect(json.matches.length).toBeGreaterThan(0);
    expect(json.matches[0].matched).toContain("printf");
  });
});

describe("Language Detection", () => {
  test("JavaScript detection by extension", async () => {
    const testFile = setupTestFile("js/sample.js");
    const result =
      await $`comby 'function :[name](:[args])' '' ${testFile} -match-only`.text();
    expect(result).toContain("function");
  });

  test("Python detection by extension", async () => {
    const testFile = setupTestFile("py/sample.py");
    const result =
      await $`comby 'def :[name](:[args]):' '' ${testFile} -match-only`.text();
    expect(result).toContain("def ");
  });

  test("Go detection by extension", async () => {
    const testFile = setupTestFile("go/sample.go");
    const result =
      await $`comby 'func :[name](:[args])' '' ${testFile} -match-only`.text();
    expect(result).toContain("func");
  });

  test("Force matcher", async () => {
    const testFile = setupTestFile("js/sample.js");
    const result =
      await $`comby 'console.log(:[args])' '' -matcher .js ${testFile} -match-only`.text();
    expect(result).toContain("console.log");
  });
});

describe("JSON Output", () => {
  test("json-lines output structure", async () => {
    const result =
      await $`echo 'func(a, b)' | comby 'func(:[args])' '' .c -stdin -match-only -json-lines`.text();
    const json = JSON.parse(result);

    expect(json.uri).toBeDefined();
    expect(json.matches).toBeDefined();
    expect(Array.isArray(json.matches)).toBe(true);

    const match = json.matches[0];
    expect(match.matched).toBeDefined();
    expect(match.range).toBeDefined();
    expect(match.environment).toBeDefined();
  });

  test("json output captures holes", async () => {
    const result =
      await $`echo 'oldFunc(test)' | comby 'oldFunc(:[args])' '' .c -stdin -match-only -json-lines`.text();
    const json = JSON.parse(result);

    const env = json.matches[0].environment;
    expect(env.length).toBeGreaterThan(0);
    expect(env[0].variable).toBe("args");
    expect(env[0].value).toBe("test");
  });
});
