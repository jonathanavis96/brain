# Brain Map Backend

FastAPI backend for the Brain Map knowledge graph system.

## Quick Start

```bash
cd app/brain-map/backend || exit 1
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Then visit `http://localhost:8000/docs` for the interactive API documentation.

## Development Workflow

### Initial Setup

1. **Create virtual environment:**

   ```bash
   cd app/brain-map/backend || exit 1
   python3 -m venv .venv
   ```

2. **Activate virtual environment:**

   ```bash
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Verify installation:**

   ```bash
   python3 -c "import fastapi; print('FastAPI installed successfully')"
   ```

### Running the Backend

**Start the development server:**

```bash
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Options:**

- `--reload`: Auto-reload on code changes (development only)
- `--host 0.0.0.0`: Listen on all network interfaces (allows external access)
- `--port 8000`: Port to listen on (default: 8000)

**Verify it's running:**

```bash
curl -s http://localhost:8000/health | jq .
```

Expected output:

```json
{"status": "ok"}
```

**Interactive API documentation:**

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Running Tests

**Run full test suite:**

```bash
# Activate virtual environment first
source .venv/bin/activate

# Run all tests with verbose output
pytest tests/ -v
```

**Run specific test file:**

```bash
pytest tests/test_search.py -v
```

**Run with coverage report:**

```bash
pytest tests/ --cov=app --cov-report=term-missing
```

**Run specific test by name:**

```bash
pytest tests/test_search.py::test_search_basic -v
```

**Expected output (all tests passing):**

```text
============================== 94 passed in 2.79s ==============================
```

### Adding New Endpoints

1. **Define endpoint in `app/main.py`:**

   ```python
   @app.get("/api/v1/my-endpoint")
   async def my_endpoint():
       return {"result": "data"}
   ```

2. **Add tests in `tests/test_*.py`:**

   ```python
   def test_my_endpoint():
       response = client.get("/api/v1/my-endpoint")
       assert response.status_code == 200
       assert response.json() == {"result": "data"}
   ```

3. **Run tests to verify:**

   ```bash
   pytest tests/test_my_endpoint.py -v
   ```

4. **Check API docs:**

   Visit `http://localhost:8000/docs` to see your new endpoint documented automatically.

### Project Structure

```text
app/brain-map/backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app and endpoints
│   ├── index.py             # Graph indexing and search
│   ├── dependency_analysis.py  # Dependency graph analysis
│   ├── frontmatter.py       # YAML frontmatter parsing
│   ├── notes.py             # Note file discovery
│   └── watcher.py           # File system watcher
├── tests/
│   ├── test_*.py            # Test modules
│   └── __init__.py
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

### Key Modules

- **`main.py`**: FastAPI application, defines all HTTP endpoints
- **`index.py`**: Core graph indexing, note parsing, search functionality
- **`dependency_analysis.py`**: Analyzes note dependencies and relationships
- **`frontmatter.py`**: Parses YAML frontmatter from markdown files
- **`notes.py`**: Discovers and lists note files in the repository
- **`watcher.py`**: File system watcher for real-time updates

### Environment Variables

- `BRAIN_MAP_REPO_ROOT` (optional): Override repo root discovery (default: auto-detect from git)
- `BRAIN_MAP_PORT` (optional): Override backend port (default: 8000)

**Example:**

```bash
export BRAIN_MAP_REPO_ROOT=/path/to/brain
export BRAIN_MAP_PORT=8080
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

### Troubleshooting

**Import errors:**

```bash
# Ensure you're in the backend directory and venv is activated
cd app/brain-map/backend
source .venv/bin/activate
pip install -r requirements.txt
```

**Port already in use:**

```bash
# Use a different port
python3 -m uvicorn app.main:app --reload --port 8001
```

**Tests failing:**

```bash
# Run tests with verbose output to see details
pytest tests/ -vv

# Run a single test to isolate issues
pytest tests/test_search.py::test_search_basic -vv
```

### Deactivating Virtual Environment

When done with development:

```bash
deactivate
```
