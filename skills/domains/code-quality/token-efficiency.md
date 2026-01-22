# Token Efficiency Skill

## Purpose

Minimize tool calls per iteration to save tokens and time. Target: <20 tool calls per iteration.

---

## DO

- **Batch independent calls** - If you need to check 3 files, do it in ONE bash call:
  ```bash
  cat file1 && cat file2 && cat file3
  ```
- **Cache results mentally** - If you ran `ls templates/ralph/`, don't run it again in the same iteration
- **Use grep -l for multi-file search** - One call instead of checking each file
- **Combine checks** - `shellcheck file1.sh file2.sh file3.sh` not 3 separate calls

---

## DON'T

- Run the same command twice (you already have the result!)
- Check the same file multiple times
- Run `pwd` repeatedly (you know where you are)
- Use multiple `sed -n 'Xp'` calls - use one range: `sed -n '23,49p'`

---

## Examples

**BAD (6 calls):**
```bash
grep -c pattern file1
grep -c pattern file2  
grep -c pattern file3
diff file1 template1
diff file2 template2
diff file3 template3
```

**GOOD (2 calls):**
```bash
grep -c pattern file1 file2 file3
diff file1 template1 && diff file2 template2 && diff file3 template3
```
