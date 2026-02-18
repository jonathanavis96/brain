#!/bin/bash

echo "=== TOP 10 DESTINATION FOLDERS (MAIN) ==="
cut -d'>' -f2 /tmp/copy_list_main.txt | sed 's/^ *//;s/ *$//' | xargs -I {} dirname {} | sort | uniq -c | sort -rn | head -10

echo ""
echo "=== TOP 10 DESTINATION FOLDERS (ROVO) ==="
cut -d'>' -f2 /tmp/copy_list_rovo.txt | sed 's/^ *//;s/ *$//' | xargs -I {} dirname {} | sort | uniq -c | sort -rn | head -10
