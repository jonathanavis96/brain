#!/usr/bin/env bash
set -euo pipefail

COMPANY_NAME="${1:-}"
OUT_DIR="${2:-outputs}"
RESEARCH_PROVIDER="${RESEARCH_PROVIDER:-stub}"

if [[ -z "${COMPANY_NAME}" ]]; then
  echo "Usage: $0 <company name> [out_dir]" >&2
  exit 2
fi

python3 "$(dirname "$0")/../auditgen/auditgen.py" \
  --company "${COMPANY_NAME}" \
  --research-provider "${RESEARCH_PROVIDER:-stub}" \
  --out "${OUT_DIR}"
