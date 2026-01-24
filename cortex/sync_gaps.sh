#!/usr/bin/env bash
# cortex/sync_gaps.sh - Sync gaps from sibling projects into brain's GAP_BACKLOG.md
# Deduplicates by checking if gap title already exists

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRAIN_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
GAP_BACKLOG="${BRAIN_ROOT}/skills/self-improvement/GAP_BACKLOG.md"

cd "${BRAIN_ROOT}"

# Find all pending gap markers
pending_gaps=()
shopt -s nullglob
for marker in "${BRAIN_ROOT}"/../*/cortex/.gap_pending; do
  [[ -f "$marker" ]] && pending_gaps+=("$marker")
done
shopt -u nullglob

if [[ ${#pending_gaps[@]} -eq 0 ]]; then
  echo "✅ No pending gaps to sync"
  exit 0
fi

echo "📥 Found ${#pending_gaps[@]} project(s) with pending gaps"
echo ""

synced=0
skipped=0

for marker in "${pending_gaps[@]}"; do
  project_dir=$(dirname "$(dirname "$marker")")
  project_name=$(basename "$project_dir")
  gap_file="$(dirname "$marker")/GAP_CAPTURE.md"

  if [[ ! -f "$gap_file" ]]; then
    echo "⚠️  $project_name: GAP_CAPTURE.md not found, removing stale marker"
    rm -f "$marker"
    continue
  fi

  echo "📂 Processing: $project_name"

  # Extract gap entries (everything from ### YYYY-MM-DD to next ### or EOF)
  # Use awk to parse entries
  while IFS= read -r entry; do
    # Extract title line (first line of entry)
    title=$(echo "$entry" | head -1 | sed 's/^### //')

    # Check if this gap already exists in GAP_BACKLOG.md (by title)
    if grep -qF "### $title" "$GAP_BACKLOG" 2>/dev/null; then
      echo "  ⏭️  Skipping (exists): $title"
      ((skipped++)) || true
    else
      echo "  ✅ Adding: $title"
      # Append entry to GAP_BACKLOG.md
      echo "" >>"$GAP_BACKLOG"
      echo "$entry" >>"$GAP_BACKLOG"
      ((synced++)) || true
    fi
  done < <(awk '/^### [0-9]{4}-[0-9]{2}-[0-9]{2}/{if(entry)print entry; entry=$0; next} entry{entry=entry"\n"$0} END{if(entry)print entry}' "$gap_file")

  # Clear the project's GAP_CAPTURE.md (keep header) and remove marker
  echo "  🧹 Clearing $project_name/cortex/GAP_CAPTURE.md"
  awk '/^## Captured Gaps$/{found=1; print; print ""; next} !found{print}' "$gap_file" >"${gap_file}.tmp" && mv "${gap_file}.tmp" "$gap_file"
  rm -f "$marker"
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary: $synced synced, $skipped skipped (duplicates)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
