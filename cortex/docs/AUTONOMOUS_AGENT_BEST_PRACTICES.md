# Autonomous Coding Agent Best Practices

Research compiled from: Aider, SWE-agent, OpenHands, shell_gpt, and OpenAI/Anthropic cookbooks.

## Executive Summary

The Cerebras agent is failing because it violates several fundamental principles:

1. **READ BEFORE WRITE** - Agent guesses at file content instead of reading first
2. **ATOMIC OPERATIONS** - No validation that patches will apply before attempting
3. **ERROR RECOVERY** - Loops on pre-commit failures instead of handling gracefully
4. **SINGLE TASK FOCUS** - Gets confused between multiple files/tasks

---

## 1. Tool Design Principles

### 1.1 Read-Before-Write Pattern (Critical)

**Problem:** Our agent tried to patch `loop.sh:504-508` without reading those lines first.

**Solution from Aider:**

```text
Once you understand the request you MUST:
1. Decide if you need to propose edits to files that haven't been added to the chat
2. If you need to edit existing files not already added, you MUST tell the user and ASK to add them
3. Think step-by-step and explain the needed changes
4. THEN describe each change with a SEARCH/REPLACE block

```text

**Solution from SWE-agent:**

```yaml
# From default.yaml
1. As a first step, it might be a good idea to find and read code relevant to the <pr_description>
2. Create a script to reproduce the error and execute it
3. Edit the sourcecode of the repo to resolve the issue
4. Rerun your reproduce script and confirm that the error is fixed!

```text

**Implementation for Cerebras:**

```python
# In system prompt, add mandatory workflow:
MANDATORY_WORKFLOW = """
Before ANY file modification:
1. read_file or head_file to see current content
2. Identify exact lines to change
3. Use patch_file with EXACT match from what you just read
4. Verify change with diff or read_file

NEVER guess at file content. ALWAYS read first.
"""

```text

### 1.2 Tool Result Feedback

**From SWE-agent parsing.py:**

```python
error_message = """
{%- if error_code == "missing" -%}
Your last output did not use any tool calls!
Please make sure your output includes exactly _ONE_ function call!
{%- elif error_code == "multiple" -%}
Your last output included multiple tool calls!
Please make sure your output includes a thought and exactly _ONE_ function call.
{%- elif error_code == "unexpected_arg" -%}
Your action could not be parsed properly: {{exception_message}}.
{%- endif -%}
"""

```text

**Current Cerebras problem:** When `patch_file` fails with "Pattern not found", the agent doesn't get clear guidance on what to do next.

**Improved error messages:**

```python
def execute_patch_file(path, find, replace, cwd):
    # ... existing code ...
    if find not in content:
        # Provide actionable feedback
        return ToolResult(
            success=False,
            output="",
            error=f"""Pattern not found in {path}.
            
RECOVERY STEPS:
1. Run: head_file {path} 50  (to see actual content)
2. Copy the EXACT text you want to replace
3. Try patch_file again with the exact text

Common issues:

- Whitespace mismatch (spaces vs tabs)

- Line ending differences

- Content changed since last read
"""
        )

```text

### 1.3 Tool Atomicity

**From Aider editblock_coder.py:**

```python
def match_but_for_leading_whitespace(whole_lines, part_lines):
    """Fuzzy matching for whitespace differences"""
    # Check if non-whitespace content matches
    if not all(whole_lines[i].lstrip() == part_lines[i].lstrip() for i in range(num)):
        return None
    # Calculate consistent offset
    add = set(...)
    if len(add) != 1:
        return None
    return add.pop()

```text

**Implementation:** Add fuzzy matching to `patch_file`:

```python
def execute_patch_file(path, find, replace, cwd):
    content = full_path.read_text()
    
    # Try exact match first
    if find in content:
        new_content = content.replace(find, replace, 1)
        # ... apply ...
        return ToolResult(success=True, ...)
    
    # Try whitespace-normalized match
    normalized_find = normalize_whitespace(find)
    for match in find_fuzzy_matches(content, normalized_find):
        # Show user what we found
        return ToolResult(
            success=False,
            error=f"Exact match not found. Did you mean:\n```\n{match}\n```\n"
                  f"Re-run with this exact text."
        )
    
    return ToolResult(success=False, error="No similar content found")

```text

