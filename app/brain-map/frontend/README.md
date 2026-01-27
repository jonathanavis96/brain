# Brain Map Frontend

Vite + React frontend for the Brain Map knowledge graph system.

## Setup

```bash
cd app/brain-map/frontend
npm install
```

## Run

```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

Then open `http://localhost:5173` in your browser.

## Environment Variables

- `VITE_BRAIN_MAP_API_BASE_URL` (optional): Backend API base URL (default: `http://localhost:8000`)

## Development

The frontend expects the backend to be running on `http://localhost:8000` by default.
