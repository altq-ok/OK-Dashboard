import logging
import pathlib
import time
from datetime import datetime

logger = logging.getLogger(__name__)


class PortfolioDataManager:
    """
    Mock wrapper for the financial calculation library.
    Simulates library initialization and execution based on task_type.
    """

    def __init__(self, shared_dir: str):
        """
        Initialization (Warm-up Phase).
        Imports heavy libraries here to keep them in the Worker's memory.
        """
        import numpy as np
        import pandas as pd

        self.pd = pd
        self.np = np
        self.shared_root = pathlib.Path(shared_dir)

        logger.info("PortfolioDataManager: Service initialized and libraries warmed up.")

    def run(self, params: dict) -> str:
        """
        Mimics the execution of 'AnotherLibrary' functions based on task_type.

        Args:
            params (dict): Should contain 'target_id', 'task_type', and 'extra_params'.
        Returns:
            str: The absolute path to the generated Parquet file.
        """
        target_id = params.get("target_id") or "ALL"
        task_type = params.get("task_type", "pricing")

        # 1. Resolve output path: snapshots/{target_id}_{task_type}/
        task_id = f"{target_id}_{task_type}"
        snapshot_dir = self.shared_root / "snapshots" / task_id
        snapshot_dir.mkdir(parents=True, exist_ok=True)

        # 2. Simulate processing time based on task type
        # Pricing is fast, while Guideline/Event might take longer
        wait_times = {"pricing": 2, "event": 5, "guideline": 8}
        processing_time = wait_times.get(task_type, 3)

        logger.info(f"Mock Engine: Starting {task_type} for {target_id} (Estimated {processing_time}s)...")
        time.sleep(processing_time)  # Progress bar should be visible on UI

        # 3. Generate Mock Data mimicking different library outputs
        data = self._generate_mock_data(target_id, task_type)
        df = self.pd.DataFrame(data)

        # 4. Save as Parquet with timestamp (Format: YYYYMMDD_HHMMSS.parquet)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_path = snapshot_dir / f"{timestamp}.parquet"

        # engine='pyarrow' is recommended for performance
        df.to_parquet(file_path, engine="pyarrow", index=False)

        logger.info(f"Mock Engine: Task complete. Saved to {file_path}")
        return str(file_path)

    def _generate_mock_data(self, target_id: str, task_type: str) -> list:
        """Helper to create realistic dummy records."""
        now = datetime.now().isoformat()

        if task_type == "pricing":
            # Pricing data: Target price and historical mock
            return [
                {"fund_id": target_id, "field": "PX_LAST", "value": 150.0 + self.np.random.rand(), "date": now},
                {"fund_id": target_id, "field": "PX_MID", "value": 149.5 + self.np.random.rand(), "date": now},
            ]
        elif task_type == "event":
            # Event data: Corporate actions or news mock
            return [
                {"fund_id": target_id, "event_type": "DIVIDEND", "message": "Expected 0.5 USD", "impact": "High"},
                {"fund_id": target_id, "event_type": "EARNINGS", "message": "Release on Friday", "impact": "Medium"},
            ]
        else:
            # Guideline data: Compliance check mock
            return [
                {"fund_id": target_id, "rule": "MAX_EQUITY_LIMIT", "status": "PASS", "limit": 0.40, "current": 0.32},
                {"fund_id": target_id, "rule": "MIN_CASH_LIMIT", "status": "WARN", "limit": 0.05, "current": 0.051},
            ]
