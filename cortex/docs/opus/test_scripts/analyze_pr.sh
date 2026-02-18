#!/bin/bash
# Extract key sections from the massive PR

echo "=== PR Statistics ==="
echo "Total lines: $(wc -l < /tmp/brain-semantic-review/semantic_review_prompt_9xrBCg.txt)"
echo "Changed files: $(grep -c "^diff --git" /tmp/brain-semantic-review/semantic_review_prompt_9xrBCg.txt)"

echo -e "\n=== New Files ==="
grep "^new file mode" /tmp/brain-semantic-review/semantic_review_prompt_9xrBCg.txt | head -20

echo -e "\n=== Deleted Files ==="
grep "^deleted file mode" /tmp/brain-semantic-review/semantic_review_prompt_9xrBCg.txt | head -20

echo -e "\n=== Key Config Changes ==="
grep "^diff --git.*\(\.yaml\|\.json\|requirements\.txt\|package\.json\)" /tmp/brain-semantic-review/semantic_review_prompt_9xrBCg.txt
