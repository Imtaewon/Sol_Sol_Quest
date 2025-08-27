"""
Quest Recommendation System

대학생을 위한 개인화된 퀘스트 추천 시스템
사용자의 개인정보와 설문조사 답변을 기반으로 맞춤형 퀘스트를 추천합니다.
"""

__version__ = "1.0.0"
__author__ = "Sol Sol Quest Team"

from .recommendation_system import QuestRecommendationSystem
from .database import get_db, get_current_user, get_current_user_simple
from .api_router import recommendation_router

__all__ = [
    "QuestRecommendationSystem",
    "get_db",
    "get_current_user", 
    "get_current_user_simple",
    "recommendation_router"
]
