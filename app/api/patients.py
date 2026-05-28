from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.patient import Patient, PatientStatus
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse, PatientListResponse

router = APIRouter(prefix="/api/v1/patients", tags=["患者管理"])


@router.post("", response_model=PatientResponse)
async def create_patient(
    patient: PatientCreate,
    db: AsyncSession = Depends(get_db)
):
    """创建患者档案"""
    db_patient = Patient(**patient.model_dump())
    db.add(db_patient)
    await db.flush()
    await db.refresh(db_patient)
    return db_patient


@router.get("", response_model=PatientListResponse)
async def list_patients(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[PatientStatus] = None,
    country: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """查询患者列表"""
    query = select(Patient)
    count_query = select(func.count(Patient.id))

    if status:
        query = query.where(Patient.status == status)
        count_query = count_query.where(Patient.status == status)
    if country:
        query = query.where(Patient.country == country)
        count_query = count_query.where(Patient.country == country)
    if search:
        search_filter = Patient.name.ilike(f"%{search}%")
        query = query.where(search_filter)
        count_query = count_query.where(search_filter)

    # Total count
    total = await db.scalar(count_query)

    # Paginated results
    query = query.order_by(Patient.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    patients = result.scalars().all()

    return PatientListResponse(
        items=patients,
        total=total or 0,
        page=page,
        page_size=page_size
    )


@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(
    patient_id: int,
    db: AsyncSession = Depends(get_db)
):
    """获取患者详情"""
    result = await db.execute(
        select(Patient).where(Patient.id == patient_id)
    )
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="患者不存在")
    return patient


@router.put("/{patient_id}", response_model=PatientResponse)
async def update_patient(
    patient_id: int,
    patient_update: PatientUpdate,
    db: AsyncSession = Depends(get_db)
):
    """更新患者信息"""
    result = await db.execute(
        select(Patient).where(Patient.id == patient_id)
    )
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="患者不存在")

    update_data = patient_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(patient, field, value)

    await db.flush()
    await db.refresh(patient)
    return patient


@router.post("/{patient_id}/files")
async def upload_medical_file(
    patient_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """上传病历文件"""
    result = await db.execute(
        select(Patient).where(Patient.id == patient_id)
    )
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="患者不存在")

    # TODO: Upload to OSS and get URL
    # For now, just acknowledge
    file_url = f"https://storage.example.com/patients/{patient_id}/{file.filename}"

    # Append to medical_files
    current_files = patient.medical_files or []
    current_files.append(file_url)
    patient.medical_files = current_files

    await db.flush()
    return {"url": file_url, "total_files": len(current_files)}