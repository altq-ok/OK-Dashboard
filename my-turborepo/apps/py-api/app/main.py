"""
FastAPI Application Entry Point.

Handles the lifecycle of the background worker process and provides
REST endpoints for the Next.js frontend to interact with the calculation engine.
"""

import os
from contextlib import asynccontextmanager
from multiprocessing import Process, Queue

from fastapi import FastAPI
from app.core.worker import calc_worker
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

# Configuration
SHARED_DIR = "~\\Dev\\TypeScript\\Shared"
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
    logger.info("INFO: Shutting down worker process...")
    if app.state.worker_process.is_alive():
        app.state.worker_process.terminate()
        app.state.worker_process.join()
    logger.info("INFO: Cleanup complete.")


# Set lifespan on app creation
app = FastAPI(lifespan=lifespan)

# CORS to allow an access from frontend
# app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], allow_methods=["*"], allow_headers=["*"])


@app.post("/run-task/{task_id}")
async def run_task(task_id: str):
    """
    Pass a request by using task_queue created with lifespan
    """
    app.state.task_queue.put({"task_id": task_id, "params": {"fund_id": "AAPL"}})
    return {"status": "accepted", "task_id": task_id}


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


# For health check
@app.get("/api/health")
async def health_check():
    return {
        "user": USER_NAME,
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
    }

