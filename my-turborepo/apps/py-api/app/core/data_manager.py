import os
from functools import lru_cache
from typing import Any, Dict, List

import pandas as pd


class DataManager:
    """
    Provides access to the mirrored data on the local SSD.
    Uses LRU cache to avoid repetitive disk I/O.
    """

    def __init__(self, local_root: str):
        self.local_root = local_root

    @lru_cache(maxsize=64)
    def load_parquet(self, data_type: str, target_id: str, filename: str) -> pd.DataFrame:
        """
        Loads a specific parquet file based on data_type.
        Path: snapshots/{data_type}/{target_id}/{filename}
        """
        path = os.path.join(self.local_root, "snapshots", data_type, target_id, filename)
        if not os.path.exists(path):
            raise FileNotFoundError(f"Data not synced yet: {path}")
        return pd.read_parquet(path, engine="pyarrow")

    def get_latest_data(self, data_type: str, target_id: str) -> List[Dict[str, Any]]:
        """Finds the newest parquet and returns it as a list of dicts for JSON."""
        folder = os.path.join(self.local_root, "snapshots", data_type, target_id)
        if not os.path.exists(folder):
            return []
        files = [f for f in os.listdir(folder) if f.endswith(".parquet")]
        if not files:
            return []

        # Assuming files are named with timestamps (e.g., 20251231_1000.parquet)
        latest_file = sorted(files)[-1]
        df = self.load_parquet(data_type, target_id, latest_file)

        # Convert to JSON-serializable format
        return df.to_dict(orient="records")

    def get_snapshots(self, data_type: str, target_id: str) -> List[str]:
        """Lists available versions for a specific data_type."""
        folder = os.path.join(self.local_root, "snapshots", data_type, target_id)
        if not os.path.exists(folder):
            return []
        # Get a list in a descending order (new => old)
        return sorted([f for f in os.listdir(folder) if f.endswith(".parquet")], reverse=True)
