from datetime import datetime
from typing import Any, Dict, Literal, Optional

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


class UserEvent(BaseModel):
    event_id: str = Field(..., description="Unique event ID")
    title: str = Field(..., description="Event title")
    start: str = Field(..., description="Start date (YYYY-MM-DD)")
    start_time: Optional[str] = Field(None, description="Start time (HH:mm)")
    end: Optional[str] = Field(None, description="End date (YYYY-MM-DD)")
    end_time: Optional[str] = Field(None, description="End time (HH:mm)")
    description: Optional[str] = ""
    category: Optional[str] = ""
    user: str = Field(..., description="User who created this")
