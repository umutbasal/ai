---
name: comby
description: Structural code search and refactoring using comby, a tool for matching and rewriting code based on syntax structure rather than regex. Use when performing code refactoring, renaming patterns across files, finding/replacing function calls with specific argument patterns, migrating APIs, transforming function signatures, or any task requiring syntax-aware code transformation. Triggers include requests to refactor code, rename functions/variables across codebase, find and replace code patterns, migrate deprecated APIs, update naming conventions, remove debug statements, or modernize code patterns.
---

# Comby - Structural Code Search and Rewrite

Comby matches and rewrites code using structural templates instead of regex. It understands balanced delimiters, strings, and comments, making it ideal for safe code refactoring.

## Installation Check

Verify comby is installed:

```bash
which comby || echo "Install: brew install comby (macOS) or bash <(curl -sL get-comby.netlify.app) (Linux)"
```

## Quick Start

### Basic Pattern

```bash
# Preview changes (dry run)
comby 'oldFunc(:[args])' 'newFunc(:[args])' .go

# Apply changes
comby 'oldFunc(:[args])' 'newFunc(:[args])' .go -i

# Specific directory
comby 'oldFunc(:[args])' 'newFunc(:[args])' -d src/ .go -i

# Review interactively
comby 'oldFunc(:[args])' 'newFunc(:[args])' .go -review
```

### Common Workflow

1. **Test pattern** - Run without `-i` to preview
2. **Review diff** - Add `-diff` flag for patch output
3. **Apply carefully** - Use `-i` to modify files in-place
4. **Verify** - Run tests after refactoring

## Core Concepts

### Stdin/Stdout Usage

When using `-stdin` for input, add `-stdout` for plain rewritten output:

```bash
# With -stdout flag for plain output
echo 'hello' | comby ':[x]' ':[x].Capitalize' -stdin -stdout
# Output: Hello

# Without -stdout: outputs colored diff format (default)
echo 'hello' | comby ':[x]' ':[x].Capitalize' -stdin
# Output: (colored diff)
```

### Match Holes

Holes capture varying parts of code:

