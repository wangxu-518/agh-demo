from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.models.patient import PatientStatus


class PatientBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    country: str = "马来西亚"
    language: str = "zh"
    disease_type: Optional[str] = None
    disease_stage: Optional[str] = None
    diagnosis_summary: Optional[str] = None
    budget_range: Optional[str] = None
    preferred_timing: Optional[str] = None


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    country: Optional[str] = None
    language: Optional[str] = None
    disease_type: Optional[str] = None
    disease_stage: Optional[str] = None
    diagnosis_summary: Optional[str] = None
    budget_range: Optional[str] = None
    preferred_timing: Optional[str] = None
    status: Optional[PatientStatus] = None
    assigned_sales_id: Optional[int] = None
    notes: Optional[str] = None


class PatientResponse(PatientBase):
    id: int
    status: PatientStatus
    medical_files: List[str] = []
    assigned_sales_id: Optional[int] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PatientListResponse(BaseModel):
    items: List[PatientResponse]
    total: int
    page: int
    page_size: int