# SeleniumBase Lab (Brain tools)

This is a small, self-contained sandbox for trying SeleniumBase (a batteries-included wrapper around Selenium).

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -U pip
python3 -m pip install -r requirements.txt
```

## Run smoke test

```bash
source .venv/bin/activate
python3 smoke.py
```

## Notes

- The smoke test uses **headless** mode and a simple `https://example.com` navigation.
- Browser availability (Chrome/Chromium) is still required on your system.
