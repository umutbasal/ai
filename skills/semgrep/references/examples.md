# Semgrep Pattern Examples

Common security and code quality patterns for Semgrep.

## Using Semgrep Registry

The [Semgrep Registry](https://semgrep.dev/r) provides pre-built rulesets covering common security issues, OWASP Top 10, and best practices.

### Quick Start with Registry

```bash
# Recommended for CI/CD - high-confidence rules
semgrep --config "p/ci" .

# Comprehensive security audit
semgrep --config "p/security-audit" .

# OWASP Top 10 coverage
semgrep --config "p/owasp-top-ten" .

# Language-specific rules
semgrep --config "p/python" .
semgrep --config "p/javascript" .
semgrep --config "p/go" .
semgrep --config "p/java" .

# Framework-specific rules
semgrep --config "p/django" .
semgrep --config "p/flask" .
semgrep --config "p/react" .
semgrep --config "p/express" .
semgrep --config "p/spring" .
semgrep --config "p/rails" .

# Combine multiple rulesets
semgrep --config "p/ci" --config "p/owasp-top-ten" --config "p/django" .
```

### Registry Rule Categories

- **Security**: XSS, SQL injection, CSRF, command injection, path traversal
- **OWASP A01-A10**: Comprehensive OWASP Top 10 coverage
- **Best Practices**: Code style, secure coding guidelines, framework best practices
- **Correctness**: Logic bugs, type errors, common programming mistakes
- **Performance**: Inefficient code patterns, N+1 queries, unnecessary loops

## Custom Security Patterns

Below are examples of custom patterns you can write for organization-specific requirements.

## Security Patterns

### SQL Injection

```yaml
rules:
  - id: sql-injection
    languages:
      - python
    message: Potential SQL injection vulnerability
    pattern: |
      query("...")
    severity: ERROR
```

### Hardcoded Secrets

```yaml
rules:
  - id: hardcoded-password
    languages:
      - python
    message: Hardcoded password detected
    pattern: |
      password = "..."
    severity: CRITICAL
```

### Unsafe Deserialization

```yaml
rules:
  - id: unsafe-pickle
    languages:
      - python
    message: Unsafe deserialization with pickle
    pattern: pickle.loads(...)
    severity: HIGH
```

### Insecure Random

```yaml
rules:
  - id: insecure-random
    languages:
      - python
    message: Use secrets module for cryptographic randomness
    pattern: random.randint(...)
    severity: MEDIUM
```

### SSRF

```yaml
rules:
  - id: ssrf-request
    languages:
      - python
    message: Potential SSRF vulnerability
    pattern: |
      requests.get($URL)
    patterns:
      - metavariable-regex:
          metavariable: $URL
          regex: '^http://'
    severity: HIGH
```

## Code Quality Patterns

### Unused Imports

```yaml
rules:
  - id: unused-import
    languages:
      - python
    message: Unused import
    pattern: import $X
    severity: INFO
```

### Debug Statements

```yaml
rules:
  - id: debug-print
    languages:
      - python
    message: Remove debug print statement
    pattern: print(...)
    fix: ""
    severity: INFO
```

### TODO Comments

```yaml
rules:
  - id: todo-comment
    languages:
      - generic
    message: TODO comment found
    pattern: TODO
    severity: INFO
```

### Empty Except Block

```yaml
rules:
  - id: empty-except
    languages:
      - python
    message: Empty except block
    pattern: |
      except:
        ...
    severity: WARNING
```

### Comparison with None

```yaml
rules:
  - id: none-comparison
    languages:
      - python
    message: Use 'is None' instead of '== None'
    pattern: $X == None
    fix: $X is None
    severity: INFO
```

## API Usage Patterns

### Missing Timeout

```yaml
rules:
  - id: requests-timeout
    languages:
      - python
    patterns:
      - pattern-not: requests.$W(..., timeout=$N, ...)
      - pattern-either:
          - pattern: requests.get(...)
          - pattern: requests.post(...)
    message: Add timeout to requests call
    fix-regex:
      regex: '(.*)\)'
      replacement: '\1, timeout=30)'
    severity: MEDIUM
```

### Deprecated API

```yaml
rules:
  - id: deprecated-api
    languages:
      - python
    message: Deprecated API call
    pattern: old_api.call(...)
    severity: WARNING
```

### Insecure SSL

```yaml
rules:
  - id: insecure-ssl
    languages:
      - python
    message: SSL verification disabled
    pattern: |
      requests.$METHOD(..., verify=False, ...)
    severity: HIGH
```

## Best Practices Patterns

### Use sys.exit

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

### F-strings

```yaml
rules:
  - id: use-fstring
    languages:
      - python
    message: Use f-string instead of concatenation
    pattern: '"' + $X + '"'
    fix: f"$X"
    severity: INFO
```

### Type Hints

```yaml
rules:
  - id: missing-type-hint
    languages:
      - python
    message: Add type hints to function
    pattern: |
      def $FUNC(...):
        ...
    severity: INFO
```

## Configuration File Patterns

### Nginx Dynamic Proxy

```yaml
rules:
  - id: dynamic-proxy-scheme
    pattern: proxy_pass $SCHEME://...;
    paths:
      include:
        - "*.conf"
    languages:
      - generic
    severity: MEDIUM
    message: Dynamic proxy scheme may be dangerous
```

### Dockerfile Root User

```yaml
rules:
  - id: dockerfile-root
    pattern: |
      USER root
    languages:
      - generic
    severity: WARNING
    message: Running as root user
```

## Complex Patterns

### Useless Assignment

```yaml
rules:
  - id: useless-assignment
    languages:
      - python
    patterns:
      - pattern: $X = $Y
      - pattern: $X = $Z
    message: Useless assignment detected
    severity: INFO
```

### Dangerous Eval

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

### Missing Error Handling

```yaml
rules:
  - id: missing-error-handling
    languages:
      - python
    patterns:
      - pattern-inside: |
          def $FUNC(...):
            ...
      - pattern: |
          $X = dangerous_call(...)
      - pattern-not-inside: |
          try:
            ...
          except:
            ...
    message: Missing error handling for dangerous call
    severity: WARNING
```
