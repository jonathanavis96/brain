#!/usr/bin/env bash
# notify_human.sh - Send notification to human with sound and popup
# Usage: bash notify_human.sh "Title" "Message"
#
# Called by Ralph when creating waiver requests or needing human attention

set -euo pipefail

TITLE="${1:-Ralph Alert}"
MESSAGE="${2:-Ralph needs your attention}"

POWERSHELL="/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe"

if [[ -x "$POWERSHELL" ]]; then
    # Play attention sound (3 ascending beeps)
    "$POWERSHELL" -Command "[console]::beep(800,200); [console]::beep(1000,200); [console]::beep(1200,300)" 2>/dev/null &
    
    # Show popup (non-blocking with timeout)
    "$POWERSHELL" -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show('$MESSAGE', '$TITLE', 'OK', 'Warning')" 2>/dev/null
else
    # Fallback: just print to stderr
    echo "🔔 ALERT: $TITLE - $MESSAGE" >&2
fi
