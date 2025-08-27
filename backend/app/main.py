from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .auth.router import router as auth_router
from .quests.router import router as quest_router
from .users.router import router as user_router
from .universities.router import router as university_router
from app.accounts.router import router as accounts_router
from app.attendance.router import router as attendance_router

app = FastAPI(
    title="쏠쏠한 퀘스트 API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(quest_router, prefix="/api/v1")
app.include_router(user_router, prefix="/api/v1")
app.include_router(university_router, prefix="/api/v1")
app.include_router(accounts_router, prefix="/api/v1")
app.include_router(attendance_router, prefix="/api/v1")

@app.get("/api/v1/health")
def health_check():
    return {"success": True, "message": "API is running"}

@app.get("/")
async def root():
    return {"message": "Quest Backend Server is Running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "quest-backend"}