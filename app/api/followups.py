from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models.followup import FollowUp, FollowUpStatus
from app.schemas.followup import FollowUpListResponse

router = APIRouter(prefix="/api/v1/followups", tags=["术后随访"])


@router.get("")
async def list_followups(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: str = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """随访列表"""
    query = select(FollowUp)

    if status:
        query = query.where(FollowUp.status == status)

    total = await db.scalar(select(func.count(FollowUp.id)))

    query = query.order_by(FollowUp.scheduled_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    followups = result.scalars().all()

    pending_count = await db.scalar(
        select(func.count(FollowUp.id)).where(FollowUp.status == FollowUpStatus.PENDING)
    )
    completed_count = await db.scalar(
        select(func.count(FollowUp.id)).where(FollowUp.status == FollowUpStatus.COMPLETED)
    )

    return FollowUpListResponse(
        items=followups,
        pending_count=pending_count or 0,
        completed_count=completed_count or 0
    )


@router.get("/pending")
async def list_pending_followups(
    db: AsyncSession = Depends(get_db)
):
    """待执行随访（用于 WhatsApp 定时任务触发）"""
    result = await db.execute(
        select(FollowUp).where(FollowUp.status == FollowUpStatus.PENDING)
    )
    followups = result.scalars().all()
    return followups