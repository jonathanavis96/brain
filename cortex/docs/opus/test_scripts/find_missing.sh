#!/bin/bash

# Known important files that should exist in source
EXPECTED_FILES=(
    "README.md"
    ".gitignore"
    "AGENTS.md"
    "kb/README.md"
    "references/README.md"
    "templates/README.md"
)

MISSING=()
SOURCE_BASE="/mnt/c/Users/grafe.MASTERRIG/Desktop/AllDoneSites/brain"

for file in "${EXPECTED_FILES[@]}"; do
    if [[ ! -f "$SOURCE_BASE/$file" ]]; then
        MISSING+=("$file")
    fi
done

if [[ ${#MISSING[@]} -gt 0 ]]; then
    echo "MISSING FILES:"
    printf '%s\n' "${MISSING[@]}"
else
    echo "No missing files found."
fi
