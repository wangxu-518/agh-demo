from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.models.review import ReviewPriority, ReviewStatus


class ReviewBase(BaseModel):
    patient_id: int
    priority: ReviewPriority = ReviewPriority.NORMAL


class ReviewCreate(ReviewBase):
    pass


class ReviewUpdate(BaseModel):
    priority: Optional[ReviewPriority] = None
    status: Optional[ReviewStatus] = None


class ReviewAssign(BaseModel):
    doctor_id: int


class ReviewComplete(BaseModel):
    conclusion: str
    recommended_hospital_id: int
    recommended_doctor_id: int
    surgery_plan: str


class ReviewResponse(ReviewBase):
    id: int
    status: ReviewStatus
    assigned_doctor_id: Optional[int] = None
    ai_preprocess_result: Optional[dict] = None
    conclusion: Optional[str] = None
    recommended_hospital_id: Optional[int] = None
    recommended_doctor_id: Optional[int] = None
    surgery_plan: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ReviewListResponse(BaseModel):
    items: List[ReviewResponse]
    total: int
    pending_count: int
    in_progress_count: int