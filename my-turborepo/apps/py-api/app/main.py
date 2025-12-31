"""
FastAPI Application Entry Point.

Handles the lifecycle of the background worker process and provides
REST endpoints for the Next.js frontend to interact with the calculation engine.
"""

import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from multiprocessing import Process, Queue
from os.path import expanduser

from fastapi import CORSMiddleware, FastAPI, HTTPException

from app.core.data_manager import DataManager
from app.core.status import StatusManager
from app.core.syncer import FileSyncer
from app.core.worker import calc_worker
from app.schemas.task import TaskParams, TaskStatus

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


# Configuration
home = expanduser("~")
SHARED_DIR = f"{home}\\Dev\\TypeScript\\Shared"
LOCAL_DIR = f"{home}\\Dev\\TypeScript\\Local"
USER_NAME = os.getlogin()

# To save under app.state
state = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifecycle handler to manage startup and shutdown of FastAPI
    Before yield => on startup
    After yield => on shutdown
    """
    # Initialize managers
    # StatusManager and DataManager will monitor local mirror of shared
    app.state.status_manager = StatusManager(LOCAL_DIR)
    app.state.data_manager = DataManager(LOCAL_DIR)

    # Start file syncer thread
    syncer = FileSyncer(SHARED_DIR, LOCAL_DIR, interval=5)
    syncer.start()
    app.state.syncer = syncer

    # Create queue for communication
    task_queue = Queue()

    # Start a worker process
    worker_process = Process(target=calc_worker, args=(task_queue, SHARED_DIR, USER_NAME), daemon=True)
    worker_process.start()

    # Save them to app.state, so each API endpoint can access
    app.state.task_queue = task_queue
    app.state.worker_process = worker_process

    logger.info(f"INFO: Worker process started with PID {worker_process.pid}")

    yield  # FastAPI starts up here and wait for a request

    # Cleanup on FastAPI's shutdown
    logger.info("INFO: Shutting down. Cleaning up resources...")
    if app.state.worker_process.is_alive():
        app.state.worker_process.terminate()
        app.state.worker_process.join()

    # Stop syncer's thread
    app.state.syncer.stop()

    logger.info("INFO: Cleanup complete.")


# Set lifespan on app creation
app = FastAPI(lifespan=lifespan)

# CORS to allow an access from frontend
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], allow_methods=["*"], allow_headers=["*"])


@app.post("/stop-worker")
async def stop_worker():
    """
    Kill the current process and set a new process to app.state
    """
    if app.state.worker_process.is_alive():
        app.state.worker_process.terminate()
        app.state.worker_process.join()

    # Restart - the same logic as startup
    app.state.worker_process = Process(
        target=calc_worker, args=(app.state.task_queue, SHARED_DIR, USER_NAME), daemon=True
    )
    app.state.worker_process.start()

    return {"status": "restarted", "new_pid": app.state.worker_process.pid}


@app.post("/run-task/{task_id}")
async def run_task(params: TaskParams):
    """
    Pass a request by using task_queue created with lifespan
    """
    task_id = f"{params.target_id}_{params.task_type}"
    app.state.task_queue.put({"task_id": task_id, "params": params.model_dump()})
    return {"status": "accepted", "task_id": task_id}


@app.get("/tasks/{target_id}/{task_type}/status", response_model=TaskStatus)
async def get_task_status(target_id: str, task_type: str):
    """
    Reads the current status from the local mirrored JSON.
    Used for frontend polling.
    """
    task_id = f"{target_id}_{task_type}"
    status_manager = app.state.status_manager

    # Get status from local mirror
    status = status_manager.get_status(task_id)
    if not status:
        raise HTTPException(status_code=404, detail="Task status not found")
    return status


@app.get("/tasks/{target_id}/{task_type}/data")
async def get_task_data(target_id: str, task_type: str, version: str = "latest"):
    """
    Returns the calculation results (from Parquet) as JSON.
    'version' parameter supports Phase 5 (History).
    """
    data_manager = app.state.data_manager
    try:
        data = data_manager.get_latest_data(task_type, target_id)
        return {"data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/health")
async def health_check():
    return {
        "user": USER_NAME,
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
    }
