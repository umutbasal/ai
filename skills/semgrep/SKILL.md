---
name: semgrep
description: Static analysis and security scanning using Semgrep, a fast, open-source static analysis tool for finding bugs and enforcing code standards. Use when scanning code for security vulnerabilities, code quality issues, style violations, or bugs. Triggers include requests to find security issues, detect code patterns, enforce coding standards, scan for vulnerabilities, write custom rules, perform static analysis, or audit code quality. Supports pattern matching, autofix, generic pattern matching, and rule composition.
---

# Semgrep - Static Analysis and Security Scanning

Semgrep is a fast, open-source static analysis tool that finds bugs and enforces code standards using pattern matching. It supports multiple languages and can detect security vulnerabilities, code quality issues, and style violations.

## Semgrep Registry

The [Semgrep Registry](https://semgrep.dev/r) provides thousands of Community Edition and Pro rules maintained by Semgrep and the community. Rules are organized by:

### Rule Categories

- **Security**: Detects vulnerabilities like SQL injection, XSS, insecure deserialization, dangerous APIs, and insecure transport
- **Best Practices**: Enforces coding standards, secure coding guidelines, and automated style reviews
- **Correctness**: Identifies logic bugs and common programming errors
- **Performance**: Addresses code efficiency and optimization issues

### OWASP Coverage

Semgrep provides comprehensive coverage for the [OWASP Top 10](https://semgrep.dev/solutions/owasp-top-ten) security risks:

1. **A01:2021 - Broken Access Control**: Authorization bypass, privilege escalation
2. **A02:2021 - Cryptographic Failures**: Weak encryption, insecure hashing
3. **A03:2021 - Injection**: SQL injection, command injection, LDAP injection, XSS
4. **A04:2021 - Insecure Design**: Missing security controls, threat modeling issues
5. **A05:2021 - Security Misconfiguration**: Default credentials, verbose errors, insecure defaults
6. **A06:2021 - Vulnerable Components**: Known CVEs in dependencies (via Semgrep Supply Chain)
7. **A07:2021 - Authentication Failures**: Weak passwords, session management issues
8. **A08:2021 - Data Integrity Failures**: Insecure deserialization, unsigned data
9. **A09:2021 - Logging Failures**: Missing logging, sensitive data in logs
10. **A10:2021 - SSRF**: Server-side request forgery

### Rule Sources

- **Pro Rules**: High-accuracy rules with crossfile and dataflow analysis (commercial)
- **Community Rules**: Free rules in [semgrep/semgrep-rules](https://github.com/semgrep/semgrep-rules) repository
- **Third-party Rules**: Contributed by security teams (Trail of Bits, etc.)

### Pre-configured Rulesets

- `p/ci`: High-confidence security and correctness bugs for CI/CD
- `p/security-audit`: Comprehensive security scanning
- `p/owasp-top-ten`: OWASP Top 10 coverage
- `p/default`: General security and correctness rules
- Language-specific: `p/python`, `p/javascript`, `p/java`, etc.
- Framework-specific: `p/react`, `p/django`, `p/spring`, etc.

### Supported Technologies

30+ languages including Python, JavaScript, TypeScript, Java, Go, Ruby, PHP, C#, Kotlin, Swift, Rust, and more. Framework support includes React, Django, Flask, Spring, Express, Rails, Laravel, and many others.

## Installation Check

Verify semgrep is installed:

```bash
which semgrep || echo "Install: pip install semgrep or brew install semgrep"
```

## Quick Start

### Using Registry Rules

```bash
# Scan with auto-detection (recommended for CI/CD)
semgrep --config auto .

# Scan with specific ruleset
semgrep --config "p/ci" .
semgrep --config "p/security-audit" .
semgrep --config "p/owasp-top-ten" .

# Scan with language-specific rules
semgrep --config "p/python" .
semgrep --config "p/javascript" .

# Scan with framework-specific rules
semgrep --config "p/react" .
semgrep --config "p/django" .

# Combine multiple rulesets
semgrep --config "p/ci" --config "p/security-audit" .
```

### Basic Scan

```bash
# Scan specific directory
semgrep --config auto src/

# Scan with inline pattern
semgrep -e 'pattern' --lang python .

# Scan with custom rule file
semgrep --config my-rules.yml .

# Search Registry for specific rules
# Visit https://semgrep.dev/r to browse available rules
```

### Common Workflow

1. **Choose rules** - Select from Registry rulesets or write custom rules
2. **Test pattern** - Use `-e` flag to test patterns interactively
3. **Run scan** - Execute with `--config` for rulesets or `-e` for inline patterns
4. **Review findings** - Check output, filtered by severity if needed
5. **Apply autofix** - Use `--autofix` for automatic fixes (if available)
6. **Integrate CI/CD** - Use `p/ci` ruleset for continuous scanning

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

1. **Start with registry**: Use `--config "p/ci"` or `--config auto` for CI/CD
2. **Layer security**: Combine `p/owasp-top-ten` with language-specific rulesets
3. **Filter by severity**: Use `--severity ERROR` or `--severity HIGH` for critical issues
4. **Use autofix in CI**: Enable `--autofix` for safe, automated fixes
5. **Test patterns**: Use `-e` flag to test patterns before creating rules
6. **Browse Registry**: Visit [semgrep.dev/r](https://semgrep.dev/r) to discover rules for your stack
7. **Version control**: Commit custom rule files to version control
8. **Monitor performance**: Use `--metrics=off` to disable telemetry in sandboxed environments
9. **Incremental adoption**: Start with high-confidence rules (`p/ci`), then expand
10. **Custom rules**: Write custom rules for organization-specific security requirements

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