---

## 2. Prompt Engineering

### 2.1 Single-Task Focus

**From Aider wholefile_prompts.py:**

```text
Once you understand the request you MUST:
1. Determine if any code changes are needed.
2. Explain any needed changes.
3. If changes are needed, output a copy of each file that needs changes.

```text

**From our PROMPT.md:** Already has this, but buried. Need to emphasize:

```markdown
## CRITICAL: One Task Per Iteration

You are working on EXACTLY ONE task:
{task_description}

DO NOT:

- Work on other tasks from IMPLEMENTATION_PLAN.md

- Fix unrelated issues you notice

- Refactor beyond the task scope

If you discover related issues, note them in THUNK.md for future tasks.

```text

### 2.2 Explicit Workflow Steps

**From SWE-agent default.yaml:**

```yaml
instance_template: |-
  Follow these steps to resolve the issue:
  1. As a first step, find and read code relevant to the description
  2. Create a script to reproduce the error
  3. Edit the sourcecode to resolve the issue
  4. Rerun your reproduce script and confirm the fix
  5. Remove your reproduction script
  6. Run the submit command

```text

**For Cerebras Ralph tasks:**

```markdown
## Task Workflow (MANDATORY)

### Step 1: Understand

- Read the task from IMPLEMENTATION_PLAN.md

- Read the target file(s) using head_file or read_file

- Identify the EXACT lines to modify

### Step 2: Plan

- Use think tool to record your plan

- State which lines will change and why

### Step 3: Execute

- Make ONE change at a time

- Verify each change with diff tool

### Step 4: Commit

- Stage changes with git_commit

- If pre-commit fails, read the error and fix it

- Do NOT retry the same commit without fixing the issue

### Step 5: Log

- Append completion to THUNK.md

- Output :::BUILD_READY:::

```text

### 2.3 Status Markers

**Current:** `:::BUILD_READY:::` and `:::PLAN_READY:::`

**Problem:** Agent sometimes outputs these prematurely.

**Solution:** Add verification requirement:

```markdown
Before outputting :::BUILD_READY:::, verify:
1. [ ] git status shows clean working tree OR committed changes
2. [ ] No uncommitted modifications to target files
3. [ ] THUNK.md has been updated with completion entry

If ANY of these fail, DO NOT output :::BUILD_READY:::

```text

---

## 3. Error Recovery

### 3.1 Retry Classification

**From Aider exceptions.py:**

```python
EXCEPTIONS = [
    ExInfo("APIConnectionError", retry=True, description=None),
    ExInfo("AuthenticationError", retry=False, 
           description="Check your API key."),
    ExInfo("RateLimitError", retry=True,
           description="Rate limited. Waiting..."),
    ExInfo("BadRequestError", retry=False, description=None),
]

```text

**For Cerebras tools:**

```python
ERROR_CLASSIFICATION = {
    # Retryable with backoff
    "rate_limit": {"retry": True, "backoff": "exponential"},
    "timeout": {"retry": True, "backoff": "linear"},
    "connection_error": {"retry": True, "backoff": "exponential"},
    
    # Retryable with different approach
    "pattern_not_found": {"retry": True, "action": "read_file_first"},
    "pre_commit_failed": {"retry": True, "action": "fix_then_retry"},
    
    # Not retryable
    "file_not_found": {"retry": False, "action": "report_error"},
    "permission_denied": {"retry": False, "action": "report_error"},
    "auth_error": {"retry": False, "action": "abort"},
}

```text

### 3.2 Pre-commit Failure Handling

**Current problem:** Agent loops trying to commit when pre-commit modifies files.

**Solution:**

