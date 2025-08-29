# 📚 퀘스트 추천 시스템 상세 문서

## 📋 목차
1. [시스템 개요](#시스템-개요)
2. [추천 시스템 작동 조건](#추천-시스템-작동-조건)
3. [Cold Start 추천 시스템 (현재 활성)](#cold-start-추천-시스템-현재-활성)
4. [하이브리드 추천 시스템 (현재 비활성)](#하이브리드-추천-시스템-현재-비활성)
5. [데이터베이스 구조](#데이터베이스-구조)
6. [API 엔드포인트](#api-엔드포인트)
7. [시스템 활성화 방법](#시스템-활성화-방법)

---

## 시스템 개요

Sol Sol Quest의 추천 시스템은 사용자에게 개인화된 퀘스트를 추천하는 지능형 시스템입니다. 
현재는 **Cold Start 추천**만 활성화되어 있으며, 충분한 데이터가 축적되면 **하이브리드 추천**으로 전환할 수 있습니다.

### 핵심 특징
- **진화형 추천**: 데이터 축적에 따라 추천 방식 업그레이드 가능
- **개인화**: 사용자의 개인정보, 설문조사 답변 기반 맞춤 추천
- **다양성 보장**: 같은 카테고리의 퀘스트만 추천되지 않도록 조절
- **LIFE/GROWTH 전용**: SURPRISE 타입 퀘스트는 추천 대상에서 제외

---

## 추천 시스템 작동 조건

### 🔄 현재 상태: Cold Start Only

```python
# 현재 코드 상태 (system.py 113-128행)
# 하이브리드 추천 부분이 주석 처리되어 있음
"""
is_data_sufficient, data_stats = self._check_data_sufficiency(db)
if is_data_sufficient:  # 모든 조건 충족 시
    quest_ids = self._hybrid_recommendation(db, user_id)
    if quest_ids and len(quest_ids) >= 3:
        self._save_recommendations_to_db(db, user_id, quest_ids[:3])
        return quest_ids[:3]
"""
```

| 현재 상태 | 사용되는 시스템 | 활성화 여부 |
|-----------|----------------|------------|
| 항상 | Cold Start | ✅ 활성 |
| 조건부 | 하이브리드 | ❌ 주석 처리됨 |

### 하이브리드 활성화 조건 

```python
def _check_data_sufficiency(self, db: Session) -> tuple[bool, dict]:
    is_sufficient = (
        total_interactions >= 10000 and   # 최소 10,000개 상호작용
        active_users >= 1000 and          # 최소 1,000명 활성 사용자 
        active_quests >= 30 and           # 최소 30개 활성 퀘스트
        avg_interactions >= 5              # 사용자당 평균 5개 이상 상호작용
    )
```

| 조건 | 필요 수치 | 이유 | 체크 방법 |
|------|----------|------|-----------|
| 전체 상호작용 | ≥ 10,000개 | 통계적 신뢰성 확보 | `is_click=1 OR is_cleared=1` |
| 활성 사용자 | ≥ 1,000명 | 유사 사용자 풀 확보 | DISTINCT user_id |
| 활성 퀘스트 | ≥ 30개 | 다양한 추천 풀 확보 | DISTINCT quest_id |
| 평균 상호작용 | ≥ 5개/사용자 | 개인 패턴 분석 가능 | total/users |

---

## Cold Start 추천 시스템 (현재 활성)

### 1️⃣ 작동 원리

초기 사용자나 데이터가 부족한 상황에서 작동하는 추천 시스템입니다.

```
사용자 정보 + 설문조사 답변 → 선호도 분석 → 점수 계산 → 다양성 적용 → 3개 퀘스트 추천
```

### 2️⃣ 데이터 소스

#### A. 사용자 기본 정보 (users 테이블)
```python
# system.py 67-79행
query = text("""
    SELECT id, gender, birth_year, school_id, department, grade
    FROM users 
    WHERE id = :user_id
""")
```

- **연령 계산**: `datetime.now().year - birth_year`
- **연령대 분류**: ≤22(대학생), ≤26(대학원생/취준생)
- **학년 분류**: ≤2(저학년), >2(고학년)

#### B. 설문조사 답변 (survey_answers 테이블)

```python
# system.py 81-95행
query = text("""
    SELECT question_id, question_type, option_order_no
    FROM survey_answers 
    WHERE user_id = :user_id
""")
```

**12개 질문의 카테고리 매핑 상세**:

| 질문 | 내용 | 옵션별 매핑 |
|------|------|------------|
| Q1 | 평일 주 활동 패턴 | 캠퍼스→STUDY+ENT, 자격준비→STUDY, 직장→ECON+SAVING, 불규칙→LIFE+ENT |
| Q2 | 월 수입/용돈 수준 | 저소득→SAVING+ECON, 중소득→SAVING+STUDY, 고소득→STUDY+HEALTH |
| Q3 | 소비 습관 | 계획→SAVING+ECON, 할인→ECON+LIFE, 최소→SAVING, 즉흥→LIFE+ENT, 기록→SAVING+ECON |
| Q4 | 여유 시간대 | 평일낮→STUDY+HEALTH, 평일밤→LIFE+ENT, 주말낮→HEALTH+LIFE, 주말밤→ENT+LIFE |
| Q5 | 관심 정보 | 혜택→LIFE+ECON, 편의→ECON+LIFE, 금융→SAVING+ECON, 가끔→ENT+LIFE |
| Q6 | 목표 달성 방식 | 루틴→HEALTH+SAVING, 데드라인→STUDY, 유연→LIFE+ENT, 추적→SAVING+STUDY |
| Q7 | 활동/탐색 취향 | 지역→LIFE, 이벤트→ENT, 여행→LIFE, 건강→HEALTH |
| Q8 | 흥미 콘텐츠 | 도전→STUDY+HEALTH, 커뮤니티→ENT+LIFE, 운세→ENT, 인사이트→STUDY+ECON |
| Q9 | 저축 목표 | 비상금→SAVING, 목표저축→SAVING+STUDY, 장기→SAVING, 습관→SAVING |
| Q10 | 납입 방식 | 모든 옵션→SAVING |
| Q11 | 현금 필요성 | 낮음→SAVING, 보통→SAVING+ECON, 높음→ECON+LIFE |
| Q12 | 알림 선호도 | 혜택→LIFE+ECON, 랭킹→STUDY+HEALTH, 코칭→SAVING+ECON, 최소→LIFE |

### 3️⃣ 점수 계산 알고리즘

```python
# system.py 130-165행 analyze_user_preferences 함수
def analyze_user_preferences(self, user_info: Dict, survey_answers: List[Dict]) -> Dict[str, int]:
    category_scores = {
        "STUDY": 0, "SAVING": 0, "ECON": 0, "LIFE": 0, "HEALTH": 0, "ENT": 0
    }
    
    # 1. 연령대 기반 가중치
    if age <= 22:  # 대학생
        category_scores["STUDY"] += 2
        category_scores["ENT"] += 1
    elif age <= 26:  # 대학원생/취준생
        category_scores["STUDY"] += 1
        category_scores["SAVING"] += 2
        category_scores["ECON"] += 1
    
    # 2. 학년 기반 가중치
    if grade <= 2:  # 저학년
        category_scores["LIFE"] += 1
        category_scores["ENT"] += 1
    else:  # 고학년
        category_scores["STUDY"] += 1
        category_scores["SAVING"] += 1
        category_scores["ECON"] += 1
    
    # 3. 설문조사 답변 기반 가중치 (+3점)
    for answer in survey_answers:
        mapped_categories = self.category_mapping[mapping_key]
        for category in mapped_categories:
            category_scores[category] += 3
    
    return category_scores
```

### 4️⃣ 퀘스트 카테고리별 우선순위

```python
# system.py 48-59행
self.quest_category_priority = {
    "STUDY": ["quest_growth_001", "quest_growth_002", "quest_growth_003", 
              "quest_growth_004", "quest_growth_015", "quest_daily_035"],
    "SAVING": ["quest_growth_005", "quest_growth_006", "quest_growth_007", 
               "quest_growth_008", "quest_growth_009", "quest_growth_010", 
               "quest_growth_011", "quest_growth_012", "quest_growth_013", 
               "quest_growth_014", "quest_daily_016", "quest_daily_025", 
               "quest_daily_026", "quest_daily_027", "quest_daily_032"],
    "ECON": ["quest_growth_015", "quest_daily_020", "quest_daily_021", 
             "quest_daily_022", "quest_daily_033", "quest_daily_034"],
    "LIFE": ["quest_daily_017", "quest_daily_018", "quest_daily_019", 
             "quest_daily_028", "quest_daily_029", "quest_daily_030", 
             "quest_daily_031"],
    "HEALTH": ["quest_daily_023", "quest_daily_024"],
    "ENT": []  # ENT는 LIFE/GROWTH 타입에 없음
}
```

### 5️⃣ 다양성 보장 메커니즘

```python
# system.py 367-390행
def _select_diverse_quests(self, scored_quests: List[Dict], count: int) -> List[Dict]:
    selected = []
    used_categories = set()
    
    # 1차: 각기 다른 카테고리에서 선택
    for quest in scored_quests:
        if quest["category"] not in used_categories:
            selected.append(quest)
            used_categories.add(quest["category"])
        if len(selected) >= count:
            break
    
    # 2차: 부족한 경우 점수 순으로 추가
    for quest in scored_quests:
        if quest not in selected:
            selected.append(quest)
        if len(selected) >= count:
            break
    
    return selected[:count]
```

### 6️⃣ 기본 추천 (Fallback)

```python
# system.py 763-781행
def _get_default_recommendations(self, db: Session) -> List[str]:
    default_quest_ids = [
        "quest_growth_008",  # 신한 계좌 등록 (진입 장벽 낮음)
        "quest_growth_012",  # 1만원 저축 (접근성 좋음)
        "quest_daily_017"    # 쏠쏠한 적금 일일 출석 (습관 형성)
    ]
```

설문조사 답변이 없거나 오류 발생 시 사용됩니다.

---

## 하이브리드 추천 시스템 (현재 비활성)

### 1️⃣ 활성화 조건 체크

```python
# system.py 400-446행
def _check_data_sufficiency(self, db: Session) -> tuple[bool, dict]:
    # 1. 전체 상호작용 수
    total_interactions = self._get_total_interactions(db)
    
    # 2. 활성 사용자 수
    active_users_query = text("""
        SELECT COUNT(DISTINCT user_id) as count
        FROM quest_recommendations
        WHERE (is_click = 1 OR is_cleared = 1)
    """)
    
    # 3. 활성 퀘스트 수  
    active_quests_query = text("""
        SELECT COUNT(DISTINCT quest_id) as count
        FROM quest_recommendations
        WHERE (is_click = 1 OR is_cleared = 1)
    """)
    
    # 4. 사용자당 평균 상호작용 수
    avg_interactions = total_interactions / active_users if active_users > 0 else 0
    
    # 5. 충분성 판단
    is_sufficient = (
        total_interactions >= 10000 and
        active_users >= 1000 and
        active_quests >= 30 and
        avg_interactions >= 5
    )
```

### 2️⃣ 시스템 구성 (구현되어 있지만 비활성)

#### A. 협업 필터링 (CF) - 60% 가중치

```python
# system.py 488-520행
def _collaborative_filtering(self, db: Session, user_id: str) -> Dict[str, float]:
    # 1. 사용자-퀘스트 상호작용 매트릭스 생성
    interaction_matrix = self._build_interaction_matrix(db)
    
    # 2. 코사인 유사도로 유사한 사용자 찾기 (상위 10명)
    similar_users = self._find_similar_users(db, user_id, interaction_matrix)
    
    # 3. 상호작용 점수 계산
    # is_click * 0.3 + is_cleared * 0.7
```

**원리**: "나와 비슷한 사용자들이 좋아한 퀘스트"

#### B. 콘텐츠 기반 필터링 (CBF) - 40% 가중치

```python
# system.py 522-543행  
def _content_based_filtering(self, db: Session, user_id: str) -> Dict[str, float]:
    # 1. 사용자 과거 퀘스트 이력 분석
    user_preferences = self._analyze_user_quest_history(db, user_id)
    
    # 2. 퀘스트 특성 벡터 생성
    quest_vector = self._create_quest_vector(quest)
    
    # 3. 유사도 점수 계산
    similarity = self._calculate_similarity(user_preferences, quest_vector)
```

**원리**: "내가 과거에 좋아한 퀘스트와 비슷한 특성의 퀘스트"

### 3️⃣ 점수 결합 및 필터링

```python
# system.py 448-487행
def _hybrid_recommendation(self, db: Session, user_id: str) -> List[str]:
    # 1. 협업 필터링 점수 계산
    cf_scores = self._collaborative_filtering(db, user_id)
    
    # 2. 콘텐츠 기반 필터링 점수 계산  
    cbf_scores = self._content_based_filtering(db, user_id)
    
    # 3. 점수 결합 (가중치: CF 60%, CBF 40%)
    for quest_id in all_quest_ids:
        hybrid_scores[quest_id] = 0.6 * cf_score + 0.4 * cbf_score
    
    # 4. 이미 완료/최근 추천 퀘스트 제외
    excluded_quests = self._get_excluded_quests(db, user_id)
    
    # 5. 다양성 적용하여 3개 선택
    return self._apply_diversity(db, top_5_quests)[:3]
```

---

## 데이터베이스 구조

### 📊 quest_recommendations 테이블

```sql
CREATE TABLE quest_recommendations (
    id varchar(26) PRIMARY KEY,           -- ULID 형식 ID
    user_id varchar(26),                  -- 사용자 ID
    quest_id varchar(26),                 -- 퀘스트 ID  
    recommendation_date date,             -- 추천 날짜
    is_click tinyint(1) DEFAULT 0,        -- 클릭 여부
    is_cleared tinyint(1) DEFAULT 0       -- 완료 여부
);
```

### 데이터 수집 및 활용 흐름

```python
# system.py 292-329행
def _save_recommendations_to_db(self, db: Session, user_id: str, quest_ids: List[str]):
    for quest_id in quest_ids:
        # 중복 체크 후 삽입
        insert_query = text("""
            INSERT INTO quest_recommendations 
            (id, user_id, quest_id, recommendation_date, is_click, is_cleared)
            VALUES (:id, :user_id, :quest_id, :recommendation_date, 0, 0)
        """)
```

1. **추천 시점**: 퀘스트 3개 추천 → DB 저장 (`is_click=0, is_cleared=0`)
2. **클릭 추적**: 사용자가 퀘스트 상세 조회 → `is_click=1` 업데이트 (별도 구현 필요)
3. **완료 추적**: 퀘스트 완료 → `is_cleared=1` 업데이트 (별도 구현 필요)
4. **학습 활용**: 축적된 데이터로 하이브리드 추천 개선

### 관련 테이블들

```sql
-- 사용자 정보
SELECT id, gender, birth_year, school_id, department, grade
FROM users WHERE id = :user_id

-- 설문조사 답변  
SELECT question_id, question_type, option_order_no
FROM survey_answers WHERE user_id = :user_id

-- 퀘스트 정보
SELECT id, type, title, category, verify_method, reward_exp, target_count, period_scope
FROM quests WHERE type IN ('life', 'growth')
```

---

## API 엔드포인트

### 1. 기본 퀘스트 추천

```python
@recommendation_router.get("/quests")
async def get_recommended_quests():
    """
    사용자를 위한 3개의 퀘스트 ID 추천
    """
```

**응답 예시**:
```json
{
    "quest_ids": ["quest_growth_008", "quest_daily_023", "quest_growth_012"],
    "message": "사용자 user123을 위한 3개의 맞춤 퀘스트를 추천했습니다."
}
```

### 2. 상세 정보 포함 추천

```python
@recommendation_router.get("/quests/detailed")
async def get_recommended_quests_with_details():
    """
    추천된 퀘스트의 상세 정보와 추천 점수 포함
    """
```

**응답 예시**:
```json
[
    {
        "id": "quest_growth_008",
        "type": "growth", 
        "title": "신한 계좌 등록",
        "category": "SAVING",
        "verify_method": "auto",
        "reward_exp": 50,
        "target_count": 1,
        "period_scope": "once",
        "recommendation_score": 15
    }
]
```

### 3. 사용자 선호도 분석

```python
@recommendation_router.get("/user/preferences")
async def get_user_preferences():
    """
    사용자의 카테고리별 선호도 점수 조회 (디버깅용)
    """
```

**응답 예시**:
```json
{
    "user_id": "user123",
    "user_info": {
        "birth_year": 2001,
        "grade": 3
    },
    "survey_answers_count": 12,
    "category_scores": {
        "STUDY": 8,
        "SAVING": 12,
        "ECON": 5,
        "LIFE": 3,
        "HEALTH": 2,
        "ENT": 1
    },
    "top_categories": [["SAVING", 12], ["STUDY", 8], ["ECON", 5]]
}
```

---

## 시스템 활성화 방법

### 🔧 하이브리드 추천 활성화 방법

1. **코드 주석 해제**:
   
   `system.py` 113-128행에서 하이브리드 추천 부분 주석 해제:

   ```python
   # 변경 전 (현재)
   """
   is_data_sufficient, data_stats = self._check_data_sufficiency(db)
   if is_data_sufficient:
       quest_ids = self._hybrid_recommendation(db, user_id)
       if quest_ids and len(quest_ids) >= 3:
           self._save_recommendations_to_db(db, user_id, quest_ids[:3])
           return quest_ids[:3]
   """
   
   # 변경 후
   is_data_sufficient, data_stats = self._check_data_sufficiency(db)
   if is_data_sufficient:
       quest_ids = self._hybrid_recommendation(db, user_id)
       if quest_ids and len(quest_ids) >= 3:
           self._save_recommendations_to_db(db, user_id, quest_ids[:3])
           return quest_ids[:3]
   ```

2. **필요한 라이브러리 확인**:
   
   ```bash
   # requirements.txt에 포함되어야 함
   numpy>=1.21.0  # 코사인 유사도 계산용
   ```

3. **데이터 수집 구현**:
   
   퀘스트 클릭/완료 시 `quest_recommendations` 테이블 업데이트하는 로직 필요:
   
   ```python
   # 클릭 시 업데이트 (별도 구현 필요)
   UPDATE quest_recommendations 
   SET is_click = 1 
   WHERE user_id = ? AND quest_id = ? AND recommendation_date >= ?
   
   # 완료 시 업데이트 (별도 구현 필요)  
   UPDATE quest_recommendations
   SET is_cleared = 1
   WHERE user_id = ? AND quest_id = ? AND recommendation_date >= ?
   ```

### 📊 모니터링 지표

1. **추천 성능**:
   - 클릭률 (CTR): `is_click=1` 비율
   - 완료율: `is_cleared=1` 비율
   - 추천 응답 시간

2. **데이터 현황**:
   ```python
   # 현재 데이터 상태 확인
   recommendation_system = QuestRecommendationSystem()
   is_sufficient, stats = recommendation_system._check_data_sufficiency(db)
   print(stats)
   ```

3. **A/B 테스팅**:
   - Cold Start vs Hybrid 성능 비교
   - 다양성 적용 전후 비교

---

## 🚀 향후 개선 계획

1. **실시간 학습**: 사용자 행동 즉시 반영
2. **컨텍스트 추천**: 시간대, 요일, 계절 고려  
3. **그룹 추천**: 비슷한 학교/학과 학생들의 선호도 반영
4. **A/B 테스팅**: 추천 알고리즘 성능 비교
5. **설명 가능한 추천**: "이 퀘스트를 추천하는 이유"
6. **하이브리드 가중치 최적화**: CF/CBF 비율 동적 조정




## 📊 성능 최적화 팁

1. **쿼리 최적화**:
   ```sql
   -- 인덱스 추가 권장
   CREATE INDEX idx_quest_recommendations_user_date 
   ON quest_recommendations(user_id, recommendation_date);
   
   CREATE INDEX idx_quest_recommendations_interactions 
   ON quest_recommendations(is_click, is_cleared);
   ```

2. **캐싱 전략**:
   - 설문조사 답변 결과 캐싱 (1시간)
   - 사용자 선호도 점수 캐싱 (6시간)
   - 퀘스트 목록 캐싱 (24시간)

3. **배치 처리**:
   - 하이브리드 추천 계산을 배치로 수행
   - 유사도 매트릭스 사전 계산

---

**Last Updated**: 2025-08-29 21:45


---
