import json
import os
from datetime import datetime
from typing import Optional
import portalocker
import logging

logger = logging.getLogger(__name__)


class StatusManager:
    """
    Manages task progress status via JSON files on a shared network drive.

    This class acts as a communication bridge between distributed workers running on
    different PCs. By writing to a shared folder (e.g., Y: drive), it allows all
    team members to see the real-time status of calculations.

    Uses Windows OS-level file locking (via portalocker) to ensure data integrity
    without leaving stale lock files on the shared drive.
    """

    def __init__(self, shared_dir: str):
        """
        Args:
            shared_dir (str): Root path of the shared data directory (e.g., 'Y:/Shared')
        """
        self.status_dir = os.path.join(shared_dir, "status")
        os.makedirs(self.status_dir, exist_ok=True)

    def _get_path(self, task_id: str) -> str:
        return os.path.join(self.status_dir, f"{task_id}.json")

    def update(self, task_id: str, status: str, user: str, progress: float = 0, message: str = ""):
        """
        Updates the task progress and writes it to the shared JSON file.
        The lock is automatically released by the OS even if the process crashes.

        The 'last_heartbeat' is automatically updated to the current timestamp
        to allow other users to detect if the process has hung.

        Args:
            task_id (str): Unique identifier for the calculation task.
            status (str): Current state, e.g., 'running', 'done', 'failed'.
            user (str): Name of the user/PC executing the task.
            progress (float): Completion percentage (0.0 to 100.0).
            message (str): Human-readable message for UI display.
        """
        path = self._get_path(task_id)
        data = {
            "task_id": task_id,
            "status": status,
            "user": user,
            "progress": progress,
            "message": message,
            "last_heartbeat": datetime.now().isoformat(),
        }

        try:
            # Open with 'r+' or 'w' and use portalocker to prevent concurrent access
            with open(path, "w", encoding="utf-8") as f:
                portalocker.lock(f, portalocker.LOCK_EX)  # Exclusive lock
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Error updating status for {task_id}: {e}")

    def get_status(self, task_id: str) -> Optional[dict]:
        """
        Reads the status file with a shared lock (allows other readers, but not writers).
        """
        path = self._get_path(task_id)
        if not os.path.exists(path):
            return None

        try:
            with open(path, "r", encoding="utf-8") as f:
                portalocker.lock(f, portalocker.LOCK_SH)  # Shared lock
                return json.load(f)
        except Exception as e:
            logger.error(f"Error reading status for {task_id}: {e}")
            return None
