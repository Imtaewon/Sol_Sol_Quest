# Sol_Sol_Quest
## 신한 은행 해커톤, 팀 - "금리복잡도 O(1)" 프로젝트

# Sol Sol Quest – Monorepo README

> FastAPI 백엔드 + Docker 인프라 + RN/Expo 프론트엔드
> 신한은행 해커톤 프로젝트
---

## 🔎 개요

이 레포지토리는 **FastAPI 기반 백엔드 서버**, **Docker 기반 인프라**, 그리고 **React Native + Expo 프론트엔드**를 포함합니다.
<hr>

핵심 기능:

* 사용자 인증 (JWT)
* 퀘스트 시스템 (EXP/티어/리더보드)
* 출석 체크
* **수시입출금/적금 계좌** 관리 (SSAFY 금융망 API 연동)
* 대학별 랭킹
* Redis 캐싱
* 추천 시스템 (Cold Start → 하이브리드 자동 전환)

> [팀 금리복잡도 O(1) 노션페이지]

> 참고: API 설계 및 문서화 방식은 FastAPI 공식 문서 스타일을 따릅니다.


---

## 📁 모놀리포 구조

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
│   │   ├── database.py      # DB 세션/엔진
│   │   ├── cache.py         # Redis 연결
│   │   ├── ENV.py           # SSAFY 금융 API 키/고정값
│   │   └── main.py          # FastAPI 엔트리포인트
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── nginx.conf
│   └── .gitignore
└── frontend/
    ├── App.tsx
    ├── package.json
    ├── components/
    ├── screens/              # auth/home/mypage/quests/leaderboard/assets/payment...
    ├── navigation/
    ├── services/             # axios api clients
    ├── hooks/
    ├── store/                # Redux Toolkit + RTK Query
    ├── types/
    ├── utils/
    └── config/
        └── env.development.ts
```

---

## 🧱 기술 스택

**Backend**: FastAPI, Uvicorn, SQLAlchemy, Alembic, PyMySQL, Redis, httpx, python-jose (JWT)
**Infra**: Docker / docker-compose, Nginx, MySQL, Redis
**Frontend**: React Native + Expo, TypeScript, Redux Toolkit, React Query, React Navigation, Axios, Zod

---

## 🧩 아키텍처

```
[Client (Web/Mobile)]
        │
        ▼
    [Nginx:80]
  (Reverse Proxy/CORS/보안헤더/정적자원)
        │             ┌──────────┐
        ├────────────▶│FastAPI   │───▶ MySQL
        │             │(Uvicorn) │───▶ Redis
        │             └──────────┘    ▲
        │                 │            │
        │                 └───httpx────┘
        │                 (SSAFY 금융망 API)
        ▼
  /health /docs /redoc
```

---

## 🔧 개발 환경 & 실행 (로컬)

### 1) Python/Node 버전

* Python 3.11+
* Node.js 18+

### 2) 백엔드 환경 변수

`backend/.env` (예시)

```env
DATABASE_URL=mysql+pymysql://quest_user:questpass123@mysql:3306/quest_db
REDIS_URL=redis://redis:6379
# 필요 시 JWT/SSAFY 등 환경 변수 추가
```

> `ENV.py`에는 SSAFY 금융망 API 키/기관코드/앱번호/계좌 고유번호 등이 존재합니다.

### 3) 백엔드 실행 (가상환경)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

접속:

* Swagger: [http://localhost:8000/docs](http://localhost:8000/docs)
* Redoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)
* Health: [http://localhost:8000/health](http://localhost:8000/health)

### 4) 프론트엔드 실행

```bash
cd frontend
npm install
npm start           # Expo Dev Server
# or
npm run ios         # iOS 시뮬레이터
npm run android     # Android 에뮬레이터
```

`config/env.development.ts`

```ts
export const developmentConfig = {
  API_BASE_URL: 'http://localhost:8000/api/v1',
  APP_NAME: 'SolQuest',
  DEBUG_MODE: true,
  LOG_LEVEL: 'debug',
};
```

---

## 🐳 Docker 기반 실행

### 1) 기본 실행

```bash
cd backend
docker-compose up --build -d
```

서비스:

* Nginx: `http://localhost/`
* API: `http://localhost/api/v1` (프록시)
* Swagger: `http://localhost/docs`
* Redoc: `http://localhost/redoc`
* Health: `http://localhost/health`
* MySQL/Redis: docker 네트워크 내부에서 접근

