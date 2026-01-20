# Comby Refactoring Examples

Common refactoring patterns organized by use case.

## Function Refactoring

### Rename Function

```bash
# Simple rename
comby 'oldFunc(:[args])' 'newFunc(:[args])' .go -i

# Rename with method call
comby ':[obj].oldMethod(:[args])' ':[obj].newMethod(:[args])' .js -i
```

### Change Function Signature

```bash
# Add parameter
comby 'fetchData(:[url])' 'fetchData(:[url], { timeout: 5000 })' .js -i

# Remove parameter
comby 'func(:[a], :[b], :[c])' 'func(:[a], :[c])' .py -i

# Reorder parameters
comby 'swap(:[a], :[b])' 'swap(:[b], :[a])' .c -i
```

### Convert Function Style

```bash
# Function to method call
comby 'len(:[x])' ':[x].length()' .py -i

# Method to function call
comby ':[str].format(:[args])' 'format(:[str], :[args])' .py -i
```

## API Migration

### Update Deprecated API

```bash
# Old API to new API
comby 'oldAPI.call(:[args])' 'newAPI.execute(:[args])' .js -i

# Chained API migration
comby 'ctx.JSON(:[status], :[body])' 'ctx.json().status(:[status]).body(:[body])' .rs -i
```

### Change Import Statements

```bash
# Update import path
comby 'from old_module import :[name]' 'from new_module import :[name]' .py -i

# Change import style
comby 'import :[mod]' 'from :[mod] import *' .py -i
```

### Framework Migration

```bash
# React class to hooks
comby 'this.setState({ :[key]: :[val] })' 'set:[key].Capitalize(:[val])' .jsx -i

# jQuery to vanilla JS
comby '$(:[selector]).click(:[handler])' 'document.querySelector(:[selector]).addEventListener("click", :[handler])' .js -i
```

## Code Cleanup

### Remove Debug Statements

```bash
# Remove console.log
comby 'console.log(:[args])' '' .js -i

# Remove dbg! macro
comby 'dbg!(:[args])' ':[args]' .rs -i

# Remove print statements
comby 'print(:[args])' '' .py -i
```

### Remove Unused Code

```bash
# Remove TODO comments
comby '// TODO: :[text]' '' .go -i

# Remove commented code
comby '// :[code]' '' .js -i
```

### Simplify Expressions

```bash
# Remove double negation
comby '!!:[expr]' ':[expr]' .js -i

# Simplify boolean comparison
comby ':[x] == true' ':[x]' .js -i
comby ':[x] == false' '!:[x]' .js -i
```

## Error Handling

### Update Error Handling Style

```bash
# unwrap() to ?
comby '.unwrap()' '?' .rs -i

# Add error handling
comby ':[call]' ':[call] or raise Exception()' .py -i
```

### Wrap in Try-Catch

```bash
# Add try-catch block
comby ':[stmt]' 'try { :[stmt] } catch (e) { console.error(e); }' .js -i
```

## Logging

### Update Log Statements

```bash
# println to log macro
comby 'println!(:[args])' 'info!(:[args])' .rs -i

# Change log level
comby 'log.Debug(:[msg])' 'log.Info(:[msg])' .go -i
```

### Add Context to Logs

```bash
# Add file context
comby 'log(:[msg])' 'log("[:[msg].file.name] " + :[msg])' .py -i
```

## Type Transformations

### Add Type Annotations

```bash
# Add return type
comby 'fn :[name](:[args]) {:[body]}' 'fn :[name](:[args]) -> Result<()> {:[body]}' .rs -i

# Add type hints
comby 'def :[name](:[args]):' 'def :[name](:[args]) -> None:' .py -i
```

### Remove Type Annotations

```bash
# Remove type hints
comby 'def :[name](:[args]) -> :[type]:' 'def :[name](:[args]):' .py -i
```

## Data Structure Refactoring

### Update Field Names

