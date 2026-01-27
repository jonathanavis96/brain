# Skill Quiz Tool

Interactive terminal-based quiz system for testing knowledge retention from skill documentation.

## Overview

The skill quiz tool presents scenarios from skill markdown files, allowing you to test your understanding before revealing solutions. It's designed to reinforce pattern recognition and decision-making skills documented in the brain repository.

## Components

- **`quiz.sh`** - Interactive bash wrapper for terminal-based quizzing
- **`extract_scenarios.py`** - Python parser that extracts problem/solution pairs from markdown files

## Usage

### Basic Quiz

Run quiz on a specific skill file:

```bash
cd /path/to/brain
bash tools/skill_quiz/quiz.sh skills/domains/code-quality/markdown-patterns.md
```

### Random Skill Quiz

Pick a random skill from the domains directory:

```bash
bash tools/skill_quiz/quiz.sh --random
```

### Custom Number of Rounds

Specify how many scenarios to present (default is 5):

```bash
bash tools/skill_quiz/quiz.sh --random --rounds 10
bash tools/skill_quiz/quiz.sh skills/domains/languages/shell/variable-patterns.md --rounds 3
```

### Help

```bash
bash tools/skill_quiz/quiz.sh --help
```

## How It Works

1. **Scenario Extraction:** The Python script parses markdown files looking for recognizable patterns:
   - `## Scenario` / `### Scenario` sections
   - `## Example` / `### Example` sections
   - `## Problem` / `### Problem` sections
   - `## When to Use` sections

2. **Interactive Presentation:**
   - Quiz presents the scenario/problem
   - Press ENTER to reveal the solution
   - Self-assess (y/n) whether you got it right
   - Score is tracked across rounds

3. **Scoring:**
   - Shows "Score: X/Y" after each round
   - Final percentage with feedback:
     - 80%+ → "Excellent!"
     - 60-79% → "Good job!"
     - 40-59% → "Keep practicing!"
     - <40% → "Review the skill documentation"

## Quiz-Compatible Skill Files

### Required Structure

For a skill file to work with the quiz tool, it should contain one or more of these section patterns:

```markdown
## Scenario

Description of a problem or situation...

### Solution

How to solve it...
```

Or:

```markdown
## Example

Demonstration of the pattern...

### Implementation

Code showing the solution...
```

Or:

```markdown
## When to Use

Situation description...

## How to Apply

Steps to solve...
```

### Section Matching Rules

The extractor looks for:

1. **Problem sections** (headers): `Scenario`, `Problem`, `Example`, `When to Use`
2. **Solution sections** (headers): `Solution`, `Fix`, `Implementation`, `How to Apply`, `Answer`

Each problem section is paired with the next solution section found in the document.

### Best Practices for Quiz-Compatible Skills

**Good - Clear problem/solution pairs:**

```markdown
## Scenario: Unused Variable

You declare a variable but shellcheck reports SC2034 (unused variable).

### Solution

Either use the variable or mark it as intentionally unused:

\`\`\`bash
# Option 1: Use it
name="value"
echo "$name"

# Option 2: Mark as unused
_name="value"  # Leading underscore convention
\`\`\`
```

**Good - Multiple scenarios:**

```markdown
## Scenario 1: Missing Language Tag

Markdown linter fails with MD040 (fenced code missing language).

### Solution

Add language identifier after opening fence:

\`\`\`bash
# Not: ```
# Use: ```bash
\`\`\`

## Scenario 2: Duplicate Headings

MD024 error for duplicate heading text.

### Solution

Make headings unique by adding context:

- Not: "## Configuration" (appears twice)
- Use: "## Database Configuration" and "## Server Configuration"
```

**Avoid - No clear structure:**

```markdown
## Overview

This pattern helps with many things. Here's how to do it...

(No quiz scenarios can be extracted)
```

## Examples

### Example Session

```text
$ bash tools/skill_quiz/quiz.sh --random --rounds 3

🎯 Quiz: skills/domains/code-quality/markdown-patterns.md
📚 Found 5 scenarios, playing 3 rounds

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Round 1/3

## Scenario

You have a code block without a language tag and markdownlint reports MD040.

[Press ENTER to reveal solution...]

### Solution

Add the language identifier after the opening fence:
- Shell: ```bash
- Python: ```python
- Text output: ```text

Did you get it right? (y/n): y
Score: 1/1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Round 2/3
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Final Score: 2/3 (67%)
🎉 Good job! Keep practicing to improve.
```

## Integration with Brain Workflow

### Use Cases

1. **Before Task Execution:** Quiz yourself on relevant skills before starting a task
2. **After Learning:** Test retention after reading new skill documentation
3. **Periodic Review:** Random quiz to maintain sharp pattern recognition
4. **Onboarding:** Help new team members learn documented patterns

### Adding Quiz Scenarios to Skills

When creating or updating skill documentation, consider adding quiz-compatible sections:

```markdown
## Scenario: [Descriptive Title]

[Problem description - what situation does the developer face?]

### Solution

[Step-by-step fix or explanation]

[Optional code example]
```

This makes the skill both reference documentation AND learning material.

## Troubleshooting

### "No scenarios found"

The skill file doesn't contain recognizable problem/solution patterns. Check that it has sections like:

- `## Scenario` / `### Solution`
- `## Example` / `### Implementation`
- `## When to Use` / `## How to Apply`

### "Error: No skill files found"

When using `--random`, ensure you're running from the brain repository root or that `skills/domains/` exists and contains `.md` files.

### Python Import Errors

Ensure Python 3.7+ is installed:

```bash
python3 --version
```

The extractor uses only standard library modules (json, re, sys, pathlib, typing).

## See Also

- **[skills/domains/code-quality/research-patterns.md](../../skills/domains/code-quality/research-patterns.md)** - Pattern for learning and applying skills
- **[skills/self-improvement/README.md](../../skills/self-improvement/README.md)** - Self-improvement protocol
- **[skills/SUMMARY.md](../../skills/SUMMARY.md)** - Quick reference for all skills
- **[skills/index.md](../../skills/index.md)** - Complete skill catalog
