# **MindMerge / MindMerge-PR**

*A “local CodeRabbit-like” PR reviewer bot you control (free-first), built with your Brain/Ralph workflow in mind.*

---

## **1\) Naming and product framing**

### **Business name**

* **MindMerge**

### **Product / tool name**

* **MindMerge-PR**

### **Practical naming for GitHub \+ CLI**

* **Repo name:** `mindmerge-pr`  
* **CLI command name:** `mindmerge-pr`  
* **GitHub Action display name:** `MindMerge PR Review`

### **Why this split works**

* “MindMerge” is broad enough to become a future business umbrella.  
* “MindMerge-PR” is immediately obvious: it reviews pull requests.  
* Later expansions become easy: `MindMerge-Sec`, `MindMerge-Docs`, etc.

---

## **2\) What you want MindMerge-PR to do**

### **The core idea**

Build a system that automatically reviews PRs and leaves comments **like CodeRabbit** (in outcome and workflow), including:

* **Major / Minor / Nitpick** severity labels (mandatory)  
* “Actionable comments posted: X”  
* Inline comments where possible  
* A clean top-level “first comment” containing **pre-merge checks**  
* A dropdown section containing **copy/paste prompts** like “Fix all issues with AI agents”

### **Important constraints**

* You want a **free** alternative (you don’t want to pay $24/month right now).  
* Don’t copy CodeRabbit proprietary phrasing or internals — replicate the *functionality*, not the text.  
* Must work well with your existing “brain” way of working (repeatable, configurable, consistent).

---

## **3\) Scope: what “CodeRabbit-like” means in practice**

You’re aiming to match the overall “coverage surface” (what it feels like it catches), which comes from **three layers**:

### **Layer A — Pre-merge policy checks (metadata \+ hygiene)**

These checks are fast, deterministic, and run first.

**Pre-merge checks you explicitly requested:**

1. **Title check**  
   * Required format (configurable): e.g. `type(scope): summary`  
   * Title length boundaries  
   * Optional ticket ID presence  
2. **Description check**  
   * Must not be empty  
   * Must include required sections (e.g. “What changed”, “Why”, “Testing”, “Risk”)  
3. **“Dark screen coverage”**  
   * You mentioned this, but the definition needs to be finalized:  
     * Option 1: “test coverage / diff coverage must be above X%”  
     * Option 2: “UI screenshot coverage including dark mode screenshots”  
     * Option 3: “visual regression coverage”  
   * MindMerge-PR should support this as a pluggable check so you can evolve it.  
4. Optional additional policy checks (configurable):  
   * Labels required (e.g. `safe-to-merge`, `breaking`)  
   * Reviewer required  
   * Changelog required  
   * Migration notes required if DB schema changes  
   * Docs updated if public APIs change

### **Layer B — Tool-driven analysis (linters \+ security scanning)**

This catches “real” issues consistently and cheaply.

**Core lint/security tools to include (free):**

* Markdown:  
  * `markdownlint-cli2` (catches MD040 and many markdown style issues)  
* Bash:  
  * `bash -n` (syntax)  
  * `shellcheck` (static analysis)  
* Repo hygiene:  
  * `actionlint` (optional) for GitHub Actions workflows  
  * `yamllint` (optional) for YAML  
* Security scanning (high-value, still free):  
  * `gitleaks` (secrets detection)  
  * `osv-scanner` (dependency vulnerabilities)  
  * `semgrep` (SAST / pattern-based security \+ quality rules)  
  * `trivy` (optional) for container/IaC scanning if relevant  
  * `checkov` (optional) if you have Terraform/K8s/IaC

**Language ecosystem support (optional, enable if present):**

* JS/TS:  
  * `eslint` (if config exists)  
  * `prettier` (format checks if configured)  
  * `tsc --noEmit` (typecheck)  
  * `npm audit` (optional — noisier than OSV sometimes)  
* Python:  
  * `ruff` \+ `pytest`  
* Go:  
  * `golangci-lint` \+ tests

**Important note:**  
You do **not** need to replicate every tool CodeRabbit integrates with. The goal is:

* Provide the **same value**: catch common issues \+ security hazards \+ correctness traps  
* Expand gradually as your needs grow

