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

describe("Equality Rules", () => {
  test("where :[x] == :[y] - match equal values", async () => {
    const testFile = setupTestFile("c/sample.c");
    const result = await $`comby 'if (:[x] == :[y])' '' -rule 'where :[x] == :[y]' ${testFile} -match-only`.text();
    expect(result).toContain("if (x == x)");
  });

  test("where :[x] != :[y] - match different values", async () => {
    const testFile = setupTestFile("c/sample.c");
    const result = await $`comby 'if (:[x] == :[y])' '' -rule 'where :[x] != :[y]' ${testFile} -match-only`.text();
    expect(result).toContain("if (a == b)");
  });

  test("compare to literal string", async () => {
    const testFile = setupTestFile("js/sample.js");
    const result = await $`comby 'log(":[level]", ":[msg]")' '' -rule 'where :[level] == "ERROR"' ${testFile} -match-only`.text();
    expect(result).toContain('"ERROR"');
    expect(result).not.toContain('"INFO"');
  });

  test("exclude specific values", async () => {
    const testFile = setupTestFile("py/sample.py");
    const result = await $`comby 'from old_module import :[name]' 'from new_module import :[name]' -rule 'where :[name] != "excluded"' ${testFile} -i`.quiet();
    const content = readTestFile(testFile);
    expect(content).toContain("from new_module import");
  });
});

describe("Pattern Matching Rules", () => {
  test("match specific pattern", async () => {
    const testFile = setupTestFile("go/sample.go");
    const result = await $`comby 'func_call(":[arg]")' '' -rule 'where match :[arg] { | "error" -> true }' ${testFile} -match-only`.text();
    expect(result).toContain('"error"');
  });

  test("match test functions using identifier hole with grep", async () => {
    const testFile = setupTestFile("py/sample.py");
    const result = await $`comby 'def :[[name]]():' '' ${testFile} -match-only`.text();
    const testFuncs = result.split('\n').filter(line => line.includes('test_'));
    expect(testFuncs.length).toBeGreaterThan(0);
    expect(result).toContain("test_function");
    expect(result).toContain("test_login");
  });
});

describe("Rules with Rewriting", () => {
  test("conditional rewrite based on rule", async () => {
    const testFile = setupTestFile("js/sample.js");
    await $`comby 'log(":[level]", ":[msg]")' 'logger(":[level]", ":[msg]")' -rule 'where :[level] == "ERROR"' ${testFile} -i`.quiet();
    const content = readTestFile(testFile);
    expect(content).toContain('logger("ERROR"');
    expect(content).toContain('log("INFO"');
  });

  test("selective function renaming", async () => {
    const testFile = setupTestFile("go/sample.go");
    await $`comby 'func_call(":[arg]")' 'new_func_call(":[arg]")' -rule 'where match :[arg] { | "error" -> true }' ${testFile} -i`.quiet();
    const content = readTestFile(testFile);
    expect(content).toContain('new_func_call("error")');
  });
});

describe("Duplicate Detection", () => {
  test("find self-assignment", async () => {
    const result = await $`echo 'x = x' | comby ':[var] = :[val]' '' -rule 'where :[var] == :[val]' .py -stdin -match-only`.text();
    expect(result).toContain("x = x");
  });

  test("find duplicate conditions", async () => {
    const testFile = setupTestFile("c/sample.c");
    const result = await $`comby 'if (:[x] == :[x])' '' ${testFile} -match-only`.text();
    expect(result).toContain("if (x == x)");
  });

  test("find duplicate boolean checks", async () => {
    const result = await $`echo 'if (foo && foo)' | comby 'if (:[x] && :[x])' '' .c -stdin -match-only`.text();
    expect(result).toContain("if (foo && foo)");
  });
});
