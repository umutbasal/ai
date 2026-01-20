---
name: semgrep
description: Static analysis and security scanning using Semgrep, a fast, open-source static analysis tool for finding bugs and enforcing code standards. Use when scanning code for security vulnerabilities, code quality issues, style violations, or bugs. Triggers include requests to find security issues, detect code patterns, enforce coding standards, scan for vulnerabilities, write custom rules, perform static analysis, or audit code quality. Supports pattern matching, autofix, generic pattern matching, and rule composition.
---

# Semgrep - Static Analysis and Security Scanning

Semgrep is a fast, open-source static analysis tool that finds bugs and enforces code standards using pattern matching. It supports multiple languages and can detect security vulnerabilities, code quality issues, and style violations.

## Installation Check

Verify semgrep is installed:

```bash
which semgrep || echo "Install: pip install semgrep or brew install semgrep"
```

## Quick Start

### Basic Scan

```bash
# Scan current directory
semgrep --config auto .

# Scan specific directory
semgrep --config auto src/

# Scan with specific rule
semgrep -e 'pattern' --lang python .

# Scan with custom rule file
semgrep --config my-rules.yml .
```

### Common Workflow

1. **Test pattern** - Use `-e` flag to test patterns interactively
2. **Create rule** - Write YAML rule file for complex patterns
3. **Run scan** - Execute with `--config` or `-e` flag
4. **Review findings** - Check output for matches
5. **Apply autofix** - Use `--autofix` for automatic fixes (if available)

## Core Concepts

### Pattern Matching

Semgrep uses pattern matching to find code that matches a given structure:

```bash
# Find all function calls
semgrep -e '$FUNC(...)' --lang python .

# Find specific function with arguments
semgrep -e 'requests.get(...)' --lang python .

# Find with metavariables
semgrep -e '$X = $Y' --lang python .
```

### Metavariables

Metavariables capture code patterns:

- `$X`, `$Y`, `$VAR` - Match any expression
- `$FUNC` - Match function names
- `$CLASS` - Match class names
- `$...ARGS` - Match sequence of arguments

```bash
# Find useless assignments
semgrep -e '$X = $Y' -e '$X = $Z' --lang python .
```

### Ellipsis Operator

The `...` operator matches zero or more items:

```bash
# Match function calls with any arguments
semgrep -e 'insecure_function(...)' --lang python .

# Match with specific argument position
semgrep -e 'func(1, ...)' --lang python .

# Match keyword arguments anywhere
semgrep -e 'requests.get(..., verify=False, ...)' --lang python .
```

**See [references/pattern-syntax.md](references/pattern-syntax.md) for complete pattern syntax reference.**

### Rule Files

Create YAML rule files for complex patterns:

```yaml
rules:
  - id: use-sys-exit
    languages:
      - python
    message: Use `sys.exit` over the python shell `exit` built-in
    pattern: exit($X)
    fix: sys.exit($X)
    severity: MEDIUM
```

Run: `semgrep --config rule.yml .`

## Essential Flags

| Flag | Purpose |
|------|---------|
| `-e 'pattern'` | Inline pattern (search mode) |
| `--config <config>` | Rule file or registry config |
| `--lang <lang>` | Target language |
| `--autofix` | Apply automatic fixes |
| `--dryrun` | Preview autofix without applying |
| `--json` | JSON output format |
| `--junit-xml` | JUnit XML output |
| `--sarif` | SARIF output format |
| `--severity <level>` | Filter by severity (INFO, WARNING, ERROR, CRITICAL) |
| `--exclude <pattern>` | Exclude files/directories |
| `--include <pattern>` | Include only matching files |

## Common Patterns

### Security Vulnerabilities

```bash
# Find SQL injection risks
semgrep -e 'query("...")' --lang python .

# Find hardcoded secrets
semgrep -e 'password = "..."' --lang python .

# Find unsafe deserialization
semgrep -e 'pickle.loads(...)' --lang python .
```

### Code Quality

```bash
# Find unused imports
semgrep -e 'import $X' --lang python .

# Find debug statements
semgrep -e 'print(...)' --lang python .

# Find TODO comments
semgrep -e 'TODO' --lang generic .
```

### API Usage

```bash
# Find requests without timeout
semgrep -e 'requests.get(...)' --lang python .

# Find deprecated API calls
semgrep -e 'old_api.call(...)' --lang python .
```

**See [references/examples.md](references/examples.md) for comprehensive pattern examples.**

## Autofix

Semgrep supports automatic code fixes through the `fix` key in rules:

```yaml
rules:
  - id: use-sys-exit
    languages:
      - python
    message: Use `sys.exit` over `exit`
    pattern: exit($X)
    fix: sys.exit($X)
    severity: MEDIUM
```

Apply fixes:

```bash
# Preview fixes (dry run)
semgrep --config rule.yml --autofix --dryrun .

# Apply fixes
semgrep --config rule.yml --autofix .
```

**See [references/autofix.md](references/autofix.md) for autofix patterns and examples.**

## Generic Pattern Matching

For unsupported languages or configuration files, use generic pattern matching:

```bash
# Scan config files
semgrep -e 'password = ...' --lang generic config.conf

# Scan XML files
semgrep -e '<tag>...</tag>' --lang generic file.xml
```

**See [references/generic-patterns.md](references/generic-patterns.md) for generic matching details.**

## Language Support

Semgrep supports 30+ languages including:
- **C-family**: C, C++, C#, Java, JavaScript, TypeScript, Go, Rust
- **Dynamic**: Python, Ruby, PHP, Perl
- **Functional**: OCaml, Haskell, Elixir, Erlang
- **Markup**: HTML, XML, JSON, YAML
- **Other**: SQL, Bash, Dockerfile, Terraform

Use `--lang generic` for unsupported languages or configuration files.

## Rule Composition

Combine patterns with boolean operators:

```yaml
rules:
  - id: dangerous-eval
    languages:
      - javascript
    patterns:
      - pattern-either:
          - pattern: eval(...)
          - pattern: Function(...)
      - pattern-not: safe_eval(...)
    message: Dangerous use of eval or Function constructor
    severity: ERROR
```

## Best Practices

1. **Start with registry**: Use `--config auto` to leverage Semgrep Registry rules
2. **Test patterns**: Use `-e` flag to test patterns before creating rules
3. **Use metavariables**: Capture patterns for reuse in messages and fixes
4. **Combine patterns**: Use boolean operators for complex logic
5. **Review findings**: Always review autofix suggestions before applying
6. **Version control**: Commit rule files to version control
7. **CI/CD integration**: Run Semgrep in CI/CD pipelines

## Resources

- **[references/pattern-syntax.md](references/pattern-syntax.md)** - Complete pattern syntax (metavariables, ellipsis, operators)
- **[references/autofix.md](references/autofix.md)** - Autofix patterns and examples
- **[references/generic-patterns.md](references/generic-patterns.md)** - Generic pattern matching for unsupported languages
- **[references/examples.md](references/examples.md)** - Common security and quality patterns

## Troubleshooting

**Pattern doesn't match?**
- Check language specification with `--lang`
- Verify metavariable syntax (`$X` not `$x`)
- Test with `-e` flag first
- Use `--lang generic` for unsupported languages

**Too many matches?**
- Make patterns more specific
- Use `pattern-not` to exclude false positives
- Add constraints with `metavariable-pattern`

**Autofix not working?**
- Verify `fix` key is present in rule
- Check `--dryrun` output first
- Ensure fix syntax matches target language