### **Layer C — AI review pass (human-like feedback)**

This is where it feels like a “reviewer,” not just CI.

MindMerge-PR should optionally run a Claude-driven pass that:

* Reads diff \+ tool outputs  
* Produces:  
  * “Potential issue” style findings  
  * Refactor suggestions  
  * Nitpicks (low severity)  
* **Guardrail:** it should not hallucinate. It should:  
  * Prefer tool-supported findings  
  * If not tool-supported, label as “Suggestion”  
  * Never invent line numbers  
  * Only post inline comments if it can map to actual diff positions

---

## **4\) The PR comment experience you want**

### **First comment format (must-have)**

The first bot comment should be a “Pre-merge checks” dashboard:

* “How many good, how many bad”  
* Focused on:  
  * Title check  
  * Description check  
  * Dark screen coverage check  
  * (Any other configured checks)

Example structure:

* ✅ Passed: 3  
* ❌ Failed: 1  
* ⚠️ Warnings: 2

Then list each check result with short detail.

### **Review findings format (must-have)**

A structured summary:

* “Actionable comments posted: X”  
* Sections:  
  * 🟠 Major  
  * 🟡 Minor  
  * 🧹 Nitpick

Each item includes:

* file path  
* line (if known)  
* rule/tool name  
* short explanation  
* suggested fix (when deterministic)

### **“Dropdown prompts” (must-have)**

Use GitHub comment collapsible sections:

* A dropdown called something like:  
  * **Fix all issues with AI agents (copy/paste)**  
* Inside: a generated prompt you can paste into Claude.

Also useful:

* “Fix Majors only”  
* “Fix file: ralph/loop.sh”  
* “Fix markdown issues only”

### **Dedupe / anti-spam (must-have)**

MindMerge-PR must avoid flooding PRs:

* Include a hidden marker in the summary comment:  
  * `<!-- mindmerge-pr:PR_NUMBER:SHA -->`  
* On re-run:  
  * update the existing bot comment (edit/replace)  
  * avoid duplicate inline comments by hashing:  
    * `(file + line + ruleId + message)`

---

## **5\) Severity model (mandatory)**

You explicitly said severity is not “nice-to-have.”

### **Minimum severities you want**

* 🟠 **Major** — must fix before merge  
* 🟡 **Minor** — should fix; merge allowed depending on policy  
* 🧹 **Nitpick** — optional cleanup

### **Suggested mapping rules**

Tool outputs map to severity:

* Tool “error” / “fail” → **Major**  
* Tool “warning” → **Minor**  
* Tool “info/style” → **Nitpick**

Policy failures map to severity:

* Title/Description missing → Minor or Major (configurable)  
* Dark screen coverage failing → Major (if you want it to block merges)

AI-only findings:

* If strongly evidenced by diff → Minor  
* If speculative → Nitpick or “Suggestion” label

---

## **6\) Architecture plan**

### **Location**

Create the project under:

* `/code/mindmerge-pr`

### **Recommended tech stack**

* **Node.js \+ TypeScript**  
  * Great GitHub API support  
  * Easy JSON handling \+ plugin patterns  
  * Works cleanly in GitHub Actions  
  * Easy local CLI mode

### **Operating modes**

1. **GitHub Action mode**  
   * runs on `pull_request`  
   * uses `GITHUB_TOKEN`  
   * posts summary \+ inline review comments  
2. **Local CLI mode**  
   * run against diff (`base..head`)  
   * prints the same structured report  
   * optional “generate prompt” output for Claude

### **Core modules (conceptual)**

* `config` loader (YAML)  
* “runners” for each tool (markdownlint, shellcheck, semgrep, osv-scanner, gitleaks, etc.)  
* `diff mapper` (unified diff parser → map file/line to PR diff positions)  
* `review composer` (formats the summary \+ dropdown prompts)  
* GitHub poster (creates one review w/ multiple inline comments if possible)

---

## **7\) Config file design**

### **Repo config file**

* `mindmerge-pr.yml` at repo root

Include:

* Enabled tools  
* Include/exclude paths/globs  
* Severity mapping overrides  
* Policy requirements:  
  * title rules  
  * description rules  
  * dark screen coverage rules  
* Limits:  
  * max inline comments per PR  
  * max total findings  
