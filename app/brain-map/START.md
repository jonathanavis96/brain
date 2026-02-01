# Brain Map - Quick Start Guide

## Prerequisites

- Python 3.12+ installed
- Node.js 24+ installed
- Brain repository cloned to `~/code/brain`

---

## Starting the Backend (Terminal 1)

```bash
# Navigate to backend directory
cd ~/code/brain/app/brain-map/backend

# Activate virtual environment
source .venv/bin/activate

# Start FastAPI server (with hot reload)
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected output:**

```text
INFO:     Will watch for changes in these directories: ['/home/.../backend']
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [...]
INFO:     Started server process [...]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Test backend:**

```bash
# In another terminal
curl http://localhost:8000/health
# Should return: {"status":"ok"}
```

---

## Starting the Frontend (Terminal 2)

```bash
# Navigate to frontend directory
cd ~/code/brain/app/brain-map/frontend

# Install dependencies (first time only)
npm install

# Start Vite dev server
npm run dev -- --host 0.0.0.0 --port 5173
```

**Expected output:**

```text
VITE v6.4.1  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: http://10.x.x.x:5173/
➜  press h + enter to show help
```

**Open in browser:**

- `http://localhost:5173`

---

## Stopping the Servers

**Backend (Terminal 1):**

- Press `Ctrl+C`
- Type `deactivate` to exit virtualenv

**Frontend (Terminal 2):**

- Press `Ctrl+C`

---

## Troubleshooting

### Backend: "Address already in use" (port 8000)

```bash
# Find process using port 8000
lsof -ti :8000

# Kill the process
lsof -ti :8000 | xargs kill -9

# Then restart backend
```

### Frontend: "Port 5173 is in use"

Vite will automatically try port 5174, 5175, etc. If you need 5173 specifically:

```bash
# Find process using port 5173
lsof -ti :5173

# Kill the process
lsof -ti :5173 | xargs kill -9

# Then restart frontend
```

### Backend: "No module named uvicorn"

Virtual environment not activated or dependencies not installed:

```bash
cd ~/code/brain/app/brain-map/backend
source .venv/bin/activate
pip install -r requirements.txt
```

### Frontend: CORS errors in browser console

Make sure:

1. Backend is running on port 8000
2. You're accessing frontend at `http://localhost:5173` (not `0.0.0.0` or an IP)

---

## Environment Variables (Optional)

### Backend

None required for local development. Defaults:

- Notes directory: `app/brain-map/notes/`
- Index DB: in-memory SQLite

### Frontend

To use a different backend URL:

```bash
# In app/brain-map/frontend/.env (create if missing)
VITE_BRAIN_MAP_API_BASE_URL=http://localhost:8080
```

Then restart frontend.

---

## Quick Health Check

**Backend:**

```bash
curl http://localhost:8000/health
curl http://localhost:8000/graph | jq '.nodes | length'
```

**Frontend:**

- Open `http://localhost:5173`
- Should see graph with nodes
- Check browser console (F12) for errors

---

## Development Workflow

1. **Backend changes:** Hot reload is enabled (uvicorn `--reload`)
2. **Frontend changes:** Vite auto-refreshes on save
3. **Adding notes:** Add `.md` files to `app/brain-map/notes/` → backend watcher auto-reindexes

---

## Single-Command Startup (Optional)

Create `app/brain-map/start.sh`:

```bash
#!/bin/bash
# Start both backend and frontend in background

cd "$(dirname "$0")/backend" || exit 1
source .venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

cd ../frontend || exit 1
npm run dev -- --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Press Ctrl+C to stop both servers"

trap 'kill $BACKEND_PID $FRONTEND_PID' EXIT
wait
```

Make it executable:

```bash
chmod +x app/brain-map/start.sh
```

Run:

```bash
cd ~/code/brain
bash app/brain-map/start.sh
```

Stop with `Ctrl+C`.

---

## See Also

- Backend README: `app/brain-map/backend/README.md`
- Frontend README: `app/brain-map/frontend/README.md`
- API docs (when backend running): `http://localhost:8000/docs`