```python
def execute_git_commit(message, files, cwd):
    # First attempt
    result = subprocess.run(["git", "commit", "-m", message], ...)
    
    if "end-of-file-fixer" in result.stderr:
        # Pre-commit modified files - stage and retry ONCE
        subprocess.run(["git", "add", "-A"], ...)
        result = subprocess.run(["git", "commit", "-m", message], ...)
        
        if result.returncode != 0:
            return ToolResult(
                success=False,
                error=f"Pre-commit keeps modifying files. Manual intervention needed.\n"
                      f"Run: git status\n"
                      f"Then: git add -A && git commit -m '{message}'"
            )
    
    return ToolResult(success=True, output=result.stdout)

```text

### 3.3 Max Requeries

**From SWE-agent:**

```python
max_requeries: int = 3
"""Maximum number of times to requery the model after an error, such as a
formatting error, a blocked action, or a bash syntax error."""

```text

**Implementation:**

```python
class CerebrasAgent:
    def __init__(self):
        self.error_counts = defaultdict(int)
        self.max_retries = {
            "patch_failed": 2,      # Try twice, then give up
            "commit_failed": 2,     # Two attempts
            "rate_limit": 5,        # More patience for rate limits
        }
    
    def handle_error(self, error_type, context):
        self.error_counts[error_type] += 1
        if self.error_counts[error_type] > self.max_retries.get(error_type, 3):
            return "ABORT", f"Max retries exceeded for {error_type}"
        return "RETRY", self.get_recovery_guidance(error_type, context)

```text

---

## 4. Context Management

### 4.1 History Truncation

**From SWE-agent history_processors.py:**

```python
class CacheControlHistoryProcessor:
    """Add cache control to the last N messages for prompt caching."""
    last_n_messages: int = 2
    tagged_roles: list[str] = ["user", "tool"]

```text

**From Aider sendchat.py:**

```python
def sanity_check_messages(messages):
    """Check if messages alternate between user and assistant roles."""
    last_role = None
    for msg in messages:
        if msg["role"] == "system":
            continue
        if last_role and msg["role"] == last_role:
            raise ValueError("Messages don't properly alternate")
        last_role = msg["role"]

```text

### 4.2 Tool Result Truncation

**Current implementation (good):**

```python
def truncate_tool_result(result: str, max_chars: int = MAX_TOOL_RESULT_CHARS) -> str:
    if len(result) <= max_chars:
        return result
    # Keep first and last parts
    half = max_chars // 2 - 50
    return f"{result[:half]}\n\n[...truncated {len(result) - max_chars} chars...]\n\n{result[-half:]}"

```text

### 4.3 File Content in Context

**From Aider repomap.py:**

- Uses tree-sitter to extract function/class signatures

- Provides "map" of codebase without full content

- Only includes full content for files explicitly added

**Recommendation:** Add a `symbols` tool that shows file structure without full content:

```python
def execute_symbols(path, cwd):
    """Show function/class definitions without bodies."""
    # Extract: class Foo, def bar(), etc.
    # Don't include implementation details

```text
✅ Already implemented in cerebras_agent.py!

---

## 5. Specific Fixes for Cerebras Agent

### 5.1 Immediate Fixes

#### Fix 1: append_file newline (DONE)

```python
if content and not content.endswith("\n"):
    content = content + "\n"
```

#### Fix 2: patch_file guidance

```python
error=f"""Pattern not found in {path}.

NEXT STEPS:
1. head_file {path} 50
2. Find the exact text to replace
3. patch_file with exact match
"""
```

#### Fix 3: git_commit retry logic

```python
# Auto-stage pre-commit modifications and retry ONCE
if "files were modified by this hook" in stderr:
    subprocess.run(["git", "add", "-A"])
    # Retry commit
```

### 5.2 System Prompt Improvements

Add to start of system prompt:

```markdown
## CRITICAL RULES

1. **READ BEFORE WRITE**: Always read_file or head_file before patch_file
2. **ONE TASK ONLY**: Complete the assigned task, nothing else
3. **VERIFY PATCHES**: After patch_file, use diff to confirm change
4. **FIX THEN COMMIT**: If pre-commit fails, fix the issue first
5. **NO GUESSING**: Never assume file content - always verify

```text

### 5.3 Task Injection Format

Current:

```text
Task: - [ ] **5.1** `loop.sh:504-508` - Add `.initialized` marker check

```text