* AI pass:  
  * enabled true/false  
  * “only supported by evidence” true  
  * model name  
  * prompt templates

---

## **8\) Roadmap (phased build plan)**

### **Phase 1 — MVP (fast \+ valuable)**

* GitHub Action triggers on PR  
* Run:  
  * markdownlint  
  * shellcheck \+ bash \-n  
  * gitleaks  
  * osv-scanner  
* Post a single summary comment:  
  * pre-merge check counts  
  * major/minor/nitpick counts  
  * list findings (even without inline mapping)  
* Generate dropdown “Fix all issues” prompt text

### **Phase 2 — Inline comments (CodeRabbit-like experience)**

* Parse PR diff hunks  
* Map findings to diff positions  
* Post a GitHub “review” with multiple inline comments  
* Dedupe existing inline comments

### **Phase 3 — Smarter policies \+ dark screen coverage**

* Finalize definition of “dark screen coverage”  
* Add the check as a first-class plugin  
* Add label/reviewer/changelog checks

### **Phase 4 — AI reviewer pass**

* Optional Claude pass gated behind evidence  
* Provide:  
  * “Potential issues”  
  * “Refactor suggestions”  
  * “Nitpicks”  
* Always label uncertain items as “Suggestion”

### **Phase 5 — Business-grade polishing (later)**

* GitHub App installation (instead of just Actions)  
* Multi-repo dashboard  
* Optional subscription model  
* Branding \+ website

---

## **9\) Validation and quality gates (free alternatives to CodeRabbit Pro)**

To replace “CodeRabbit caught it before merge,” you rely on:

* GitHub Actions  
* Deterministic linters/scanners  
* A consistent severity gate

Suggested merge rules:

* Block merge if any **Major** exists  
* Allow merge with **Minor** depending on repo policy  
* Ignore **Nitpick** as non-blocking

---

## **10\) Known open questions (to answer later)**

### **A) “Dark screen coverage” definition**

Pick one:

1. **Test/diff coverage** requirement (most common)  
2. **UI screenshot coverage** including dark mode  
3. **Visual regression coverage** via Playwright/Cypress/Chromatic  
   MindMerge-PR should support whichever you choose, but we must define it for implementation.

### **B) GitHub Action-only vs GitHub App**

* **Action-only** is simplest and free.  
* **GitHub App** is more “SaaS-like” and can comment across repos more smoothly, but it’s more work.

### **C) How much AI do you want?**

* “Tools first, AI second” keeps it trustworthy and cheap.  
* AI is optional and should never invent findings.

---

## **11\) The “Fix all issues” prompt behavior (what it should generate)**

MindMerge-PR should output a prompt that includes:

* exact file paths  
* exact tool outputs (or condensed actionable info)  
* the desired changes  
* constraints: minimal changes, no refactors unless requested, preserve behavior  
* requested output: patch/diff \+ commands to validate

This prompt is produced deterministically based on the findings.

---

## **12\) Summary of the “must-have” requirements you set**

### **Must-have**

* MindMerge business name \+ MindMerge-PR product  
* Pre-merge checks summary as the first PR comment  
* Severity labeling (Major/Minor/Nitpick) is mandatory  
* Dropdown “Fix all issues with AI agents” prompt you can copy/paste  
* Inline comments where possible  
* Dedupe / no spam behavior  
* Free-first tooling: GitHub Actions \+ open-source linters/scanners

### **Should-have soon**

* Inline diff mapping  
* Security suite (gitleaks \+ OSV \+ semgrep)  
* Configurable policy rules

### **Nice later**

* GitHub App  
* Dashboards and analytics  
* Multi-repo management and “business” features

---

## **13\) Next time you pick this back up**

When you return to this project, the first thing to decide is:

**What exactly is “dark screen coverage”?**  
Reply with “it means diff/test coverage” or “it means dark mode screenshots,” and we can bake the rule into the policy engine.

Then we update the Claude one-shot prompt with:

* your finalized definition  
* exact repo structure under `/code/mindmerge-pr`  
* the full implementation plan \+ files to generate

---

If you want, I can also turn this into a tighter “spec document” format (like a formal README \+ SPEC.md split) so you can paste it into two separate notes.

