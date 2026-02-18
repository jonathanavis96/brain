# Test Scripts

All test scripts used during the Opus 4.6 exploit investigation.

## Script Categories

### Model ID Testing
- `test_opus_variants.sh` - Various Opus model ID formats
- `test_opus_date_suffix.sh` - Date suffix formats (@20250929, @latest)
- `test_model_id_variations.sh` - Alternative model name formats
- `test_opus45.sh` - Opus 4.5 variants

### Configuration Testing
- `test_config_file_exploit.sh` - Temp config file method
- `test_exact_cortex_format.sh` - Exact cortex.bash format
- `verify_agent_vs_runtime.sh` - Config structure variations
- `test_workspace_config.sh` - Workspace-specific configs

### Environment & Session Testing
- `test_env_override.sh` - Environment variable exploits
- `test_session_continuation.sh` - Session restoration
- `test_old_sessions.sh` - Old session manipulation

### Analysis Scripts
- `analyze_cortex_script.sh` - cortex.bash analysis
- `check_current_session.sh` - Running process inspection
- `trace_model_resolution.sh` - Model resolution debugging
- `definitive_test.sh` - Final verification test

## Key Findings

All scripts confirmed: **No working exploit exists.**

The UI shows "Using model: claude-opus-4-6" but logs reveal GPT-5.2 or Sonnet 4.5 actually responded.
