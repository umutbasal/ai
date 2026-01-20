# Comby Rules System

Rules add constraints to matches using `where` clauses. Apply rules with the `-rule` flag.

## Rule Syntax

```bash
comby 'MATCH' 'REWRITE' -rule 'where CONDITION' .ext
```

## Important: Matching String Literals vs Identifiers

**Critical distinction**: Whether to include quotes in your pattern depends on what you're matching in the source code.

### String Literals (Include Quotes in Pattern)

When matching string literals, include quotes in the pattern so the hole captures only the string content:

```bash
# Source: log("ERROR", "message")
# Pattern includes quotes:
comby 'log(":[level]", ":[msg]")' '' -rule 'where :[level] == "ERROR"'
# :[level] captures: ERROR (without quotes)
# :[msg] captures: message (without quotes)
```

### Identifiers (No Quotes in Pattern)

When matching identifiers (function names, variables), don't include quotes:

```bash
# Source: def test_login():
# Pattern without quotes:
comby 'def :[name]():' '' -rule 'where match :[name] { | "test_.*" -> true }'
# :[name] captures: test_login (identifier, no quotes)
```

### Mixed Patterns

```bash
# Source: func_call("error")
# Pattern: func_call(":[arg]")
# :[arg] captures: error (without quotes from source)

# Source: connect("host", 8080)
# Pattern: connect(":[host]", :[port])
# :[host] captures: host (string content)
# :[port] captures: 8080 (number, no quotes)
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

Compare holes to literal strings (pattern must include quotes to match string literals):

```bash
# Find specific log levels
comby 'log(":[level]", ":[msg]")' '' -rule 'where :[level] == "ERROR"' .py
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
# Match specific values (pattern includes quotes to match string literals)
comby 'func(":[arg]")' 'newfunc(":[arg]")' \
  -rule 'where match :[arg] { | "error" -> true }' .go
# Matches: func("error")
# Rewrites to: newfunc("error")
```

### Multiple Patterns

```bash
# Match multiple acceptable values (pattern includes quotes)
comby 'log(":[level]", ":[msg]")' 'logger.log(":[level]", ":[msg]")' \
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
# Match error messages containing "error"
comby 'log(":[msg]")' '' \
  -rule 'where match :[msg] { | ".*error.*" -> true }' .py
# Matches: log("error occurred"), log("connection error")
```

### Numeric Patterns

```bash
# Find high port numbers (port arguments are typically numbers without quotes)
comby 'connect(":[host]", :[port])' '' \
  -rule 'where match :[port] { | "[89]\\d{3}" -> true }' .py
# Matches ports 8000-9999
# Note: Escape backslash in shell as \\d
```

### Identifier Patterns

Use regex holes for pattern matching identifiers:

```bash
# Match test functions using regex hole
comby 'def :[name~test.*](:[args]):' '' .py -match-only
# Matches: def test_login, def test_logout

# Alternative: Use equality in rules for exact matches
comby 'def :[name](:[args]):' '' \
  -rule 'where :[name] == "test_login"' .py
# Matches only: def test_login
```

**Note**: Advanced `match` expressions with regex patterns in rules may have limited support. Use regex holes (`:[name~pattern]`) for reliable pattern matching.

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
# Only refactor test files (uses file property)
comby 'assert(:[expr])' 'expect(:[expr])' \
  -rule 'where match :[expr].file.name { | ".*test.*" -> true }' .js -i
# Note: file.name doesn't need quotes in the pattern
```

### Selective API Migration

```bash
# Migrate specific function calls (methods are identifiers, no quotes)
comby 'oldAPI.:[method](:[args])' 'newAPI.:[method](:[args])' \
  -rule 'where match :[method] {
    | "get" -> true
    | "post" -> true
    | "put" -> true
  }' .js -i
# Note: method names are identifiers captured without quotes
```

### Type-Based Refactoring

```bash
# Change only string concatenation (strings with quotes in source)
comby ':[a] + :[b]' ':[a].concat(:[b])' \
  -rule 'where match :[a] { | "\".*\"" -> true }' .js -i
# Note: Rule matches the captured value which includes quotes from source
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
