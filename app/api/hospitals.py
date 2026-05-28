from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.hospital import Hospital
from app.models.doctor import Doctor

router = APIRouter(prefix="/api/v1", tags=["医院/医生"])


@router.get("/hospitals")
async def list_hospitals(
    country: str = Query(None),
    specialty: str = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """医院列表"""
    query = select(Hospital).where(Hospital.is_active == True)

    if country:
        query = query.where(Hospital.country == country)
    if specialty:
        query = query.where(Hospital.specialties.contains([specialty]))

    result = await db.execute(query)
    hospitals = result.scalars().all()
    return hospitals


@router.get("/hospitals/{hospital_id}")
async def get_hospital(
    hospital_id: int,
    db: AsyncSession = Depends(get_db)
):
    """医院详情"""
    result = await db.execute(
        select(Hospital).where(Hospital.id == hospital_id)
    )
    hospital = result.scalar_one_or_none()
    if not hospital:
        raise HTTPException(status_code=404, detail="医院不存在")
    return hospital


@router.get("/doctors")
async def list_doctors(
    hospital_id: int = Query(None),
    specialty: str = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """医生列表"""
    query = select(Doctor).where(Doctor.is_active == True)

    if hospital_id:
        query = query.where(Doctor.hospital_id == hospital_id)
    if specialty:
        query = query.where(Doctor.specialty == specialty)

    result = await db.execute(query)
    doctors = result.scalars().all()
    return doctors


@router.get("/doctors/{doctor_id}")
async def get_doctor(
    doctor_id: int,
    db: AsyncSession = Depends(get_db)
):
    """医生详情"""
    result = await db.execute(
        select(Doctor).where(Doctor.id == doctor_id)
    )
    doctor = result.scalar_one_or_none()
    if not doctor:
        raise HTTPException(status_code=404, detail="医生不存在")
    return doctor