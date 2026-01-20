# Generic Pattern Matching Reference

Guide to using Semgrep's generic pattern matching for unsupported languages and configuration files.

## When to Use Generic Mode

Use `--lang generic` for:
- Unsupported languages
- Configuration files (nginx, apache, etc.)
- Structured data (XML, JSON, YAML)
- Files with mixed languages (HTML with embedded JS/PHP)

## Basic Generic Patterns

### Simple Pattern Matching

```bash
semgrep -e 'password = ...' --lang generic config.conf
```

### Metavariables

In generic mode, metavariables match single "words" (alphanumeric sequences):

```yaml
pattern: password = $PASSWORD
```

Matches: `password = secret` (captures `secret` in `$PASSWORD`)

**Note**: Metavariables only capture single tokens, not sequences like `hello, world`.

### Ellipsis Operator

The `...` operator matches sequences, up to 10 lines:

```yaml
pattern: |
  [system]
  ...
  name = ...
```

### Ellipsis Metavariables

Use `$...X` to capture sequences:

```yaml
pattern: password = $...PASSWORD
```

**Warning**: This may capture too much. Use `generic_ellipsis_max_span: 0` to limit to single line.

## Handling Line-Based Input

For configuration files with key-value pairs:

```yaml
rules:
  - id: password-in-config
    pattern: |
      password = $...PASSWORD
    options:
      generic_ellipsis_max_span: 0
    message: password found in config file: $...PASSWORD
    languages:
      - generic
    severity: WARNING
```

The `generic_ellipsis_max_span: 0` option forces ellipsis to match within a single line.

## Ignoring Comments

Use `generic_comment_style` to ignore comments:

```yaml
rules:
  - id: css-blue-is-ugly
    pattern: |
      color: blue
    options:
      generic_comment_style: c
    message: Blue is ugly.
    languages:
      - generic
    severity: WARNING
```

Supported comment styles:
- `c`: `/* ... */`
- `cpp`: `// ...` and `/* ... */`
- `shell`: `# ...`

## Indentation Matters

Generic mode respects indentation for structure:

```yaml
# Match name only in system section
pattern: |
  [system]
    ...
    name = ...
```

The indentation ensures `name` is matched only within `[system]` block.

## Common Pitfalls

### Not Enough Ellipsis

If pattern spans many lines, use multiple ellipses:

```yaml
# May fail for long argument lists
pattern: f(...)

# Better for long lists
pattern: f(... ...)
```

### Not Enough Indentation

Always match indentation of target code:

```yaml
# Incorrect - matches name in any section
pattern: |
  [system]
  ...
  name = ...

# Correct - matches only in system section
pattern: |
  [system]
    ...
    name = ...
```

## Example Rules

### Nginx Configuration

```yaml
rules:
  - id: dynamic-proxy-scheme
    pattern: proxy_pass $SCHEME://...;
    paths:
      include:
        - "*.conf"
        - "*.vhost"
    languages:
      - generic
    severity: MEDIUM
    message: Dynamic proxy scheme may be dangerous
```

### Dockerfile

```yaml
rules:
  - id: root-user
    pattern: |
      USER root
      ...
      RUN ...
    languages:
      - generic
    severity: WARNING
    message: Running as root user
```

### XML

```yaml
rules:
  - id: deprecated-tag
    pattern: |
      <deprecated>...</deprecated>
    languages:
      - generic
    severity: ERROR
    message: Deprecated tag found
```

## Limitations

### Token-Based Matching

- Metavariables only capture single tokens (`[A-Za-z0-9_]+`)
- Cannot capture sequences like `hello, world` as single metavariable
- Use ellipsis metavariables for sequences

### Line Spanning

- Ellipsis spans at most 10 lines by default
- Use multiple ellipses for longer spans: `... ...` (20 lines), `... ... ...` (30 lines)

### No Regex in Strings

- Inline regex for strings (`"..." =~ /regex/`) not supported
- Use `metavariable-regex` instead

### ASCII-Based

- Works best with ASCII text
- Unicode or encoded content may not match well

## Best Practices

1. **Use indentation**: Match target code's indentation structure
2. **Multiple ellipses**: Use `... ...` for long spans
3. **Limit span**: Use `generic_ellipsis_max_span: 0` for line-based configs
4. **Ignore comments**: Use `generic_comment_style` when needed
5. **Test patterns**: Test with `-e` flag before creating rules
6. **Be specific**: Narrow patterns to reduce false positives

## Troubleshooting

**Pattern doesn't match?**
- Check indentation matches target code
- Use more ellipses for long spans
- Verify metavariable syntax (`$X` not `$x`)

**Captures too much?**
- Use `generic_ellipsis_max_span: 0` for line-based input
- Make pattern more specific
- Add constraints with `pattern-not`

**False positives?**
- Add `pattern-not` to exclude cases
- Use more specific patterns
- Consider using supported language if available
