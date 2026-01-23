# Common Pitfalls

> ShellCheck errors and bash gotchas to avoid.

## 🚨 Quick Reference (Common Shell Pitfalls to Avoid!)

Check this table when writing shell scripts or debugging ShellCheck errors.

| Pitfall                  | Anti-Pattern                                    | Correct Pattern                          | What Goes Wrong             |
|--------------------------|-------------------------------------------------|------------------------------------------|-----------------------------|
| **Unquoted Variables**   | `echo $file; cp $src $dest`                     | `echo "$file"; cp "$src" "$dest"`        | Word splitting, glob expansion |
| **Masked Exit Codes**    | `local result=$(cmd)`                           | `local result; result=$(cmd)`            | Exit code hidden, errors missed |
| **Unused Variables**     | `local var="value"` (never used)                | Remove or prefix: `_unused_var`          | SC2034 warnings, code clutter |
| **Unquoted Expansion**   | `files=$(ls *.txt); echo $files`                | `files=$(find . -name "*.txt"); echo "$files"` | Word splitting breaks filenames |
| **Backticks**            | `` result=`command` ``                          | `result=$(command)`                      | Hard to nest, deprecated    |
| **Useless Cat**          | `cat file.txt \| grep pattern`                  | `grep pattern file.txt`                  | Extra process, SC2002       |
| **Missing -r in read**   | `while read line; do`                           | `while read -r line; do`                 | Backslashes mangled, SC2162 |
| **Glob in [[ ]]**        | `[[ $var == *.txt ]]` (wrong context)           | `case "$var" in *.txt) ;; esac`          | Glob doesn't work in [[ ]]  |

**Quick Fixes:**

- Always quote: `"$var"`, `"${array[@]}"`
- Separate declare/assign: `local x; x=$(cmd)`
- Use `read -r` to prevent backslash interpretation
- Prefer `$(cmd)` over `` `cmd` ``
- Check all scripts with: `shellcheck -e SC1091 *.sh`

---

## ShellCheck Quick Reference

### High-Impact Errors

| Code | Issue | Fix |
|------|-------|-----|
| SC2155 | `local x=$(cmd)` masks exit | Separate: `local x; x=$(cmd)` |
| SC2034 | Unused variable | Remove or use it |
| SC2086 | Unquoted variable | Use `"$var"` |
| SC2046 | Unquoted command sub | Use `"$(cmd)"` |
| SC2006 | Backticks | Use `$(cmd)` instead |
| SC2001 | sed for simple sub | Use `${var//old/new}` |

### Running ShellCheck

```bash
# Single file
shellcheck script.sh

# All shell files in directory  
shellcheck **/*.sh

# Exclude specific codes
shellcheck -e SC2034,SC2155 script.sh

# Specify shell dialect
shellcheck -s bash script.sh
```

## Quoting

### Always Quote Variables

```bash
# ❌ Wrong - word splitting, glob expansion
echo $filename
cp $src $dest
[[ $var = value ]]

# ✅ Right - quoted
echo "$filename"
cp "$src" "$dest"
[[ "$var" = "value" ]]
```

### When Quoting Is Optional

```bash
# Inside [[ ]] on the left side (but quote anyway for consistency)
[[ $var = "value" ]]  # Works, but prefer "$var"

# Numeric comparisons in (( ))
if (( count > 5 )); then  # No quotes needed

# Array indices
echo "${array[$i]}"  # No quotes on $i
```

### Command Substitution

```bash
# ❌ Wrong - unquoted
files=$(ls *.txt)
for f in $files; do  # Word splitting issues

# ✅ Right - quote or use arrays
files=$(ls *.txt)
for f in "$files"; do  # Single string

# ✅ Better - use arrays
files=(*.txt)
for f in "${files[@]}"; do
```

## Test Constructs

### Use [[ ]] Not [ ]

```bash
# ❌ Wrong - POSIX [ ] has quirks
[ -z $var ]  # Breaks if var is empty
[ $var = "value" ]  # Breaks if var has spaces

# ✅ Right - bash [[ ]] is safer
[[ -z "$var" ]]
[[ "$var" = "value" ]]
```

### String vs Numeric Comparison

