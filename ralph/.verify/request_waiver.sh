#!/usr/bin/env bash
#
# Waiver Request Helper
# Creates a properly formatted waiver request JSON file.
#
# Usage:
#   ./.verify/request_waiver.sh <RULE_ID> <FILE_PATH> "<REASON>"
#
# Example:
#   ./.verify/request_waiver.sh Hygiene.MarkdownFenceLang docs/snippets.md "File uses plain fences for copy/paste UX"
#
# Ralph CAN run this script. It only creates REQUEST files.
# Approval requires Jono to run approve_waiver_totp.py with OTP.
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REQUESTS_DIR="${SCRIPT_DIR}/waiver_requests"

# Default expiry: 30 days from now
DEFAULT_EXPIRY_DAYS=30

usage() {
    cat << 'EOF'
Usage: request_waiver.sh <RULE_ID> <FILE_PATH> "<REASON>"

Arguments:
  RULE_ID    The AC rule being waived (e.g., Hygiene.MarkdownFenceLang)
  FILE_PATH  The specific file path to waive (no wildcards)
  REASON     Why this waiver is needed (in quotes)

Options:
  --expiry DAYS  Set custom expiry (default: 30, max: 60)
  --help         Show this help

Example:
  ./.verify/request_waiver.sh Hygiene.MarkdownFenceLang docs/snippets.md \
    "This file intentionally uses plain fences for copy/paste UX"

After creating the request, ask Jono to approve:
  source .venv/bin/activate
  python .verify/approve_waiver_totp.py .verify/waiver_requests/<WAIVER_ID>.json
EOF
    exit 1
}

# Parse arguments
EXPIRY_DAYS=$DEFAULT_EXPIRY_DAYS
POSITIONAL=()

while [[ $# -gt 0 ]]; do
    case $1 in
        --expiry)
            EXPIRY_DAYS="$2"
            shift 2
            ;;
        --help|-h)
            usage
            ;;
        *)
            POSITIONAL+=("$1")
            shift
            ;;
    esac
done

set -- "${POSITIONAL[@]}"

if [[ $# -lt 3 ]]; then
    echo "ERROR: Missing required arguments"
    usage
fi

RULE_ID="$1"
FILE_PATH="$2"
REASON="$3"

# Validate inputs
if [[ -z "$RULE_ID" ]]; then
    echo "ERROR: RULE_ID cannot be empty"
    exit 1
fi

if [[ -z "$FILE_PATH" ]]; then
    echo "ERROR: FILE_PATH cannot be empty"
    exit 1
fi

if [[ "$FILE_PATH" == "." || "$FILE_PATH" == "*" || "$FILE_PATH" == "**" || "$FILE_PATH" == "**/*" ]]; then
    echo "ERROR: Wildcard or repo-wide scopes are forbidden"
    echo "Specify explicit file paths only."
    exit 1
fi

if [[ "$FILE_PATH" == *"*"* ]]; then
    echo "ERROR: Wildcards not allowed in FILE_PATH"
    exit 1
fi

if [[ -z "$REASON" ]]; then
    echo "ERROR: REASON cannot be empty"
    exit 1
fi

if [[ $EXPIRY_DAYS -gt 60 ]]; then
    echo "ERROR: Expiry cannot exceed 60 days"
    exit 1
fi

if [[ $EXPIRY_DAYS -lt 1 ]]; then
    echo "ERROR: Expiry must be at least 1 day"
    exit 1
fi

# Generate waiver ID
TODAY=$(date +%Y-%m-%d)

# Find next sequence number for today
mkdir -p "$REQUESTS_DIR"
SEQ=1
while [[ -f "${REQUESTS_DIR}/WVR-${TODAY}-$(printf '%03d' $SEQ).json" ]]; do
    ((SEQ++))
done

WAIVER_ID="WVR-${TODAY}-$(printf '%03d' $SEQ)"

# Calculate expiry date
if [[ "$(uname)" == "Darwin" ]]; then
    # macOS
    EXPIRES=$(date -v+${EXPIRY_DAYS}d +%Y-%m-%d)
else
    # Linux
    EXPIRES=$(date -d "+${EXPIRY_DAYS} days" +%Y-%m-%d)
fi

# Create request JSON
REQUEST_FILE="${REQUESTS_DIR}/${WAIVER_ID}.json"

cat > "$REQUEST_FILE" << EOF
{
  "waiver_id": "${WAIVER_ID}",
  "rule_id": "${RULE_ID}",
  "scope": {
    "paths": ["${FILE_PATH}"]
  },
  "reason": "${REASON}",
  "created_by": "ralph",
  "created_at": "${TODAY}",
  "expires": "${EXPIRES}"
}
EOF

echo "✅ Waiver request created: ${REQUEST_FILE}"
echo ""
echo "Request Details:"
echo "  Waiver ID: ${WAIVER_ID}"
echo "  Rule:      ${RULE_ID}"
echo "  Path:      ${FILE_PATH}"
echo "  Reason:    ${REASON}"
echo "  Expires:   ${EXPIRES}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  REQUEST CREATED - NOT YET APPROVED"
echo ""
echo "To approve, Jono must run:"
echo "  source .venv/bin/activate"
echo "  python .verify/approve_waiver_totp.py ${REQUEST_FILE}"
echo ""
echo "Then enter the 6-digit OTP from Google Authenticator."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
