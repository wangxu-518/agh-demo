from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, Boolean, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    name_en = Column(String(100))

    # 医院
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False)
    hospital = relationship("Hospital")

    # 专科
    specialty = Column(String(200))  # e.g. "胸外科", "胃肠外科"
    title = Column(String(100))  # 职称 e.g. "主任医师", "副主任医师"

    # 擅长病种 (JSON array)
    expert_in = Column(JSON, default=[])  # e.g. ["肺癌", "食管癌", "纵隔肿瘤"]

    # 手术量
    surgery_annual = Column(Integer)  # 年手术量
    international_patient_annual = Column(Integer)  # 年国际患者量

    # 排班 (JSON array of available date ranges)
    availability = Column(JSON, default=[])

    # 语言能力
    languages = Column(JSON, default=[])  # e.g. ["中文", "英语", "马来语"]

    # 状态
    is_active = Column(Boolean, default=True)

    # 联系方式 (内部使用，不暴露给患者)
    contact_internal = Column(String(200))

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)