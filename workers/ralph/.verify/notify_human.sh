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
read -r -d '' PS_SCRIPT << 'PSEOF' || true
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$form = New-Object System.Windows.Forms.Form
$form.Text = "TITLE_PLACEHOLDER"
$form.Size = New-Object System.Drawing.Size(450, 250)
$form.StartPosition = "Manual"
$form.Location = New-Object System.Drawing.Point(-1616, 472)
$form.TopMost = $false
$form.ShowInTaskbar = $true

$label = New-Object System.Windows.Forms.Label
$label.Location = New-Object System.Drawing.Point(20, 20)
$label.Size = New-Object System.Drawing.Size(400, 140)
$label.Text = "MESSAGE_PLACEHOLDER"
$label.Font = New-Object System.Drawing.Font("Segoe UI", 10)
$form.Controls.Add($label)

$okButton = New-Object System.Windows.Forms.Button
$okButton.Location = New-Object System.Drawing.Point(170, 170)
$okButton.Size = New-Object System.Drawing.Size(100, 30)
$okButton.Text = "OK - Approve"
$okButton.DialogResult = [System.Windows.Forms.DialogResult]::OK
$form.Controls.Add($okButton)
$form.AcceptButton = $okButton

$result = $form.ShowDialog()
if ($result -eq [System.Windows.Forms.DialogResult]::OK) {
    Write-Output "APPROVED"
}
PSEOF

# Escape quotes and substitute placeholders
ESCAPED_TITLE="${TITLE//\"/\\\"}"
ESCAPED_MESSAGE="${MESSAGE//\"/\\\"}"
PS_SCRIPT="${PS_SCRIPT//TITLE_PLACEHOLDER/$ESCAPED_TITLE}"
PS_SCRIPT="${PS_SCRIPT//MESSAGE_PLACEHOLDER/$ESCAPED_MESSAGE}"

# Run popup and capture result
RESULT=$("$POWERSHELL" -Command "$PS_SCRIPT" 2>/dev/null || echo "")

if [[ "$RESULT" == "APPROVED" && -n "$WAIVER_REQUEST" && -f "$WAIVER_REQUEST" ]]; then
    # Auto-approve the waiver
    WAIVER_ID=$(basename "$WAIVER_REQUEST" .json)
    APPROVE_FILE="${SCRIPT_DIR}/waivers/${WAIVER_ID}.approved"

    # Extract info from JSON
    RULE_ID=$(grep -o '"rule_id":\s*"[^"]*"' "$WAIVER_REQUEST" | cut -d'"' -f4)
    REASON=$(grep -o '"reason":\s*"[^"]*"' "$WAIVER_REQUEST" | cut -d'"' -f4)
    PATHS=$(grep -o '"paths":\s*\[[^]]*\]' "$WAIVER_REQUEST" | sed 's/.*\[//;s/\].*//;s/"//g')
    REQUEST_HASH=$(sha256sum "$WAIVER_REQUEST" | cut -d' ' -f1)
    EXPIRY=$(date -d "+30 days" +%Y-%m-%d)

    mkdir -p "${SCRIPT_DIR}/waivers"
    cat > "$APPROVE_FILE" << EOF
WAIVER_ID=$WAIVER_ID
RULE_ID=$RULE_ID
PATHS=$PATHS
REASON=$REASON
APPROVED_BY=human-popup
APPROVED_AT=$(date +%Y-%m-%d\ %H:%M:%S)
EXPIRES=$EXPIRY
REQUEST_SHA256=$REQUEST_HASH
EOF

    echo "✅ Waiver $WAIVER_ID approved via popup"
else
    echo "ℹ️ Notification shown (no approval action)"
fi
