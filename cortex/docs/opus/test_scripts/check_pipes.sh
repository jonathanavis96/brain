#!/bin/bash
# Check for ANY pipe into while pattern
grep -n '|[[:space:]]*while' "$1"