Improved:

```text
## YOUR TASK (Complete this and ONLY this)

**ID:** 5.1
**File:** workers/ralph/loop.sh
**Lines:** 504-508
**Action:** Add `.initialized` marker check to `run_verifier()`

### Requirements

- If verifier.sh missing AND .verify/.initialized exists → hard-fail (exit 1)

- If verifier.sh missing AND .initialized missing → soft-fail (return 1)

### Workflow
1. head_file workers/ralph/loop.sh 60 (starting ~line 480)
2. Identify current run_verifier() logic
3. think: plan the change
4. patch_file with exact match
5. diff workers/ralph/loop.sh to verify
6. git_commit "feat(ralph): add .initialized security check"
7. append_file THUNK.md with completion
8. Output: :::BUILD_READY:::

```text

---

## 6. Testing Recommendations

### 6.1 Dry Run Mode

Before running with real model:

```bash
# Test tool execution
python cerebras_agent.py --dry-run --task "5.1"

```text

### 6.2 Single Tool Tests

```python
# Test patch_file error messages
result = execute_patch_file("test.py", "nonexistent", "new", "/tmp")
assert "NEXT STEPS" in result.error
assert "head_file" in result.error

```text

### 6.3 Integration Test

```bash
# Run one iteration and check:
# 1. File was read before modified
# 2. Commit succeeded or failed gracefully
# 3. No infinite loops
bash loop.sh --runner cerebras --model qwen -i1 --timeout 120

```text

---

## 7. Success Metrics

After implementing these changes, measure:

1. **First-attempt success rate**: % of tasks completed without retry
2. **Read-before-write compliance**: % of patches preceded by read
3. **Commit success rate**: % of commits that succeed first try
4. **Loop avoidance**: Max iterations per task (should be <5)

---

## References

- [Aider editblock_prompts.py](https://github.com/Aider-AI/aider/blob/main/aider/coders/editblock_prompts.py)
- [SWE-agent default.yaml](https://github.com/SWE-agent/SWE-agent/blob/main/config/default.yaml)
- [SWE-agent parsing.py](https://github.com/SWE-agent/SWE-agent/blob/main/sweagent/tools/parsing.py)
- [OpenAI Function Calling Cookbook](https://github.com/openai/openai-cookbook/blob/main/examples/How_to_call_functions_with_chat_models.ipynb)
- [Anthropic Tool Use Cookbook](https://github.com/anthropics/anthropic-cookbook/tree/main/tool_use)

---

## 8. Cerebras-Specific: Token Efficiency

### 8.1 The Problem

Every API call sends the full conversation history. Unlike RovoDev (which maintains server-side context), Cerebras is stateless - each turn requires re-sending:

- System prompt (~11K chars)
- User prompt
- All previous assistant messages
- All tool results

### 8.2 Implemented Solution: Tool Result Summarization

Added `summarize_old_tool_results()` based on SWE-agent's `LastNObservations`:

```python
# In cerebras_agent.py
KEEP_RECENT_TURNS = 6  # Keep last 6 messages with full content

def summarize_old_tool_results(messages, keep_recent=KEEP_RECENT_TURNS):
    """Replace old tool outputs with one-line summaries."""
    # Messages 0-1: system + user (keep full)
    # Messages 2 to -keep_recent: summarize tool results
    # Last keep_recent messages: keep full
```

**Before:** Each tool result might be 100+ lines
**After:** Old results become: `[Tool output: 47 lines] def run_verifier():...`

### 8.3 Other Approaches Considered

| Approach | Pros | Cons |
|----------|------|------|
| **Prompt caching** | Automatic if supported | Cerebras may do internally |
| **Chat summarization** | Better context | Requires extra API call |
| **Aggressive pruning** | Simple | Loses important context |
| **Tool result limits** | Predictable | May miss details |

### 8.4 Monitoring Token Usage

Check the log for token counts:

```text
Prompt tokens:     115,891  # Should decrease over turns
Completion tokens: 2,122
Total tokens:      118,013
API requests:      10
```

If prompt tokens stay constant or grow, summarization isn't working.
