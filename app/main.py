from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.api import patients, reviews, hospitals, followups

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="AGH 跨境肿瘤患者管理系统 API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(patients.router)
app.include_router(reviews.router)
app.include_router(hospitals.router)
app.include_router(followups.router)


@app.get("/")
async def root():
    return {"message": "AGH 跨境肿瘤患者管理系统 API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}