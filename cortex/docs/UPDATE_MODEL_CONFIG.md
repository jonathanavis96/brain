# Updating Cortex Model Configuration

This guide explains how to change the default model for Cortex sessions.

## When to Use This

- Changing default model (e.g., Opus 4.6 → Sonnet, or adding new models)
- Adding new model aliases
- Updating model IDs when new versions release

## Files to Update

All changes must be made in **4 locations** to maintain consistency:

1. **`~/.rovodev/config.yml`** - Global RovoDev config (user-specific)
2. **`cortex/cortex.bash`** - Active Cortex launcher (brain repo)
3. **`templates/cortex/cortex.bash`** - Template for new projects
4. **`templates/cortex/cortex-PROJECT.bash`** - Project-specific template

## Step-by-Step Process

### 1. Update Global Config

```bash
# Edit your global RovoDev config
vim ~/.rovodev/config.yml

# Find the agent section and update modelId:
agent:
  modelId: claude-opus-4-6  # Change this to your desired model
```

**Common model IDs:**
- `claude-opus-4-6` - Opus 4.6 (latest)
- `anthropic.claude-opus-4-5-20251101-v1:0` - Opus 4.5
- `anthropic.claude-sonnet-4-5-20250929-v1:0` - Sonnet 4.5
- `auto` - Use system default

### 2. Update Cortex Launcher Scripts

Each file has two sections to update:

#### A. Default Model Assignment

Find:
```bash
# Defaults
MODEL_ARG="opus46" # Default to Opus 4.6 for Cortex
```

Change to:
```bash
MODEL_ARG="your-alias" # Default to YourModel for Cortex
```

#### B. Model Resolution Case Statement

Find the `case "$MODEL_ARG" in` block and add/update:

```bash
case "$MODEL_ARG" in
  your-alias | your-model | yourmodel)
    RESOLVED_MODEL="your-model-id"
    ;;
  # ... existing cases ...
esac
```

**Example (adding Opus 4.6):**
```bash
case "$MODEL_ARG" in
  opus46 | opus-4-6 | opus4.6)
    RESOLVED_MODEL="claude-opus-4-6"
    ;;
  opus | opus45 | opus-4-5)
    RESOLVED_MODEL="anthropic.claude-opus-4-5-20251101-v1:0"
    ;;
  sonnet | sonnet45 | sonnet-4-5)
    RESOLVED_MODEL="anthropic.claude-sonnet-4-5-20250929-v1:0"
    ;;
  auto)
    RESOLVED_MODEL=""
    ;;
  *)
    RESOLVED_MODEL="$MODEL_ARG"
    ;;
esac
```

### 3. Update All Three Scripts

Apply the same changes to:

1. **`cortex/cortex.bash`**
   - Lines ~65 (default), ~99-120 (case statement)

2. **`templates/cortex/cortex.bash`**
   - Lines ~80 (default), ~103-120 (case statement)

3. **`templates/cortex/cortex-PROJECT.bash`**
   - Lines ~81 (default), ~102-109 (case statement)

**Tip:** Use find/replace to ensure consistency across all files.

### 4. Test the Change

```bash
# Start a new Cortex session
bash cortex/cortex.bash

# Verify the model in output:
# Should show: ✔ Using model: your-model-id
```

### 5. Commit Changes

```bash
git add ~/.rovodev/config.yml cortex/cortex.bash templates/cortex/
git commit -m "feat(cortex): update default model to YourModel

- Changed default from OldModel to YourModel
- Updated global config: ~/.rovodev/config.yml
- Updated cortex launchers: cortex.bash + templates
- Added model aliases: your-alias, your-model, yourmodel"
```

## Quick Checklist

- [ ] Updated `~/.rovodev/config.yml` → `modelId:`
- [ ] Updated `cortex/cortex.bash` → Default + case statement
- [ ] Updated `templates/cortex/cortex.bash` → Default + case statement
- [ ] Updated `templates/cortex/cortex-PROJECT.bash` → Default + case statement
- [ ] Tested: `bash cortex/cortex.bash` shows correct model
- [ ] Committed all 4 files with descriptive message

## Common Model Aliases

| Alias | Model ID | Use Case |
|-------|----------|----------|
| `opus46` | `claude-opus-4-6` | Latest Opus (best reasoning) |
| `opus45` | `anthropic.claude-opus-4-5-20251101-v1:0` | Opus 4.5 (legacy) |
| `sonnet45` | `anthropic.claude-sonnet-4-5-20250929-v1:0` | Sonnet 4.5 (fast, cost-effective) |
| `auto` | (empty string) | Use RovoDev system default |

## Troubleshooting

**Issue:** Cortex still uses old model after update

**Solution:**
- Check temp config files: `ls -la /tmp/cortex_config_*.yml`
- Restart your shell session
- Verify all 4 files were updated (use `grep "MODEL_ARG" <file>`)

**Issue:** Model not found / fallback to default

**Solution:**
- Verify model ID is correct (check `/models` in RovoDev)
- Ensure model is available on your plan tier
- Check logs: `~/.rovodev/logs/rovodev.log`

## See Also

- **Cortex agent guidance:** `cortex/AGENTS.md`
- **Model exploit discovery:** (historical) Session 2026-02-16 - Opus 4.6 tier bypass
- **RovoDev config reference:** `rovodev-config.template.yml`
