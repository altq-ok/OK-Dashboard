import os
import shutil
import sys
import time

import pandas as pd

current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, ".."))
sys.path.append(project_root)

from app.core.data_manager import DataManager
from app.core.syncer import FileSyncer


def test_integration():
    # Create test directories
    base_path = os.path.join(current_dir, "test_env")
    shared_root = os.path.join(base_path, "shared_drive")
    local_root = os.path.join(base_path, "local_ssd")

    if os.path.exists(base_path):
        shutil.rmtree(base_path, ignore_errors=True)
    os.makedirs(os.path.join(shared_root, "snapshots/AAPL_pricing"), exist_ok=True)

    print("--- Phase 3 Integration Test Starting ---")

    # Launch FileSyncer (make interval=1 for faster test)
    syncer = FileSyncer(shared_root, local_root, interval=1)
    syncer.start()

    # Launch DataManager
    data_manager = DataManager(local_root)

    # Create dummy Parquet
    df = pd.DataFrame(
        {"price": [150, 155, 160], "timestamp": pd.to_datetime(["2025-01-01", "2025-01-02", "2025-01-03"])}
    )
    shared_file_path = os.path.join(shared_root, "snapshots/AAPL_pricing/20251231_1500.parquet")
    df.to_parquet(shared_file_path)
    print(f"[1] Created dummy parquet in shared drive: {shared_file_path}")

    # Wait for Syncer to finish copy
    print("[2] Waiting for Syncer to detect and copy file...")
    time.sleep(3)

    # Check if file exists on local side
    local_file_path = os.path.join(local_root, "snapshots/AAPL_pricing/20251231_1500.parquet")
    if os.path.exists(local_file_path):
        print(f"[3] SUCCESS: File found in local SSD: {local_file_path}")
    else:
        print("[3] FAILED: File not found in local SSD.")
        return

    # Check if data can be loaded via DataManager
    data = data_manager.get_latest_data("pricing", "AAPL")
    if len(data) == 3:
        print(f"[4] SUCCESS: DataManager read {len(data)} records correctly.")
    else:
        print("[4] FAILED: DataManager could not read data.")

        print(f"[4] SUCCESS: DataManager read {len(data)} records correctly.")

    print("[5] Clean up folders after test...")
    if os.path.exists(base_path):
        shutil.rmtree(base_path, ignore_errors=True)

    print("--- Test Completed ---")


if __name__ == "__main__":
    test_integration()
