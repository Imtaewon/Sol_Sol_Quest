# Sol Sol Quest – Monorepo README

> FastAPI 백엔드 · Docker 인프라 · React Native Web 프론트엔드
> 신한은행 해커톤 프로젝트 (팀 S\_OS)

---

## 📌 개요

이 레포지토리는 **백엔드(FastAPI)**, **인프라(Nginx/Docker)**, **프론트엔드(RN Web)** 를 하나의 모놀리포로 관리합니다.
도메인 핵심:

* 인증(JWT) · 사용자 · 출석
* 퀘스트(진행/검증/경험치/티어/리더보드)
* 계좌(수시입출금/적금, SSAFY 금융망 API 연동)
* **추천 시스템**(Cold Start → 하이브리드 자동 전환: CF+CBF)

> 문서/사용법은 FastAPI 스타일(경로·스키마·예시 중심)을 따릅니다. API 스키마는 `/docs`(Swagger), `/redoc`에서 확인하세요.

---

## [노션]

[노션]: https://legend-floss-10d.notion.site/2561ca636c65812380b4dee6bae18083?source=copy_link

## 시연영상
<video controls src="시연영상.mp4" title="Title"></video>

---

## 🗂️ 레포지토리 구조

```
.
├── backend/
│   ├── app/
│   │   ├── accounts/        # 계좌 API
│   │   ├── attendance/      # 출석 API
│   │   ├── auth/            # 인증/인가
│   │   ├── quests/          # 퀘스트/추천
│   │   ├── universities/    # 대학 랭킹
│   │   ├── users/           # 사용자
│   │   ├── models.py        # SQLAlchemy 모델
│   │   ├── database.py      # DB 엔진/세션(get_db, create_tables)
│   │   ├── cache.py         # Redis 연결
│   │   ├── ENV.py           # SSAFY 금융망 API 키/헤더 유틸(make_header 등)
│   │   └── main.py          # FastAPI 엔트리포인트(/api/v1, /health)
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── nginx.conf
│   └── .gitignore
└── frontend/
    ├── src/
    │   ├── components/          # common/feature 컴포넌트
    │   ├── screens/             # auth/signup/quests/deposit/leaderboard
    │   ├── navigation/
    │   ├── store/               # RTK Query(api/*)
    │   ├── hooks/
    │   ├── utils/
    │   └── types/
    ├── App.tsx
    └── package.json
```

---

## 🧱 기술 스택

**Backend**: FastAPI, Uvicorn, SQLAlchemy, Alembic, PyMySQL, Redis, httpx, python-jose(JWT)
**Infra**: Docker / docker-compose, Nginx, MySQL, Redis, (선택) phpMyAdmin
**Frontend**: React Native Web, TypeScript, React Navigation, RTK Query, React Hook Form, Zod, Axios

---

## 🧩 아키텍처

```
[Client (Web/Mobile/Expo)]
          │
          ▼
     [Nginx:80]
   - /api/*   → FastAPI(app:8000)
   - /docs    → Swagger
   - /redoc   → Redoc
   - /health  → FastAPI 헬스 프록시
          │
          ▼
   [FastAPI app:8000]
      ├─ MySQL (SQLAlchemy/Alembic)
      ├─ Redis (캐시)
      └─ httpx → SSAFY 금융망 API
```

---

## ⚙️ 환경 설정

### Backend `.env` (예시)

```
DATABASE_URL=mysql+pymysql://quest_user:questpass123@mysql:3306/quest_db
REDIS_URL=redis://redis:6379
# JWT_SECRET, SENTRY_DSN 등은 필요 시 추가
```

> SSAFY 금융망 명세 엑셀: **비밀번호 `ssafy`**. 키/고유번호 등 민감정보는 반드시 환경변수/비밀관리로 주입(커밋 금지).

---

## 🚀 실행 방법

### 1) Docker (권장)

```bash
cd backend
docker-compose up --build -d
```

* API: `http://localhost/api/v1`
* Swagger: `http://localhost/docs`
* Redoc: `http://localhost/redoc`
* Health: `http://localhost/health` (프록시) / `http://localhost/api/v1/health` (앱)

### 2) 로컬(비도커) Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

* Swagger: `http://localhost:8000/docs`
* Redoc: `http://localhost:8000/redoc`
* Health: `http://localhost:8000/health`

### 3) Frontend (React Native Web)

```bash
cd frontend
npm install
npm start        # 개발 서버
npm run build    # 웹 빌드
```

API Base 예시(환경에 맞게 설정):

```ts
// src/utils/env.ts (예시)
export const ENV = {
  API_BASE_URL: 'http://localhost:8000/api/v1',
  APP_NAME: 'SolQuest',
  DEBUG: true,
};
```

---

## 🗃️ 데이터베이스 & 마이그레이션

* 엔진/세션: `app/database.py` (`create_engine`, `SessionLocal`, `get_db`)
* 모델: `app/models.py` (User, Quest, QuestAttempt, Attendance, Accounts, Transfers 등)
* Alembic:

```bash
cd backend
alembic revision --autogenerate -m "init or changes"
alembic upgrade head
```

