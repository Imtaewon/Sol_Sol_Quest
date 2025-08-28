from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
from pydantic import BaseModel

from .system import QuestRecommendationSystem
from ..database import get_db
from ..auth.deps import get_current_user
from ..models import User


# 응답 모델 정의
class QuestRecommendationResponse(BaseModel):
    quest_ids: List[str]
    message: str

class QuestDetailResponse(BaseModel):
    id: str
    type: str
    title: str
    category: str
    verify_method: str
    reward_exp: int
    target_count: int
    period_scope: str
    recommendation_score: int = None

# 라우터 생성
recommendation_router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])

@recommendation_router.get("/quests", response_model=QuestRecommendationResponse)
async def get_recommended_quests(
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """
    현재 사용자를 위한 퀘스트 추천
    
    - 사용자의 개인정보와 설문조사 답변을 분석하여 맞춤형 퀘스트 3개를 추천합니다.
    - LIFE, GROWTH 타입의 퀘스트를 추천합니다. (SURPRISE 타입은 제외)
    - 1회성 추천으로, 사용자의 시도 이력은 고려하지 않습니다.
    """
    try:
        # current_user 객체에서 user_id 추출
        user_id = current_user.get("id") if isinstance(current_user, dict) else str(current_user)
        
        recommendation_system = QuestRecommendationSystem()
        quest_ids = recommendation_system.recommend_quests(db, user_id)
        
        return QuestRecommendationResponse(
            quest_ids=quest_ids,
            message=f"사용자 {user_id}를 위한 {len(quest_ids)}개의 맞춤 퀘스트를 추천했습니다."
        )
    
    except HTTPException:
        raise HTTPException(status_code=404, detail="추천 퀘스트를 찾을 수 없습니다.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"추천 시스템 오류: {str(e)}")

@recommendation_router.get("/quests/detailed", response_model=List[QuestDetailResponse])
async def get_recommended_quests_with_details(
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """
    현재 사용자를 위한 상세 정보가 포함된 퀘스트 추천
    
    - 추천된 퀘스트의 상세 정보와 추천 점수를 함께 반환합니다.
    - quest_recommendations 테이블에 추천 기록을 저장합니다.
    """
    try:
        # current_user 객체에서 user_id 추출
        user_id = current_user.get("id") if isinstance(current_user, dict) else str(current_user)
        
        recommendation_system = QuestRecommendationSystem()
        
        # 사용자 정보 및 설문조사 답변 조회
        user_info = recommendation_system.get_user_info(db, user_id)
        survey_answers = recommendation_system.get_survey_answers(db, user_id)
        available_quests = recommendation_system.get_available_quests(db)
        
        if survey_answers:
            # 선호도 분석 및 퀘스트 점수 계산
            category_scores = recommendation_system.analyze_user_preferences(user_info, survey_answers)
            scored_quests = recommendation_system.score_quests(available_quests, category_scores)
            recommended_quests = recommendation_system._select_diverse_quests(scored_quests, 3)
        else:
            # 기본 추천
            default_ids = recommendation_system._get_default_recommendations(db)
            recommended_quests = [q for q in available_quests if q["id"] in default_ids][:3]
        
        # DB에 추천 기록 저장
        quest_ids = [quest["id"] for quest in recommended_quests]
        recommendation_system._save_recommendations_to_db(db, user_id, quest_ids)
        
        return [
            QuestDetailResponse(
                id=quest["id"],
                type=quest["type"],
                title=quest["title"],
                category=quest["category"],
                verify_method=quest["verify_method"],
                reward_exp=quest["reward_exp"],
                target_count=quest["target_count"],
                period_scope=quest["period_scope"],
                recommendation_score=quest.get("recommendation_score", 0)
            )
            for quest in recommended_quests
        ]
    
    except HTTPException:
        raise HTTPException(status_code=404, detail="추천 퀘스트를 찾을 수 없습니다2.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"추천 시스템 오류: {str(e)}")

@recommendation_router.get("/user/preferences")
async def get_user_preferences(
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """
    사용자의 선호도 분석 결과 조회
    
    - 디버깅 및 분석 목적으로 사용자의 카테고리별 선호도 점수를 반환합니다.
    """
    try:
        # current_user 객체에서 user_id 추출
        user_id = current_user.get("id") if isinstance(current_user, dict) else str(current_user)
        
        recommendation_system = QuestRecommendationSystem()
        user_info = recommendation_system.get_user_info(db, user_id)
        survey_answers = recommendation_system.get_survey_answers(db, user_id)
        
        if not survey_answers:
            raise HTTPException(status_code=404, detail="설문조사 답변을 찾을 수 없습니다.")
        
        category_scores = recommendation_system.analyze_user_preferences(user_info, survey_answers)
        
        return {
            "user_id": user_id,
            "user_info": user_info,
            "survey_answers_count": len(survey_answers),
            "category_scores": category_scores,
            "top_categories": sorted(category_scores.items(), key=lambda x: x[1], reverse=True)[:3]
        }
    
    except HTTPException:
        raise HTTPException(status_code=404, detail="선호도 분석 결과를 찾을 수 없습니다.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"선호도 분석 오류: {str(e)}")
