# Comby Skill Test Suite

Comprehensive test suite that validates all comby commands documented in the skill.

## Structure

```
tests/comby/
├── basic.test.ts           # Installation, matching, stdin/stdout, JSON
├── properties.test.ts      # Case transformers, converters, fresh IDs
├── rules.test.ts           # Equality, pattern matching, constraints
├── patterns.test.ts        # Real-world refactoring patterns
├── testdata/               # Sample code files for testing
│   ├── js/sample.js        # JavaScript test cases
│   ├── py/sample.py        # Python test cases
│   ├── go/sample.go        # Go test cases
│   ├── rs/sample.rs        # Rust test cases
│   └── c/sample.c          # C test cases
└── temp/                   # Generated during tests (gitignored)
```

## Prerequisites

1. **Install comby**:

   ```bash
   # macOS
   brew install comby

   # Linux/WSL
   bash <(curl -sL get-comby.netlify.app)
   ```

2. **Install Bun** (if not already installed):
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

## Running Tests

```bash
# Install dependencies (if needed)
bun install

# Run all tests
bun test

# Run specific test suite
bun test basic.test.ts
bun test properties.test.ts
bun test rules.test.ts
bun test patterns.test.ts

# Watch mode (re-run on changes)
bun test --watch

# Verbose output
bun test --verbose
```

## Test Coverage

### basic.test.ts

- ✓ Installation verification
- ✓ Basic matching and rewriting
- ✓ Match holes (:[hole], :[[hole]], ..., :[hole:e])
- ✓ Stdin/stdout operations
- ✓ Language detection
- ✓ JSON output format
- ✓ Diff generation

### properties.test.ts

- ✓ Case transformers (.Capitalize, .UPPERCASE, .lowercase, .uncapitalize)
- ✓ Case converters (.UpperCamelCase, .lowerCamelCase, .UPPER_SNAKE_CASE, .lower_snake_case)
- ✓ Size properties (.length, .lines)
- ✓ Identity property (.value)
- ✓ Fresh identifiers (:[id()], :[id(label)])
- ✓ Property combinations

### rules.test.ts

- ✓ Equality rules (==, !=)
- ✓ Literal comparison
- ✓ Pattern matching rules
- ✓ Conditional rewriting
- ✓ Duplicate detection

### patterns.test.ts

- ✓ Function refactoring (rename, swap args, add params)
- ✓ API migration (deprecated → new)
- ✓ Code cleanup (remove console.log, dbg!, print)
- ✓ Naming conventions (snake_case ↔ camelCase)
- ✓ Field/property rename
- ✓ Unwrap operations (Some, Ok, unwrap)
- ✓ Balanced delimiters
- ✓ Configuration files

## Test Data

The `testdata/` directory contains sample code files in multiple languages:

- **JavaScript**: Function calls, console.log, API calls, naming patterns
- **Python**: Imports, print statements, dict operations, test functions
- **Go**: Functions, method calls, type declarations
- **Rust**: Option/Result types, dbg!, println!, field access
- **C**: Functions, conditionals, basic patterns

Each test creates temporary copies in `temp/` directory to avoid modifying originals.

## CI/CD Integration

### GitHub Actions

```yaml
- name: Install comby
  run: brew install comby

- name: Install Bun
  uses: oven-sh/setup-bun@v2

- name: Run tests
  run: cd tests/comby && bun test
```

### Local Development

```bash
# Run tests before committing
bun test

# Check specific skill section
bun test basic.test.ts

# Watch mode during development
bun test --watch
```

## Adding New Tests

1. Add test data to `testdata/<language>/` if needed
2. Create test in appropriate test file
3. Use helper functions:
   ```typescript
   setupTestFile("js/sample.js"); // Copy to temp
   readTestFile(testFile); // Read content
   ```
4. Clean up is automatic (beforeEach hook)

## Debugging Failed Tests

1. Check comby installation: `which comby`
2. Run failing test individually: `bun test basic.test.ts`
3. Check temp directory: `ls -la temp/`
4. Test command manually: `echo 'test' | comby 'test' 'result' -stdin`
5. Use `--verbose` flag for detailed output

## Related Documentation

- Main skill: `../../skills/comby/SKILL.md`
- Syntax reference: `../../skills/comby/references/syntax.md`
- Rules reference: `../../skills/comby/references/rules.md`
- Examples: `../../skills/comby/references/examples.md`
