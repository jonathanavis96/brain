# Opus 4.6 Free Tier Exploit Investigation

This directory contains the complete investigation into alleged Claude Opus 4.6 free tier access exploits.

## Contents

- `INVESTIGATION_COMPLETE.md` - Comprehensive investigation report (Feb 18, 2026)
- `ORIGINAL_EXPLOIT_NOTES.md` - Historical documentation of the Feb 16-17 exploit
- `test_scripts/` - All test scripts used during investigation

## TL;DR

**No working exploit exists.** Atlassian has proper server-side subscription enforcement. All tested methods (30+) failed.

The UI misleadingly shows "Using model: claude-opus-4-6" but actually falls back to GPT-5.2 or Sonnet 4.5.

## Timeline

- **Feb 16, 2026:** Exploit working (global config bypass)
- **Feb 17, 2026:** Exploit patched by Atlassian
- **Feb 18, 2026:** Comprehensive investigation confirms no bypass exists

## Investigation Metrics

- **Iterations:** 17
- **Test methods:** 30+
- **Time spent:** ~1 hour
- **Result:** All methods blocked
