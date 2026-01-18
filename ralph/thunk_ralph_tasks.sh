#!/bin/bash
# Thunk Ralph Tasks Monitor - Persistent completion log display
#
# Usage: bash thunk_ralph_tasks.sh
#
# Features:
#   - Displays completed tasks from THUNK.md
#   - Auto-detects new completions in IMPLEMENTATION_PLAN.md
#   - Appends new completions to THUNK.md with sequential numbering
#   - Groups tasks by Era
#   - Interactive hotkeys for management
#
# Hotkeys:
#   r - Refresh/Clear display (re-read THUNK.md, clear terminal)
#   f - Force sync (scan IMPLEMENTATION_PLAN.md for new completions)
#   e - New era (prompt for era name, add new section)
#   q - Quit cleanly

RALPH_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLAN_FILE="$RALPH_DIR/IMPLEMENTATION_PLAN.md"
THUNK_FILE="$RALPH_DIR/THUNK.md"
LAST_THUNK_MODIFIED=""
LAST_PLAN_MODIFIED=""

# Check if required files exist
if [[ ! -f "$THUNK_FILE" ]]; then
    echo "Error: THUNK.md not found in $RALPH_DIR"
    echo "Please create THUNK.md first (see THOUGHTS.md for template)"
    exit 1
fi

if [[ ! -f "$PLAN_FILE" ]]; then
    echo "Error: IMPLEMENTATION_PLAN.md not found in $RALPH_DIR"
    exit 1
fi

# Function to get file modification time
get_file_mtime() {
    local file="$1"
    stat -c %Y "$file" 2>/dev/null || stat -f %m "$file" 2>/dev/null
}

# Function to generate short human-readable title from task description
generate_title() {
    local desc="$1"
    
    # Strip technical IDs (T1.1, P4A.7, 1.1, 2.3, etc.) from the beginning
    desc=$(echo "$desc" | sed -E 's/^[[:space:]]*\*\*[T]?[0-9A-Za-z]+(\.[0-9A-Za-z]+)*\*\*[[:space:]]*//')
    
    # Strip markdown bold markers
    desc=$(echo "$desc" | sed -E 's/\*\*//g')
    
    # Extract action verb and main object (look for common action verbs)
    if [[ "$desc" =~ ^(Rename|Update|Create|Verify|Delete|Add|Remove|Test|Implement|Fix|Refactor|Document|Migrate|Copy|Set|Run|If)([[:space:]]*:[[:space:]]*|[[:space:]]+)(.+)$ ]]; then
        local verb="${BASH_REMATCH[1]}"
        local separator="${BASH_REMATCH[2]}"
        local rest="${BASH_REMATCH[3]}"
        
        # For "Test:" prefix, include the object being tested
        if [[ "$verb" == "Test" ]] && [[ "$separator" =~ : ]]; then
            # Take up to arrow, period, or first 50 chars
            if [[ "$rest" =~ ^([^.→]+)[.→] ]]; then
                rest="${BASH_REMATCH[1]}"
            else
                rest=$(echo "$rest" | cut -c1-50)
            fi
            # Remove any trailing quotes, backticks, or markdown
            rest=$(echo "$rest" | sed -E 's/`[[:space:]]*$//; s/[[:space:]]*$//')
            echo "$verb: $rest"
        else
            # For other verbs, take up to colon with space (title separator) or first 50 chars
            if [[ "$rest" =~ ^([^:]+):[[:space:]] ]]; then
                rest="${BASH_REMATCH[1]}"
            else
                rest=$(echo "$rest" | cut -c1-50)
            fi
            # Remove any trailing quotes, backticks, or markdown
            rest=$(echo "$rest" | sed -E 's/`[[:space:]]*$//; s/[[:space:]]*$//')
            echo "$verb $rest"
        fi
    else
        # Fallback: take first 60 chars or up to first colon
        if [[ "$desc" =~ ^([^:.]+)[:.] ]]; then
            echo "${BASH_REMATCH[1]}"
        else
            echo "$desc" | cut -c1-60 | sed 's/[[:space:]]*$//'
        fi
    fi
}

