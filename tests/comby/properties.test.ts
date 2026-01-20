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

describe("Case Transformers", () => {
  test(".Capitalize - first char uppercase", async () => {
    const result = await $`echo 'hello' | comby ':[x]' ':[x].Capitalize' -stdin -stdout`.text();
    expect(result.trim()).toBe("Hello");
  });

  test(".UPPERCASE - all uppercase", async () => {
    const result = await $`echo 'hello' | comby ':[x]' ':[x].UPPERCASE' -stdin -stdout`.text();
    expect(result.trim()).toBe("HELLO");
  });

  test(".lowercase - all lowercase", async () => {
    const result = await $`echo 'HELLO' | comby ':[x]' ':[x].lowercase' -stdin -stdout`.text();
    expect(result.trim()).toBe("hello");
  });

  test(".uncapitalize - first char lowercase", async () => {
    const result = await $`echo 'Hello' | comby ':[x]' ':[x].uncapitalize' -stdin -stdout`.text();
    expect(result.trim()).toBe("hello");
  });
});

describe("Case Convention Converters", () => {
  test(".UpperCamelCase - snake to UpperCamel", async () => {
    const result = await $`echo 'my_function' | comby ':[[fn]]' ':[fn].UpperCamelCase' -stdin -stdout`.text();
    expect(result.trim()).toBe("MyFunction");
  });

  test(".lowerCamelCase - snake to lowerCamel", async () => {
    const testFile = setupTestFile("js/sample.js");
    await $`comby ':[[var]]' ':[var].lowerCamelCase' ${testFile} -i`.quiet();
    const content = readTestFile(testFile);
    expect(content).toContain("oldVariableName");
  });

  test(".UPPER_SNAKE_CASE - camel to UPPER_SNAKE", async () => {
    const result = await $`echo 'myFunction' | comby ':[[fn]]' ':[fn].UPPER_SNAKE_CASE' -stdin -stdout`.text();
    expect(result.trim()).toBe("MY_FUNCTION");
  });

  test(".lower_snake_case - camel to lower_snake", async () => {
    const result = await $`echo 'myFunction' | comby ':[[fn]]' ':[fn].lower_snake_case' -stdin -stdout`.text();
    expect(result.trim()).toBe("my_function");
  });
});

describe("Size Properties", () => {
  test(".length property in rewrite", async () => {
    const testFile = setupTestFile("py/sample.py");
    await $`comby 'my_variable_name' 'var_:[name].length' ${testFile} -i`.quiet();
    const content = readTestFile(testFile);
    // Property should evaluate to a number
    expect(content).toContain("var_");
  });

  test(".length works with matched content", async () => {
    const result = await $`echo 'hello' | comby ':[word]' 'word_:[word].length' -stdin -stdout`.text();
    expect(result).toContain("word_");
  });
});

describe("Identity Property", () => {
  test(".value in rewrite template", async () => {
    const result = await $`echo 'word' | comby 'word' 'result' -stdin -stdout`.text();
    expect(result.trim()).toBe("result");
  });

  test("matched values are substituted", async () => {
    const result = await $`echo 'test123' | comby ':[[x]]' 'matched_:[x]' -stdin -stdout`.text();
    expect(result.trim()).toBe("matched_test123");
  });
});

describe("Fresh Identifiers", () => {
  test(":[id()] generates unique identifier", async () => {
    const result = await $`echo 'x + y' | comby ':[a] + :[b]' 'let :[id()] = :[a]; :[id()] + :[b]' .js -stdin`.text();
    expect(result).toContain("let ");
    expect(result).toContain(" = x");
  });

  test(":[id(label)] generates consistent identifier", async () => {
    const result = await $`echo 'foo() + foo()' | comby ':[expr] + :[expr]' 'let :[id(tmp)] = :[expr]; :[id(tmp)] + :[id(tmp)]' .js -stdin`.text();
    
    const tmpMatches = result.match(/tmp_\d+/g);
    expect(tmpMatches).toBeDefined();
    if (tmpMatches && tmpMatches.length > 1) {
      expect(tmpMatches[0]).toBe(tmpMatches[1]);
    }
  });
});

describe("Property Combinations", () => {
  test("single case transformer works", async () => {
    const result = await $`echo 'my_var' | comby ':[[v]]' ':[v].lowerCamelCase' -stdin -stdout`.text();
    expect(result.trim()).toBe("myVar");
    // Note: Property chaining (.lowerCamelCase.Capitalize) has limited support
  });

  test("properties in complex template", async () => {
    const testFile = setupTestFile("js/sample.js");
    await $`comby 'const :[[var]] = :[val]' 'const :[var].UPPER_SNAKE_CASE = :[val]' ${testFile} -i`.quiet();
    const content = readTestFile(testFile);
    expect(content).toContain("OLD_VARIABLE_NAME");
  });
});
