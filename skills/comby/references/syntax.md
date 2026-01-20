# Comby Syntax Reference

Complete reference for Comby's match and rewrite syntax.

## Match Holes

Match holes capture parts of code that vary. Use named holes to reference captured content in rewrites.

| Syntax | Matches | Example |
|--------|---------|---------|
| `:[hole]` | Everything (lazy, respects balanced delimiters) | `:[args]` matches `foo, bar(x)` in `func(foo, bar(x))` |
| `:[[hole]]` | Alphanumeric + underscore (`\w+`) | `:[[name]]` matches `myFunc` but not `my-func` |
| `:[hole~regex]` | PCRE regex pattern | `:[num~\d+]` matches `123` but not `abc` |
| `:[hole:e]` | Single expression | `:[expr:e]` matches `x` not `x, y` |
| `...` | Anonymous hole (unnamed) | `foo(...)` matches `foo(anything)` |

### Match Hole Behavior

**Lazy matching**: `:[hole]` matches as little as possible while satisfying the overall pattern.

```bash
# Matches the first argument only
comby 'func(:[first], ...)' '' .py
```

**Balanced delimiters**: Holes respect `()`, `[]`, `{}`, `<>` based on language syntax.

```bash
# Correctly captures nested calls
comby 'log(:[msg])' '' .py
# Matches: log(format("hello %s", name))
# Captures: format("hello %s", name)
```

**Whitespace flexibility**: Whitespace in patterns is flexible.

```bash
# These are equivalent
comby 'foo(:[x])' '' .py
comby 'foo( :[x] )' '' .py
comby 'foo(  :[x]  )' '' .py
```

### Expression Holes

Use `:e` modifier for single expressions (stops at commas, semicolons).

```bash
# Match single expression arguments
comby 'func(:[arg:e])' '' .py
# Matches: func(x)
# Doesn't match: func(x, y)
```

### Regex Holes

Regex holes let you match specific patterns.

```bash
# Match numeric literals
comby ':[num~\d+]' '' .py

# Match identifiers starting with 'test'
comby ':[fn~test\w*]' '' .py

# Match string literals
comby ':[str~".*"]' '' .py
```

**Important**: Escape backslashes in shell: `\d` becomes `\\d`

## Rewrite Properties

Transform matched values during rewriting using properties.

### Case Transformers

| Property | Effect | Example |
|----------|--------|---------|
| `.Capitalize` | First char uppercase | `hello` → `Hello` |
| `.UPPERCASE` | All uppercase | `hello` → `HELLO` |
| `.lowercase` | All lowercase | `HELLO` → `hello` |
| `.uncapitalize` | First char lowercase | `Hello` → `hello` |

### Case Convention Converters

| Property | Effect | Example |
|----------|--------|---------|
| `.UpperCamelCase` | To UpperCamelCase | `my_func` → `MyFunc` |
| `.lowerCamelCase` | To lowerCamelCase | `my_func` → `myFunc` |
| `.UPPER_SNAKE_CASE` | To UPPER_SNAKE | `myFunc` → `MY_FUNC` |
| `.lower_snake_case` | To lower_snake | `myFunc` → `my_func` |

```bash
# Convert naming conventions
comby ':[[fn]]' ':[fn].UPPER_SNAKE_CASE' .c -i
# oldFunc → OLD_FUNC

comby ':[[var]]' ':[var].lowerCamelCase' .py -i
# my_variable → myVariable
```

### Size Properties

| Property | Returns |
|----------|---------|
| `.length` | Character count |
| `.lines` | Line count |

```bash
# Add length comments
comby 'def :[name](:[args]):' 'def :[name](:[args]):  # :[name].length chars' .py
```

### Position Properties

| Property | Returns |
|----------|---------|
| `.line` / `.line.start` | Starting line number |
| `.line.end` | Ending line number |
| `.column` / `.column.start` | Starting column |
| `.column.end` | Ending column |
| `.offset` / `.offset.start` | Starting byte offset |
| `.offset.end` | Ending byte offset |

**Note**: Position properties work on files, not stdin.

### File Context Properties

| Property | Returns |
|----------|---------|
| `.file` / `.file.path` | Absolute file path |
| `.file.name` | File name (basename) |
| `.file.directory` | Directory path (dirname) |

```bash
# Add file references in comments
comby 'func :[name]()' 'func :[name]()  // Defined in :[name].file.name' .go
```

### Identity Property

`.value` returns the matched text unchanged. Use to escape property names:

```bash
# Insert literal ".length" after hole
comby ':[x]' ':[x].value.length' .txt
# "word" → "word.length"
```

## Fresh Identifiers

Generate unique identifiers in rewrites.

### Syntax

- `:[id()]` - Random unique identifier
- `:[id(label)]` - Reusable identifier with label

```bash
# Generate unique temp variable
comby ':[x] + :[y]' 'let :[id()] = :[x]; :[id()] + :[y]' .js
# a + b → let temp_12345 = a; temp_12345 + b
```

### Reusable Identifiers

Same label generates same identifier within a match.

```bash
# Extract to variable with consistent name
comby ':[expr] + :[expr]' 'let :[id(tmp)] = :[expr]; :[id(tmp)] + :[id(tmp)]' .js
# foo() + foo() → let tmp_1 = foo(); tmp_1 + tmp_1
```

## Language-Specific Matching

Comby understands language syntax:

- **Balanced delimiters**: `()`, `[]`, `{}`, `<>` (language-specific)
- **String literals**: Respects quotes and escapes
- **Comments**: Ignores language-specific comment syntax

### Supported Languages

Auto-detected by file extension:
- C-family: C, C++, C#, Java, JavaScript, TypeScript, Go, Rust
- Dynamic: Python, Ruby, PHP, Perl
- Functional: OCaml, Haskell, Elixir, Erlang
- Markup: HTML, XML, JSON, YAML
- Other: SQL, Bash, LaTeX, Lisp, Clojure

### Generic Matcher

Use `-matcher .generic` for unsupported languages or when language detection fails.

```bash
comby 'pattern' 'replacement' -matcher .generic file.unknown
```

## Stdin/Stdout Behavior

When using stdin, control output format:

```bash
# Plain rewritten output (use -stdout)
echo 'test' | comby ':[x]' ':[x].Capitalize' -stdin -stdout
# Output: Test

# Diff format (default without -stdout)
echo 'test' | comby ':[x]' ':[x].Capitalize' -stdin
# Output: colored diff showing changes
```

**Important**: Always use `-stdout` with `-stdin` when you want the rewritten text, not a diff.

## Tips

1. **Start simple**: Test with basic patterns before adding complexity
2. **Use `:[[hole]]`** for identifiers to avoid over-matching
3. **Test without `-i`**: Preview changes before applying
4. **Escape regex**: In regex holes, escape `\` as `\\`
5. **Whitespace flexible**: Patterns match regardless of spacing
6. **Use `-stdout` with `-stdin`**: Get plain output instead of diff
7. **Playground**: Test at https://comby.live
