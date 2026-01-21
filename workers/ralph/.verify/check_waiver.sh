#!/usr/bin/env bash
#
# Waiver Verification Helper
# Called by verifier.sh to check if a valid waiver exists for a gate+file.
#
# Usage:
#   source .verify/check_waiver.sh
#   if check_waiver "Hygiene.MarkdownFenceLang" "docs/snippets.md"; then
#       echo "Waiver valid, skip gate"
#   fi
#
# Returns 0 if valid waiver exists, 1 otherwise.
#

VERIFY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WAIVERS_DIR="${VERIFY_DIR}/waivers"
REQUESTS_DIR="${VERIFY_DIR}/waiver_requests"

# Check if a valid waiver exists for a given rule and file
# Args: $1 = rule_id, $2 = file_path
# Returns: 0 if valid waiver exists, 1 otherwise
check_waiver() {
    local rule_id="$1"
    local file_path="$2"
    
    # No waivers directory = no waivers
    [[ -d "$WAIVERS_DIR" ]] || return 1
    
    # Search all approved waivers
    shopt -s nullglob
    for approved_file in "${WAIVERS_DIR}"/*.approved; do
        [[ -f "$approved_file" ]] || continue
        
        # Parse the approved file
        local waiver_rule=""
        local waiver_paths=""
        local waiver_expires=""
        local waiver_id=""
        local request_hash=""
        
        while IFS='=' read -r key value; do
            case "$key" in
                WAIVER_ID) waiver_id="$value" ;;
                RULE_ID) waiver_rule="$value" ;;
                PATHS) waiver_paths="$value" ;;
                EXPIRES) waiver_expires="$value" ;;
                REQUEST_SHA256) request_hash="$value" ;;
            esac
        done < "$approved_file"
        
        # Check rule matches
        [[ "$waiver_rule" == "$rule_id" ]] || continue
        
        # Check file is in scope (comma-separated paths)
        local path_match=false
        IFS=',' read -ra paths_array <<< "$waiver_paths"
        for waiver_path in "${paths_array[@]}"; do
            if [[ "$waiver_path" == "$file_path" ]]; then
                path_match=true
                break
            fi
        done
        [[ "$path_match" == "true" ]] || continue
        
        # Check not expired
        local today
        today=$(date +%Y-%m-%d)
        if [[ "$waiver_expires" < "$today" ]]; then
            # Expired waiver
            continue
        fi
        
        # Verify request hash (if request file exists)
        local request_file="${REQUESTS_DIR}/${waiver_id}.json"
        if [[ -f "$request_file" ]]; then
            local current_hash
            current_hash=$(sha256sum "$request_file" 2>/dev/null | cut -d' ' -f1)
            if [[ "$current_hash" != "$request_hash" ]]; then
                # Request was modified after approval - invalid
                echo "WARNING: Waiver ${waiver_id} invalid - request modified after approval" >&2
                continue
            fi
        fi
        
        # Valid waiver found
        return 0
    done
    
    # No valid waiver found
    return 1
}

# Get waiver info for display
# Args: $1 = rule_id, $2 = file_path
# Outputs: waiver details if found
get_waiver_info() {
    local rule_id="$1"
    local file_path="$2"
    
    [[ -d "$WAIVERS_DIR" ]] || return 1
    
    shopt -s nullglob
    for approved_file in "${WAIVERS_DIR}"/*.approved; do
        [[ -f "$approved_file" ]] || continue
        
        local waiver_rule=""
        local waiver_paths=""
        local waiver_expires=""
        local waiver_id=""
        local waiver_reason=""
        
        while IFS='=' read -r key value; do
            case "$key" in
                WAIVER_ID) waiver_id="$value" ;;
                RULE_ID) waiver_rule="$value" ;;
                PATHS) waiver_paths="$value" ;;
                EXPIRES) waiver_expires="$value" ;;
                REASON) waiver_reason="$value" ;;
            esac
        done < "$approved_file"
        
        [[ "$waiver_rule" == "$rule_id" ]] || continue
        
        IFS=',' read -ra paths_array <<< "$waiver_paths"
        for waiver_path in "${paths_array[@]}"; do
            if [[ "$waiver_path" == "$file_path" ]]; then
                echo "WAIVED: ${waiver_id} (expires: ${waiver_expires})"
                return 0
            fi
        done
    done
    
    return 1
}

# Count active (non-expired) waivers
count_active_waivers() {
    local count=0
    local today
    today=$(date +%Y-%m-%d)
    
    [[ -d "$WAIVERS_DIR" ]] || { echo 0; return; }
    
    shopt -s nullglob
    for approved_file in "${WAIVERS_DIR}"/*.approved; do
        [[ -f "$approved_file" ]] || continue
        
        local waiver_expires=""
        while IFS='=' read -r key value; do
            [[ "$key" == "EXPIRES" ]] && waiver_expires="$value"
        done < "$approved_file"
        
        if [[ -n "$waiver_expires" && ! "$waiver_expires" < "$today" ]]; then
            ((count++))
        fi
    done
    
    echo "$count"
}

# List all active waivers
list_active_waivers() {
    local today
    today=$(date +%Y-%m-%d)
    
    [[ -d "$WAIVERS_DIR" ]] || return
    
    echo "Active Waivers:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    local found=false
    shopt -s nullglob
    for approved_file in "${WAIVERS_DIR}"/*.approved; do
        [[ -f "$approved_file" ]] || continue
        
        local waiver_id="" waiver_rule="" waiver_paths="" waiver_expires=""
        while IFS='=' read -r key value; do
            case "$key" in
                WAIVER_ID) waiver_id="$value" ;;
                RULE_ID) waiver_rule="$value" ;;
                PATHS) waiver_paths="$value" ;;
                EXPIRES) waiver_expires="$value" ;;
            esac
        done < "$approved_file"
        
        if [[ -n "$waiver_expires" && ! "$waiver_expires" < "$today" ]]; then
            found=true
            echo "  ${waiver_id}"
            echo "    Rule:    ${waiver_rule}"
            echo "    Paths:   ${waiver_paths}"
            echo "    Expires: ${waiver_expires}"
            echo ""
        fi
    done
    
    if [[ "$found" == "false" ]]; then
        echo "  (none)"
    fi
}