### 2) 정적 프런트 배포(예시)

빌드 산출물(`dist/` 또는 `web-build/`)을 Nginx 루트(`/var/www/app/`)로 복사하도록 compose 혹은 별도 스크립트를 사용합니다.
Nginx `nginx.conf`에서 정적 경로와 API 프록시(`/api/`)를 분리합니다.

---

## 🗃️ 데이터베이스 & 마이그레이션

### 1) Alembic

```bash
cd backend
alembic revision --autogenerate -m "add new table"
alembic upgrade head
```

> 운영 DB 스키마 변경은 **항상 Alembic으로 버전 관리**하세요.

### 2) 초기 테이블 생성 (임시 스크립트)

```python
from app.database import create_tables
create_tables()
```

> 실제 운영에서는 Alembic을 권장합니다.

---

## 📡 SSAFY 금융망 API 연동

* `ENV.py`의 고정값: `API_KEY`, `INSTITUTION_CODE`, `FINTECH_APP_NO`, `DEPOSIT_ACCOUNT_UNIQUE_NO`, `SAVINGS_ACCOUNT_UNIQUE_NO` 등
* 요청 헤더 생성: `make_header()` (전송일자/시간/기관/앱번호/거래고유번호)
* 구현 예:

  * 수시입출금 계좌 개설 / 조회
  * 적금 계좌 개설 / 조회
  * 입출금 트랜잭션 (입금/출금)

> SSAFY\_교육용\_금융망\_API\_Interface\_예제\_v4\_해커톤용.xlsx 비밀번호: `ssafy`

---

## 🧠 퀘스트 추천 시스템 (요약)

* **Cold Start** (설문 + 사용자 속성 → 카테고리 점수 → 다양성 보장 3개 추천)
* **하이브리드 전환**: 상호작용 ≥10,000 / 활성 사용자 ≥1,000 / 활성 퀘스트 ≥30 / 평균 ≥5
  → CF 60% + CBF 40%

인덱스 권장:

```sql
CREATE INDEX idx_user_date ON quest_recommendations(user_id, recommendation_date);
CREATE INDEX idx_interactions ON quest_recommendations(is_click, is_cleared);
```

---

## 🔌 대표 API (백엔드)

### 인증

* `POST /api/v1/auth/login` – 로그인
* `POST /api/v1/auth/register` – 회원가입
* 공통 응답: `{ success:boolean, data:any, message?:string, error?:string }`

### 사용자/계좌

* `GET /api/v1/users/me` – 내 정보
* `GET /api/v1/accounts/demand-deposit` – 수시입출금 목록
* `GET /api/v1/accounts/savings` – 적금 목록
* `POST /api/v1/accounts/demand-deposit` – 수시입출금 계좌 개설
* `POST /api/v1/accounts/savings` – 적금 계좌 개설

### 퀘스트

* `GET /api/v1/quests` – 전체 목록(+유저 진행상태)
* `POST /api/v1/quests/start` – 시작
* `POST /api/v1/quests/submit` – 제출
* `POST /api/v1/quests/verify` – 검증
* `POST /api/v1/quests/claim` – EXP 수령
* `GET /api/v1/quests/recommended` – 추천 3개

### 랭킹/출석

* `GET /api/v1/universities/leaderboard` – 학교 랭킹
* `GET /api/v1/attendance/{year}/{month}` – 출석 내역
* `POST /api/v1/attendance/check-in` – 출석하기

