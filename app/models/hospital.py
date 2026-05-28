from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, Boolean, JSON, Float
from app.database import Base


class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    name_en = Column(String(200))
    name_ms = Column(String(200))

    # 基本信息
    country = Column(String(50), default="中国")
    city = Column(String(100))
    address = Column(String(500))

    # 专科优势 (JSON array)
    specialties = Column(JSON, default=[])  # e.g. ["肿瘤内科", "胸外科", "胃肠外科"]

    # 接待能力
    annual_capacity = Column(Integer)  # 年接待量
    international_patient_annual = Column(Integer)  # 年国际患者量

    # 价格区间
    price_range_min = Column(Float)  # 人民币
    price_range_max = Column(Float)

    # 设施
    has_english_service = Column(Boolean, default=False)
    has_malay_service = Column(Boolean, default=False)
    international_center = Column(Boolean, default=False)

    # 联系信息
    contact_email = Column(String(100))
    contact_phone = Column(String(50))

    # 合作状态
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)