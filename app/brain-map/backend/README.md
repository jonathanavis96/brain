# Brain Map Backend

FastAPI backend for the Brain Map knowledge graph system.

## Setup

```bash
cd app/brain-map/backend || exit 1
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Health Check

```bash
curl -s http://localhost:8000/health | jq .
```

Expected output:

```json
{"status": "ok"}
```

## Environment Variables

- `BRAIN_MAP_REPO_ROOT` (optional): Override repo root discovery
- `BRAIN_MAP_PORT` (optional): Override backend port (default: 8000)
