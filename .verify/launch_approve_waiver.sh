#!/bin/bash
# launch_approve_waiver.sh - Opens an interactive terminal window for TOTP waiver approval
# Usage: ./launch_approve_waiver.sh <waiver_request_filename>
# Example: ./launch_approve_waiver.sh WVR-pop-test-001.json

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VERIFY_DIR="${REPO_ROOT}/.verify"
REQUESTS_DIR="${VERIFY_DIR}/waiver_requests"

# Validate argument
if [[ -z "$1" ]]; then
  echo "ERROR: No waiver request filename provided."
  echo "Usage: $0 <waiver_request_filename>"
  echo "Example: $0 WVR-pop-test-001.json"
  exit 1
fi

REQUEST_FILE="$1"
REQUEST_PATH="${REQUESTS_DIR}/${REQUEST_FILE}"

# Check request file exists
if [[ ! -f "$REQUEST_PATH" ]]; then
  echo "ERROR: Request file not found: $REQUEST_PATH"
  exit 1
fi

echo "=== Launching TOTP Approval Terminal ==="
echo "Request: $REQUEST_FILE"
echo ""
echo "A new terminal window will open."
echo "It will display waiver details and prompt for your 6-digit OTP."
echo ""

# Create a temporary script that will run in the new terminal
TEMP_SCRIPT="${VERIFY_DIR}/.tmp_approve_runner.sh"
cat >"$TEMP_SCRIPT" <<ENDSCRIPT
#!/bin/bash
cd ${REPO_ROOT}
source .venv/bin/activate
echo ""
python .verify/approve_waiver_totp.py .verify/waiver_requests/${REQUEST_FILE}
EXIT_CODE=\$?
echo ""
if [[ \$EXIT_CODE -ne 0 ]]; then
    echo "ERROR: Script exited with code \$EXIT_CODE"
fi
echo "Press Enter to close..."
read
ENDSCRIPT
chmod +x "$TEMP_SCRIPT"

# Check if Windows Terminal (wt.exe) is available
if /mnt/c/Windows/System32/cmd.exe /c "where wt" >/dev/null 2>&1; then
  echo "Using Windows Terminal..."
  /mnt/c/Windows/System32/cmd.exe /c "start wt.exe wsl.exe -d Ubuntu -- ${TEMP_SCRIPT}" 2>/dev/null
else
  echo "Windows Terminal not found, using fallback..."
  /mnt/c/Windows/System32/cmd.exe /c "start wsl.exe -d Ubuntu -- ${TEMP_SCRIPT}" 2>/dev/null
fi

echo ""
echo "Terminal window launched!"
echo "Type your 6-digit OTP when prompted in the new window."
