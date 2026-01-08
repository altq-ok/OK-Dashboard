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

    def _get_merged_files(self, data_type: str, target_id: str) -> List[str]:
        """Check ALL and target_id and return merged files"""
        files = set()
        paths = [
            os.path.join(self.local_root, "snapshots", data_type, target_id),
            os.path.join(self.local_root, "snapshots", data_type, "ALL"),
        ]
        for p in paths:
            if os.path.exists(p):
                files.update([f for f in os.listdir(p) if f.endswith(".parquet")])
        return sorted(list(files), reverse=True)

    @lru_cache(maxsize=64)
    def _raw_read(self, path: str) -> pd.DataFrame:
        """Cache raw read only to avoid duplicate cachcing due to different target ids"""
        return pd.read_parquet(path, engine="pyarrow")

    def load_parquet(self, data_type: str, target_id: str, filename: str) -> pd.DataFrame:
        """
        Loads a specific parquet file based on data_type.
        Path: snapshots/{data_type}/{target_id}/{filename}
        """
        path = os.path.join(self.local_root, "snapshots", data_type, target_id, filename)
        if os.path.exists(path):
            return self._raw_read(path)

        # Search in ALL if it doesn't exist in specific and target_id != "ALL"
        if target_id != "ALL":
            all_path = os.path.join(self.local_root, "snapshots", data_type, "ALL", filename)
            if os.path.exists(all_path):
                df = self._raw_read(all_path)
                if target_id != "ALL" and isinstance(df, pd.DataFrame) and "primary_id" in df.columns:
                    df = df[df["primary_id"] == target_id]
                return df

        raise FileNotFoundError(f"Snapshot {filename} not found.")

    def get_latest_data(self, data_type: str, target_id: str) -> List[Dict[str, Any]]:
        """Finds the newest parquet and returns it as a list of dicts for JSON."""
        files = self.get_snapshots(data_type, target_id)
        if not files:
            return []

        # Assuming files are named with timestamps (e.g., 20251231_1000.parquet)
        latest_file = files[0]  # sorted by get_snapshots()
        df = self.load_parquet(data_type, target_id, latest_file)

        # Convert to JSON-serializable format
        return df.to_dict(orient="records")

    def get_snapshots(self, data_type: str, target_id: str) -> List[str]:
        """Lists available versions for a specific data_type."""
        if target_id == "ALL":
            folder = os.path.join(self.local_root, "snapshots", data_type, target_id)
            if not os.path.exists(folder):
                return []
            # Get a list in a descending order (new => old)
            return sorted([f for f in os.listdir(folder) if f.endswith(".parquet")], reverse=True)

        return self._get_merged_files(data_type, target_id)