# Function to get next THUNK number
get_next_thunk_number() {
    local max_num=0
    
    # Parse THUNK.md for highest THUNK number using regex
    while IFS= read -r line; do
        if [[ "$line" =~ ^\|[[:space:]]*([0-9]+)[[:space:]]*\| ]]; then
            local thunk_num="${BASH_REMATCH[1]}"
            if [[ $thunk_num -gt $max_num ]]; then
                max_num=$thunk_num
            fi
        fi
    done < <(grep -E '^\|[[:space:]]*[0-9]+[[:space:]]*\|' "$THUNK_FILE")
    
    echo $((max_num + 1))
}

# Function to normalize description for comparison
normalize_description() {
    local desc="$1"
    # Remove markdown bold, backticks, leading/trailing whitespace, task IDs, trailing colons
    desc=$(echo "$desc" | sed -E 's/\*\*//g; s/`//g; s/^[[:space:]]*//; s/[[:space:]]*$//; s/^[T]?[0-9]+(\.[0-9]+)*[[:space:]]*:?[[:space:]]*//; s/:+[[:space:]]*$//')
    echo "$desc"
}

# Function to check if task already exists in THUNK.md
task_exists_in_thunk() {
    local description="$1"
    local normalized=$(normalize_description "$description")
    
    # Search THUNK.md for matching description using regex parsing
    while IFS= read -r line; do
        if [[ "$line" =~ ^\|[[:space:]]*([0-9]+)[[:space:]]*\|[[:space:]]*([^|]+)[[:space:]]*\|[[:space:]]*([^|]+)[[:space:]]*\|[[:space:]]*([^|]+)[[:space:]]*\|[[:space:]]*([^|]+)[[:space:]]*\|$ ]]; then
            local thunk_desc=$(normalize_description "${BASH_REMATCH[4]}")
            if [[ "$thunk_desc" == "$normalized" ]]; then
                return 0  # Found
            fi
        fi
    done < <(grep -E '^\|[[:space:]]*[0-9]+[[:space:]]*\|' "$THUNK_FILE")
    
    return 1  # Not found
}

# Function to extract task ID from description
extract_task_id() {
    local desc="$1"
    # Match patterns like **T1.1**, **1.1**, T1.1, 1.1 at start
    if [[ "$desc" =~ ^\*\*([T]?[0-9]+(\.[0-9]+)*)\*\* ]]; then
        echo "${BASH_REMATCH[1]}"
    elif [[ "$desc" =~ ^([T]?[0-9]+(\.[0-9]+)*)[[:space:]] ]]; then
        echo "${BASH_REMATCH[1]}"
    else
        echo "LEGACY"
    fi
}

# Function to detect priority from section
get_current_priority() {
    local section_upper="${1^^}"
    if [[ "$section_upper" =~ HIGH[[:space:]]*PRIORITY ]]; then
        echo "HIGH"
    elif [[ "$section_upper" =~ MEDIUM[[:space:]]*PRIORITY ]]; then
        echo "MEDIUM"
    elif [[ "$section_upper" =~ LOW[[:space:]]*PRIORITY ]]; then
        echo "LOW"
    else
        echo "MEDIUM"
    fi
}

