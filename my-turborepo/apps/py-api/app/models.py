from pydantic import BaseModel
from typing import Dict, Any


class ComputeRequest(BaseModel):
    fund_id: str
    action: str
    params: Dict[str, Any]
    user_name: str
