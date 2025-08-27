# Quest Recommendation System

대학생을 위한 개인화된 퀘스트 추천 시스템입니다. 사용자의 개인정보와 설문조사 답변을 분석하여 LIFE와 GROWTH 타입의 퀘스트 중에서 가장 적합한 3개를 추천합니다. (SURPRISE 타입은 추천에서 제외됩니다)

## 🚀 주요 기능

- **개인화 추천**: 사용자의 나이, 학년, 성별 등 개인정보 기반 추천
- **설문조사 분석**: 12개 설문 문항 답변을 통한 선호도 분석
- **다양성 보장**: 서로 다른 카테고리의 퀘스트를 균형있게 추천
- **Cold Start 해결**: 사용자의 시도 이력 없이도 추천 가능
- **1회성 추천**: 단발성 추천으로 빠른 응답

## 📋 설문조사 기반 분석

### 분석 요소
1. **학업/취업/알바**: 활동 패턴, 수입 수준
2. **건강/생활**: 소비 습관, 여유 시간
3. **경제/정보/뉴스**: 관심 정보 유형
4. **라이프스타일**: 목표 달성 방식, 활동 취향
5. **엔터테인먼트**: 선호 콘텐츠 유형
6. **저축성향**: 저축 목표, 납입 방식, 현금 필요성

## 🏗️ 시스템 구조

```
rec/
├── __init__.py              # 패키지 초기화
├── main.py                  # FastAPI 메인 애플리케이션
├── recommendation_system.py # 핵심 추천 로직
├── api_router.py           # API 라우터
├── database.py             # 데이터베이스 연결 및 의존성
├── requirements.txt        # 의존성 패키지
└── README.md              # 사용법 가이드
```

## 🔧 설치 및 실행

### 1. 의존성 설치
```bash
pip install -r requirements.txt
```

### 2. 환경변수 설정
```bash
# .env 파일 또는 시스템 환경변수
export DATABASE_URL="mysql+pymysql://user:password@host:3306/quest_db"
```

### 3. 서버 실행
```bash
# 개발 모드
uvicorn rec.main:app --reload --host 0.0.0.0 --port 8000

# 또는 Python으로 직접 실행
python -m rec.main
```

## 📡 API 엔드포인트

### ✅ 인증이 필요한 엔드포인트 (JWT 토큰 필요)
모든 인증 필요 엔드포인트는 `Sol_Sol_QUEST.backend.app.auth.deps.get_current_user`를 통해 인증됩니다.

#### 1. 퀘스트 추천
```http
GET /api/recommendations/quests
Headers: Authorization: Bearer {jwt_token}
```

#### 2. 상세 추천 정보
```http
GET /api/recommendations/quests/detailed
Headers: Authorization: Bearer {jwt_token}
```

#### 3. 사용자 선호도 분석
```http
GET /api/recommendations/user/preferences  
Headers: Authorization: Bearer {jwt_token}
```

#### 4. 내 추천 조회
```http
GET /api/my-recommendations
Headers: Authorization: Bearer {jwt_token}
```

#### 5. 내 설문조사 조회
```http
GET /api/my-survey
Headers: Authorization: Bearer {jwt_token}
```

#### 6. 사용 가능한 퀘스트 목록
```http
GET /api/available-quests
Headers: Authorization: Bearer {jwt_token}
```

### 🔧 개발/테스트용 엔드포인트 (인증 불필요)
실제 프로덕션에서는 사용하지 마세요.

#### 1. 테스트용 간단 추천
```http
GET /api/test/simple-recommend/{user_id}
```

#### 2. 테스트용 설문조사 정보
```http
GET /api/test/debug/user/{user_id}/survey
```

#### 3. 헬스 체크
```http
GET /health
```

## 🎯 추천 알고리즘

### 1. 사용자 정보 분석
- **연령대**: 22세 이하(대학생), 23-26세(대학원생/취준생)
- **학년**: 저학년(1-2학년), 고학년(3-4학년)
- **성별**: 선호도 미세 조정용

