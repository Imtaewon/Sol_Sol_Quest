from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Dict, Optional
import random
from datetime import datetime, date, timedelta
import secrets
import string
import numpy as np
from collections import defaultdict

# 추천 시스템 클래스
class QuestRecommendationSystem:
    """
    진화하는 퀘스트 추천 시스템
    
    사용자의 개인정보와 설문조사 답변을 기반으로
    LIFE와 GROWTH 타입의 퀘스트 중에서 개인화된 추천을 제공합니다.
    """
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
        
        # 퀘스트 카테고리별 우선순위 매핑 (업데이트된 퀘스트 ID - LIFE와 GROWTH만 포함)
        self.quest_category_priority = {
            "STUDY": ["quest_growth_001", "quest_growth_002", "quest_growth_003", "quest_growth_004", "quest_growth_015", 
                      "quest_daily_035"],
            "SAVING": ["quest_growth_005", "quest_growth_006", "quest_growth_007", "quest_growth_008", "quest_growth_009", 
                      "quest_growth_010", "quest_growth_011", "quest_growth_012", "quest_growth_013", "quest_growth_014", 
                      "quest_daily_016", "quest_daily_025", "quest_daily_026", "quest_daily_027", "quest_daily_032"],
            "ECON": ["quest_growth_015", "quest_daily_020", "quest_daily_021", "quest_daily_022", "quest_daily_033", 
                      "quest_daily_034"],
            "LIFE": ["quest_daily_017", "quest_daily_018", "quest_daily_019", "quest_daily_028", "quest_daily_029", 
                      "quest_daily_030", "quest_daily_031"],
            "HEALTH": ["quest_daily_023", "quest_daily_024"],
            "ENT": []  # ENT 카테고리는 현재 LIFE/GROWTH 타입에 없음 (SURPRISE 제외)
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
            SELECT question_id, question_type, option_order_no
            FROM survey_answers 
            WHERE user_id = :user_id
            ORDER BY question_type
        """)
        results = db.execute(query, {"user_id": user_id}).fetchall()
        
        return [
            {
                "question_id": result.question_id,
                "question_type": result.question_type,
                "option_order_no": result.option_order_no
            }
            for result in results
        ]

    def get_available_quests(self, db: Session) -> List[Dict]:
        """LIFE, GROWTH 타입 퀘스트만 조회 (SURPRISE 제외)"""
        query = text("""
            SELECT id, type, title, category, verify_method, reward_exp, 
                   target_count, period_scope
            FROM quests 
            WHERE type IN ('LIFE', 'GROWTH') AND active = TRUE
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
                "period_scope": result.period_scope
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
            option_order_no = answer["option_order_no"]
            
            # 질문별 매핑 적용
            mapping_key = f"q{question_type}_{self._get_option_key(question_type, option_order_no)}"
            
            if mapping_key in self.category_mapping:
                for category in self.category_mapping[mapping_key]:
                    category_scores[category] += 3  # 설문 답변은 높은 가중치

        return category_scores

    def _get_option_key(self, question_type: int, option_order_no: int) -> str:
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
        
        return option_mapping.get(question_type, {}).get(str(option_order_no), "default")

    def score_quests(self, quests: List[Dict], category_scores: Dict[str, int]) -> List[Dict]:
        """퀘스트 점수 계산"""
        scored_quests = []
        
        for quest in quests:
            score = 0
            
            # 카테고리 매칭 점수만 사용 (설문 기반 선호도)
            quest_category = quest["category"]
            if quest_category in category_scores:
                score = category_scores[quest_category]
            
            scored_quests.append({
                **quest,
                "recommendation_score": score
            })
        
        return sorted(scored_quests, key=lambda x: x["recommendation_score"], reverse=True)

    def _generate_ulid_like_id(self) -> str:
        """ULID 형식의 ID 생성 (26자리)"""
        # 실제 ULID는 시간 기반이지만, 여기서는 랜덤 문자열로 생성
        # 형식: 01HJQXXX... (26자리)
        prefix = "01HJQ"  # 고정 prefix
        remaining_length = 26 - len(prefix)
        random_part = ''.join(secrets.choice(string.ascii_uppercase + string.ascii_lowercase + string.digits) 
                            for _ in range(remaining_length))
        return prefix + random_part

    def _save_recommendations_to_db(self, db: Session, user_id: str, quest_ids: List[str]) -> None:
        """추천된 퀘스트를 quest_recommendations 테이블에 저장"""
        try:
            today = date.today()
            
            for quest_id in quest_ids:
                # 이미 같은 날짜에 같은 퀘스트가 추천되었는지 확인
                check_query = text("""
                    SELECT id FROM quest_recommendations 
                    WHERE user_id = :user_id 
                    AND quest_id = :quest_id 
                    AND recommendation_date = :recommendation_date
                """)
                
                existing = db.execute(check_query, {
                    "user_id": user_id,
                    "quest_id": quest_id,
                    "recommendation_date": today
                }).fetchone()
                
                # 이미 존재하지 않는 경우에만 삽입
                if not existing:
                    insert_query = text("""
                        INSERT INTO quest_recommendations 
                        (id, user_id, quest_id, recommendation_date, is_click, is_cleared)
                        VALUES (:id, :user_id, :quest_id, :recommendation_date, :is_click, :is_cleared)
                    """)
                    
                    db.execute(insert_query, {
                        "id": self._generate_ulid_like_id(),
                        "user_id": user_id,
                        "quest_id": quest_id,
                        "recommendation_date": today,
                        "is_click": False,  # TINYINT(1)에서 False = 0
                        "is_cleared": False  # TINYINT(1)에서 False = 0
                    })
            
            db.commit()
            print(f"사용자 {user_id}에 대해 {len(quest_ids)}개의 퀘스트 추천을 DB에 저장했습니다.")
            
        except Exception as e:
            db.rollback()
            print(f"추천 저장 중 오류 발생: {e}")
            raise

    def recommend_quests(self, db: Session, user_id: str) -> List[str]:
        """메인 추천 함수 - 3개의 퀘스트 ID 반환 및 DB 저장"""
        try:
            # 충분한 데이터가 있는지 종합적으로 체크
            is_data_sufficient, data_stats = self._check_data_sufficiency(db)
            
            # 디버깅을 위한 로그 (원하면 주석 처리 가능)
            print(f"하이브리드 추천 데이터 현황: {data_stats}")
            
            if is_data_sufficient:  # 모든 조건 충족 시
                # 하이브리드 추천 사용 (CF + CBF)
                quest_ids = self._hybrid_recommendation(db, user_id)
                
                if quest_ids and len(quest_ids) >= 3:
                    # DB에 추천 기록 저장
                    self._save_recommendations_to_db(db, user_id, quest_ids[:3])
                    return quest_ids[:3]
           
            
            # 1. 사용자 정보 조회 (Cold Start 추천)
            user_info = self.get_user_info(db, user_id)
            
            # 2. 설문조사 답변 조회
            survey_answers = self.get_survey_answers(db, user_id)
            
            if not survey_answers:
                # 설문조사 답변이 없는 경우 기본 추천
                quest_ids = self._get_default_recommendations(db)
                # DB에 추천 기록 저장
                self._save_recommendations_to_db(db, user_id, quest_ids)
                return quest_ids
            else:
                # 3. 사용 가능한 퀘스트 조회
                available_quests = self.get_available_quests(db)
                
                # 4. 사용자 선호도 분석
                category_scores = self.analyze_user_preferences(user_info, survey_answers)
                
                # 5. 퀘스트 점수 계산 및 정렬
                scored_quests = self.score_quests(available_quests, category_scores)
                
                # 6. 다양성을 위한 최종 선택 (카테고리별로 분산)
                recommended_quests = self._select_diverse_quests(scored_quests, 3)
                
                quest_ids = [quest["id"] for quest in recommended_quests]
            
            # 7. DB에 추천 기록 저장
            self._save_recommendations_to_db(db, user_id, quest_ids)
            
            return quest_ids
            
        except Exception as e:
            print(f"추천 시스템 오류: {e}")
            # 오류 발생 시 기본 추천
            default_ids = self._get_default_recommendations(db)
            # 오류가 발생해도 기본 추천은 DB에 저장 시도
            try:
                self._save_recommendations_to_db(db, user_id, default_ids)
            except:
                pass  # 저장 실패해도 추천은 반환
            return default_ids

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

    # ==================== 하이브리드 추천 시스템 메소드들 ====================
   
    def _get_total_interactions(self, db: Session) -> int:
        """전체 상호작용 데이터 개수 조회"""
        query = text("""
            SELECT COUNT(*) as count
            FROM quest_recommendations
            WHERE (is_click = 1 OR is_cleared = 1)
        """)
        result = db.execute(query).fetchone()
        return result.count if result else 0
    
    def _check_data_sufficiency(self, db: Session) -> tuple[bool, dict]:
        """하이브리드 추천을 위한 데이터 충분성 체크"""
        # 1. 전체 상호작용 수
        total_interactions = self._get_total_interactions(db)
        
        # 2. 활성 사용자 수 (상호작용 1개 이상)
        active_users_query = text("""
            SELECT COUNT(DISTINCT user_id) as count
            FROM quest_recommendations
            WHERE (is_click = 1 OR is_cleared = 1)
        """)
        active_users_result = db.execute(active_users_query).fetchone()
        active_users = active_users_result.count if active_users_result else 0
        
        # 3. 활성 퀘스트 수 (상호작용 1개 이상)
        active_quests_query = text("""
            SELECT COUNT(DISTINCT quest_id) as count
            FROM quest_recommendations
            WHERE (is_click = 1 OR is_cleared = 1)
        """)
        active_quests_result = db.execute(active_quests_query).fetchone()
        active_quests = active_quests_result.count if active_quests_result else 0
        
        # 4. 사용자당 평균 상호작용 수
        avg_interactions = total_interactions / active_users if active_users > 0 else 0
        
        # 5. 충분성 판단 (대규모 서비스 기준 - 40만명 규모)
        # 예상 활성 사용자: 전체의 1-5% (4,000-20,000명)
        # 초기 목표: 1,000명이 각각 평균 10개 상호작용 = 10,000개
        is_sufficient = (
            total_interactions >= 10000 and   # 최소 10,000개 상호작용
            active_users >= 1000 and          # 최소 1,000명 활성 사용자 
            active_quests >= 30 and           # 최소 30개 활성 퀘스트
            avg_interactions >= 5              # 사용자당 평균 5개 이상 상호작용
        )
        
        stats = {
            'total_interactions': total_interactions,
            'active_users': active_users,
            'active_quests': active_quests,
            'avg_interactions_per_user': avg_interactions,
            'is_sufficient': is_sufficient,
            'requirements_met': f"{sum([total_interactions >= 10000, active_users >= 1000, active_quests >= 30, avg_interactions >= 5])}/4",
            'details': {
                'interactions': f"{total_interactions:,}/10,000 ({(total_interactions/10000)*100:.1f}%)",
                'users': f"{active_users:,}/1,000 ({(active_users/1000)*100:.1f}%)",
                'quests': f"{active_quests}/30 ({(active_quests/30)*100:.1f}%)",
                'avg_interactions': f"{avg_interactions:.1f}/5.0 ({(avg_interactions/5)*100:.1f}%)"
            }
        }
        
        return is_sufficient, stats
    
    def _hybrid_recommendation(self, db: Session, user_id: str) -> List[str]:
        """하이브리드 추천 (협업 필터링 + 콘텐츠 기반 필터링)"""
        try:
            # 1. 협업 필터링 점수 계산
            cf_scores = self._collaborative_filtering(db, user_id)
            
            # 2. 콘텐츠 기반 필터링 점수 계산
            cbf_scores = self._content_based_filtering(db, user_id)
            
            # 3. 점수 결합 (가중치: CF 60%, CBF 40%)
            hybrid_scores = {}
            all_quest_ids = set(cf_scores.keys()) | set(cbf_scores.keys())
            
            for quest_id in all_quest_ids:
                cf_score = cf_scores.get(quest_id, 0)
                cbf_score = cbf_scores.get(quest_id, 0)
                
                # 정규화된 점수 결합
                hybrid_scores[quest_id] = 0.6 * cf_score + 0.4 * cbf_score
            
            # 4. 이미 완료했거나 최근 추천된 퀘스트 제외
            excluded_quests = self._get_excluded_quests(db, user_id)
            
            # 5. 최종 추천 퀘스트 선택
            sorted_quests = sorted(
                [(qid, score) for qid, score in hybrid_scores.items() 
                 if qid not in excluded_quests],
                key=lambda x: x[1],
                reverse=True
            )
            
            # 상위 5개 중에서 다양성을 고려하여 3개 선택
            return self._apply_diversity(db, [qid for qid, _ in sorted_quests[:5]])[:3]
            
        except Exception as e:
            print(f"하이브리드 추천 오류: {e}")
            # 오류 발생시 콜드 스타트 추천으로 폴백
            return []
    
    def _collaborative_filtering(self, db: Session, user_id: str) -> Dict[str, float]:
        """협업 필터링 - 유사한 사용자들의 선호도 기반 추천"""
        # 1. 사용자-퀘스트 상호작용 매트릭스 생성
        interaction_matrix = self._build_interaction_matrix(db)
        
        # 2. 현재 사용자와 유사한 사용자 찾기
        similar_users = self._find_similar_users(db, user_id, interaction_matrix)
        
        # 3. 유사한 사용자들이 완료한/클릭한 퀘스트 점수 계산
        cf_scores = defaultdict(float)
        
        for similar_user_id, similarity in similar_users:
            # 유사한 사용자의 퀘스트 상호작용 조회
            query = text("""
                SELECT quest_id, 
                       is_click * 0.3 + is_cleared * 0.7 as interaction_score
                FROM quest_recommendations
                WHERE user_id = :user_id
                AND (is_click = 1 OR is_cleared = 1)
            """)
            
            results = db.execute(query, {"user_id": similar_user_id}).fetchall()
            
            for result in results:
                # 유사도 * 상호작용 점수로 가중치 적용
                cf_scores[result.quest_id] += similarity * result.interaction_score
        
        # 점수 정규화 (0-1 범위)
        if cf_scores:
            max_score = max(cf_scores.values())
            if max_score > 0:
                cf_scores = {qid: score/max_score for qid, score in cf_scores.items()}
        
        return dict(cf_scores)
    
    def _content_based_filtering(self, db: Session, user_id: str) -> Dict[str, float]:
        """콘텐츠 기반 필터링 - 사용자의 과거 선호도와 퀘스트 특성 기반 추천"""
        # 1. 사용자가 과거에 상호작용한 퀘스트들의 특성 분석
        user_preferences = self._analyze_user_quest_history(db, user_id)
        
        # 2. 모든 퀘스트의 특성 벡터 생성
        all_quests = self.get_available_quests(db)
        
        # 3. 각 퀘스트에 대한 점수 계산
        cbf_scores = {}
        
        for quest in all_quests:
            # 퀘스트 특성 벡터 생성
            quest_vector = self._create_quest_vector(quest)
            
            # 사용자 선호도와의 유사도 계산
            similarity = self._calculate_similarity(user_preferences, quest_vector)
            
            cbf_scores[quest['id']] = similarity
        
        return cbf_scores
    
    def _build_interaction_matrix(self, db: Session) -> Dict[str, Dict[str, float]]:
        """사용자-퀘스트 상호작용 매트릭스 구축"""
        query = text("""
            SELECT user_id, quest_id,
                   is_click * 0.3 + is_cleared * 0.7 as interaction_score
            FROM quest_recommendations
            WHERE recommendation_date >= :cutoff_date
        """)
        
        # 최근 3개월 데이터만 사용
        cutoff_date = date.today() - timedelta(days=90)
        results = db.execute(query, {"cutoff_date": cutoff_date}).fetchall()
        
        matrix = defaultdict(dict)
        for result in results:
            matrix[result.user_id][result.quest_id] = result.interaction_score
        
        return dict(matrix)
    
    def _find_similar_users(self, db: Session, user_id: str, 
                           interaction_matrix: Dict) -> List[tuple]:
        """코사인 유사도 기반 유사 사용자 찾기"""
        if user_id not in interaction_matrix:
            return []
        
        user_vector = interaction_matrix[user_id]
        similarities = []
        
        for other_user_id, other_vector in interaction_matrix.items():
            if other_user_id == user_id:
                continue
            
            # 코사인 유사도 계산
            similarity = self._cosine_similarity(user_vector, other_vector)
            if similarity > 0.1:  # 최소 유사도 임계값
                similarities.append((other_user_id, similarity))
        
        # 상위 10명의 유사한 사용자 반환
        return sorted(similarities, key=lambda x: x[1], reverse=True)[:10]
    
    def _cosine_similarity(self, vector1: Dict, vector2: Dict) -> float:
        """두 벡터 간의 코사인 유사도 계산"""
        common_items = set(vector1.keys()) & set(vector2.keys())
        
        if not common_items:
            return 0.0
        
        numerator = sum(vector1[item] * vector2[item] for item in common_items)
        
        sum1 = sum(vector1[item] ** 2 for item in common_items)
        sum2 = sum(vector2[item] ** 2 for item in common_items)
        
        denominator = (sum1 ** 0.5) * (sum2 ** 0.5)
        
        if denominator == 0:
            return 0.0
        
        return numerator / denominator
    
    def _analyze_user_quest_history(self, db: Session, user_id: str) -> Dict[str, float]:
        """사용자의 퀘스트 상호작용 이력 분석"""
        query = text("""
            SELECT q.category, q.type, q.verify_method,
                   COUNT(*) as count,
                   AVG(qr.is_cleared) as completion_rate
            FROM quest_recommendations qr
            JOIN quests q ON qr.quest_id = q.id
            WHERE qr.user_id = :user_id
            AND (qr.is_click = 1 OR qr.is_cleared = 1)
            GROUP BY q.category, q.type, q.verify_method
        """)
        
        results = db.execute(query, {"user_id": user_id}).fetchall()
        
        preferences = {
            'category_scores': {},
            'type_scores': {},
            'verify_method_scores': {}
        }
        
        for result in results:
            # 카테고리별 선호도 (완료율 반영)
            preferences['category_scores'][result.category] = \
                result.count * (0.5 + 0.5 * result.completion_rate)
            
            # 타입별 선호도
            preferences['type_scores'][result.type] = \
                result.count * (0.5 + 0.5 * result.completion_rate)
            
            # 검증 방법별 선호도
            preferences['verify_method_scores'][result.verify_method] = \
                result.count * (0.5 + 0.5 * result.completion_rate)
        
        return preferences
    
    def _create_quest_vector(self, quest: Dict) -> Dict[str, float]:
        """퀘스트 특성 벡터 생성"""
        vector = {
            f'category_{quest["category"]}': 1.0,
            f'type_{quest["type"]}': 1.0,
            f'verify_{quest["verify_method"]}': 1.0,
            f'period_{quest["period_scope"]}': 1.0,
            'reward_exp': min(quest['reward_exp'] / 100.0, 1.0)  # 정규화
        }
        
        # target_count가 있는 경우 난이도 지표로 활용
        if quest.get('target_count'):
            vector['difficulty'] = min(quest['target_count'] / 30.0, 1.0)
        
        return vector
    
    def _calculate_similarity(self, user_prefs: Dict, quest_vector: Dict) -> float:
        """사용자 선호도와 퀘스트 벡터 간 유사도 계산"""
        score = 0.0
        
        # 카테고리 매칭
        for category, pref_score in user_prefs.get('category_scores', {}).items():
            if f'category_{category}' in quest_vector:
                score += pref_score * quest_vector[f'category_{category}']
        
        # 타입 매칭
        for type_, pref_score in user_prefs.get('type_scores', {}).items():
            if f'type_{type_}' in quest_vector:
                score += pref_score * quest_vector[f'type_{type_}']
        
        # 검증 방법 매칭
        for method, pref_score in user_prefs.get('verify_method_scores', {}).items():
            if f'verify_{method}' in quest_vector:
                score += pref_score * quest_vector[f'verify_{method}']
        
        # 점수 정규화
        max_possible = sum(user_prefs.get('category_scores', {}).values()) + \
                      sum(user_prefs.get('type_scores', {}).values()) + \
                      sum(user_prefs.get('verify_method_scores', {}).values())
        
        if max_possible > 0:
            score = score / max_possible
        
        return min(score, 1.0)
    
    def _get_excluded_quests(self, db: Session, user_id: str) -> set:
        """제외할 퀘스트 목록 (이미 완료 or 최근 추천)"""
        query = text("""
            SELECT DISTINCT quest_id
            FROM quest_recommendations
            WHERE user_id = :user_id
            AND (
                is_cleared = 1  -- 이미 완료한 퀘스트
                OR recommendation_date >= :recent_date  -- 최근 7일 내 추천된 퀘스트
            )
        """)
        
        recent_date = date.today() - timedelta(days=7)
        results = db.execute(query, {
            "user_id": user_id,
            "recent_date": recent_date
        }).fetchall()
        
        return {result.quest_id for result in results}
    
    def _apply_diversity(self, db: Session, quest_ids: List[str]) -> List[str]:
        """추천 다양성 적용 - 같은 카테고리 중복 최소화"""
        if len(quest_ids) <= 3:
            return quest_ids
        
        # 퀘스트 정보 조회
        if not quest_ids:
            return []
            
        placeholders = ",".join(f"'{qid}'" for qid in quest_ids)
        query = text(f"""
            SELECT id, category, type
            FROM quests
            WHERE id IN ({placeholders})
        """)
        
        results = db.execute(query).fetchall()
        
        # 카테고리별로 그룹화
        category_groups = defaultdict(list)
        quest_info = {}
        
        for result in results:
            category_groups[result.category].append(result.id)
            quest_info[result.id] = {
                'category': result.category,
                'type': result.type
            }
        
        # 다양한 카테고리에서 선택
        diverse_quests = []
        used_categories = set()
        
        # 원래 순서대로 순회하면서 다른 카테고리 우선 선택
        for quest_id in quest_ids:
            if quest_id in quest_info:
                category = quest_info[quest_id]['category']
                if category not in used_categories or len(diverse_quests) < 3:
                    diverse_quests.append(quest_id)
                    used_categories.add(category)
                    
                    if len(diverse_quests) >= 3:
                        break
        
        # 부족한 경우 나머지에서 채우기
        if len(diverse_quests) < 3:
            for quest_id in quest_ids:
                if quest_id not in diverse_quests:
                    diverse_quests.append(quest_id)
                    if len(diverse_quests) >= 3:
                        break
        
        return diverse_quests[:3]
    
    # ==================== 하이브리드 추천 시스템 메소드들 끝 ====================
    
    def _get_default_recommendations(self, db: Session) -> List[str]:
        """기본 추천 (설문조사 답변이 없거나 오류 발생 시)"""
        default_quest_ids = [
            "quest_growth_008",  # 신한 계좌 등록 (진입 장벽 낮음)
            "quest_growth_012",  # 1만원 저축 (접근성 좋음)  
            "quest_daily_017"    # 쏠쏠한 적금 일일 출석 (습관 형성)
        ]
        
        # DB에서 실제 존재하는 퀘스트만 반환 (SURPRISE 제외)
        placeholders = ",".join(f"'{qid}'" for qid in default_quest_ids)
        query = text(f"""
            SELECT id FROM quests 
            WHERE id IN ({placeholders}) AND type IN ('LIFE', 'GROWTH') AND active = TRUE
            LIMIT 3
        """)
        results = db.execute(query).fetchall()
        
        return [result.id for result in results] if results else default_quest_ids


# 이 클래스는 router.py에서 import하여 사용됩니다.
# 실제 API 엔드포인트는 router.py에 구현되어 있습니다.
