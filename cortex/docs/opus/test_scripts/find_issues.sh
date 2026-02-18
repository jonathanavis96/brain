#!/bin/bash
FILE=/tmp/brain-semantic-review/semantic_review_prompt_9xrBCg.txt

echo "=== SECURITY SCAN ==="
echo "-- Hardcoded secrets/tokens --"
grep -n "token\|password\|secret\|api_key" "$FILE" | grep -v "YOUR_" | grep -v "example" | grep -v "\.md" | head -10

echo -e "\n-- File permission changes --"
grep -B2 "chmod\|755\|777" "$FILE" | head -20

echo -e "\n=== BREAKING CHANGES ==="
echo "-- Deleted files --"
grep -A1 "^deleted file mode" "$FILE" | grep "diff --git" | head -10

echo -e "\n-- Renamed/moved files --"
grep "rename from\|rename to" "$FILE" | head -10

echo -e "\n=== ERROR HANDLING ==="
echo "-- Bare except clauses --"
grep -n "except:" "$FILE" | grep -v "except .*:" | head -5

echo -e "\n-- Missing error handling --"
grep -n "TODO\|FIXME\|XXX\|HACK" "$FILE" | head -10
