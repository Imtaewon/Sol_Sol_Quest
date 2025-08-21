# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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