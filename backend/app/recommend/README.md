# 📚 퀘스트 추천 시스템 상세 문서

## 📋 목차
1. [시스템 개요](#시스템-개요)
2. [추천 시스템 작동 조건](#추천-시스템-작동-조건)
3. [Cold Start 추천 시스템 (현재 활성)](#cold-start-추천-시스템-현재-활성)
4. [하이브리드 추천 시스템 (미래 활성 예정)](#하이브리드-추천-시스템-미래-활성-예정)
5. [데이터베이스 구조](#데이터베이스-구조)
6. [API 엔드포인트](#api-엔드포인트)

---

## 시스템 개요

Sol Sol Quest의 추천 시스템은 사용자에게 개인화된 퀘스트를 추천하는 지능형 시스템입니다. 서비스 초기에는 **Cold Start 추천**을 사용하고, 충분한 데이터가 축적되면 **하이브리드 추천**으로 전환됩니다.

### 핵심 특징
- **진화형 추천**: 데이터 축적에 따라 자동으로 추천 방식이 업그레이드
- **개인화**: 사용자의 개인정보, 설문조사, 행동 패턴을 모두 고려
- **다양성 보장**: 같은 카테고리의 퀘스트만 추천되지 않도록 조절

---

## 추천 시스템 작동 조건

### 🔄 자동 전환 로직

```python
if interaction_count >= 100:  # quest_recommendations 테이블의 상호작용 데이터
    # 하이브리드 추천 시스템 사용 (CF + CBF)
    use_hybrid_recommendation()
else:
    # Cold Start 추천 시스템 사용 (설문조사 + 개인정보 기반)
    use_cold_start_recommendation()
```

| 조건 | 사용되는 시스템 | 설명 |
|------|----------------|------|
| 하이브리드 조건 미충족 | Cold Start | 설문조사와 개인정보 기반 추천 |
| 하이브리드 조건 충족 | 하이브리드 | 협업 필터링 + 콘텐츠 기반 필터링 |

### 하이브리드 활성화 조건 (40만명 규모 서비스 기준)

| 조건 | 필요 수치 | 이유 |
|------|----------|------|
| 전체 상호작용 | ≥ 10,000개 | 통계적 신뢰성 확보 |
| 활성 사용자 | ≥ 1,000명 | 유사 사용자 찾기에 충분한 풀 |
| 활성 퀘스트 | ≥ 30개 | 다양한 추천을 위한 퀘스트 풀 |
| 평균 상호작용 | ≥ 5개/사용자 | 개인별 패턴 파악 가능 |

> **참고**: 현재는 하이브리드 추천 코드가 주석 처리되어 있어 Cold Start만 작동합니다.

---

## Cold Start 추천 시스템 (현재 활성)

### 1️⃣ 작동 원리

초기 사용자나 데이터가 부족한 상황에서 작동하는 추천 시스템입니다.

```
사용자 정보 수집 → 선호도 분석 → 점수 계산 → 다양성 적용 → 3개 퀘스트 추천
```

### 2️⃣ 데이터 소스

#### A. 사용자 기본 정보
- **연령대**: birth_year를 통해 대학생/대학원생/취준생 구분
- **학년**: 저학년(1-2학년) vs 고학년(3-4학년+)
- **성별, 학교, 학과**: 추가 컨텍스트 정보

#### B. 설문조사 답변 (12개 질문)

| 질문 번호 | 질문 내용 | 매핑되는 카테고리 |
|-----------|----------|------------------|
| Q1 | 평일 주 활동 패턴 | STUDY, ENT, ECON, SAVING, LIFE |
| Q2 | 월 고정 수입/용돈 수준 | SAVING, ECON, STUDY, HEALTH |
| Q3 | 소비 습관 | SAVING, ECON, LIFE, ENT |
| Q4 | 여유 시간대 | STUDY, HEALTH, LIFE, ENT |
| Q5 | 관심 정보 유형 | LIFE, ECON, SAVING, ENT |
| Q6 | 목표 달성 방식 | HEALTH, SAVING, STUDY, LIFE, ENT |
| Q7 | 활동/탐색 취향 | LIFE, ENT, HEALTH |
| Q8 | 흥미로운 콘텐츠 | STUDY, HEALTH, ENT, ECON |
| Q9 | 저축 목표 | SAVING, STUDY |
| Q10 | 납입 방식 | SAVING |
| Q11 | 현금 필요 가능성 | SAVING, ECON, LIFE |
| Q12 | 알림 선호도 | LIFE, ECON, STUDY, HEALTH, SAVING |

### 3️⃣ 점수 계산 알고리즘

```python
def analyze_user_preferences():
    category_scores = {
        "STUDY": 0,
        "SAVING": 0,
        "ECON": 0,
        "LIFE": 0,
        "HEALTH": 0,
        "ENT": 0
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
    
    # 3. 설문조사 답변 기반 가중치 (높은 가중치: +3)
    for answer in survey_answers:
        mapped_categories = get_categories_for_answer(answer)
        for category in mapped_categories:
            category_scores[category] += 3
    
    return category_scores
```

### 4️⃣ 다양성 보장 메커니즘

```python
def _select_diverse_quests(scored_quests, count=3):
    # 1차: 서로 다른 카테고리에서 1개씩 선택
    # 2차: 점수가 높은 순서대로 추가 선택
    # 결과: 최대한 다양한 카테고리의 퀘스트 3개
```

### 5️⃣ 기본 추천 (Fallback)

설문조사 답변이 없거나 오류 발생 시:
```python
default_quest_ids = [
    "quest_growth_008",  # 신한 계좌 등록 (진입 장벽 낮음)
    "quest_growth_012",  # 1만원 저축 (접근성 좋음)
    "quest_daily_017"    # 쏠쏠한 적금 일일 출석 (습관 형성)
]
```

---

## 하이브리드 추천 시스템 (미래 활성 예정)

### 1️⃣ 활성화 조건

```python
# 모든 조건을 만족해야 활성화
if (
    total_interactions >= 10000 and   # 전체 상호작용 수
    active_users >= 1000 and          # 활성 사용자 수
    active_quests >= 30 and           # 활성 퀘스트 수
    avg_interactions >= 5              # 사용자당 평균 상호작용
):
    activate_hybrid_system()
```

### 2️⃣ 시스템 구성

#### A. 협업 필터링 (CF) - 60% 가중치

**원리**: "나와 비슷한 사용자들이 좋아한 퀘스트"

```
1. 사용자-퀘스트 상호작용 매트릭스 구축
2. 코사인 유사도로 유사 사용자 찾기 (상위 10명)
3. 유사 사용자들의 퀘스트 선호도 점수 계산
4. 점수 정규화 (0-1 범위)
```

**상호작용 점수 계산**:
```python
interaction_score = is_click * 0.3 + is_cleared * 0.7
# 클릭(30%) < 완료(70%) 가중치
```

#### B. 콘텐츠 기반 필터링 (CBF) - 40% 가중치

**원리**: "내가 과거에 좋아한 퀘스트와 비슷한 특성의 퀘스트"

```
1. 사용자의 과거 퀘스트 이력 분석
   - 카테고리별 선호도
   - 타입별 선호도 (life/growth)
   - 검증 방법별 선호도
   
2. 퀘스트 특성 벡터 생성
   - category, type, verify_method
   - period_scope, reward_exp
   - target_count (난이도)
   
3. 사용자 선호도와 퀘스트 특성 매칭
4. 유사도 점수 계산
```

### 3️⃣ 점수 결합 및 필터링

```python
def hybrid_score(quest_id):
    cf_score = collaborative_filtering_score(quest_id)
    cbf_score = content_based_filtering_score(quest_id)
    
    # 가중치 적용
    final_score = 0.6 * cf_score + 0.4 * cbf_score
    
    # 제외 조건
    if quest_id in completed_quests:  # 이미 완료
        return 0
    if quest_id in recent_7days_recommendations:  # 최근 추천
        return 0
    
    return final_score
```

### 4️⃣ 다양성 적용

```python
def apply_diversity(top_5_quests):
    # 상위 5개 중에서
    # 카테고리가 겹치지 않도록 3개 선택
    # 카테고리 중복 최소화
```

---

## 데이터베이스 구조

### 📊 quest_recommendations 테이블

| 컬럼명 | 타입 | 설명 | 용도 |
|--------|------|------|------|
| id | varchar(26) | ULID 형식 ID | Primary Key |
| user_id | varchar(26) | 사용자 ID | 추천 대상 |
| quest_id | varchar(26) | 퀘스트 ID | 추천된 퀘스트 |
| recommendation_date | date | 추천 날짜 | 시간 추적 |
| is_click | tinyint(1) | 클릭 여부 | CF 학습 데이터 |
| is_cleared | tinyint(1) | 완료 여부 | CF 학습 데이터 |

### 데이터 수집 및 활용

1. **추천 시점**: 퀘스트 3개 추천 → DB 저장
2. **클릭 추적**: 추천 후 24시간 내 상세 조회 시 `is_click = 1`
3. **완료 추적**: 퀘스트 기간 내 완료 시 `is_cleared = 1`
4. **학습 활용**: 축적된 데이터로 하이브리드 추천 개선

---

## API 엔드포인트

### 추천 받기

```python
@router.get("/recommend")
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """
    사용자를 위한 3개의 퀘스트 추천
    
    Returns:
        List[str]: 추천된 퀘스트 ID 3개
    """
    recommendation_system = QuestRecommendationSystem()
    return recommendation_system.recommend_quests(db, current_user["id"])
```

### 응답 예시

```json
{
    "recommended_quests": [
        "quest_growth_008",
        "quest_daily_023",
        "quest_growth_012"
    ]
}
```

---

## 🚀 향후 개선 계획

1. **실시간 학습**: 사용자 행동 즉시 반영
2. **컨텍스트 추천**: 시간대, 요일, 계절 고려
3. **그룹 추천**: 비슷한 학교/학과 학생들의 선호도 반영
4. **A/B 테스팅**: 추천 알고리즘 성능 비교
5. **설명 가능한 추천**: "이 퀘스트를 추천하는 이유"

---

## 📝 주의사항

1. **데이터 프라이버시**: 사용자 간 데이터는 익명화되어 처리
2. **콜드 스타트 문제**: 신규 퀘스트는 초기에 추천 빈도가 낮을 수 있음
3. **피드백 루프**: 인기 있는 퀘스트만 계속 추천되지 않도록 주기적 모니터링 필요

---

## 🔧 유지보수 가이드

### 하이브리드 추천 활성화 방법

1. `system.py`의 `recommend_quests()` 메소드에서 주석 해제:

```python
# 변경 전 (현재)
"""
if interaction_count >= 100:
    quest_ids = self._hybrid_recommendation(db, user_id)
    ...
"""

# 변경 후
if interaction_count >= 100:
    quest_ids = self._hybrid_recommendation(db, user_id)
    ...
```

2. 필요한 라이브러리 확인:
   - numpy (코사인 유사도 계산용)
   - collections.defaultdict (매트릭스 구축용)

3. 성능 모니터링:
   - 추천 응답 시간
   - 클릭률 (CTR)
   - 완료율

---

**Last Updated**: 2025-01-10
**Version**: 1.0.0
**Author**: Sol Sol Quest Development Team