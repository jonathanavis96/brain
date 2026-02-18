#!/usr/bin/env bash
set -euo pipefail

CREDS_DIR="/home/grafe/code/rovo/state/creds"
count=0

for account_dir in "$CREDS_DIR"/account_*; do
    [ -d "$account_dir" ] || continue
    account_name=$(basename "$account_dir")
    echo "Processing: $account_name"
    ((count++))
    [ $count -ge 5 ] && break
done

echo "Processed $count accounts"