> 상세 스키마는 `/docs` 참조.

---

## 🧪 테스트

```bash
cd backend
pytest -v
```

* `pytest-asyncio`로 비동기 핸들러 테스트
* API E2E: httpx/requests + faker로 샘플 시나리오 작성 권장

---

## 🚀 배포 가이드 (예시)

### 백엔드 (수동)

```bash
# 서버
cd ~/quest-backend/backend
git pull
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
sudo systemctl daemon-reload
sudo systemctl restart quest-backend   # Unit 파일에 ExecStart=uvicorn ...
sudo systemctl status quest-backend
```

### 프론트 (정적 배포)

```bash
# 로컬 빌드
cd frontend
npm ci
npm run build:static   # 혹은 expo export 등

# 서버로 업로드 (예: scp/rsync)
scp -i ../backend/solquest.pem -r dist/* ubuntu@SERVER:/var/www/app/

# 검증
curl -I http://SERVER/
curl -I http://SERVER/index.html
```

> Nginx가 정적 파일 경로와 `/api/` 프록시를 올바르게 라우팅하는지 확인하세요.

---

## 🧯 트러블슈팅

### 1) 404 (예: `/attendance/{year}/{month}`)

* 라우터 prefix 및 경로 파라미터 타입 확인
* Nginx에서 `/api/` 프록시 경로 누락/오타 여부 확인
* 실제 엔드포인트는 `/api/v1/attendance/2025/8` 형식인지 점검

### 2) 422 Unprocessable Entity (POST)

* `pydantic` 스키마와 요청 바디(JSON) 일치 확인
* Query/Path/Body 구분 (예: `proof_url`을 **query**가 아닌 **body**로 받을 때 `BaseModel`로 정의)

### 3) 500/502

* Uvicorn 로그 확인 (`journalctl -u quest-backend -f`)
* DB 커넥션/마이그레이션 불일치 확인 (Alembic)
* Nginx 업스트림 포트/컨테이너 헬스체크 확인

### 4) 정적 파일 404

* 빌드 산출물 디렉터리명(`dist/`, `web-build/`)과 Nginx `root` 일치
* 캐시/압축 파일 경로 (`/_expo/static/js/...`)가 존재하는지 확인

### 5) phpMyAdmin 연결 이슈

* `PMA_HOST=mysql` 설정 확인 (compose 네트워크 상의 서비스명)
* MySQL `bind-address`는 컨테이너 내부 기본 설정 유지

---

## 🔐 보안/운영 체크리스트

* JWT 비밀키/SSAFY API 키는 환경변수/비밀 스토리지로 관리
* CORS: 개발/운영 분리
* 요청 크기 제한(Nginx `client_max_body_size`)
* Rate limiting/WAF(선택)
* 헬스체크 엔드포인트 `/health`

---

## 📞 지원

* 이슈 트래커에 버그/요청 등록
* 재현 절차, 요청/응답 샘플, 로그 포함 시 빠른 대응 가능

---

## 🗓️ 변경 이력

* **2025-08-30**: README 통합/정리, 실행/배포/트러블슈팅 보강

---

### 부록 – 요청 바디 예시 (업로드 인증 퀘스트)

```python
# router
@router.post("/{quest_id}/upload", summary="업로드 인증 퀘스트 완료처리")
def complete_upload_quest(
    quest_id: str,
    body: UploadProofRequest,  # BaseModel: { proof_url: HttpUrl }
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = quest_submitted(
        db=db,
        user_id=current_user.id,
        quest_id=quest_id,
        proof_url=body.proof_url,
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message", "처리 실패"))
    return result
```

```python
# schemas.py
from pydantic import BaseModel, HttpUrl

class UploadProofRequest(BaseModel):
    proof_url: HttpUrl
```

[팀 금리복잡도 O(1) 노션페이지]: https://meeting.ssafy.com/s13p01b01/pl/1wdu7z1rubyk9ryqut4xq8swaw