# AGH 跨境肿瘤患者管理系统 — 后端 API

## 环境要求

- Python 3.10+
- PostgreSQL 14+
- Redis 6+

## 本地开发

```bash
cd agh-demo-api
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 填写数据库和 Redis 配置

# 初始化数据库
python init_db.py

# 启动开发服务器
uvicorn app.main:app --reload --port 8000
```

## 目录结构

```
agh-demo-api/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI 应用入口
│   ├── config.py            # 配置管理
│   ├── database.py         # 数据库连接
│   ├── models/             # SQLAlchemy 模型
│   │   ├── __init__.py
│   │   ├── patient.py      # 患者模型
│   │   ├── review.py       # 评审记录模型
│   │   ├── hospital.py     # 医院模型
│   │   ├── doctor.py       # 医生模型
│   │   └── followup.py     # 随访记录模型
│   ├── schemas/            # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── patient.py
│   │   ├── review.py
│   │   └── followup.py
│   ├── api/                # API 路由
│   │   ├── __init__.py
│   │   ├── patients.py
│   │   ├── reviews.py
│   │   ├── hospitals.py
│   │   └── followups.py
│   └── services/           # 业务逻辑
│       ├── __init__.py
│       ├── patient_service.py
│       ├── review_service.py
│       └── followup_service.py
├── tests/
├── .env.example
├── requirements.txt
└── README.md
```

## API 文档

启动服务后访问：http://localhost:8000/docs

## 核心接口

### 患者管理

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/v1/patients | 创建患者档案 |
| GET | /api/v1/patients | 查询患者列表 |
| GET | /api/v1/patients/{id} | 获取患者详情 |
| PUT | /api/v1/patients/{id} | 更新患者信息 |
| POST | /api/v1/patients/{id}/files | 上传病历文件 |

### 评审工作流

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/v1/reviews | 创建评审任务 |
| GET | /api/v1/reviews | 查询评审列表 |
| GET | /api/v1/reviews/{id} | 获取评审详情 |
| PUT | /api/v1/reviews/{id}/status | 更新评审状态 |
| POST | /api/v1/reviews/{id}/assign | 分配医生 |
| POST | /api/v1/reviews/{id}/complete | 提交评审结果 |

### 医院/医生

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/v1/hospitals | 医院列表 |
| GET | /api/v1/hospitals/{id} | 医院详情 |
| GET | /api/v1/doctors | 医生列表 |
| POST | /api/v1/doctors/{id}/availability | 更新医生排班 |

### 术后随访

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/v1/followups | 随访列表 |
| GET | /api/v1/followups/pending | 待执行随访 |
| POST | /api/v1/followups/{id}/complete | 标记已完成 |