```bash
# Rename struct field
comby ':[obj].old_field' ':[obj].new_field' .rs -i

# Update dict key
comby 'data["old_key"]' 'data["new_key"]' .py -i
```

### Change Data Structure

```bash
# Array to object
comby '[:[a], :[b]]' '{ first: :[a], second: :[b] }' .js -i

# Tuple to struct
comby '(:[a], :[b])' 'Point { x: :[a], y: :[b] }' .rs -i
```

## Naming Conventions

### Convert Case

```bash
# snake_case to camelCase
comby ':[[var]]' ':[var].lowerCamelCase' .js -i

# camelCase to snake_case
comby ':[[var]]' ':[var].lower_snake_case' .py -i

# Convert to CONSTANT_CASE
comby 'const :[[name]] = :[val]' 'const :[name].UPPER_SNAKE_CASE = :[val]' .js -i
```

### Prefix/Suffix Variables

```bash
# Add prefix
comby ':[[var]]' 'new_:[var]' .py -i

# Add suffix
comby ':[[var]]' ':[var]_v2' .go -i
```

## String Formatting

### Update String Templates

```bash
# % formatting to f-strings
comby 'print("%s" % :[var])' 'print(f"{:[var]}")' .py -i

# String concatenation to template
comby ':[a] + " " + :[b]' '`${:[a]} ${:[b]}`' .js -i
```

## Control Flow

### Simplify Conditionals

```bash
# Remove redundant else
comby 'if :[cond] { return :[x] } else { return :[y] }' 'if :[cond] { return :[x] } return :[y]' .go -i
```

### Convert Loops

```bash
# for to forEach
comby 'for (:[item] of :[arr]) { :[body] }' ':[arr].forEach(:[item] => { :[body] })' .js -i
```

## Configuration

### Update Config Values

```bash
# Change config key
comby 'config.get("old_key")' 'config.get("new_key")' .py -i

# Update environment variable
comby 'process.env.OLD_VAR' 'process.env.NEW_VAR' .js -i
```

## Testing

### Update Test Assertions

```bash
# Change assertion style
comby 'assert(:[expr])' 'expect(:[expr]).toBeTruthy()' .js -i

# Add test description
comby 'test(:[name], :[fn])' 'test("Test: " + :[name], :[fn])' .js -i
```

### Mock Updates

```bash
# Update mock syntax
comby 'mock(:[obj]).returns(:[val])' 'when(:[obj]).thenReturn(:[val])' .java -i
```

## Documentation

### Update Comments

```bash
# Change comment style
comby '// :[text]' '/* :[text] */' .c -i

# Add docstring
comby 'def :[name](:[args]):' '"""TODO: Document this."""\ndef :[name](:[args]):' .py -i
```

## Multi-Step Refactorings

### Safe Rename with Intermediate Step

```bash
# Step 1: Rename to intermediate name
comby 'oldFunc(:[args])' 'oldFunc_deprecated(:[args])' .go -i

# Step 2: Add new function calls
# (manually add newFunc implementations)

# Step 3: Update deprecated to new
comby 'oldFunc_deprecated(:[args])' 'newFunc(:[args])' .go -i

# Step 4: Remove deprecated functions
# (manually remove old implementations)
```

### Gradual Type Addition

```bash
# Step 1: Add basic types
comby 'def :[name](:[args]):' 'def :[name](:[args]) -> Any:' .py -i

# Step 2: Refine specific functions
comby 'def :[name](:[args]) -> Any:' 'def :[name](:[args]) -> :[specific_type]:' \
  -rule 'where match :[name] { | "get_.*" -> true }' .py -i
```

## Tips for Effective Refactoring

1. **Always preview first**: Run without `-i` to see changes
2. **Use version control**: Commit before large refactorings
3. **Test incrementally**: Apply to one file first, verify, then expand
4. **Combine with grep**: `git grep -l 'pattern' | xargs comby ...`
5. **Use -review**: Interactive mode for careful refactoring
6. **Check diffs**: Use `-diff` to generate reviewable patches
7. **Run tests**: Validate after each refactoring step
