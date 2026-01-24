"""Entry point for python -m tools.rollflow_analyze."""

import sys
from pathlib import Path

# Add src to path so we can import the actual package
_src_dir = Path(__file__).parent / "src"
sys.path.insert(0, str(_src_dir))

from rollflow_analyze.cli import main  # noqa: E402

if __name__ == "__main__":
    sys.exit(main())
