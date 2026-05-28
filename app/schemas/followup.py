from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class FollowUpResponse(BaseModel):
    id: int
    patient_id: int
    node: str
    scheduled_at: datetime
    executed_at: Optional[datetime] = None
    status: str
    whatsapp_message_id: Optional[str] = None
    patient_response: Optional[str] = None
    requires_intervention: bool
    created_at: datetime

    class Config:
        from_attributes = True


class FollowUpListResponse(BaseModel):
    items: List[FollowUpResponse]
    pending_count: int
    completed_count: int