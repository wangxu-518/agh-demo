from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, Enum, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class PatientStatus(str, enum.Enum):
    INITIAL = "initial"           # 初始录入
    CONSULTING = "consulting"     # 咨询中
    REVIEWING = "reviewing"       # 评审中
    REVIEWED = "reviewed"        # 评审完成
    CONTRACTED = "contracted"     # 已签约
    SURGERY_SCHEDULED = "surgery_scheduled"  # 手术已预约
    POST_SURGERY = "post_surgery"  # 术后
    FOLLOWUP = "followup"        # 随访中
    CLOSED = "closed"            # 已结束


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(50))
    whatsapp = Column(String(50))
    email = Column(String(100))
    country = Column(String(50), default="马来西亚")  # 马来西亚/印尼/泰国
    language = Column(String(20), default="zh")  # zh/en/ms

    # 病情信息
    disease_type = Column(String(200))  # 肿瘤类型
    disease_stage = Column(String(50))  # 分期 I/II/III/IV
    diagnosis_summary = Column(Text)  # 诊断摘要

    # 病情资料文件 (JSON array of file URLs)
    medical_files = Column(JSON, default=[])

    # 状态
    status = Column(Enum(PatientStatus), default=PatientStatus.INITIAL)

    # 预算和期望
    budget_range = Column(String(100))
    preferred_timing = Column(String(100))

    # 内部信息
    assigned_sales_id = Column(Integer)  # 负责销售ID
    notes = Column(Text)

    # 时间戳
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    reviews = relationship("Review", back_populates="patient", cascade="all, delete-orphan")
    followups = relationship("FollowUp", back_populates="patient", cascade="all, delete-orphan")