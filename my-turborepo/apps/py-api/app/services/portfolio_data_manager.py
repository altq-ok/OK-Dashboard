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

        time.sleep(5)  # Simulate heavy imports

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

        time.sleep(5)  # Simulate heavy task

        outputs = []
        if task_type == "pricing":
            outputs = ["prices", "fx_rates"]
        elif task_type == "event":
            outputs = ["calendar_events"]
        else:
            outputs = [task_type]

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        for data_type in outputs:
            save_dir = self.shared_root / "snapshots" / data_type / target_id
            save_dir.mkdir(parents=True, exist_ok=True)

            file_path = save_dir / f"{timestamp}.parquet"

            df = self._generate_mock_data(target_id, data_type)
            df.to_parquet(file_path, engine="pyarrow", index=False)
            logger.info(f"Saved {data_type} to {file_path}")

        return str(file_path)

    def _generate_mock_data(self, target_id: str, data_type: str) -> list:
        """Helper to create realistic dummy records."""
        now = datetime.now().isoformat()

        if data_type == "prices":
            # prices data: Target price and historical mock
            return [
                {"fund_id": target_id, "field": "PX_LAST", "value": 150.0 + self.np.random.rand(), "date": now},
                {"fund_id": target_id, "field": "PX_MID", "value": 149.5 + self.np.random.rand(), "date": now},
            ]
        elif data_type == "fx_rates":
            # fx_rates data: Target price and historical mock
            return [
                {"fund_id": target_id, "field": "PX_LAST", "value": 150.0 + self.np.random.rand(), "date": now},
                {"fund_id": target_id, "field": "PX_MID", "value": 149.5 + self.np.random.rand(), "date": now},
            ]
        elif data_type == "calendar_events":
            # calendar_events data: Corporate actions or news mock
            return [
                {"fund_id": target_id, "event_type": "DIVIDEND", "message": "Expected 0.5 USD", "impact": "High"},
                {"fund_id": target_id, "event_type": "EARNINGS", "message": "Release on Friday", "impact": "Medium"},
            ]
        else:
            # guidelines data: Compliance check mock
            return [
                {"fund_id": target_id, "rule": "MAX_EQUITY_LIMIT", "status": "PASS", "limit": 0.40, "current": 0.32},
                {"fund_id": target_id, "rule": "MIN_CASH_LIMIT", "status": "WARN", "limit": 0.05, "current": 0.051},
            ]
