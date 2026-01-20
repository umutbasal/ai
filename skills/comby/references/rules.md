# Comby Rules System

Rules add constraints to matches using `where` clauses. Apply rules with the `-rule` flag.

## Rule Syntax

```bash
comby 'MATCH' 'REWRITE' -rule 'where CONDITION' .ext
```

## Equality Rules

Compare hole values for equality or inequality.

### Equality

Match only when holes are equal:

```bash
# Find duplicate conditions
comby 'if (:[x] == :[y])' '' -rule 'where :[x] == :[y]' .c
# Matches: if (foo == foo)
# Doesn't match: if (foo == bar)
```

```bash
# Find assignments to self
comby ':[var] = :[val]' '' -rule 'where :[var] == :[val]' .py
# Matches: x = x
```

### Inequality

Match only when holes differ:

```bash
# Find non-duplicate conditions
comby 'if (:[x] == :[y])' '' -rule 'where :[x] != :[y]' .c
# Matches: if (foo == bar)
# Doesn't match: if (foo == foo)
```

### Literal Comparison

Compare holes to literal strings:

```bash
# Find specific log levels
comby 'log(:[level], :[msg])' '' -rule 'where :[level] == "ERROR"' .py
# Matches: log("ERROR", "failed")
# Doesn't match: log("INFO", "ok")
```

```bash
# Exclude specific patterns
comby 'import :[mod]' '' -rule 'where :[mod] != "os"' .py
# Matches: import sys, import json
# Doesn't match: import os
```

## Pattern Matching Rules

Match holes against patterns using `match` expressions.

### Basic Pattern Matching

```bash
# Match specific values
comby 'func(:[arg])' 'newfunc(:[arg])' \
  -rule 'where match :[arg] { | "error" -> true }' .go
# Matches: func("error")
# Rewrites to: newfunc("error")
```

### Multiple Patterns

```bash
# Match multiple acceptable values
comby 'log(:[level], :[msg])' 'logger.log(:[level], :[msg])' \
  -rule 'where match :[level] {
    | "ERROR" -> true
    | "WARN" -> true
    | "DEBUG" -> true
  }' .py
```

### Pattern with Default

```bash
# Match with fallback
comby 'config.:[key]' '' \
  -rule 'where match :[key] {
    | "database" -> true
    | "cache" -> true
    | _ -> false
  }' .py
```

## Regex Matching Rules

Match holes against regular expressions.

### Basic Regex

```bash
# Match error messages
comby 'log(:[msg])' '' \
  -rule 'where match :[msg] { | ".*error.*" -> true }' .py
# Matches: log("error occurred"), log("connection error")
```

### Numeric Patterns

```bash
# Find high port numbers
comby 'connect(:[host], :[port])' '' \
  -rule 'where match :[port] { | "[89]\d{3}" -> true }' .py
# Matches ports 8000-9999
```

### Identifier Patterns

```bash
# Match test functions
comby 'def :[name](:[args]):' '' \
  -rule 'where match :[name] { | "test_.*" -> true }' .py
# Matches: def test_login, def test_logout
```

## Rewrite Expression Rules

Transform matched content within rules before applying the main rewrite.

### Basic Rewrite

```bash
# Transform dict to JSON syntax
comby 'dict(:[args])' '{:[args]}' \
  -rule 'where rewrite :[args] {
    ":[[k]]=:[[v]]" -> "\":[k]\": :[v]"
  }' .py
# dict(name="John", age=30) → {"name": "John", "age": 30}
```

### Conditional Rewrite

```bash
# Normalize imports
comby 'from :[mod] import :[name]' 'from :[mod] import :[name]' \
  -rule 'where rewrite :[mod] {
    "os.path" -> "pathlib"
  }' .py
```

### Multiple Rewrites

```bash
# Complex transformations
comby 'func(:[args])' 'newfunc(:[args])' \
  -rule 'where rewrite :[args] {
    ":[a], :[b]" -> ":[b], :[a]"  # Swap order
  }' .go
```

## Combining Rules

Multiple conditions can be chained (though support varies by Comby version).

```bash
# Multiple constraints
comby 'func(:[a], :[b])' '' \
  -rule 'where :[a] != :[b], match :[a] { | ".*test.*" -> true }' .py
```

## Rule Use Cases

### Find Code Smells

```bash
# Find self-assignment
comby ':[var] = :[var]' '' -rule 'where :[var] == :[var]' .py -match-only

# Find duplicate boolean checks
comby 'if (:[x] && :[x])' '' -rule 'where :[x] == :[x]' .c -match-only
```

### Conditional Refactoring

```bash
# Only refactor test files
comby 'assert(:[expr])' 'expect(:[expr])' \
  -rule 'where match :[expr].file.name { | ".*test.*" -> true }' .js -i
```

### Selective API Migration

```bash
# Migrate specific function calls
comby 'oldAPI.:[method](:[args])' 'newAPI.:[method](:[args])' \
  -rule 'where match :[method] {
    | "get" -> true
    | "post" -> true
    | "put" -> true
  }' .js -i
```

### Type-Based Refactoring

```bash
# Change only string concatenation
comby ':[a] + :[b]' ':[a].concat(:[b])' \
  -rule 'where match :[a] { | "\".*\"" -> true }' .js -i
```

## Tips

1. **Test incrementally**: Start with basic rules, add complexity gradually
2. **Use -match-only**: Verify rule behavior before rewriting
3. **Escape quotes**: Use `\"` for literal quotes in rules
4. **Regex escaping**: Double-escape in shell: `\\d+` for digits
5. **Combine with filters**: Use `-f` extension filter alongside rules
6. **Debug with JSON**: Use `-json-lines` to see what matched

## Common Patterns

### Find without rewriting

```bash
# Audit pattern
comby 'PATTERN' '' -rule 'CONDITION' .ext -match-only
```

### Conditional rewrite

```bash
# Transform only when condition met
comby 'PATTERN' 'REPLACEMENT' -rule 'where CONDITION' .ext -i
```

### Multi-stage refactoring

```bash
# First pass: transform A to B where condition 1
comby 'A' 'B' -rule 'where COND1' .ext -i

# Second pass: transform B to C where condition 2
comby 'B' 'C' -rule 'where COND2' .ext -i
```