```bash
# Strings: = !=
[[ "$str" = "value" ]]
[[ "$str" != "other" ]]

# Numbers: -eq -ne -lt -gt -le -ge
[[ "$num" -eq 5 ]]
[[ "$num" -gt 0 ]]

# Or use (( )) for arithmetic
(( num == 5 ))
(( num > 0 ))
```

### Regex Matching

```bash
# Use =~ for regex (unquoted on right side!)
if [[ "$str" =~ ^[0-9]+$ ]]; then
    echo "Numeric"
fi

# ❌ Wrong - quoted regex is literal
[[ "$str" =~ "^[0-9]+$" ]]  # Looks for literal ^[0-9]+$
```

## Loops

### Looping Over Files

```bash
# ❌ Wrong - breaks on spaces in filenames
for f in $(ls *.txt); do

# ❌ Wrong - breaks on spaces
for f in `ls`; do

# ✅ Right - glob directly
for f in *.txt; do
    [[ -e "$f" ]] || continue  # Handle no matches
    echo "$f"
done

# ✅ Right - find with -print0 for complex cases
while IFS= read -r -d '' f; do
    echo "$f"
done < <(find . -name "*.txt" -print0)
```

### Reading Lines

```bash
# ❌ Wrong - loses in subshell
cat file.txt | while read -r line; do
    count=$((count + 1))
done  # count is 0 here!

# ✅ Right - redirect avoids subshell
while IFS= read -r line; do
    count=$((count + 1))
done < file.txt

# ✅ Right - process substitution
while IFS= read -r line; do
    count=$((count + 1))
done < <(some_command)
```

## Command Substitution

### Use $() Not Backticks

```bash
# ❌ Wrong - backticks are hard to nest, read
output=`command`
nested=`echo \`inner\``

# ✅ Right - $() nests cleanly
output=$(command)
nested=$(echo $(inner))
```

### Capturing Exit Codes

```bash
# ❌ Wrong - no error handling
output=$(failing_command)

# ✅ Right - check exit
if ! output=$(failing_command 2>&1); then
    echo "Failed: $output" >&2
    exit 1
fi
```

## Arithmetic

### Use (( )) for Math

```bash
# ❌ Wrong - expr is slow and clunky
count=`expr $count + 1`

# ❌ Wrong - $[] is deprecated
count=$[$count + 1]

# ✅ Right - (( )) is clean
((count++))
((count += 5))
result=$((a + b * c))
```

### Floating Point

```bash
# Bash doesn't do floating point!
# ❌ Wrong
result=$((3 / 2))  # Result: 1

# ✅ Right - use bc or awk
result=$(echo "scale=2; 3/2" | bc)  # Result: 1.50
result=$(awk 'BEGIN {printf "%.2f", 3/2}')
```

## Here Documents

### Quoting the Delimiter

```bash
# Variables expanded
cat <<EOF
Hello $USER
EOF

# Variables NOT expanded (quoted delimiter)
cat <<'EOF'
Literal $USER
EOF

# Indented (<<- strips leading tabs only)
cat <<-EOF
	Indented content
EOF
```

## Process Substitution

```bash
# Compare two command outputs
diff <(sort file1.txt) <(sort file2.txt)

# Feed command output to while
while read -r line; do
    echo "Got: $line"
done < <(some_command)
```

## Terminal and TTY Detection

### Guard tput Commands

`tput` requires a terminal. Scripts may be run with redirected output.

```bash
# ❌ Wrong - fails when stdout is not a TTY
tput cup 10 0
tput setaf 2

# ✅ Right - check for TTY first
if [[ -t 1 ]]; then
    tput cup 10 0
    tput setaf 2
fi

# ✅ Right - wrapper function
tput_safe() {
    [[ -t 1 ]] && tput "$@"
}
tput_safe cup 10 0
```

### Color Output Guards

```bash
# ❌ Wrong - colors appear as garbage in logs
echo -e "\033[32mSuccess\033[0m"

# ✅ Right - conditional colors
if [[ -t 1 ]]; then
    GREEN='\033[32m'
    RESET='\033[0m'
else
    GREEN=''
    RESET=''