### 2. 설문조사 매핑
각 질문의 답변을 카테고리별 선호도로 변환:
- STUDY: 학습, 자격증, 공모전
- SAVING: 적금, 저축, 금융관리  
- ECON: 경제, 결제, 투자정보
- LIFE: 생활, 출석, 일상활동
- HEALTH: 건강, 운동, 웰니스
- ENT: 엔터테인먼트

모든 퀘스트는 타입(LIFE/GROWTH)이나 보상, 주기에 관계없이 동등하게 평가됩니다.

### 3. 점수 계산 요소
- **카테고리 매칭**: 설문 기반 선호도 점수만 사용
- 사용자의 설문조사 답변과 개인정보를 분석하여 카테고리별 선호도 점수를 계산
- 퀘스트의 카테고리와 사용자 선호도가 일치하는 정도로만 점수 산정

### 4. 다양성 보장
- 1차: 서로 다른 카테고리에서 선택
- 2차: 점수순으로 부족분 보충
- 최대 3개 퀘스트 추천

## 🔍 사용 예시

### Python 코드에서 직접 사용
```python
from rec.recommendation_system import QuestRecommendationSystem
from rec.database import SessionLocal

# 추천 시스템 초기화
rec_system = QuestRecommendationSystem()

# 데이터베이스 세션
db = SessionLocal()

try:
    # 퀘스트 추천
    recommended_quest_ids = rec_system.recommend_quests(db, "user123")
    print(f"추천 퀘스트: {recommended_quest_ids}")
    
    # 사용자 선호도 분석
    user_info = rec_system.get_user_info(db, "user123")
    survey_answers = rec_system.get_survey_answers(db, "user123")
    preferences = rec_system.analyze_user_preferences(user_info, survey_answers)
    print(f"선호도: {preferences}")
    
finally:
    db.close()
```

### cURL을 통한 API 호출
```bash
# JWT 토큰을 사용한 인증된 요청
curl -X GET "http://localhost:8000/api/recommendations/quests" \
     -H "Authorization: Bearer {jwt_token}"

# 내 추천 조회
curl -X GET "http://localhost:8000/api/my-recommendations" \
     -H "Authorization: Bearer {jwt_token}"

# 개발/테스트용 (인증 불필요)
curl -X GET "http://localhost:8000/api/test/simple-recommend/user123"
```

## 📊 응답 예시

### 기본 추천 응답
```json
{
  "quest_ids": [
    "quest_growth_008",
    "quest_growth_012", 
    "quest_daily_016"
  ],
  "message": "사용자 user123를 위한 3개의 맞춤 퀘스트를 추천했습니다."
}
```

### 상세 추천 응답
```json
[
  {
    "id": "quest_growth_008",
    "type": "growth",
    "title": "신한 계좌 등록",
    "category": "SAVING",
    "verify_method": "PAYMENT",
    "reward_exp": 10,
    "target_count": 1,
    "period_scope": "any",
    "recommendation_score": 15
  }
]
```

## 🚨 주의사항

1. **데이터베이스 연결**: DATABASE_URL 환경변수 필수 설정
2. **인증 시스템**: 
   - 모든 프로덕션 엔드포인트는 `Depends(get_current_user)` 사용
   - JWT 토큰은 `Sol_Sol_QUEST.backend.app.auth.deps`에서 검증
   - 테스트 엔드포인트(`/api/test/*`)는 개발 환경에서만 사용
3. **에러 처리**: 설문조사 답변이 없는 경우 기본 추천 제공
4. **성능**: 대용량 사용자 대응시 캐싱 및 최적화 필요
5. **테이블 구조**: 새로운 quests 테이블 스키마에 맞춰 업데이트됨

## 🔄 확장 가능성

- **실시간 추천**: 사용자 행동 로그 기반 동적 추천
- **협업 필터링**: 유사 사용자 그룹 기반 추천
- **A/B 테스트**: 추천 알고리즘 성능 비교
- **머신러닝**: 딥러닝 모델 기반 고도화