# Function to scan IMPLEMENTATION_PLAN.md for new completions
scan_for_new_completions() {
    local current_section=""
    local current_priority="MEDIUM"
    local new_count=0
    local next_thunk_num=$(get_next_thunk_number)
    local timestamp=$(date "+%Y-%m-%d")
    
    echo "Scanning IMPLEMENTATION_PLAN.md for new completions..."
    
    while IFS= read -r line; do
        # Detect priority sections
        local line_upper="${line^^}"
        if [[ "$line_upper" =~ HIGH[[:space:]]*PRIORITY ]] && [[ ! "$line_upper" =~ ARCHIVE ]]; then
            current_section="$line"
            current_priority="HIGH"
        elif [[ "$line_upper" =~ MEDIUM[[:space:]]*PRIORITY ]] && [[ ! "$line_upper" =~ ARCHIVE ]]; then
            current_section="$line"
            current_priority="MEDIUM"
        elif [[ "$line_upper" =~ LOW[[:space:]]*PRIORITY ]] && [[ ! "$line_upper" =~ ARCHIVE ]]; then
            current_section="$line"
            current_priority="LOW"
        fi
        
        # Check for completed tasks
        if [[ "$line" =~ ^[[:space:]]*-[[:space:]]\[x\][[:space:]]*(.*)$ ]]; then
            local task_desc="${BASH_REMATCH[1]}"
            
            # Skip if already in THUNK.md
            if task_exists_in_thunk "$task_desc"; then
                continue
            fi
            
            # Extract task ID
            local task_id=$(extract_task_id "$task_desc")
            
            # Append to THUNK.md
            # Find the last table in the current era
            local temp_file="${THUNK_FILE}.tmp"
            local found_table=false
            local last_table_line=0
            local line_num=0
            
            # Find last table row position
            while IFS= read -r thunk_line; do
                ((line_num++))
                if [[ "$thunk_line" =~ ^\|[[:space:]]*[0-9]+[[:space:]]*\| ]]; then
                    last_table_line=$line_num
                    found_table=true
                fi
            done < "$THUNK_FILE"
            
            if [[ "$found_table" == "true" ]]; then
                # Insert after last table row
                {
                    head -n "$last_table_line" "$THUNK_FILE"
                    echo "| $next_thunk_num | $task_id | $current_priority | $task_desc | $timestamp |"
                    tail -n +$((last_table_line + 1)) "$THUNK_FILE"
                } > "$temp_file"
                mv "$temp_file" "$THUNK_FILE"
            else
                # No table found, append at end
                echo "| $next_thunk_num | $task_id | $current_priority | $task_desc | $timestamp |" >> "$THUNK_FILE"
            fi
            
            ((new_count++))
            ((next_thunk_num++))
        fi
    done < "$PLAN_FILE"
    
    if [[ $new_count -gt 0 ]]; then
        echo "✓ Added $new_count new completion(s) to THUNK.md"
    else
        echo "✓ No new completions found"
    fi
    
    sleep 2
}

