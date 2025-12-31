from datetime import datetime
from typing import Any, Dict, Literal

from pydantic import BaseModel, Field


class TaskParams(BaseModel):
    """Parameters sent from the frontend to trigger a task."""

    target_id: str = Field(..., description="Target identifier (e.g., AAPL)")
    task_type: Literal["event", "guideline", "pricing"] = Field(..., description="Type of task")
    extra_params: Dict[str, Any] = Field(default_factory=dict, description="Additional library-specific arguments")


class TaskStatus(BaseModel):
    """The shape of the JSON stored in the shared folder."""

    task_id: str = Field(..., description="Unique ID for the task")
    status: Literal["pending", "running", "done", "failed"] = Field(..., description="Current status")
    user: str = Field(..., description="The user/PC executing the task")
    progress: float = Field(0.0, ge=0.0, le=100.0)
    message: str = Field("", description="Display message for the UI")
    last_heartbeat: datetime = Field(..., description="Last update timestamp")
    params: TaskParams
