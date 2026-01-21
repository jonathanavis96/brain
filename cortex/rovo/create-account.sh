#!/usr/bin/env bash
set -euo pipefail

# create-account.sh - Automated account creation wrapper
# Usage: 
#   ./create-account.sh              # Auto-detect next account number
#   ./create-account.sh 54           # Create specific account number
#   ./create-account.sh --dry-run    # Show what would be created without running

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROVO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Configuration
PASSWORD="yNjdEM9CB7JPMp5"  # Current password for new accounts
VARIATIONS_FILE="$ROVO_ROOT/config/email-variations.txt"
USED_EMAILS_FILE="$ROVO_ROOT/config/used-emails.txt"
CREDS_DIR="$ROVO_ROOT/state/creds"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
DRY_RUN=false
SHOW_BROWSER=false
ACCOUNT_NUM=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run|-n)
            DRY_RUN=true
            shift
            ;;
        --show|-s)
            SHOW_BROWSER=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS] [ACCOUNT_NUMBER]"
            echo ""
            echo "Options:"
            echo "  --dry-run, -n    Show what would be created without running"
            echo "  --show, -s       Keep browser visible (disable auto-hide and positioning)"
            echo "  --help, -h       Show this help message"
            echo ""
            echo "If ACCOUNT_NUMBER is not provided, auto-detects the next number."
            exit 0
            ;;
        *)
            ACCOUNT_NUM="$1"
            shift
            ;;
    esac
done

# Function to get the next account number
# Considers both successful (account_59) and burnt (account_59_burnt) directories
get_next_account_num() {
    local max_num=0
    
    # Check state/creds directories
    if [[ -d "$CREDS_DIR" ]]; then
        for dir in "$CREDS_DIR"/account_*; do
            if [[ -d "$dir" ]]; then
                # Extract number from account_XX or account_XX_burnt
                num=$(basename "$dir" | sed 's/account_//' | sed 's/_burnt$//')
                if [[ "$num" =~ ^[0-9]+$ ]] && (( num > max_num )); then
                    max_num=$num
                fi
            fi
        done
    fi
    
    echo $((max_num + 1))
}

# Function to get list of used emails
# Includes both successful and burnt account directories
get_used_emails() {
    {
        # From state/creds directories (both account_XX and account_XX_burnt)
        for dir in "$CREDS_DIR"/account_*/; do
            if [[ -f "$dir/email" ]]; then
                cat "$dir/email"
                echo ""  # Add newline
            fi
        done
        # From manual tracking file
        if [[ -f "$USED_EMAILS_FILE" ]]; then
            cat "$USED_EMAILS_FILE"
        fi
    } | sort -u
}

# Function to get next unused email
get_next_unused_email() {
    local used_emails
    used_emails=$(get_used_emails)
    
    while IFS= read -r email || [[ -n "$email" ]]; do
        # Skip empty lines and comments
        [[ -z "$email" || "$email" =~ ^# ]] && continue
        
        # Check if email is already used
        if ! echo "$used_emails" | grep -qxF "$email"; then
            echo "$email"
            return 0
        fi
    done < "$VARIATIONS_FILE"
    
    echo "ERROR: No unused email variations remaining!" >&2
    return 1
}

# Determine account number
if [[ -z "$ACCOUNT_NUM" ]]; then
    ACCOUNT_NUM=$(get_next_account_num)
fi

# Get next unused email
NEXT_EMAIL=$(get_next_unused_email)
if [[ -z "$NEXT_EMAIL" ]]; then
    echo -e "${RED}ERROR: Could not find an unused email variation${NC}"
    exit 1
fi

# Build the variables
SITE_NAME="grafeeti${ACCOUNT_NUM}"
DISPLAY_NAME="Grafeeti ${ACCOUNT_NUM}"

# Display what we're about to do
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          ATLASSIAN ACCOUNT CREATION                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${GREEN}Account Number:${NC}  $ACCOUNT_NUM"
echo -e "  ${GREEN}Email:${NC}           $NEXT_EMAIL"
echo -e "  ${GREEN}Display Name:${NC}    $DISPLAY_NAME"
echo -e "  ${GREEN}Site Name:${NC}       $SITE_NAME"
echo -e "  ${GREEN}Site URL:${NC}        https://${SITE_NAME}.atlassian.net"
echo -e "  ${GREEN}Password:${NC}        $PASSWORD"
echo ""

if [[ "$DRY_RUN" == true ]]; then
    echo -e "${YELLOW}[DRY RUN] Would execute:${NC}"
    echo ""
    echo "  cd $ROVO_ROOT && python3 src/create_account.py \\"
    echo "    \"$NEXT_EMAIL\" \\"
    echo "    \"$DISPLAY_NAME\" \\"
    echo "    \"$PASSWORD\" \\"
    echo "    \"$SITE_NAME\""
    echo ""
    echo -e "${YELLOW}To run for real, remove --dry-run flag${NC}"
    exit 0
fi

# Confirm before running
echo -e "${YELLOW}Ready to create account. Press Enter to continue, Ctrl+C to cancel...${NC}"
read -r

# Mark email as used BEFORE running (in case of partial failure)
echo "$NEXT_EMAIL" >> "$USED_EMAILS_FILE"
echo -e "${GREEN}✓ Email marked as used${NC}"

# Run the Python script
echo ""
echo -e "${BLUE}Starting account creation...${NC}"
if [[ "$SHOW_BROWSER" == true ]]; then
    echo -e "${YELLOW}  --show mode: Browser will stay visible on main monitor${NC}"
fi
echo ""

cd "$ROVO_ROOT"

# Build Python command with optional --show flag
if [[ "$SHOW_BROWSER" == true ]]; then
    python3 src/create_account.py "$NEXT_EMAIL" "$DISPLAY_NAME" "$PASSWORD" "$SITE_NAME" --show
else
    python3 src/create_account.py "$NEXT_EMAIL" "$DISPLAY_NAME" "$PASSWORD" "$SITE_NAME"
fi

RESULT=$?

if [[ $RESULT -eq 0 ]]; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║          ACCOUNT CREATED SUCCESSFULLY!                     ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  Credentials saved to: ${CREDS_DIR}/account_${ACCOUNT_NUM}/"
    echo ""
    echo -e "  To view credentials:"
    echo -e "    cat ${CREDS_DIR}/account_${ACCOUNT_NUM}/api_token"
    echo ""
else
    echo ""
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║          ACCOUNT CREATION FAILED                           ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  Check logs in: ${ROVO_ROOT}/logs/"
    echo ""
    echo -e "  Partial credentials may be saved to:"
    echo -e "    ${CREDS_DIR}/account_${ACCOUNT_NUM}/"
    echo ""
fi

exit $RESULT
