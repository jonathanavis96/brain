generate_iteration_summary() {
  local iter_num="$1"
  local mode="$2"
  local logfile="$3"
  local timestamp run_id

  timestamp="$(date '+%Y-%m-%d %H:%M:%S')"
  run_id="${ROLLFLOW_RUN_ID:-unknown}"

  # Check if logfile exists
  if [[ ! -f "$logfile" ]]; then
    cat <<EOF
**Ralph Iteration ${iter_num} (${mode})** — ${timestamp}

No log file found.

Run ID: ${run_id}
Log: ${logfile}
EOF
    return
  fi

  # Step 1: Find the LAST occurrence of :::PLAN_READY::: or :::BUILD_READY:::
  local marker_line
  marker_line=$(grep -n ":::\(PLAN\|BUILD\)_READY:::" "$logfile" 2>/dev/null | tail -1 | cut -d: -f1 || echo "")

  if [[ -z "$marker_line" ]]; then
    # No marker found - output fallback
    cat <<EOF
**Ralph Iteration ${iter_num} (${mode})** — ${timestamp}

No completion marker found in logs.

Run ID: ${run_id}
Log: ${logfile}
EOF
    return
  fi

  # Step 2: Find start boundary - prefer nearest preceding "─── Response" separator
  # Fallback to nearest preceding STATUS header
  local start_line=""
  local response_line
  response_line=$(sed -n "1,${marker_line}p" "$logfile" | grep -n "─── Response" | tail -1 | cut -d: -f1 || echo "")

  if [[ -n "$response_line" ]]; then
    start_line="$response_line"
  else
    # Fallback: find last STATUS header before marker
    local status_line
    status_line=$(sed -n "1,${marker_line}p" "$logfile" | grep -n "^STATUS |" | tail -1 | cut -d: -f1 || echo "")
    if [[ -n "$status_line" ]]; then
      start_line="$status_line"
    else
      # No valid start boundary - extract from beginning
      start_line="1"
    fi
  fi

  # Step 3: Extract block between start and marker (marker excluded)
  # Strip ANSI color codes for Discord
  local summary_block
  summary_block=$(sed -n "${start_line},$((marker_line - 1))p" "$logfile" | sed $'s/\x1b\[[0-9;]*m//g')

  # Step 4: Check if the extracted block looks valid (has structure)
  # Valid blocks should have at least one of: "**Summary**", "**Changes Made**", "**Next Steps**"
  # If not found, trigger graceful fallback
  if ! echo "$summary_block" | grep -qE '\*\*Summary\*\*|\*\*Changes Made\*\*|\*\*Next Steps\*\*'; then
    # Graceful fallback: structured block could not be extracted
    # Provide Discord-friendly metadata + excerpt of last ~40 lines
    local excerpt
    excerpt=$(tail -40 "$logfile" | sed $'s/\x1b\[[0-9;]*m//g' | sed '/^[─═]+$/d; /^STATUS |/d; /^PROGRESS |/d; /^$/d')

    cat <<EOF
**Ralph Iteration ${iter_num} (${mode})** — ${timestamp}

**Status:** Marker found but structured summary block could not be extracted

**Recent Log Excerpt** (last ~40 lines after ANSI stripping):

${excerpt}

---
**Run ID:** ${run_id}
**Log:** ${logfile}
EOF
    return
  fi

  # Step 5: Remove STATUS header portion (multi-line STATUS continuations)
  # Strategy: Remove STATUS and PROGRESS lines, then remove immediately following
  # metadata continuation lines that match the pattern (phase=|step=|tasks=|file=|runner=|model=)
  # but ONLY if they appear at the start of the block (before any blank line or real content).
  # This prevents deleting legitimate body content that happens to mention "phase=" later.

  # First pass: remove STATUS and PROGRESS lines
  summary_block=$(echo "$summary_block" | sed '/^STATUS |/d; /^PROGRESS |/d')

  # Second pass: remove leading continuation lines that match metadata patterns
  # Continue removing lines that start with metadata keys until we hit a blank line or non-metadata line
  summary_block=$(echo "$summary_block" | awk '
    BEGIN { in_header = 1 }
    {
      if (in_header) {
        # If blank line, end header section
        if ($0 ~ /^[[:space:]]*$/) {
          in_header = 0
          print
          next
        }
        # If line starts with metadata pattern, skip it (continuation)
        if ($0 ~ /^(phase|step|tasks|file|runner|model)=/) {
          next
        }
        # Otherwise, this is real content - end header section and print
        in_header = 0
        print
      } else {
        # Past header section, print everything
        print
      }
    }
  ')

  # Step 6: Remove decorative framing (response separator lines)
  summary_block=$(echo "$summary_block" | sed '/^─── Response/d')

  # Step 7: Trim leading/trailing whitespace
  summary_block=$(echo "$summary_block" | sed '/^[[:space:]]*$/d' | sed -e :a -e '/^\n*$/{$d;N;ba' -e '}')

  # Step 8: Truncate if exceeds 1800 characters (preserve section boundaries)
  # Target: < 1800 chars to stay under Discord's 2000 limit with metadata overhead
  local summary_with_header
  summary_with_header="**Ralph Iteration ${iter_num} (${mode})** — ${timestamp}

$summary_block"

  local summary_length=${#summary_with_header}

  if [[ $summary_length -gt 1800 ]]; then
    # Extract sections to preserve structure
    local title="**Ralph Iteration ${iter_num} (${mode})** — ${timestamp}"
    local summary_section="" changes_section="" next_steps_section=""

    # Extract Summary section (first occurrence)
    summary_section=$(echo "$summary_block" | sed -n '/\*\*Summary\*\*/,/\*\*[A-Z]/p' | sed '$d' || echo "")

    # Extract Changes Made section
    changes_section=$(echo "$summary_block" | sed -n '/\*\*Changes Made\*\*/,/\*\*[A-Z]/p' | sed '$d' || echo "")

    # Extract Next Steps section
    next_steps_section=$(echo "$summary_block" | sed -n '/\*\*Next Steps\*\*/,/\*\*[A-Z]/p' | sed '$d' || echo "")

    # Build truncated summary with key sections only
    local truncated
    truncated="${title}

${summary_section}

${changes_section}

${next_steps_section}

*(Summary truncated - full details in logs)*"

    # If still too long, truncate Changes Made section bullets
    if [[ ${#truncated} -gt 1800 ]]; then
      # Keep only first 3 bullets from Changes Made
      changes_section=$(echo "$changes_section" | head -5)
      truncated="${title}

${summary_section}

${changes_section}
*(... and more changes)*

${next_steps_section}

*(Summary truncated - full details in logs)*"
    fi

    # Final safety: hard truncate if still over limit
    if [[ ${#truncated} -gt 1800 ]]; then
      truncated="${truncated:0:1750}... *(truncated)*"
    fi

    echo "$truncated"
  else
    # No truncation needed
    echo "$summary_with_header"
  fi
}
generate_iteration_summary 1 PLAN logs/2026-01-28_165726_iter1_plan.log
