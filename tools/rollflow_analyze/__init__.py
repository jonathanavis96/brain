"""RollFlow log analyzer package - bridge to src/rollflow_analyze."""

# Import from src for compatibility
import sys
from pathlib import Path

# Add src to path so we can import the actual package
_src_dir = Path(__file__).parent / "src"
if str(_src_dir) not in sys.path:
    sys.path.insert(0, str(_src_dir))

# Re-export main components
from rollflow_analyze import *  # noqa: E402, F401, F403