# Function to display THUNK.md contents (full refresh)
display_thunks() {
    clear
    
    # Header
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║          THUNK RALPH TASKS - $(date +%H:%M:%S)                     ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    
    local current_era=""
    local total_count=0
    local in_era=false
    local display_row=4  # Track row position (starting after header)
    
    while IFS= read -r line; do
        # Detect Era headers
        if [[ "$line" =~ ^##[[:space:]]+Era:[[:space:]]+(.+)$ ]]; then
            current_era="${BASH_REMATCH[1]}"
            in_era=true
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            ((display_row++))
            echo "  Era: $current_era"
            ((display_row++))
        elif [[ "$line" =~ ^Started:[[:space:]]+(.+)$ ]]; then
            echo "  Started: ${BASH_REMATCH[1]}"
            ((display_row++))
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            ((display_row++))
        elif [[ "$line" =~ ^\|[[:space:]]*([0-9]+)[[:space:]]*\|[[:space:]]*([^|]+)[[:space:]]*\|[[:space:]]*([^|]+)[[:space:]]*\|[[:space:]]*([^|]+)[[:space:]]*\|[[:space:]]*([^|]+)[[:space:]]*\|$ ]]; then
            # Parse table row
            local thunk_num="${BASH_REMATCH[1]}"
            local orig_num="${BASH_REMATCH[2]}"
            local priority="${BASH_REMATCH[3]}"
            local description="${BASH_REMATCH[4]}"
            local completed="${BASH_REMATCH[5]}"
            
            # Strip whitespace
            thunk_num=$(echo "$thunk_num" | xargs)
            orig_num=$(echo "$orig_num" | xargs)
            priority=$(echo "$priority" | xargs)
            description=$(echo "$description" | xargs)
            completed=$(echo "$completed" | xargs)
            
            # Skip header row
            if [[ "$thunk_num" =~ ^[0-9]+$ ]]; then
                # Generate human-friendly short title
                local short_title=$(generate_title "$description")
                
                # Format as "THUNK N — <short title>" with bold if terminal supports
                if [[ -t 1 ]]; then
                    echo -e "  \033[32m✓\033[0m \033[1mTHUNK #$thunk_num\033[0m — $short_title"
                else
                    echo "  ✓ THUNK #$thunk_num — $short_title"
                fi
                ((total_count++))
                ((display_row++))
            fi
        fi
    done < "$THUNK_FILE"
    
    if [[ $total_count -eq 0 ]]; then
        echo "  No completed tasks yet."
        ((display_row++))
        echo ""
        ((display_row++))
    fi
    
    # Footer
    echo ""
    ((display_row++))
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    ((display_row++))
    echo "  Total Thunked: $total_count"
    ((display_row++))
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    ((display_row++))
    echo ""
    ((display_row++))
    
    # Hotkey legend
    echo "╔════════════════════════════════════════════════════════════════╗"
    ((display_row++))
    echo "║  HOTKEYS: [r] Refresh/Clear   [f] Force Sync   [e] New Era    ║"
    ((display_row++))
    echo "║           [q] Quit                                             ║"
    ((display_row++))
    echo "╚════════════════════════════════════════════════════════════════╝"
    ((display_row++))
    echo ""
    ((display_row++))
    
    # Store last display row and total count for incremental updates
    LAST_DISPLAY_ROW=$display_row
    LAST_TOTAL_COUNT=$total_count
}

# Function to parse only new entries from THUNK.md (tail-only parsing)
# Args: $1 = start_line (line number to start reading from)
# Appends new entries to display and updates footer
parse_new_thunk_entries() {
    local start_line="$1"
    local line_num=0
    local new_count=0
    
    # Position cursor at the row where new content should be appended
    # This is stored from the last full display
    local append_row=$((LAST_DISPLAY_ROW - 8))  # Back up before footer (8 lines: blank, separator, total, separator, blank, 3 hotkey lines)
    
    while IFS= read -r line; do
        ((line_num++))
        
        # Skip lines before start_line
        if [[ $line_num -le $start_line ]]; then
            continue
        fi
        
        # Parse table rows only (skip headers, era markers, etc.)
        if [[ "$line" =~ ^\|[[:space:]]*([0-9]+)[[:space:]]*\|[[:space:]]*([^|]+)[[:space:]]*\|[[:space:]]*([^|]+)[[:space:]]*\|[[:space:]]*([^|]+)[[:space:]]*\|[[:space:]]*([^|]+)[[:space:]]*\|$ ]]; then
            # Parse table row
            local thunk_num="${BASH_REMATCH[1]}"
            local orig_num="${BASH_REMATCH[2]}"
            local priority="${BASH_REMATCH[3]}"
            local description="${BASH_REMATCH[4]}"
            local completed="${BASH_REMATCH[5]}"
            
            # Strip whitespace
            thunk_num=$(echo "$thunk_num" | xargs)
            orig_num=$(echo "$orig_num" | xargs)
            priority=$(echo "$priority" | xargs)
            description=$(echo "$description" | xargs)
            completed=$(echo "$completed" | xargs)
            
            # Skip header row
            if [[ "$thunk_num" =~ ^[0-9]+$ ]]; then
                # Generate human-friendly short title
                local short_title=$(generate_title "$description")
                
                # Position cursor and append new entry
                tput cup $append_row 0
                if [[ -t 1 ]]; then
                    echo -e "  \033[32m✓\033[0m \033[1mTHUNK #$thunk_num\033[0m — $short_title"
                else
                    echo "  ✓ THUNK #$thunk_num — $short_title"
                fi
                
                ((new_count++))
                ((append_row++))
            fi
        fi
    done < "$THUNK_FILE"
    
    # Update the total count in footer
    local new_total=$((LAST_TOTAL_COUNT + new_count))
    local footer_row=$((append_row + 2))  # Skip blank line, then separator
    
    # Clear and redraw footer with updated count
    tput cup $footer_row 0
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    tput cup $((footer_row + 1)) 0
    echo "  Total Thunked: $new_total"
    tput cup $((footer_row + 2)) 0
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    tput cup $((footer_row + 3)) 0
    echo ""
    
    # Update stored state
    LAST_DISPLAY_ROW=$((footer_row + 9))  # Footer + blank + 3 hotkey lines + blank
    LAST_TOTAL_COUNT=$new_total
}

# Function to create new era
create_new_era() {
    clear
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                    CREATE NEW ERA                              ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    echo -n "  Enter new era name: "
    read -r era_name
    
    if [[ -z "$era_name" ]]; then
        echo "  Cancelled - no name provided."
        sleep 2
        return
    fi
    
    local timestamp=$(date "+%Y-%m-%d")
    
    # Append new era section to THUNK.md
    cat >> "$THUNK_FILE" << EOF

## Era: $era_name
Started: $timestamp

| THUNK # | Original # | Priority | Description | Completed |
|---------|------------|----------|-------------|-----------|

EOF
    
    echo ""
    echo "  ✓ Created new era: $era_name"
    sleep 2
}

# Main loop
echo "Starting Thunk Ralph Tasks Monitor..."
echo "Watching: $THUNK_FILE"
echo "Syncing with: $PLAN_FILE"
echo ""

# Initial scan for completions
scan_for_new_completions

# Display thunks immediately
display_thunks

# Get initial modification times and line count
LAST_THUNK_MODIFIED=$(get_file_mtime "$THUNK_FILE")
LAST_PLAN_MODIFIED=$(get_file_mtime "$PLAN_FILE")
LAST_LINE_COUNT=$(wc -l < "$THUNK_FILE" 2>/dev/null || echo "0")

# Enable non-blocking input
if [[ -t 0 ]]; then
    stty -echo -icanon time 0 min 0
fi

# Cleanup function
cleanup() {
    if [[ -t 0 ]]; then
        stty sane
    fi
    echo ""
    echo "Exiting Thunk Ralph Tasks Monitor..."
    exit 0
}

trap cleanup EXIT INT TERM

# Monitor loop
while true; do
    # Check for hotkey input
    if read -t 0.1 -n 1 key 2>/dev/null; then
        case "$key" in
            r|R)
                # Refresh/Clear
                display_thunks
                LAST_THUNK_MODIFIED=$(get_file_mtime "$THUNK_FILE")
                LAST_LINE_COUNT=$(wc -l < "$THUNK_FILE" 2>/dev/null || echo "0")
                ;;
            f|F)
                # Force sync
                scan_for_new_completions
                LAST_THUNK_MODIFIED=$(get_file_mtime "$THUNK_FILE")
                LAST_LINE_COUNT=$(wc -l < "$THUNK_FILE" 2>/dev/null || echo "0")
                display_thunks
                ;;
            e|E)
                # New era
                create_new_era
                LAST_THUNK_MODIFIED=$(get_file_mtime "$THUNK_FILE")
                LAST_LINE_COUNT=$(wc -l < "$THUNK_FILE" 2>/dev/null || echo "0")
                display_thunks
                ;;
            q|Q)
                # Quit
                cleanup
                ;;
        esac
    fi
    
    # Check for file changes
    CURRENT_THUNK_MODIFIED=$(get_file_mtime "$THUNK_FILE")
    CURRENT_PLAN_MODIFIED=$(get_file_mtime "$PLAN_FILE")
    
    if [[ "$CURRENT_THUNK_MODIFIED" != "$LAST_THUNK_MODIFIED" ]]; then
        LAST_THUNK_MODIFIED="$CURRENT_THUNK_MODIFIED"
        
        # Check line count to determine update strategy
        CURRENT_LINE_COUNT=$(wc -l < "$THUNK_FILE" 2>/dev/null || echo "0")
        
        if [[ "$CURRENT_LINE_COUNT" -lt "$LAST_LINE_COUNT" ]]; then
            # Line count decreased - full refresh needed (rare case: deletions)
            display_thunks
        elif [[ "$CURRENT_LINE_COUNT" -gt "$LAST_LINE_COUNT" ]]; then
            # Line count increased - only new lines added (common case: append-only)
            # Use tail-only parsing for efficiency
            parse_new_thunk_entries "$LAST_LINE_COUNT"
        else
            # Same line count - content modified (edits)
            display_thunks
        fi
        
        LAST_LINE_COUNT="$CURRENT_LINE_COUNT"
    fi
    
    if [[ "$CURRENT_PLAN_MODIFIED" != "$LAST_PLAN_MODIFIED" ]]; then
        LAST_PLAN_MODIFIED="$CURRENT_PLAN_MODIFIED"
        # Auto-sync when IMPLEMENTATION_PLAN.md changes
        scan_for_new_completions
        LAST_THUNK_MODIFIED=$(get_file_mtime "$THUNK_FILE")
        LAST_LINE_COUNT=$(wc -l < "$THUNK_FILE" 2>/dev/null || echo "0")
        display_thunks
    fi
    
    # Small sleep to prevent CPU spinning
    sleep 0.5
done
