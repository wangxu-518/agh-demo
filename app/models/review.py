from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, Enum, ForeignKey, JSON
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class ReviewPriority(str, enum.Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class ReviewStatus(str, enum.Enum):
    PENDING = "pending"          # 待分配
    ASSIGNED = "assigned"        # 已分配医生
    IN_PROGRESS = "in_progress"  # 评审中
    COMPLETED = "completed"      # 已完成
    CANCELLED = "cancelled"     # 已取消


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)

    # 优先级
    priority = Column(Enum(ReviewPriority), default=ReviewPriority.NORMAL)

    # 状态
    status = Column(Enum(ReviewStatus), default=ReviewStatus.PENDING)

    # 分配的医生
    assigned_doctor_id = Column(Integer, ForeignKey("doctors.id"))

    # AI 预处理结果
    ai_preprocess_result = Column(JSON)

    # 评审结论
    conclusion = Column(Text)  # 医生填写的评审结论
    recommended_hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    recommended_doctor_id = Column(Integer, ForeignKey("doctors.id"))
    surgery_plan = Column(Text)  # 手术方案建议

    # 时间戳
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime)

    # 关系
    patient = relationship("Patient", back_populates="reviews")
    assigned_doctor = relationship("Doctor", foreign_keys=[assigned_doctor_id])
    recommended_hospital = relationship("Hospital", foreign_keys=[recommended_hospital_id])
    recommended_doctor = relationship("Doctor", foreign_keys=[recommended_doctor_id])