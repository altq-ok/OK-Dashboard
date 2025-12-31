import logging
import multiprocessing
import os
import time

from app.core.status import StatusManager

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

    # Heavy imports should be placed here to keep them persistent in memory.
    logger.info(f"Worker[{os.getpid()}]: Warming up heavy libraries...")
    # import blpapi, pandas as pd, etc.
    time.sleep(2)  # Simulating library load time

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

        try:
            # Notify start via status manager
            status_mgr.update(task_id, "running", user_name, progress=0, message="Initializing...")

            # Run the actual task here
            for i in range(1, 11):
                # Simulated calculation step
                time.sleep(1)

                # Periodic heartbeat update to notify other users of life
                status_mgr.update(task_id, "running", user_name, progress=i * 10, message=f"Processing step {i}/10...")

            # Notify completion via status manager
            status_mgr.update(task_id, "done", user_name, progress=100, message="Task finished.")

        except Exception as e:
            # Catch and broadcast errors to all users via the shared status file
            status_mgr.update(task_id, "failed", user_name, message=f"Error: {str(e)}")
