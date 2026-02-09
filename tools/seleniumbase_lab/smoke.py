"""Minimal SeleniumBase smoke test.

This is intentionally tiny:
- launches a headless browser
- navigates to https://example.com
- asserts the title contains "Example Domain"

Run from this folder with an activated venv:
  python smoke.py
"""

from seleniumbase import SB


def main() -> None:
    with SB(headless=True) as sb:
        sb.open("https://example.com")
        sb.assert_title_contains("Example Domain")
        print("OK: loaded example.com and validated title")


if __name__ == "__main__":
    main()