> 운영/스테이징 반영은 항상 **Alembic**으로 관리하세요. 개발 초기화용 `create_tables()` 유틸 제공.

---

## 📡 SSAFY 금융망 API 연동

* 유틸/고정값: `app/ENV.py`

  * `API_KEY`, `BASE_URL`, `INSTITUTION_CODE="00100"`, `FINTECH_APP_NO="001"`,
  * `DEPOSIT_ACCOUNT_UNIQUE_NO`, `SAVINGS_ACCOUNT_UNIQUE_NO`,
  * `_now_kr()`, `_unique_no()`, **`make_header()`** (표준 헤더 생성)
* 호출 예시(httpx):

```python
import httpx
from app.ENV import BASE_URL, make_header

async def deposit_account_create(payload: dict):
    url = f"{BASE_URL}/demandDeposit/createDemandDepositAccount"
    headers = make_header()
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.post(url, json={"Header": headers, **payload})
        r.raise_for_status()
        return r.json()
```

> 엑셀 명세 파일(비번 `ssafy`)을 참고하여 요청/응답 스키마를 맞추세요.

---

## 🔌 대표 API (요약)

> 상세 스키마·예시는 Swagger(`/docs`) 확인

* **Auth**

  * `POST /api/v1/auth/register` — 회원가입
  * `POST /api/v1/auth/login` — 로그인(JWT)
* **Accounts**

  * `GET /api/v1/accounts/demand-deposit` — 수시입출금 목록
  * `GET /api/v1/accounts/savings` — 적금 목록
  * `POST /api/v1/accounts/demand-deposit` — 수시입출금 생성
  * `POST /api/v1/accounts/savings` — 적금 생성
* **Quests**

  * `GET /api/v1/quests` — 전체 목록(+ 유저 최신 진행상태)
  * `POST /api/v1/quests/start` / `submit` / `verify` / `claim`
  * `POST /api/v1/quests/{quest_id}/upload` — 업로드 인증(Body로 `proof_url`)
* **Universities**

  * `GET /api/v1/universities/leaderboard` — 학교 랭킹(총/평균 + 내 학교)
* **Attendance**

  * `GET /api/v1/attendance/{year}/{month}`
  * `POST /api/v1/attendance/check-in`
* **Health**

  * `GET /api/v1/health` (앱) / `GET /health` (프록시)

---

## 🧠 📚 퀘스트 추천 시스템 문서

### 시스템 개요

Sol Sol Quest의 추천 시스템은 사용자 데이터에 따라 **진화**합니다.

* **초기**: Cold Start 추천(설문 기반)
* **데이터 축적 후**: **하이브리드 추천** 자동 활성화(CF + CBF)

### 자동 전환 로직

```python
# system.py 452-462행
is_data_sufficient, data_stats = self._check_data_sufficiency(db)

if is_data_sufficient:  # 조건 충족 시 자동으로 하이브리드 추천 활성화
    quest_ids = self._hybrid_recommendation(db, user_id)
else:  # 조건 미충족 시 Cold Start 추천 사용
    # Cold Start 로직 실행
```

### 하이브리드 활성화 조건

| 조건      | 필요 수치     | 현재 체크 방법                            |
| ------- | --------- | ----------------------------------- |
| 전체 상호작용 | ≥ 10,000개 | `is_click=1 OR is_cleared=1`        |
| 활성 사용자  | ≥ 1,000명  | 상호작용 있는 고유 사용자                      |
| 활성 퀘스트  | ≥ 30개     | 상호작용 있는 고유 퀘스트                      |
| 평균 상호작용 | ≥ 5개/사용자  | `total_interactions / active_users` |

---

### Cold Start 추천 (현재 주로 사용)

**작동 원리**

```
사용자 정보 + 설문 12문항 → 카테고리 점수 계산 → 퀘스트 매칭 → 다양성 적용 → 3개 추천
```

**점수 계산 방식 (요약)**

```python
# 1) 연령대 가중치
if age <= 22: STUDY +2, ENT +1
elif age <= 26: STUDY +1, SAVING +2, ECON +1

# 2) 학년 가중치
if grade <= 2: LIFE +1, ENT +1
else: STUDY +1, SAVING +1, ECON +1

# 3) 설문 답변 가중치 (+3/답변)
# 매핑된 카테고리에 +3점
```

**카테고리별 퀘스트 풀 (예시)**

* STUDY(6), SAVING(15), ECON(6), LIFE(7), HEALTH(2), ENT(0)

**다양성 보장**

* 1차: 서로 다른 카테고리에서 1개씩
* 2차: 부족 시 점수 순 보충

---

### 하이브리드 추천 (자동 활성화)

#### 1) 협업 필터링(CF) – 60%

* 아이디어: **유사 사용자**의 행동을 활용
* 유사도: **코사인 유사도** (0\~1)
* 상위 10명 이웃 기반 가중 합산

```
퀘스트 점수 = Σ(유사도 × 선호도)
선호도 = (클릭 × 0.3) + (완료 × 0.7)
```

