from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.review import Review, ReviewStatus, ReviewPriority
from app.models.patient import Patient, PatientStatus
from app.schemas.review import (
    ReviewCreate, ReviewUpdate, ReviewAssign, ReviewComplete, ReviewResponse, ReviewListResponse
)

router = APIRouter(prefix="/api/v1/reviews", tags=["评审工作流"])


@router.post("", response_model=ReviewResponse)
async def create_review(
    review: ReviewCreate,
    db: AsyncSession = Depends(get_db)
):
    """创建评审任务"""
    # Verify patient exists
    result = await db.execute(
        select(Patient).where(Patient.id == review.patient_id)
    )
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="患者不存在")

    # Check if patient already has a pending review
    existing = await db.execute(
        select(Review).where(
            Review.patient_id == review.patient_id,
            Review.status.in_([ReviewStatus.PENDING, ReviewStatus.ASSIGNED, ReviewStatus.IN_PROGRESS])
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="该患者已有进行中的评审任务")

    db_review = Review(**review.model_dump())
    db.add(db_review)

    # Update patient status
    patient.status = PatientStatus.REVIEWING

    await db.flush()
    await db.refresh(db_review)
    return db_review


@router.get("", response_model=ReviewListResponse)
async def list_reviews(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[ReviewStatus] = None,
    priority: Optional[ReviewPriority] = None,
    db: AsyncSession = Depends(get_db)
):
    """查询评审列表"""
    query = select(Review).options(selectinload(Review.patient))
    count_query = select(func.count(Review.id))

    if status:
        query = query.where(Review.status == status)
        count_query = count_query.where(Review.status == status)
    if priority:
        query = query.where(Review.priority == priority)
        count_query = count_query.where(Review.priority == priority)

    total = await db.scalar(count_query)

    query = query.order_by(Review.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    reviews = result.scalars().all()

    # Count by status
    pending_count = await db.scalar(
        select(func.count(Review.id)).where(Review.status == ReviewStatus.PENDING)
    )
    in_progress_count = await db.scalar(
        select(func.count(Review.id)).where(Review.status == ReviewStatus.IN_PROGRESS)
    )

    return ReviewListResponse(
        items=reviews,
        total=total or 0,
        pending_count=pending_count or 0,
        in_progress_count=in_progress_count or 0
    )


@router.get("/{review_id}", response_model=ReviewResponse)
async def get_review(
    review_id: int,
    db: AsyncSession = Depends(get_db)
):
    """获取评审详情"""
    result = await db.execute(
        select(Review).where(Review.id == review_id)
    )
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="评审不存在")
    return review


@router.put("/{review_id}/status", response_model=ReviewResponse)
async def update_review_status(
    review_id: int,
    status_update: ReviewUpdate,
    db: AsyncSession = Depends(get_db)
):
    """更新评审状态"""
    result = await db.execute(
        select(Review).where(Review.id == review_id)
    )
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="评审不存在")

    update_data = status_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(review, field, value)

    await db.flush()
    await db.refresh(review)
    return review


@router.post("/{review_id}/assign", response_model=ReviewResponse)
async def assign_doctor(
    review_id: int,
    assignment: ReviewAssign,
    db: AsyncSession = Depends(get_db)
):
    """分配医生"""
    result = await db.execute(
        select(Review).where(Review.id == review_id)
    )
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="评审不存在")

    if review.status != ReviewStatus.PENDING:
        raise HTTPException(status_code=400, detail="只能分配待分配的评审任务")

    review.assigned_doctor_id = assignment.doctor_id
    review.status = ReviewStatus.ASSIGNED

    await db.flush()
    await db.refresh(review)
    return review


@router.post("/{review_id}/complete", response_model=ReviewResponse)
async def complete_review(
    review_id: int,
    completion: ReviewComplete,
    db: AsyncSession = Depends(get_db)
):
    """提交评审结果"""
    result = await db.execute(
        select(Review).where(Review.id == review_id)
    )
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="评审不存在")

    if review.status not in [ReviewStatus.ASSIGNED, ReviewStatus.IN_PROGRESS]:
        raise HTTPException(status_code=400, detail="只能完成已分配的评审任务")

    review.conclusion = completion.conclusion
    review.recommended_hospital_id = completion.recommended_hospital_id
    review.recommended_doctor_id = completion.recommended_doctor_id
    review.surgery_plan = completion.surgery_plan
    review.status = ReviewStatus.COMPLETED
    review.completed_at = datetime.utcnow()

    # Update patient status
    patient_result = await db.execute(
        select(Patient).where(Patient.id == review.patient_id)
    )
    patient = patient_result.scalar_one_or_none()
    if patient:
        patient.status = PatientStatus.REVIEWED

    await db.flush()
    await db.refresh(review)
    return review