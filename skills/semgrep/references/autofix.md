# Semgrep Autofix Reference

Guide to creating and using autofix rules in Semgrep.

## Basic Autofix

Add `fix` key to rule with replacement pattern:

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

## Using Metavariables in Fixes

Metavariables from pattern can be reused in fix:

```yaml
rules:
  - id: rename-function
    languages:
      - python
    message: Rename old_func to new_func
    pattern: old_func($X)
    fix: new_func($X)
    severity: INFO
```

## Fix with Multiple Patterns

When using pattern composition, fix applies to matched code:

```yaml
rules:
  - id: add-timeout
    languages:
      - python
    patterns:
      - pattern-either:
          - pattern: requests.get(...)
          - pattern: requests.post(...)
      - pattern-not: requests.$W(..., timeout=$N, ...)
    fix: requests.$W(..., timeout=30)
    message: Add timeout to requests call
    severity: WARNING
```

## Fix-Regex

Use `fix-regex` for regular expression replacements:

```yaml
rules:
  - id: add-timeout-regex
    languages:
      - python
    patterns:
      - pattern-not: requests.$W(..., timeout=$N, ...)
      - pattern-either:
          - pattern: requests.get(...)
          - pattern: requests.post(...)
    fix-regex:
      regex: '(.*)\)'
      replacement: '\1, timeout=30)'
    message: Add timeout to requests call
    severity: WARNING
```

### Fix-Regex Fields

- `regex`: Regular expression to match (Python `re.sub` syntax)
- `replacement`: Replacement string (supports `\1`, `\2` for capture groups)
- `count`: Optional, number of replacements (default: all)

## Removing Code

Use empty string to remove matched code:

```yaml
rules:
  - id: remove-debug-print
    languages:
      - python
    message: Remove debug print statement
    pattern: print(...)
    fix: ""
    severity: INFO
```

## Applying Autofixes

### Preview (Dry Run)

```bash
semgrep --config rule.yml --autofix --dryrun .
```

Shows what would be changed without modifying files.

### Apply Fixes

```bash
semgrep --config rule.yml --autofix .
```

Applies fixes directly to files.

## Common Autofix Patterns

### API Migration

```yaml
rules:
  - id: migrate-api
    languages:
      - python
    message: Migrate to new API
    pattern: old_api.call($X)
    fix: new_api.execute($X)
    severity: WARNING
```

### Add Parameters

```yaml
rules:
  - id: add-parameter
    languages:
      - python
    message: Add required parameter
    pattern: func($X)
    fix: func($X, required=True)
    severity: ERROR
```

### Rename Functions

```yaml
rules:
  - id: rename-func
    languages:
      - python
    message: Rename function
    pattern: old_name($X)
    fix: new_name($X)
    severity: INFO
```

### Update Imports

```yaml
rules:
  - id: update-import
    languages:
      - python
    message: Update import path
    pattern: from old_module import $X
    fix: from new_module import $X
    severity: WARNING
```

### Fix String Formatting

```yaml
rules:
  - id: f-string
    languages:
      - python
    message: Use f-string
    pattern: '"' + $X + '"'
    fix: f"$X"
    severity: INFO
```

## Best Practices

1. **Test with dryrun**: Always preview fixes before applying
2. **Use metavariables**: Capture values for reuse in fixes
3. **Be specific**: Narrow patterns to avoid unintended changes
4. **Version control**: Commit before applying autofixes
5. **Review changes**: Check diff after applying fixes
6. **Incremental**: Apply fixes in small batches

## Limitations

- Fixes must be valid code in target language
- Complex transformations may require multiple rules
- Some patterns may not have straightforward fixes
- Fixes apply to matched code only, not surrounding context

## Troubleshooting

**Fix not applying?**
- Check `fix` syntax matches target language
- Verify metavariables are correctly referenced
- Use `--dryrun` to see what would change

**Fix breaks code?**
- Review fix pattern carefully
- Test on sample code first
- Use version control to revert if needed

**Too many changes?**
- Make pattern more specific
- Use `pattern-not` to exclude cases
- Apply fixes incrementally