| Syntax | Matches | Example |
|--------|---------|---------|
| `:[hole]` | Everything (lazy, balanced) | `:[args]` in `func(a, b)` captures `a, b` |
| `:[[hole]]` | Identifiers only (`\w+`) | `:[[name]]` matches `myFunc` not `my-func` |
| `:[hole~\d+]` | Regex pattern | Matches only digits |
| `...` | Anonymous (don't care) | `func(...)` matches any args |

### Rewrite with Properties

Transform captured values:

```bash
# Convert naming conventions
comby ':[[func]]' ':[func].lowerCamelCase' .py -i
comby ':[[var]]' ':[var].UPPER_SNAKE_CASE' .c -i

# Add file context
comby 'log(:[msg])' 'log(":[msg].file.name: " + :[msg])' .js -i
```

Common properties: `.Capitalize`, `.lowercase`, `.UPPERCASE`, `.lowerCamelCase`, `.UpperCamelCase`, `.lower_snake_case`, `.UPPER_SNAKE_CASE`, `.length`, `.file`

**See [references/syntax.md](references/syntax.md) for complete syntax reference.**

### Rules for Constraints

Add conditions with `-rule`:

```bash
# Only match when equal
comby 'if (:[x] == :[y])' '' -rule 'where :[x] == :[y]' .c -match-only

# Only match specific values (pattern includes quotes to match string literals)
comby 'log(":[level]", ":[msg]")' 'logger(":[level]", ":[msg]")' \
  -rule 'where :[level] == "ERROR"' .py -i

# Pattern matching (pattern includes quotes to match string literals)
comby 'func(":[arg]")' 'newfunc(":[arg]")' \
  -rule 'where match :[arg] { | "error" -> true }' .go -i
```

**See [references/rules.md](references/rules.md) for complete rule system.**

## Essential Flags

| Flag | Purpose |
|------|---------|
| `-i` | Apply changes in-place |
| `-d dir` | Target directory |
| `-f .ext` | Filter by extension |
| `-match-only` | Show matches without rewriting |
| `-diff` | Generate unified diff |
| `-review` | Interactive approval |
| `-rule 'where ...'` | Add constraints |
| `-matcher .lang` | Force language parser |
| `-stdin` / `-stdout` | Pipe input/output |
| `-json-lines` | JSON output for scripting |

## Common Patterns

### Rename Function/Method

```bash
comby 'oldFunc(:[args])' 'newFunc(:[args])' .go -i
comby ':[obj].oldMethod(:[args])' ':[obj].newMethod(:[args])' .js -i
```

### Update Function Signature

```bash
# Add parameter
comby 'fetch(:[url])' 'fetch(:[url], { timeout: 5000 })' .js -i

# Reorder parameters
comby 'func(:[a], :[b])' 'func(:[b], :[a])' .py -i
```

### API Migration

```bash
# Deprecated to new API
comby 'oldAPI.call(:[args])' 'newAPI.execute(:[args])' .js -i

# Method chaining change
comby ':[obj].old(:[x]).chain(:[y])' ':[obj].new(:[x], :[y])' .rs -i
```

### Remove Debug Code

```bash
comby 'console.log(:[args])' '' .js -i
comby 'dbg!(:[expr])' ':[expr]' .rs -i
comby 'print(:[args])' '' .py -i
```

### Update Naming Conventions

```bash
# snake_case to camelCase
comby ':[[var]]' ':[var].lowerCamelCase' .js -i

# camelCase to snake_case
comby ':[[var]]' ':[var].lower_snake_case' .py -i
```

### Field/Property Rename

```bash
comby ':[obj].oldField' ':[obj].newField' .ts -i
comby ':[var]["old_key"]' ':[var]["new_key"]' .py -i
```

**See [references/examples.md](references/examples.md) for comprehensive refactoring examples.**

## Configuration Files

Create `comby.toml` for multiple patterns:

```toml
[rename-function]
match = "oldFunc(:[args])"
rewrite = "newFunc(:[args])"

[remove-debug]
match = "console.log(:[args])"
rewrite = ""

[update-import]
match = "from old_module import :[name]"
rewrite = "from new_module import :[name]"
rule = "where :[name] != 'excluded'"
```

Run: `comby -config comby.toml -f .js -d directory/ -i`

## Language Support

Auto-detects by extension:
- **C-family**: C, C++, C#, Java, JavaScript, TypeScript, Go, Rust
- **Dynamic**: Python, Ruby, PHP, Perl
- **Functional**: OCaml, Haskell, Elixir, Erlang
- **Markup**: HTML, XML, JSON, YAML
- **Other**: SQL, Bash, LaTeX

Force language: `-matcher .rs` (use correct names from `comby -list`) or use `-matcher .generic` for unsupported languages.

## Best Practices

1. **Always test first**: Run without `-i` to preview changes
2. **Use version control**: Commit before large refactorings
3. **Start narrow**: Test on one file, then expand to directory
4. **Review diffs**: Use `-diff` or `-review` for verification
5. **Combine with git**: `git grep -l 'pattern' | xargs comby ... -i`
6. **Escape properly**: Use `\\d` for regex digit class in shell
7. **Run tests**: Validate after each refactoring step

## Structural Matching Details

Comby understands:
- **Balanced delimiters**: `()`, `[]`, `{}`, `<>` (language-aware)
- **String literals**: Respects quotes and escape sequences
- **Comments**: Skips language-specific comment syntax

Example: `func(:[args])` correctly matches `func(foo(x), bar(y))` capturing nested calls.

## Playground

Test patterns interactively: https://comby.live

## Resources

- **[references/syntax.md](references/syntax.md)** - Complete syntax reference (holes, properties, identifiers)
- **[references/rules.md](references/rules.md)** - Rule system (equality, pattern matching, regex)
- **[references/examples.md](references/examples.md)** - Common refactoring patterns by use case

## Troubleshooting

**Pattern doesn't match?**
- Check whitespace (usually flexible but test variations)
- Try `:[[hole]]` for identifiers instead of `:[hole]`
- Use `-matcher .generic` if language detection fails
- Test at https://comby.live

**Too many matches?**
- Make holes more specific: use `:[[id]]` instead of `:[any]`
- Add `-rule` constraints
- Use regex holes: `:[num~\d+]`

**Changes not applying?**
- Verify `-i` flag is present
- Check file permissions
- Use `-diff` to see what would change
