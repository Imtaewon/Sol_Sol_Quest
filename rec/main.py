from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import uvicorn

from .database import get_db, test_database_connection, get_current_user_simple
from .api_router import recommendation_router
from .recommendation_system import QuestRecommendationSystem

# FastAPI 애플리케이션 생성
app = FastAPI(
    title="Quest Recommendation API",
    description="대학생을 위한 퀘스트 추천 시스템 API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 실제 운영에서는 특정 도메인으로 제한
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(recommendation_router)

# 헬스 체크 엔드포인트
@app.get("/health")
async def health_check():
    """서비스 상태 확인"""
    db_status = test_database_connection()
    return {
        "status": "healthy" if db_status else "unhealthy",
        "database": "connected" if db_status else "disconnected",
        "service": "Quest Recommendation System",
        "version": "1.0.0"
    }

# 루트 엔드포인트
@app.get("/")
async def root():
    """API 정보"""
    return {
        "message": "Quest Recommendation System API",
        "version": "1.0.0",
        "docs_url": "/docs",
        "health_check": "/health"
    }

# 개발/테스트용 간단한 추천 엔드포인트
@app.get("/api/simple-recommend/{user_id}")
async def simple_recommend(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    개발/테스트용 간단한 퀘스트 추천 엔드포인트
    인증 없이 user_id만으로 추천 결과를 받을 수 있습니다.
    """
    try:
        recommendation_system = QuestRecommendationSystem()
        quest_ids = recommendation_system.recommend_quests(db, user_id)
        
        return {
            "user_id": user_id,
            "recommended_quest_ids": quest_ids,
            "count": len(quest_ids),
            "message": "추천 성공"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 설문조사 답변 확인용 엔드포인트
@app.get("/api/debug/user/{user_id}/survey")
async def debug_user_survey(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    디버깅용: 특정 사용자의 설문조사 답변 확인
    """
    try:
        recommendation_system = QuestRecommendationSystem()
        user_info = recommendation_system.get_user_info(db, user_id)
        survey_answers = recommendation_system.get_survey_answers(db, user_id)
        
        if survey_answers:
            category_scores = recommendation_system.analyze_user_preferences(user_info, survey_answers)
        else:
            category_scores = {}
        
        return {
            "user_id": user_id,
            "user_info": user_info,
            "survey_answers": survey_answers,
            "category_scores": category_scores,
            "survey_completed": len(survey_answers) > 0
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 전체 퀘스트 목록 조회 (디버깅용)
@app.get("/api/debug/quests")
async def debug_available_quests(db: Session = Depends(get_db)):
    """
    디버깅용: 추천 가능한 모든 퀘스트 목록 조회
    """
    try:
        recommendation_system = QuestRecommendationSystem()
        quests = recommendation_system.get_available_quests(db)
        
        # 카테고리별 통계
        category_stats = {}
        type_stats = {}
        
        for quest in quests:
            category = quest["category"]
            quest_type = quest["type"]
            
            category_stats[category] = category_stats.get(category, 0) + 1
            type_stats[quest_type] = type_stats.get(quest_type, 0) + 1
        
        return {
            "total_quests": len(quests),
            "quests": quests,
            "statistics": {
                "by_category": category_stats,
                "by_type": type_stats
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
