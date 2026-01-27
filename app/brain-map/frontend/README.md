# Brain Map Frontend

Vite + React frontend for the Brain Map knowledge graph system.

## Quick Start

```bash
cd app/brain-map/frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

Then open `http://localhost:5173` in your browser.

**Note:** The backend must be running at `http://localhost:8000` for the frontend to work.

## Development Workflow

### Initial Setup

1. **Navigate to frontend directory:**

   ```bash
   cd app/brain-map/frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Verify installation:**

   ```bash
   npm list react vite
   ```

### Running the Frontend

**Start the development server:**

```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

**Options:**

- `--host 0.0.0.0`: Listen on all network interfaces (allows external access)
- `--port 5173`: Port to listen on (default: 5173)

**Access the app:**

Open `http://localhost:5173` in your browser.

**Features:**

- Hot module replacement (HMR): Changes to code are reflected instantly
- React Fast Refresh: Component state is preserved during updates
- Graph visualization: Interactive knowledge graph using Sigma.js

### Project Structure

```text
app/brain-map/frontend/
├── src/
│   ├── main.jsx           # Application entry point
│   ├── App.jsx            # Main app component
│   ├── GraphView.jsx      # Graph visualization component
│   ├── FilterPanel.jsx    # Filter controls component
│   └── InsightsPanel.jsx  # Insights display component
├── index.html             # HTML template
├── package.json           # Node.js dependencies and scripts
├── vite.config.js         # Vite configuration
└── README.md             # This file
```

### Key Components

- **`App.jsx`**: Main application component, manages state and layout
- **`GraphView.jsx`**: Renders the knowledge graph using Sigma.js and Graphology
- **`FilterPanel.jsx`**: Provides filtering controls for the graph
- **`InsightsPanel.jsx`**: Displays graph insights and statistics

### Making Changes

**Edit components:**

1. Modify a component file in `src/` (e.g., `src/App.jsx`)
2. Save the file
3. Changes are automatically reflected in the browser (no reload needed)

**Add new components:**

1. Create a new `.jsx` file in `src/`:

   ```jsx
   // src/MyComponent.jsx
   export default function MyComponent() {
     return <div>My Component</div>;
   }
   ```

2. Import and use in `App.jsx`:

   ```jsx
   import MyComponent from './MyComponent';

   // In App component:
   <MyComponent />
   ```

**Add new dependencies:**

```bash
npm install package-name
```

**Example - adding a UI library:**

```bash
npm install @mui/material @emotion/react @emotion/styled
```

### Building for Production

**Create optimized production build:**

```bash
npm run build
```

**Output:** Optimized files in `dist/` directory.

**Preview production build locally:**

```bash
npm run preview
```

### Environment Variables

- `VITE_BRAIN_MAP_API_BASE_URL` (optional): Backend API base URL (default: `http://localhost:8000`)

**Example:**

Create a `.env` file in the frontend directory:

```bash
VITE_BRAIN_MAP_API_BASE_URL=http://localhost:8080
```

Then restart the dev server.

**Note:** Environment variables must be prefixed with `VITE_` to be exposed to the frontend code.

### Connecting to Backend

The frontend expects the backend to be running at `http://localhost:8000` by default.

**Start both services:**

1. **Terminal 1 - Backend:**

   ```bash
   cd app/brain-map/backend
   source .venv/bin/activate
   python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Terminal 2 - Frontend:**

   ```bash
   cd app/brain-map/frontend
   npm run dev -- --host 0.0.0.0 --port 5173
   ```

3. **Verify connection:**

   Open `http://localhost:5173` and check the browser console for any API errors.

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build locally

### Troubleshooting

**Port already in use:**

```bash
# Use a different port
npm run dev -- --port 5174
```

**Dependencies not found:**

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

**Backend connection failed:**

1. Verify backend is running: `curl http://localhost:8000/health`
2. Check browser console for CORS errors
3. Verify `VITE_BRAIN_MAP_API_BASE_URL` if using custom backend URL

**Build errors:**

```bash
# Clear Vite cache
rm -rf dist
npm run build
```

### Technology Stack

- **React 18**: UI library
- **Vite 6**: Build tool and dev server
- **Sigma.js**: Graph visualization
- **Graphology**: Graph data structure
- **ForceAtlas2**: Graph layout algorithm
