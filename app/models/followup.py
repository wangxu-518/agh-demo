from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, Enum, ForeignKey, Boolean
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class FollowUpStatus(str, enum.Enum):
    PENDING = "pending"      # 待执行
    COMPLETED = "completed"  # 已完成
    SKIPPED = "skipped"      # 跳过（患者主动取消）
    FAILED = "failed"       # 失败（无法联系）


class FollowUpNode(str, enum.Enum):
    DAY_7 = "day_7"      # 出院后7天
    DAY_30 = "day_30"    # 出院后30天
    DAY_90 = "day_90"    # 出院后90天
    DAY_180 = "day_180"  # 出院后180天


class FollowUp(Base):
    __tablename__ = "followups"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    patient = relationship("Patient")

    # 随访节点
    node = Column(Enum(FollowUpNode), nullable=False)

    # 计划执行时间
    scheduled_at = Column(DateTime, nullable=False)

    # 实际执行时间
    executed_at = Column(DateTime)

    # 状态
    status = Column(Enum(FollowUpStatus), default=FollowUpStatus.PENDING)

    # WhatsApp 消息 ID (用于追踪)
    whatsapp_message_id = Column(String(100))

    # 患者回复内容
    patient_response = Column(Text)

    # 内部备注
    internal_notes = Column(Text)

    # 是否需要介入
    requires_intervention = Column(Boolean, default=False)
    intervention_notes = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)