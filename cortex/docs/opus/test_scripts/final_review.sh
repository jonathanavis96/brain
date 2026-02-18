#!/bin/bash

# Final comprehensive semantic review

# Extract and check main.py for actual issue
bash /tmp/extract_file.sh "app/brain-map/backend/app/main.py" > /tmp/main_full.py 2>/dev/null

# Check if stop() is actually called
if grep -A 50 "async def lifespan" /tmp/main_full.py | grep -q "file_watcher.stop()"; then
  STOP_CALLED="yes"
else
  STOP_CALLED="no"
fi

# Check watcher.py to understand FileWatcher
bash /tmp/extract_file.sh "app/brain-map/backend/app/watcher.py" > /tmp/watcher.py 2>/dev/null

# Look for actual bugs in the code

# 1. Check GraphView.jsx for memory leaks
bash /tmp/extract_file.sh "app/brain-map/frontend/src/GraphView.jsx" > /tmp/graphview_full.jsx 2>/dev/null
GRAPH_SIZE=$(wc -l < /tmp/graphview_full.jsx)

# Check if event listeners are properly cleaned up
EVENT_ADD=$(grep -c "addEventListener" /tmp/graphview_full.jsx || echo 0)
EVENT_REMOVE=$(grep -c "removeEventListener" /tmp/graphview_full.jsx || echo 0)

# 2. Check for React setState after unmount issues in App.jsx
bash /tmp/extract_file.sh "app/brain-map/frontend/src/App.jsx" > /tmp/app_full.jsx 2>/dev/null

# Look for fetch without abort controller
FETCH_COUNT=$(grep -c "fetch(" /tmp/app_full.jsx || echo 0)
ABORT_COUNT=$(grep -c "AbortController\|abort" /tmp/app_full.jsx || echo 0)

# 3. Check test files for missing assertions or incomplete tests
bash /tmp/extract_file.sh "app/brain-map/backend/tests/test_dependency_analysis.py" > /tmp/test_dep.py 2>/dev/null

# Look for test functions without assertions
TEST_FUNCS=$(grep -c "^def test_" /tmp/test_dep.py || echo 0)
ASSERTIONS=$(grep -c "assert " /tmp/test_dep.py || echo 0)

echo "=== Analysis Summary ===" >&2
echo "Stop called: $STOP_CALLED" >&2
echo "Event listeners: add=$EVENT_ADD, remove=$EVENT_REMOVE" >&2
echo "Fetch calls: $FETCH_COUNT, AbortController usage: $ABORT_COUNT" >&2
echo "Test functions: $TEST_FUNCS, Assertions: $ASSERTIONS" >&2

# Generate findings

# Issue 1: FileWatcher cleanup
if [ "$STOP_CALLED" = "no" ]; then
  echo ""
  echo "FILE: app/brain-map/backend/app/main.py"
  echo "LINE: 30"
  echo "SEVERITY: error"
  echo "CATEGORY: bug"
  echo "MESSAGE: FileWatcher started but stop() is not called in lifespan cleanup"
  echo "SUGGESTION: Add file_watcher.stop() in the finally block or yield section of lifespan context manager"
  echo ""
fi

# Issue 2: Event listener cleanup
if [ "$EVENT_ADD" -gt 0 ] && [ "$EVENT_REMOVE" -eq 0 ]; then
  echo ""
  echo "FILE: app/brain-map/frontend/src/GraphView.jsx"
  echo "SEVERITY: error"
  echo "CATEGORY: bug"
  echo "MESSAGE: Event listeners added without corresponding cleanup in useEffect"
  echo "SUGGESTION: Return cleanup function from useEffect to remove event listeners and prevent memory leaks"
  echo ""
fi

# Issue 3: Potential setState after unmount
if [ "$FETCH_COUNT" -gt 3 ] && [ "$ABORT_COUNT" -eq 0 ]; then
  echo ""
  echo "FILE: app/brain-map/frontend/src/App.jsx"
  echo "SEVERITY: warning"
  echo "CATEGORY: bug"
  echo "MESSAGE: Multiple fetch calls without AbortController - may cause setState on unmounted component"
  echo "SUGGESTION: Use AbortController to cancel pending requests in useEffect cleanup functions"
  echo ""
fi

