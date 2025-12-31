import logging
import multiprocessing
import os

from app.core.status import StatusManager
from app.services.portfolio_data_manager import PortfolioDataManager

logger = logging.getLogger(__name__)


def calc_worker(queue: multiprocessing.Queue, shared_dir: str, user_name: str):
    """
    Main loop for the persistent calculation worker process.

    This function runs in a separate OS process to prevent heavy computations
    from blocking the FastAPI main thread. It implements a 'Warm-up' strategy
    by importing heavy libraries (e.g., Bloomberg SDK) at startup, ensuring
    zero-latency imports when a task is received.

    Args:
        queue (multiprocessing.Queue): IPC queue for receiving task requests from FastAPI.
        shared_dir (str): Root directory for status tracking.
        user_name (str): Identifier of the current PC user.
    """

    logger.info(f"Worker[{os.getpid()}]: Intializing engines...")
    engines = {
        "event": PortfolioDataManager(shared_dir=shared_dir),
    }
    # Initialize own StatusManager for this worker's process
    status_mgr = StatusManager(shared_dir)
    logger.info("Worker: Initialization complete. Waiting for tasks...")

    while True:
        # Blocks until a new task is pushed into the queue
        task_info = queue.get()

        if task_info == "STOP":
            logger.info("Worker: Shutdown signal received.")
            break

        task_id = task_info["task_id"]
        params = task_info.get("params", {})
        task_type = params.get("task_type")

        try:
            # Get engine dynamically
            engine = engines.get(task_type)

            if not engine:
                raise ValueError(f"Unknown task_type: {task_type}")

            # Notify start via status manager
            status_mgr.update(task_id, "running", user_name, params=params, progress=0, message="Initializing...")

            # Run task
            # No need to save result path here as the dashboard should refer to the latest (or a specific version manually)
            _ = engine.run(params)

            # Notify completion via status manager
            status_mgr.update(task_id, "done", user_name, params=params, progress=100, message="Task finished.")

        except Exception as e:
            # Catch and broadcast errors to all users via the shared status file
            status_mgr.update(task_id, "failed", user_name, params=params, message=f"Error: {str(e)}")
