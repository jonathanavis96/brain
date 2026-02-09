#!/usr/bin/env bash
set -euo pipefail

INTAKE_PATH="${1:-}"
OUT_DIR="${2:-tmp_rovodev_audit_out}"

if [[ -z "${INTAKE_PATH}" ]]; then
  echo "Usage: $0 <intake.json> [out_dir]" >&2
  exit 2
fi

python3 "$(dirname "$0")/auditgen.py" --intake "${INTAKE_PATH}" --out "${OUT_DIR}"

echo "Wrote: ${OUT_DIR}" >&2
