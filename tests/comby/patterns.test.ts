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

beforeEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
  mkdirSync(TEST_DIR, { recursive: true });
});

describe("Function Refactoring", () => {
  test("rename function", async () => {
    const testFile = setupTestFile("go/sample.go");
    await $`comby 'oldFunc(:[args])' 'newFunc(:[args])' ${testFile} -i`.quiet();
    const content = readTestFile(testFile);
    expect(content).toContain("newFunc");
    expect(content).not.toContain("oldFunc(");
  });

  test("swap function arguments", async () => {
    const result =
      await $`echo 'swap(a, b)' | comby 'swap(:[a], :[b])' 'swap(:[b], :[a])' .go -stdin -stdout`.text();
    expect(result.trim()).toBe("swap(b, a)");
  });

  test("add parameter to function", async () => {
    const testFile = setupTestFile("js/sample.js");
    await $`comby 'fetch(:[url])' 'fetch(:[url], { timeout: 5000 })' ${testFile} -i`.quiet();
    const content = readTestFile(testFile);
    expect(content).toContain("timeout: 5000");
  });

  test("reorder parameters", async () => {
    const testFile = setupTestFile("py/sample.py");
    await $`comby 'func(:[a], :[b])' 'func(:[b], :[a])' ${testFile} -i`.quiet();
    const content = readTestFile(testFile);
    expect(content).toContain("func(2, 1)");
  });
});

describe("API Migration", () => {
  test("update deprecated API", async () => {
    const testFile = setupTestFile("js/sample.js");
    await $`comby 'oldAPI.call(:[args])' 'newAPI.execute(:[args])' ${testFile} -i`.quiet();
    const content = readTestFile(testFile);
    expect(content).toContain("newAPI.execute");
    expect(content).not.toContain("oldAPI.call");
  });

  test("method chaining change", async () => {
    const result =
      await $`echo 'obj.old(x).chain(y)' | comby ':[obj].old(:[x]).chain(:[y])' ':[obj].new(:[x], :[y])' .js -stdin -stdout`.text();
    expect(result.trim()).toBe("obj.new(x, y)");
  });

  test("update import statements", async () => {
    const testFile = setupTestFile("py/sample.py");
    await $`comby 'from old_module import :[name]' 'from new_module import :[name]' ${testFile} -i`.quiet();
    const content = readTestFile(testFile);
    expect(content).toContain("from new_module import");
    expect(content).not.toContain("from old_module import");
  });
});

describe("Code Cleanup", () => {
  test("remove console.log", async () => {
    const testFile = setupTestFile("js/sample.js");
    await $`comby 'console.log(:[args])' '' ${testFile} -i`.quiet();
    const content = readTestFile(testFile);
    expect(content).not.toContain("console.log");
  });

  test("remove dbg! macro", async () => {
    const testFile = setupTestFile("rs/sample.rs");
    await $`comby 'dbg!(:[expr])' ':[expr]' ${testFile} -i`.quiet();
    const content = readTestFile(testFile);
    expect(content).not.toContain("dbg!");
  });

  test("remove print statements", async () => {
    const testFile = setupTestFile("py/sample.py");
    await $`comby 'print(:[args])' '' ${testFile} -i`.quiet();
    const content = readTestFile(testFile);
    expect(content).not.toContain('print("debug")');
  });

  test("unwrap to question mark", async () => {
    const testFile = setupTestFile("rs/sample.rs");
    await $`comby '.unwrap()' '?' ${testFile} -i`.quiet();
    const content = readTestFile(testFile);
    expect(content).toContain("value?");
    expect(content).not.toContain("unwrap()");
  });

  test("println to info macro", async () => {
    const testFile = setupTestFile("rs/sample.rs");
    await $`comby 'println!(:[args])' 'info!(:[args])' ${testFile} -i`.quiet();
    const content = readTestFile(testFile);
    expect(content).toContain("info!");
    expect(content).not.toContain("println!");
  });
});

describe("Naming Conventions", () => {
  test("snake_case to camelCase", async () => {
    const testFile = setupTestFile("js/sample.js");
    await $`comby 'const :[[var]] = :[val]' 'const :[var].lowerCamelCase = :[val]' ${testFile} -i`.quiet();
    const content = readTestFile(testFile);
    expect(content).toContain("oldVariableName");
  });

  test("camelCase to snake_case", async () => {
    const result =
      await $`echo 'myVariable' | comby ':[[var]]' ':[var].lower_snake_case' .py -stdin -stdout`.text();
    expect(result.trim()).toBe("my_variable");
  });

  test("convert to CONSTANT_CASE", async () => {
    const result =
      await $`echo 'const myConst = 42' | comby 'const :[[name]] = :[val]' 'const :[name].UPPER_SNAKE_CASE = :[val]' .js -stdin`.text();
    expect(result).toContain("MY_CONST");
  });
});

describe("Field/Property Rename", () => {
  test("rename struct field", async () => {
    const testFile = setupTestFile("rs/sample.rs");
    await $`comby ':[obj].old_field' ':[obj].new_field' ${testFile} -i`.quiet();
    const content = readTestFile(testFile);
    expect(content).toContain(".new_field");
    expect(content).not.toContain(".old_field");
  });

  test("rename object property", async () => {
    const testFile = setupTestFile("js/sample.js");
    await $`comby ':[obj].oldField' ':[obj].newField' ${testFile} -i`.quiet();
    const content = readTestFile(testFile);
    expect(content).toContain(".newField");
    expect(content).not.toContain(".oldField");
  });

  test("update dict key", async () => {
    const testFile = setupTestFile("py/sample.py");
    await $`comby ':[var]["old_key"]' ':[var]["new_key"]' ${testFile} -i`.quiet();
    const content = readTestFile(testFile);
    expect(content).toContain('data["new_key"]');
    // Both data and result should be updated
    expect(content).toContain('result["new_key"]');
  });
});

describe("Unwrap Operations", () => {
  test("unwrap Some", async () => {
    const result =
      await $`echo 'Some(42)' | comby 'Some(:[x])' ':[x]' .rs -stdin -stdout`.text();
    expect(result.trim()).toBe("42");
  });

  test("unwrap Ok", async () => {
    const result =
      await $`echo 'Ok("test")' | comby 'Ok(:[x])' ':[x]' .rs -stdin -stdout`.text();
    expect(result.trim()).toBe('"test"');
  });
});

describe("Balanced Delimiters", () => {
  test("match nested function calls", async () => {
    const result =
      await $`echo 'log(format("hello %s", name))' | comby 'log(:[msg])' '' .py -stdin -match-only`.text();
    expect(result).toContain('format("hello %s", name)');
  });

  test("match nested parentheses", async () => {
    const result =
      await $`echo 'func(foo(x), bar(y))' | comby 'func(:[args])' '' .c -stdin -match-only`.text();
    expect(result).toContain("func(foo(x), bar(y))");
  });
});

describe("Configuration Files", () => {
  test("use config file for multiple patterns", async () => {
    const testFile = setupTestFile("js/sample.js");
    const configPath = join(TEST_DIR, "comby.toml");

    const config = `
[rename-function]
match = "oldFunc(:[args])"
rewrite = "newFunc(:[args])"

[remove-debug]
match = "console.log(:[args])"
rewrite = ""
`;

    writeFileSync(configPath, config);

    // Config files need the file extension and directory
    await $`comby -config ${configPath} -f .js -d ${TEST_DIR} -i`.quiet();
    const content = readTestFile(testFile);

    expect(content).toContain("newFunc");
    expect(content).not.toContain("console.log");
  });
});
