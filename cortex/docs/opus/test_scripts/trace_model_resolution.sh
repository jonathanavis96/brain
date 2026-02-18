#!/bin/bash
# Trace what cortex.bash actually does

echo "=== TRACING CORTEX.BASH MODEL RESOLUTION ==="

# Simulate what cortex.bash does
MODEL_ARG="opus46"
RESOLVED_MODEL=""

if [[ -n "$MODEL_ARG" ]]; then
  case "$MODEL_ARG" in
    opus46 | opus-4-6 | opus4.6)
      RESOLVED_MODEL="claude-opus-4-6"
      echo "opus46 resolves to: $RESOLVED_MODEL"
      ;;
    opus | opus45 | opus-4-5)
      RESOLVED_MODEL="anthropic.claude-opus-4-5-20251101-v1:0"
      echo "opus resolves to: $RESOLVED_MODEL"
      ;;
    sonnet | sonnet45 | sonnet-4-5)
      RESOLVED_MODEL="anthropic.claude-sonnet-4-5-20250929-v1:0"
      echo "sonnet resolves to: $RESOLVED_MODEL"
      ;;
    auto)
      RESOLVED_MODEL=""
      echo "auto resolves to: (empty/auto)"
      ;;
    *)
      RESOLVED_MODEL="$MODEL_ARG"
      echo "Unknown resolves to: $RESOLVED_MODEL"
      ;;
  esac
fi

echo ""
echo "But the ACTUAL config has: claude-sonnet-4-5@20250929"
echo ""
echo "This means cortex.bash line 76 is NOT setting MODEL_ARG=\"opus46\"!"
echo "Let me check what it actually does..."

grep -A5 "MODEL_ARG=" cortex/cortex.bash | head -10
