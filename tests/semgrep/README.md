# Semgrep Skill Test Suite

Comprehensive test suite that validates all semgrep commands documented in the skill.

## Structure

```
tests/semgrep/
├── basic.test.ts           # Installation, matching, rule files, output formats
├── patterns.test.ts        # Metavariables, ellipsis, pattern composition
├── autofix.test.ts         # Autofix rules, fix-regex, dry run
├── generic.test.ts         # Generic pattern matching, config files
├── testdata/               # Sample code files for testing
│   ├── js/sample.js        # JavaScript test cases
│   ├── py/sample.py        # Python test cases
│   ├── go/sample.go        # Go test cases
│   └── generic/            # Generic/config file test cases
│       ├── config.conf     # Configuration file
│       ├── nginx.conf      # Nginx configuration
│       ├── Dockerfile      # Dockerfile
│       └── style.css       # CSS file
└── temp/                   # Generated during tests (gitignored)
```

## Prerequisites

1. **Install semgrep**:

   ```bash
   # macOS
   brew install semgrep

   # Linux/Python
   pip install semgrep
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
bun test patterns.test.ts
bun test autofix.test.ts
bun test generic.test.ts

# Watch mode (re-run on changes)
bun test --watch

# Verbose output
bun test --verbose
```

## Test Coverage

### basic.test.ts

- ✓ Installation verification
- ✓ Basic pattern matching
- ✓ Inline patterns (`-e` flag)
- ✓ Rule file usage
- ✓ Language detection (Python, JavaScript, Go)
- ✓ Output formats (JSON, SARIF)
- ✓ Severity filtering

### patterns.test.ts

- ✓ Metavariables (`$X`, `$Y`)
- ✓ Reoccurring metavariables
- ✓ Ellipsis operator (`...`)
- ✓ Pattern composition (pattern-either, pattern-not, pattern-inside)
- ✓ Security patterns (hardcoded passwords, SQL injection)
- ✓ Code quality patterns (debug prints, empty except blocks)

### autofix.test.ts

- ✓ Basic autofix with metavariables
- ✓ Autofix dry run
- ✓ Remove code with empty fix
- ✓ Fix-regex patterns
- ✓ Autofix with multiple patterns

### generic.test.ts

- ✓ Generic pattern matching
- ✓ Configuration file patterns (nginx, dockerfile)
- ✓ Generic ellipsis options
- ✓ Comment handling

## Test Data

The `testdata/` directory contains sample code files in multiple languages:

- **Python**: Security issues, debug statements, API calls, error handling
- **JavaScript**: Eval usage, API calls, function patterns
- **Go**: Function calls, API usage, assignments
- **Generic**: Configuration files (nginx, dockerfile, config, CSS)

Each test creates temporary copies in `temp/` directory to avoid modifying originals.

## CI/CD Integration

### GitHub Actions

```yaml
- name: Install semgrep
  run: pip install semgrep

- name: Install Bun
  uses: oven-sh/setup-bun@v2

- name: Run tests
  run: cd tests/semgrep && bun test
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
   setupTestFile("py/sample.py"); // Copy to temp
   readTestFile(testFile); // Read content
   writeTestFile(path, content); // Write content
   ```
4. Clean up is automatic (beforeEach hook)

## Debugging Failed Tests

1. Check semgrep installation: `which semgrep`
2. Run failing test individually: `bun test basic.test.ts`
3. Check temp directory: `ls -la temp/`
4. Test command manually: `semgrep -e 'pattern' --lang python testdata/py/sample.py`
5. Use `--verbose` flag for detailed output

## Related Documentation

- Main skill: `../../skills/semgrep/SKILL.md`
- Pattern syntax: `../../skills/semgrep/references/pattern-syntax.md`
- Autofix reference: `../../skills/semgrep/references/autofix.md`
- Generic patterns: `../../skills/semgrep/references/generic-patterns.md`
- Examples: `../../skills/semgrep/references/examples.md`
