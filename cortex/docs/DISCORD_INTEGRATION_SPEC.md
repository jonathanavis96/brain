# Discord Integration Specification

**Status:** Design Complete  
**Date:** 2026-01-27 16:36:00

## Overview

Post real-time build updates to Discord after each Ralph iteration completes.

## Architecture

### Components

1. **bin/discord-post** - Discord webhook sender utility
2. **Loop integration** - Call after `:::ITER_END:::` marker emitted
3. **Summary generator** - Extract iteration summary from logs/state

### Integration Point

**Location:** `workers/ralph/loop.sh` line ~2270 (after `emit_marker ":::ITER_END:::"`)

```bash
# Example variables (defined earlier in loop.sh):
# i=1                          # Current iteration number
# mode="BUILD"                 # Current mode (PLAN/BUILD)
# iter_end_ts="$(date +%s)"    # End timestamp

emit_marker ":::ITER_END::: iter=$i run_id=$ROLLFLOW_RUN_ID ts=$iter_end_ts"

# Post iteration summary to Discord (if configured)
if [[ -n "$DISCORD_WEBHOOK_URL" ]] && [[ -x "$ROOT/bin/discord-post" ]]; then
  generate_iteration_summary "$i" "$mode" | "$ROOT/bin/discord-post" || true
fi
```

## bin/discord-post Specification

### Interface

```bash
discord-post [OPTIONS]
```

**Input:** Summary text from stdin OR `--file FILE`  
**Output:** None (posts to Discord)  
**Exit codes:** 0 = success, 1 = failure (non-fatal)

### Options

- `--dry-run` - Print payload, don't post
- `--file FILE` - Read from file instead of stdin
- `--webhook URL` - Override DISCORD_WEBHOOK_URL env var

### Environment Variables

- `DISCORD_WEBHOOK_URL` (required) - Discord webhook URL
- `DISCORD_MAX_LENGTH` (optional, default: 1900) - Max chars per message

### Behavior

1. Read input text (stdin or file)
2. Chunk into messages ≤ `DISCORD_MAX_LENGTH` chars
3. POST each chunk to Discord webhook
4. Add 300ms delay between chunks (rate limit safety)
5. Never print webhook URL (security)

### Message Format

```markdown
**Ralph Iteration ${ITER} (${MODE})**
Timestamp: ${ISO8601}
Run ID: ${RUN_ID}

\`\`\`
${SUMMARY}
\`\`\`
```

### Chunking Strategy

- Split on paragraph boundaries (`\n\n`) when possible
- Fallback to line boundaries (`\n`)
- Last resort: hard split at max length
- Add `(continued...)` footer on chunks 1..N-1
- Add `(X of Y)` counter to each chunk

### Error Handling

- Missing webhook URL: Print warning, exit 0
- Invalid webhook URL: Print error, exit 1
- POST failure: Print error, exit 1
- All errors non-fatal to loop

## Summary Generator Specification

### Interface

```bash
generate_iteration_summary ITER_NUM MODE
```

**Output:** Plain text summary to stdout

### Content

```text
Iteration: ${ITER_NUM}
Mode: ${MODE}
Branch: ${BRANCH}
Timestamp: ${ISO8601}
Run ID: ${RUN_ID}

Git Status:
- ${N} files changed
- Commit: ${SHORT_SHA} ${COMMIT_MSG}

Verifier: ${STATUS}
${VERIFIER_SUMMARY}

Cache Stats:
- Hits: ${HITS}
- Misses: ${MISSES}
- Time saved: ${TIME}

Tasks:
- ${COMPLETED_TASKS}
```

### Data Sources

1. Iteration number/mode: function params
2. Git status: `git status --short`, `git log -1`
3. Verifier: `.verify/latest.txt` SUMMARY section
4. Cache stats: Global vars `CACHE_HITS`, `CACHE_MISSES`, `TIME_SAVED_MS`
5. Tasks: Parse THUNK.md for this iteration's completions

## Discord Webhook Format

### Payload Structure

```json
{
  "content": "**Ralph Iteration N (MODE)**\nTimestamp: ...\n```\n...\n```"
}
```

**Method:** POST  
**Content-Type:** application/json  
**Rate Limit:** ~5 msg/sec per webhook (300ms delay = safe)

### Message Limits

- **Max length:** 2000 chars (use 1900 for safety)
- **Max embeds:** 10 (not using)
- **Max files:** 10 (not using)

## Implementation Phases

### MVP (30-45 min)

- [x] **bin/discord-post** with chunking + dry-run
- [x] **generate_iteration_summary** function in loop.sh
- [x] **Integration** after ITER_END marker
- [x] **Error handling** (non-fatal)

### V1 - Milestones (20-30 min)

- [ ] **Start marker** - Post when loop starts with plan summary
- [ ] **End marker** - Post when loop completes with totals
- [ ] **Error alerts** - Post on verifier failures

### V2 - Polish (30-45 min)

- [ ] **Rich formatting** - Discord embeds instead of code blocks
- [ ] **Task links** - Link to GitHub commits/files
- [ ] **Metrics graph** - Inline charts (if feasible)
- [ ] **@mentions** - Notify on completion/errors

## Testing Strategy

### Unit Tests

1. **Chunking logic** - Long text splits correctly
2. **Message format** - Valid JSON, proper escaping
3. **Dry-run mode** - No network calls

### Integration Tests

1. **Mock webhook** - Test POST format with httpbin
2. **Real webhook** - Manual test with Discord test channel
3. **Loop integration** - Run `loop.sh --iterations 1` with webhook

### Manual Verification Checklist

- [ ] Set DISCORD_WEBHOOK_URL
- [ ] Run `echo "test" | bin/discord-post --dry-run`
- [ ] Run `echo "test" | bin/discord-post` (check Discord)
- [ ] Run loop.sh for 1 iteration (check Discord post)
- [ ] Test with 3000-char summary (verify chunking)
- [ ] Unset DISCORD_WEBHOOK_URL (verify non-fatal)
- [ ] Test invalid webhook URL (verify error handling)

## Security Considerations

1. **Never log webhook URL** - It's a secret token
2. **Env var only** - No command-line args with URL
3. **Rate limiting** - 300ms delay prevents abuse
4. **Content sanitization** - Escape special chars in JSON

## Dependencies

- `curl` - For HTTP POST
- `jq` - For JSON escaping
- Bash 4+ - For arrays, string manipulation

## References

- Discord Webhook API: <https://discord.com/developers/docs/resources/webhook>
- Ralph loop: `workers/ralph/loop.sh`
- Gap radar integration: Lines ~1931, ~2252 (non-blocking pattern)
