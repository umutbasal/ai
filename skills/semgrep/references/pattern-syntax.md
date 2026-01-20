# Semgrep Pattern Syntax Reference

Complete reference for Semgrep's pattern matching syntax.

## Metavariables

Metavariables capture code patterns for reuse in messages and fixes.

### Expression Metavariables

Match any expression:

```yaml
pattern: $X + $Y
```

Matches: `foo() + bar()`, `current + total`

### Naming Rules

- Must start with `$`
- Uppercase letters, digits, and underscores only
- Examples: `$X`, `$VAR`, `$FUNC_1`
- Invalid: `$x`, `$some_value`

### Reoccurring Metavariables

Same metavariable name must match the same value:

```yaml
patterns:
  - pattern: $X = $Y
  - pattern: $X = $Z
```

Detects useless assignments where `$X` is reassigned.

### Typed Metavariables

Match only when metavariable has specific type:

**Java:**
```yaml
pattern: (java.util.logging.Logger $LOGGER).log(...)
```

**C:**
```yaml
pattern: $X == (char *$Y)
```

**Go:**
```yaml
pattern: ($READER : *zip.Reader).Open($INPUT)
```

**TypeScript:**
```yaml
pattern: ($X: DomSanitizer).sanitize(...)
```

### Ellipsis Metavariables

Capture sequences of arguments:

```yaml
pattern: foo($...ARGS, 3, $...ARGS)
```

Matches: `foo(1, 2, 3, 1, 2)`

When referencing in messages, include ellipsis: `Call to foo($...ARGS)`

### Anonymous Metavariables

Use `$_` to match without capturing:

```yaml
pattern: def function($_, $_, $_)
```

Matches functions with exactly 3 arguments, but doesn't capture them.

## Ellipsis Operator

The `...` operator matches zero or more items.

### Function Calls

```yaml
# Match any arguments
pattern: insecure_function(...)

# Match with specific first argument
pattern: func(1, ...)

# Match with specific last argument
pattern: func(..., 1)

# Match keyword argument anywhere
pattern: requests.get(..., verify=False, ...)
```

### Method Calls

```yaml
# Match method calls
pattern: $OBJECT.extractall(...)

# Match method chains
pattern: $O.foo(). ... .bar()
```

### Function Definitions

```yaml
# Match any function with one parameter
pattern: function ...($X) { ... }

# Match functions with mutable defaults
pattern: |
  def $FUNC(..., $ARG={}, ...):
    ...
```

### Strings

```yaml
# Match any string content
pattern: crypto.set_secret_key("...")

# Match regular expressions
pattern: /.../
```

### Containers

```yaml
# Match list with specific last element
pattern: user_list = [..., 10]

# Match any dictionary
pattern: user_dict = {...}

# Match dictionary with key-value pair
pattern: user_dict = {..., $KEY: $VALUE, ...}
```

### Conditionals and Loops

```yaml
# Match if statement body
pattern: |
  if $CONDITION:
    ...

# Match conditional body with metavariable
pattern: |
  if $CONDITION:
    $BODY
```

## Deep Expression Operator

Use `<<... [pattern] ...>>` to match deeply nested expressions:

```yaml
pattern: |
  if <<... $USER.is_admin() ...>>:
    ...
```

Matches `is_admin()` anywhere within the if condition, even if nested.

## Equivalences

Semgrep automatically matches semantically equivalent code.

### Imports

```yaml
pattern: subprocess.Popen(...)
```

Matches:
- `import subprocess; subprocess.Popen(...)`
- `import subprocess.Popen as sub_popen; sub_popen(...)`
- `from subprocess import Popen; Popen(...)`

### Constants

Semgrep performs constant propagation:

```yaml
pattern: set_password("password")
```

Matches:
```python
HARDCODED_PASSWORD = "password"
def update_system():
    set_password(HARDCODED_PASSWORD)
```

### Associative and Commutative Operators

Semgrep matches operators regardless of order:

```yaml
pattern: ... && B && C
```

Matches: `A && B && C`, `(A && B) && C`, `B && C && A`

## Pattern Operators

### pattern-either

Match any of multiple patterns:

```yaml
patterns:
  - pattern-either:
      - pattern: eval(...)
      - pattern: Function(...)
```

### pattern-not

Exclude matches:

```yaml
patterns:
  - pattern: eval(...)
  - pattern-not: safe_eval(...)
```

### pattern-inside

Match only inside specific context:

```yaml
patterns:
  - pattern-inside: |
      def $FUNC(...):
        ...
  - pattern: dangerous_call(...)
```

### pattern-not-inside

Exclude matches inside specific context:

```yaml
patterns:
  - pattern: eval(...)
  - pattern-not-inside: |
      def safe_wrapper(...):
        ...
```

## Metavariable Constraints

### metavariable-pattern

Apply pattern to metavariable value:

```yaml
patterns:
  - pattern: password = "$PASSWORD"
  - metavariable-pattern:
      metavariable: $PASSWORD
      pattern: ".*password.*"
```

### metavariable-regex

Match metavariable with regex:

```yaml
patterns:
  - pattern: api_key = "$KEY"
  - metavariable-regex:
      metavariable: $KEY
      regex: 'sk-[a-zA-Z0-9]{32}'
```

### metavariable-comparison

Compare metavariable values:

```yaml
patterns:
  - pattern: $X == $Y
  - metavariable-comparison:
      metavariable: $X
      comparison: $Y
      base: "int"
```

## Limitations

### Partial Expressions

Partial expressions are not valid:

```yaml
# Invalid
pattern: 1+

# Valid
pattern: 1 + $X
```

### Ellipsis Scope

Ellipsis doesn't jump between statement blocks:

```yaml
# Matches
pattern: |
  foo()
  ...
  bar()

# Matches
pattern: |
  foo()
  baz()
  if cond:
    bar()

# Doesn't match
pattern: |
  if cond:
    foo()
  baz()
  bar()
```

### Statement Types

Some statement types handled differently:

```yaml
# Matches
pattern: foo
# Matches: x += foo(), return bar + foo, foo(1, 2)

# Doesn't match
pattern: foo
# Doesn't match: import foo (use "import foo" instead)
```

## Tips

1. **Use metavariables**: Capture patterns for reuse
2. **Test with `-e`**: Test patterns before creating rules
3. **Combine operators**: Use boolean operators for complex logic
4. **Check equivalences**: Semgrep matches equivalent code automatically
5. **Use deep operator**: For nested expressions
6. **Be specific**: Narrow patterns to reduce false positives
