# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine

from .auth.router import router as auth_router
from .users.router import router as users_router


Base.metadata.create_all(bind=engine)  # 초기 개발용(운영은 Alembic 권장)

app = FastAPI(
    title="쏠쏠한 퀘스트 API",
    description="신한은행 해커톤 - 퀘스트 기반 적금 서비스",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발 환경용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 인증 라우터 등록
app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")

@app.get("/api/v1/health")
def health_check():
    return {"success": True, "message": "API is running"}

@app.get("/")
async def root():
    return {"message": "Quest Backend Server is Running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "quest-backend",
        "version": "1.0.0"
    }