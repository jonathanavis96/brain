#!/usr/bin/env bash
# notify_human.sh - Send notification with optional auto-approve
# Usage: bash notify_human.sh "Title" "Message" [waiver_request_file]
#
# If waiver_request_file is provided and user clicks OK, auto-approves the waiver

set -euo pipefail

TITLE="${1:-Ralph Alert}"
MESSAGE="${2:-Ralph needs your attention}"
WAIVER_REQUEST="${3:-}"

POWERSHELL="/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ ! -x "$POWERSHELL" ]]; then
  echo "🔔 ALERT: $TITLE - $MESSAGE" >&2
  exit 0
fi

# Play attention sound at 30% volume in background
"$POWERSHELL" -Command "
\$player = New-Object System.Media.SoundPlayer
[console]::beep(600,150); Start-Sleep -Milliseconds 50; [console]::beep(800,150); Start-Sleep -Milliseconds 50; [console]::beep(1000,200)
" 2>/dev/null &

# Build popup script - positioned on left monitor, non-modal
read -r -d '' PS_SCRIPT <<'PSEOF' || true
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$form = New-Object System.Windows.Forms.Form
$form.Text = "TITLE_PLACEHOLDER"
$form.Size = New-Object System.Drawing.Size(600, 450)
$form.StartPosition = "Manual"
$form.Location = New-Object System.Drawing.Point(-1716, 300)
$form.TopMost = $false
$form.ShowInTaskbar = $true

$label = New-Object System.Windows.Forms.Label
$label.Location = New-Object System.Drawing.Point(20, 20)
$label.Size = New-Object System.Drawing.Size(550, 280)
$label.Text = "MESSAGE_PLACEHOLDER"
$label.Font = New-Object System.Drawing.Font("Segoe UI", 10)
$form.Controls.Add($label)

$otpLabel = New-Object System.Windows.Forms.Label
$otpLabel.Location = New-Object System.Drawing.Point(20, 310)
$otpLabel.Size = New-Object System.Drawing.Size(200, 25)
$otpLabel.Text = "Enter 6-digit OTP to approve:"
$otpLabel.Font = New-Object System.Drawing.Font("Segoe UI", 10)
$form.Controls.Add($otpLabel)

$otpBox = New-Object System.Windows.Forms.TextBox
$otpBox.Location = New-Object System.Drawing.Point(220, 308)
$otpBox.Size = New-Object System.Drawing.Size(100, 25)
$otpBox.Font = New-Object System.Drawing.Font("Segoe UI", 12)
$otpBox.MaxLength = 6
$form.Controls.Add($otpBox)

$approveButton = New-Object System.Windows.Forms.Button
$approveButton.Location = New-Object System.Drawing.Point(150, 360)
$approveButton.Size = New-Object System.Drawing.Size(130, 35)
$approveButton.Text = "Approve"
$approveButton.DialogResult = [System.Windows.Forms.DialogResult]::OK
$form.Controls.Add($approveButton)
$form.AcceptButton = $approveButton

$cancelButton = New-Object System.Windows.Forms.Button
$cancelButton.Location = New-Object System.Drawing.Point(310, 360)
$cancelButton.Size = New-Object System.Drawing.Size(130, 35)
$cancelButton.Text = "Cancel"
$cancelButton.DialogResult = [System.Windows.Forms.DialogResult]::Cancel
$form.Controls.Add($cancelButton)

$result = $form.ShowDialog()
if ($result -eq [System.Windows.Forms.DialogResult]::OK) {
    Write-Output "OTP:$($otpBox.Text)"
}
PSEOF

# Escape quotes and substitute placeholders
ESCAPED_TITLE="${TITLE//\"/\\\"}"
ESCAPED_MESSAGE="${MESSAGE//\"/\\\"}"
PS_SCRIPT="${PS_SCRIPT//TITLE_PLACEHOLDER/$ESCAPED_TITLE}"
PS_SCRIPT="${PS_SCRIPT//MESSAGE_PLACEHOLDER/$ESCAPED_MESSAGE}"

# Run popup and capture result
RESULT=$("$POWERSHELL" -Command "$PS_SCRIPT" 2>/dev/null || echo "")

# Check if OTP was provided
if [[ "$RESULT" == OTP:* && -n "$WAIVER_REQUEST" && -f "$WAIVER_REQUEST" ]]; then
  OTP_CODE="${RESULT#OTP:}"

  if [[ -z "$OTP_CODE" ]]; then
    echo "❌ No OTP code entered"
    exit 1
  fi

  # Verify OTP using Python script
  REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
  VERIFY_SCRIPT="${REPO_ROOT}/.verify/approve_waiver_totp.py"

  if [[ -f "$VERIFY_SCRIPT" ]]; then
    # Activate venv if available
    VENV_ACTIVATE="${REPO_ROOT}/.venv/bin/activate"
    if [[ -f "$VENV_ACTIVATE" ]]; then
      # shellcheck source=/dev/null
      source "$VENV_ACTIVATE"
    fi

    # Call Python with OTP via stdin
    if echo "$OTP_CODE" | python3 "$VERIFY_SCRIPT" "$WAIVER_REQUEST" 2>/dev/null; then
      echo "✅ Waiver approved via popup with TOTP"
    else
      echo "❌ Invalid OTP code - waiver NOT approved"
      exit 1
    fi
  else
    # Fallback: manual approval without TOTP (legacy mode)
    WAIVER_ID=$(basename "$WAIVER_REQUEST" .json)
    APPROVE_FILE="${SCRIPT_DIR}/waivers/${WAIVER_ID}.approved"

    RULE_ID=$(grep -o '"rule_id":\s*"[^"]*"' "$WAIVER_REQUEST" | cut -d'"' -f4)
    REASON=$(grep -o '"reason":\s*"[^"]*"' "$WAIVER_REQUEST" | cut -d'"' -f4)
    PATHS=$(grep -o '"paths":\s*\[[^]]*\]' "$WAIVER_REQUEST" | sed 's/.*\[//;s/\].*//;s/"//g')
    REQUEST_HASH=$(sha256sum "$WAIVER_REQUEST" | cut -d' ' -f1)
    EXPIRY=$(date -d "+30 days" +%Y-%m-%d)

    mkdir -p "${SCRIPT_DIR}/waivers"
    cat >"$APPROVE_FILE" <<EOF
WAIVER_ID=$WAIVER_ID
RULE_ID=$RULE_ID
PATHS=$PATHS
REASON=$REASON
APPROVED_BY=human-popup
APPROVED_AT=$(date +%Y-%m-%d\ %H:%M:%S)
EXPIRES=$EXPIRY
REQUEST_SHA256=$REQUEST_HASH
EOF
    echo "✅ Waiver $WAIVER_ID approved via popup (legacy mode)"
  fi
else
  echo "ℹ️ Notification shown (no approval action)"
fi
