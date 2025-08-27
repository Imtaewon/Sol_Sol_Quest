from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Dict, Optional
import random
from datetime import datetime

# 추천 시스템 클래스
class QuestRecommendationSystem:
    def __init__(self):
        # 설문조사 질문별 매핑 정의
        self.category_mapping = {
            # Q1: 평일 주 활동 패턴
            "q1_campus": ["STUDY", "ENT"],  # 캠퍼스/강의 위주
            "q1_certification": ["STUDY"],  # 자격·시험 준비 위주
            "q1_work": ["ECON", "SAVING"],  # 직장/알바 위주
            "q1_irregular": ["LIFE", "ENT"],  # 일정이 불규칙/그 외
            
            # Q2: 월 고정 수입/용돈 수준
            "q2_low_income": ["SAVING", "ECON"],  # 낮은 수입 (20만원 이하)
            "q2_mid_income": ["SAVING", "STUDY"],  # 중간 수입 (21-100만원)
            "q2_high_income": ["STUDY", "HEALTH"],  # 높은 수입 (100만원 이상)
            
            # Q3: 소비 습관
            "q3_planned": ["SAVING", "ECON"],  # 계획 소비 위주
            "q3_discount": ["ECON", "LIFE"],  # 할인·쿠폰 활용
            "q3_minimal": ["SAVING"],  # 필요 위주 최소 지출
            "q3_spontaneous": ["LIFE", "ENT"],  # 즉흥적/경험 소비
            "q3_tracking": ["SAVING", "ECON"],  # 지출 기록/가계부
            
            # Q4: 여유 시간대
            "q4_weekday_day": ["STUDY", "HEALTH"],
            "q4_weekday_evening": ["LIFE", "ENT"],
            "q4_weekend_day": ["HEALTH", "LIFE"],
            "q4_weekend_evening": ["ENT", "LIFE"],
            
            # Q5: 관심 정보 유형
            "q5_benefits": ["LIFE", "ECON"],
            "q5_convenience": ["ECON", "LIFE"],
            "q5_finance": ["SAVING", "ECON"],
            "q5_occasional": ["ENT", "LIFE"],
            
            # Q6: 목표 달성 방식
            "q6_routine": ["HEALTH", "SAVING"],
            "q6_deadline": ["STUDY"],
            "q6_flexible": ["LIFE", "ENT"],
            "q6_tracking": ["SAVING", "STUDY"],
            
            # Q7: 활동/탐색 취향
            "q7_local": ["LIFE"],
            "q7_events": ["ENT"],
            "q7_travel": ["LIFE"],
            "q7_health": ["HEALTH"],
            
            # Q8: 흥미로운 콘텐츠
            "q8_challenge": ["STUDY", "HEALTH"],
            "q8_community": ["ENT", "LIFE"],
            "q8_fortune": ["ENT"],
            "q8_insight": ["STUDY", "ECON"],
            
            # Q9: 저축 목표
            "q9_emergency": ["SAVING"],
            "q9_period_goal": ["SAVING", "STUDY"],
            "q9_long_term": ["SAVING"],
            "q9_habit": ["SAVING"],
            
            # Q10: 납입 방식
            "q10_auto": ["SAVING"],
            "q10_flexible": ["SAVING"],
            "q10_payday": ["SAVING"],
            "q10_roundup": ["SAVING"],
            "q10_adjustable": ["SAVING"],
            
            # Q11: 현금 필요 가능성
            "q11_low": ["SAVING"],
            "q11_medium": ["SAVING", "ECON"],
            "q11_high": ["ECON", "LIFE"],
            
            # Q12: 알림 선호도
            "q12_benefits": ["LIFE", "ECON"],
            "q12_ranking": ["STUDY", "HEALTH"],
            "q12_coaching": ["SAVING", "ECON"],
            "q12_minimal": ["LIFE"]
        }
        
        # 퀘스트 카테고리별 우선순위 매핑
        self.quest_category_priority = {
            "STUDY": ["quest_growth_001", "quest_growth_002", "quest_growth_003", "quest_growth_004", "quest_growth_015"],
            "SAVING": ["quest_growth_005", "quest_growth_006", "quest_growth_007", "quest_growth_008", "quest_growth_009", 
                      "quest_growth_010", "quest_growth_011", "quest_growth_012", "quest_growth_013", "quest_growth_014"],
            "ECON": ["quest_growth_015", "quest_daily_018", "quest_daily_019", "quest_daily_020"],
            "LIFE": ["quest_daily_016", "quest_daily_017"],
            "HEALTH": ["quest_daily_021", "quest_daily_022"],
            "ENT": []  # ENT 카테고리는 LIFE나 GROWTH 타입에 없음
        }

    def get_user_info(self, db: Session, user_id: str) -> Dict:
        """사용자 정보 조회"""
        query = text("""
            SELECT id, gender, birth_year, school_id, department, grade
            FROM users 
            WHERE id = :user_id
        """)
        result = db.execute(query, {"user_id": user_id}).fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="User not found")
            
        return {
            "id": result.id,
            "gender": result.gender,
            "birth_year": result.birth_year,
            "school_id": result.school_id,
            "department": result.department,
            "grade": result.grade
        }

    def get_survey_answers(self, db: Session, user_id: str) -> List[Dict]:
        """사용자 설문조사 답변 조회"""
        query = text("""
            SELECT question_id, question_type, option_id
            FROM survey_answers 
            WHERE user_id = :user_id
            ORDER BY question_type
        """)
        results = db.execute(query, {"user_id": user_id}).fetchall()
        
        return [
            {
                "question_id": result.question_id,
                "question_type": result.question_type,
                "option_id": result.option_id
            }
            for result in results
        ]

    def get_available_quests(self, db: Session) -> List[Dict]:
        """LIFE, GROWTH 타입 퀘스트 조회"""
        query = text("""
            SELECT id, type, title, category, verify_method, reward_exp, 
                   target_count, period_scope, active
            FROM quests 
            WHERE type IN ('LIFE', 'GROWTH') AND active = 1
        """)
        results = db.execute(query).fetchall()
        
        return [
            {
                "id": result.id,
                "type": result.type,
                "title": result.title,
                "category": result.category,
                "verify_method": result.verify_method,
                "reward_exp": result.reward_exp,
                "target_count": result.target_count,
                "period_scope": result.period_scope,
                "active": result.active
            }
            for result in results
        ]

    def analyze_user_preferences(self, user_info: Dict, survey_answers: List[Dict]) -> Dict[str, int]:
        """사용자 선호도 분석"""
        category_scores = {
            "STUDY": 0,
            "SAVING": 0,
            "ECON": 0,
            "LIFE": 0,
            "HEALTH": 0,
            "ENT": 0
        }
        
        # 연령대 기반 선호도
        if user_info["birth_year"]:
            age = datetime.now().year - user_info["birth_year"]
            if age <= 22:  # 대학생
                category_scores["STUDY"] += 2
                category_scores["ENT"] += 1
            elif age <= 26:  # 대학원생/취준생
                category_scores["STUDY"] += 1
                category_scores["SAVING"] += 2
                category_scores["ECON"] += 1
        
        # 학년 기반 선호도
        if user_info["grade"]:
            if user_info["grade"] <= 2:  # 저학년
                category_scores["LIFE"] += 1
                category_scores["ENT"] += 1
            else:  # 고학년
                category_scores["STUDY"] += 1
                category_scores["SAVING"] += 1
                category_scores["ECON"] += 1

        # 설문조사 답변 기반 분석
        for answer in survey_answers:
            question_type = answer["question_type"]
            option_id = answer["option_id"]
            
            # 질문별 매핑 적용
            mapping_key = f"q{question_type}_{self._get_option_key(question_type, option_id)}"
            
            if mapping_key in self.category_mapping:
                for category in self.category_mapping[mapping_key]:
                    category_scores[category] += 3  # 설문 답변은 높은 가중치

        return category_scores

    def _get_option_key(self, question_type: int, option_id: str) -> str:
        """설문 옵션을 키로 변환"""
        option_mapping = {
            1: {  # Q1: 평일 주 활동 패턴
                "1": "campus",
                "2": "certification", 
                "3": "work",
                "4": "irregular"
            },
            2: {  # Q2: 월 고정 수입/용돈 수준
                "1": "low_income", "2": "low_income",  # 없음, 20만원 이하
                "3": "mid_income", "4": "mid_income",   # 21-50만원, 51-100만원
                "5": "high_income", "6": "high_income"  # 101-200만원, 200만원 이상
            },
            3: {  # Q3: 소비 습관
                "1": "planned",
                "2": "discount",
                "3": "minimal",
                "4": "spontaneous",
                "5": "tracking"
            },
            4: {  # Q4: 여유 시간대
                "1": "weekday_day",
                "2": "weekday_evening",
                "3": "weekend_day",
                "4": "weekend_evening"
            },
            5: {  # Q5: 관심 정보 유형
                "1": "benefits",
                "2": "convenience",
                "3": "finance",
                "4": "occasional"
            },
            6: {  # Q6: 목표 달성 방식
                "1": "routine",
                "2": "deadline",
                "3": "flexible",
                "4": "tracking"
            },
            7: {  # Q7: 활동/탐색 취향
                "1": "local",
                "2": "events",
                "3": "travel",
                "4": "health"
            },
            8: {  # Q8: 흥미로운 콘텐츠
                "1": "challenge",
                "2": "community",
                "3": "fortune",
                "4": "insight"
            },
            9: {  # Q9: 저축 목표
                "1": "emergency",
                "2": "period_goal",
                "3": "long_term",
                "4": "habit"
            },
            10: {  # Q10: 납입 방식
                "1": "auto",
                "2": "flexible",
                "3": "payday",
                "4": "roundup",
                "5": "adjustable"
            },
            11: {  # Q11: 현금 필요 가능성
                "1": "low",
                "2": "medium",
                "3": "high"
            },
            12: {  # Q12: 알림 선호도
                "1": "benefits",
                "2": "ranking",
                "3": "coaching",
                "4": "minimal"
            }
        }
        
        return option_mapping.get(question_type, {}).get(str(option_id), "default")

    def score_quests(self, quests: List[Dict], category_scores: Dict[str, int]) -> List[Dict]:
        """퀘스트 점수 계산"""
        scored_quests = []
        
        for quest in quests:
            score = 0
            
            # 카테고리 매칭 점수
            quest_category = quest["category"]
            if quest_category in category_scores:
                score += category_scores[quest_category]
            
            # 퀘스트 타입별 보너스 점수
            if quest["type"] == "GROWTH":
                score += 2  # GROWTH 퀘스트에 약간의 보너스
            
            # 보상 경험치 기반 점수 (높은 보상 = 더 가치 있는 퀘스트)
            if quest["reward_exp"] >= 100:
                score += 3
            elif quest["reward_exp"] >= 50:
                score += 2
            elif quest["reward_exp"] >= 20:
                score += 1
            
            # 주기별 점수 조정 (일일 퀘스트는 접근성이 좋음)
            if quest["period_scope"] == "daily":
                score += 1
            elif quest["period_scope"] == "any":
                score += 2  # 언제든 할 수 있는 퀘스트
            
            scored_quests.append({
                **quest,
                "recommendation_score": score
            })
        
        return sorted(scored_quests, key=lambda x: x["recommendation_score"], reverse=True)

    def recommend_quests(self, db: Session, user_id: str) -> List[str]:
        """메인 추천 함수 - 3개의 퀘스트 ID 반환"""
        try:
            # 1. 사용자 정보 조회
            user_info = self.get_user_info(db, user_id)
            
            # 2. 설문조사 답변 조회
            survey_answers = self.get_survey_answers(db, user_id)
            
            if not survey_answers:
                # 설문조사 답변이 없는 경우 기본 추천
                return self._get_default_recommendations(db)
            
            # 3. 사용 가능한 퀘스트 조회
            available_quests = self.get_available_quests(db)
            
            # 4. 사용자 선호도 분석
            category_scores = self.analyze_user_preferences(user_info, survey_answers)
            
            # 5. 퀘스트 점수 계산 및 정렬
            scored_quests = self.score_quests(available_quests, category_scores)
            
            # 6. 다양성을 위한 최종 선택 (카테고리별로 분산)
            recommended_quests = self._select_diverse_quests(scored_quests, 3)
            
            return [quest["id"] for quest in recommended_quests]
            
        except Exception as e:
            print(f"추천 시스템 오류: {e}")
            # 오류 발생 시 기본 추천
            return self._get_default_recommendations(db)

    def _select_diverse_quests(self, scored_quests: List[Dict], count: int) -> List[Dict]:
        """다양한 카테고리에서 퀘스트 선택"""
        selected = []
        used_categories = set()
        
        # 1차: 각기 다른 카테고리에서 선택
        for quest in scored_quests:
            if len(selected) >= count:
                break
            
            if quest["category"] not in used_categories:
                selected.append(quest)
                used_categories.add(quest["category"])
        
        # 2차: 부족한 경우 점수 순으로 추가
        for quest in scored_quests:
            if len(selected) >= count:
                break
            
            if quest not in selected:
                selected.append(quest)
        
        return selected[:count]

    def _get_default_recommendations(self, db: Session) -> List[str]:
        """기본 추천 (설문조사 답변이 없거나 오류 발생 시)"""
        default_quest_ids = [
            "quest_growth_008",  # 신한 계좌 등록 (진입 장벽 낮음)
            "quest_growth_012",  # 1만원 저축 (접근성 좋음)  
            "quest_daily_016"    # 출석 (습관 형성)
        ]
        
        # DB에서 실제 존재하는 퀘스트만 반환
        query = text("""
            SELECT id FROM quests 
            WHERE id IN :quest_ids AND type IN ('LIFE', 'GROWTH') AND active = 1
            LIMIT 3
        """)
        results = db.execute(query, {"quest_ids": tuple(default_quest_ids)}).fetchall()
        
        return [result.id for result in results] if results else default_quest_ids


# FastAPI 엔드포인트 함수 예시
# 실제 사용시에는 database.py에서 의존성을 import하여 사용
def recommend_quests_for_user(
    db: Session,  # Depends(get_db)로 주입
    current_user_id: str  # Depends(get_current_user)로 주입
) -> List[str]:
    """사용자를 위한 퀘스트 추천 엔드포인트 예시"""
    recommendation_system = QuestRecommendationSystem()
    return recommendation_system.recommend_quests(db, current_user_id)