fi
echo -e "${GREEN}Success${RESET}"
```

### Interactive vs Non-Interactive

```bash
# Check if running interactively
if [[ -t 0 ]]; then
    # stdin is a terminal - can prompt user
    read -p "Continue? " answer
else
    # Non-interactive - use defaults
    answer="y"
fi
```

## Magic Numbers and Constants

### Use Named Constants

```bash
# ❌ Wrong - magic numbers are unclear
if (( count > 8 )); then
    # What is 8?
fi
sleep 30  # Why 30?

# ✅ Right - named constants explain intent
readonly MAX_RETRIES=8
readonly POLL_INTERVAL_SECS=30

if (( count > MAX_RETRIES )); then
    echo "Exceeded retry limit"
fi
sleep "$POLL_INTERVAL_SECS"
```

### Layout Constants

```bash
# ❌ Wrong - magic number for UI layout
local visible_rows=$((LINES - 8))  # What is 8?

# ✅ Right - explain the constant
# Footer: blank + separator + total + separator + blank + 3 hotkey lines
readonly FOOTER_HEIGHT=8
local visible_rows=$((LINES - FOOTER_HEIGHT))
```

### Exit Codes

```bash
# ❌ Wrong - bare numbers
exit 2

# ✅ Right - named exit codes
readonly EXIT_SUCCESS=0
readonly EXIT_USAGE_ERROR=1
readonly EXIT_CONFIG_ERROR=2
readonly EXIT_RUNTIME_ERROR=3

exit "$EXIT_CONFIG_ERROR"
```

## Code Duplication and DRY

### Extract Shared Functions

```bash
# ❌ Wrong - same logic in multiple scripts
# script1.sh
generate_title() { ... 50 lines ... }

# script2.sh  
generate_title() { ... same 50 lines, slightly different ... }

# ✅ Right - shared library
# lib/utils.sh
generate_title() { ... }

# script1.sh
source "${SCRIPT_DIR}/lib/utils.sh"

# script2.sh
source "${SCRIPT_DIR}/lib/utils.sh"
```

### Create a Shared Library

```bash
# lib/common.sh
#!/usr/bin/env bash
# Shared utilities - source this file, don't execute it

# Prevent double-sourcing
[[ -n "${_COMMON_SH_LOADED:-}" ]] && return
readonly _COMMON_SH_LOADED=1

# Shared functions
log_info() { echo "[INFO] $*" >&2; }
log_error() { echo "[ERROR] $*" >&2; }
die() { log_error "$@"; exit 1; }

# Usage in other scripts:
# source "${SCRIPT_DIR}/lib/common.sh"
```

### When Duplication Is Acceptable

- **Standalone scripts** that must work without dependencies
- **Templates** that generate independent scripts  
- **Trivial code** (< 5 lines) where extraction adds complexity
- **Intentionally different behavior** that happens to look similar

### Signs You Need to Extract

| Smell | Action |
|-------|--------|
| Same function in 2+ files | Extract to shared library |
| Copy-paste with tweaks | Parameterize and extract |
| Bug fixed in one copy but not others | Single source of truth |
| > 20 lines duplicated | Almost always extract |

## Common Mistakes Summary

| Mistake | Problem | Fix |
|---------|---------|-----|
| `cd dir; cmd` | dir might fail | `cd dir && cmd` or check |
| `[ -z $var ]` | Empty var breaks | `[[ -z "$var" ]]` |
| `cat file \| while` | Subshell loses vars | `while ... done < file` |
| `for f in $(ls)` | Breaks on spaces | `for f in *` |
| `echo $var` | Word splitting | `echo "$var"` |
| `local x=$(cmd)` | Masks exit code | `local x; x=$(cmd)` |
| `tput cup` without guard | Fails in non-TTY | Check `[[ -t 1 ]]` first |
| Magic number `8` | Unclear intent | Use `readonly CONSTANT=8` |
| Same function in 2 files | Bugs diverge | Extract to shared lib |

## Related

- [strict-mode.md](./strict-mode.md) - Strict mode settings
- [variable-patterns.md](./variable-patterns.md) - Variable best practices
- [cleanup-patterns.md](./cleanup-patterns.md) - Proper cleanup