#### 2) 콘텐츠 기반 필터링(CBF) – 40%

* 아이디어: **내가 좋아한 특성과 유사**한 퀘스트 추천
* 특성: 카테고리/타입(LIFE,GROWTH)/검증(auto,manual,upload)/보상EXP/목표횟수 등
* 점수(예시)

```
퀘스트 점수 = (카테고리 일치 × 카테고리 선호)
            + (타입 일치 × 타입 선호)
            + (검증방식 일치 × 검증방식 선호)
            + (난이도 적합성)
```

**최종 결합**

```python
hybrid_score = 0.6 * CF_score + 0.4 * CBF_score
```

---

### 데이터베이스 구조 & 수집 흐름

**테이블**: `quest_recommendations`

```sql
id (ULID)               -- 고유 ID
user_id                 -- 사용자 ID
quest_id                -- 퀘스트 ID
recommendation_date     -- 추천 날짜
is_click (0/1)          -- 클릭 여부
is_cleared (0/1)        -- 완료 여부
```

**흐름**

1. 추천 시점: 3개 추천 → DB 저장(`is_click=0`, `is_cleared=0`)
2. 클릭 추적: 상세 조회 시 `is_click=1`
3. 완료 추적: 퀘스트 완료 시 `is_cleared=1`

**권장 인덱스**

```sql
CREATE INDEX idx_user_date ON quest_recommendations(user_id, recommendation_date);
CREATE INDEX idx_interactions ON quest_recommendations(is_click, is_cleared);
```

**데이터 현황 확인**

```python
recommendation_system = QuestRecommendationSystem()
is_sufficient, stats = recommendation_system._check_data_sufficiency(db)
print(stats)  # 하이브리드 활성화 진행률 확인
```

---

### 관련 API 엔드포인트 (추천)

* **기본 추천**

  ```
  GET /quests
  ```

  응답: 퀘스트 ID 3개

* **상세 추천**

  ```
  GET /quests/detailed
  ```

  응답: 퀘스트 상세 포함

* **사용자 선호도(디버깅)**

  ```
  GET /user/preferences
  ```

  응답: 카테고리별 점수

**Fallback(설문 미완료/오류 시)**

1. `quest_growth_008`(신한 계좌 등록)
2. `quest_growth_012`(1만원 저축)
3. `quest_daily_017`(쏠쏠한 적금 출석)

---

## 🛰️ 배포 가이드

### Docker

* `docker-compose.yml`: `app`(FastAPI), `nginx`, `mysql`, `redis`, `phpmyadmin(8080)`
* `/api/`는 FastAPI, `/`는 정적 자산(선택)을 Nginx에서 서빙

### systemd (예시)

`/etc/systemd/system/quest-backend.service`

```ini
[Unit]
Description=SolQuest FastAPI
After=network.target

[Service]
WorkingDirectory=/home/ubuntu/quest-backend/backend
Environment="DATABASE_URL=mysql+pymysql://quest_user:questpass123@127.0.0.1:3306/quest_db"
Environment="REDIS_URL=redis://127.0.0.1:6379"
ExecStart=/home/ubuntu/quest-backend/backend/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
User=ubuntu

[Install]
WantedBy=multi-user.target
```

---

## 🧯 트러블슈팅

* **404 (경로/프록시)**: Nginx `/api/` 라우팅과 FastAPI prefix(`/api/v1`) 일치 확인
* **422 (요청 바디 미스매치)**: Pydantic 모델 ↔ 요청 JSON 키/타입 점검 (예: `proof_url`은 **Body**)
* **500/502**: `journalctl -u quest-backend -f` 로그, DB 접속/마이그레이션(`alembic upgrade head`) 확인
* **정적 404**: 빌드 산출물 폴더(`dist/` or `web-build/`)와 Nginx `root` 일치
* **phpMyAdmin**: `PMA_HOST=mysql` (docker 네트워크 이름 사용)

---

## 🔐 보안/운영 수칙

* 비밀키/금융 API 키: **환경변수/비밀관리**로만 주입(커밋 금지)
* CORS/보안 헤더: 개발·운영 분리
* 업로드 크기 제한(Nginx `client_max_body_size`)
* 헬스체크: `/health`, `/api/v1/health`
* 모니터링/로그: 필요 시 Sentry/CloudWatch 등 연동

---

## 🧭 프론트엔드 요약

* 구조: `src/components`, `src/screens(auth/signup/quests/deposit/leaderboard)`, `src/navigation`, `src/store(api/*: RTK Query)`, `src/hooks`, `src/utils`, `src/types`
* 플로우:

  1. 회원가입 → 적금 가입 → 설문 → 메인
  2. 로그인 → 메인
  3. 적금 정보 → 상시입출금 생성 → 설문 → 적금 가입
  4. 메인 → 입금 → DD 계좌 입금
  5. 퀘스트 목록 → 수행 → 경험치 수령 → 티어 상승
  6. 리더보드 조회
* 실행:

  ```bash
  cd frontend
  npm install
  npm start
  npm run build
  ```

---

**Last Updated**: 2025-08-30
