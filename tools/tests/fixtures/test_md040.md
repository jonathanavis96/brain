# Test File for MD040 Check

This file has code fences without language tags.

```bash
#!/bin/bash
echo "This should trigger MD040"
```

This one is correct:

```bash
echo "This has a language tag"
```

Another bad one:

```python
def main():
    pass
```

And a good one:

```python
def main():
    pass
```
