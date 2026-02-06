# LESSONS

## What this file is

An **append-only** log of design mistakes, fixes, and decisions.

It exists to prevent regressions and repeated debates.

## Setup (how to start)

- Keep entries short.
- Prefer facts + outcomes over opinions.
- Include dates with seconds: `YYYY-MM-DD HH:MM:SS`.

## Ask the user

- What past UI changes caused regressions?
- What decisions are you tired of re-litigating?
- What “gotchas” should a new contributor know?

## Required format (layout contract)

Each entry:

- Timestamp
- What changed
- Why
- What we learned
- What to do next time (rule of thumb)

## Example entry

```text
2026-02-06 13:29:16
- Changed button sizes to use spacing tokens instead of per-component CSS.
- Learned: the old CSS caused inconsistent hit targets on mobile.
- Rule: all interactive components must meet minimum hit size.
```
