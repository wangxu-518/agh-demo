#!/usr/bin/env python3
"""数据库初始化脚本"""
import asyncio
import sys
sys.path.insert(0, '.')

from sqlalchemy import text
from app.database import engine, Base
from app.models.patient import Patient
from app.models.review import Review
from app.models.hospital import Hospital
from app.models.doctor import Doctor
from app.models.followup import FollowUp


async def init_db():
    """创建所有表"""
    async with engine.begin() as conn:
        # Drop all tables (for development)
        await conn.run_sync(Base.metadata.drop_all)
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    print("✓ 数据库表创建完成")


async def seed_data():
    """填充示例数据"""
    from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
    from app.database import engine
    from app.models.hospital import Hospital
    from app.models.doctor import Doctor

    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # 创建示例医院
        hospitals = [
            Hospital(
                name="北京协和医院",
                name_en="Peking Union Medical College Hospital",
                country="中国",
                city="北京",
                specialties=["肿瘤内科", "胸外科", "胃肠外科", "泌尿外科"],
                annual_capacity=50000,
                international_patient_annual=5000,
                price_range_min=50000,
                price_range_max=200000,
                has_english_service=True,
                has_malay_service=False,
                international_center=True
            ),
            Hospital(
                name="复旦大学附属肿瘤医院",
                name_en="Fudan University Cancer Hospital",
                country="中国",
                city="上海",
                specialties=["肿瘤外科", "放射治疗科", "肿瘤内科"],
                annual_capacity=80000,
                international_patient_annual=3000,
                price_range_min=40000,
                price_range_max=180000,
                has_english_service=True,
                has_malay_service=False,
                international_center=True
            ),
            Hospital(
                name="中山大学肿瘤防治中心",
                name_en="Sun Yat-sen University Cancer Center",
                country="中国",
                city="广州",
                specialties=["鼻咽癌专科", "胸外科", "肝胆外科"],
                annual_capacity=60000,
                international_patient_annual=2000,
                price_range_min=35000,
                price_range_max=150000,
                has_english_service=True,
                has_malay_service=True,
                international_center=True
            ),
        ]
        session.add_all(hospitals)
        await session.flush()

        # 创建示例医生
        doctors = [
            Doctor(
                name="张明华",
                name_en="Zhang Minghua",
                hospital_id=hospitals[0].id,
                specialty="胸外科",
                title="主任医师",
                expert_in=["肺癌", "食管癌", "纵隔肿瘤"],
                surgery_annual=500,
                international_patient_annual=100,
                languages=["中文", "英语"],
                availability=[]
            ),
            Doctor(
                name="李建国",
                name_en="Li Jianguo",
                hospital_id=hospitals[0].id,
                specialty="肿瘤内科",
                title="副主任医师",
                expert_in=["肺癌", "胃癌", "结直肠癌"],
                surgery_annual=0,
                international_patient_annual=80,
                languages=["中文", "英语"],
                availability=[]
            ),
            Doctor(
                name="王晓东",
                name_en="Wang Xiaodong",
                hospital_id=hospitals[1].id,
                specialty="胃肠外科",
                title="主任医师",
                expert_in=["胃癌", "结直肠癌", "肝癌"],
                surgery_annual=400,
                international_patient_annual=60,
                languages=["中文", "英语"],
                availability=[]
            ),
        ]
        session.add_all(doctors)
        await session.commit()
        print(f"✓ 示例数据创建完成 ({len(hospitals)} 家医院, {len(doctors)} 位医生)")


if __name__ == "__main__":
    if "--seed" in sys.argv:
        asyncio.run(seed_data())
    else:
        asyncio.run(init_db())