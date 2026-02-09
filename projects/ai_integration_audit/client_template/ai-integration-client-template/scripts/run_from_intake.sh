#!/usr/bin/env bash
set -euo pipefail

INTAKE_PATH="${1:-client/intake.json}"
OUT_DIR="${2:-outputs}"

python3 "$(dirname "$0")/../auditgen/auditgen.py" \
  --intake "${INTAKE_PATH}" \
  --out "${OUT_DIR}"
