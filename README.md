아래는 **업데이트된 프론트엔드 README**를 반영해 백엔드·인프라까지 한 번에 보는 **통합 `README.md`** 초안입니다. 그대로 붙여 넣어도 되고, 팀 컨벤션에 맞게 섹션을 더/빼면 돼요.

---

# Sol Sol Quest – Monorepo

> FastAPI 백엔드 + Docker 인프라 + React Native Web 프론트엔드
> 신한은행 해커톤 프로젝트 (팀 S\_OS)

---

## 📌 개요

이 레포지토리는 다음 3가지를 한 저장소에서 관리합니다.

1. **Backend** — FastAPI 기반 API 서버, MySQL/Redis 연동, SSAFY 금융망 API 연동
2. **Infra** — Nginx Reverse Proxy, Docker / docker-compose
3. **Frontend** — React Native Web 기반의 적금·퀘스트 앱

핵심 도메인:

* 사용자 인증(JWT)
* 퀘스트(진행/검증/경험치/티어/리더보드)
* 출석
* 계좌(수시입출금/적금, SSAFY 금융망 API)
* 추천 시스템(Cold Start → 하이브리드 자동전환)

---

### [노션]

### 시현영상
<video controls src="시연영상-1.mp4" title="Title"></video>

---

## 🗂️ 모놀리포 구조

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
│   │   ├── ENV.py           # SSAFY 금융망 API 설정
│   │   └── main.py          # FastAPI 엔트리포인트
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── nginx.conf
│   └── .gitignore
└── frontend/
    ├── src/
    │   ├── components/          # 공통/기능 컴포넌트
    │   ├── screens/             # auth/signup/quests/deposit/leaderboard ...
    │   ├── navigation/          # MainTabs, 스택들
    │   ├── store/               # RTK Query (api/ 포함)
    │   ├── hooks/               # useUser 등
    │   ├── utils/               # 상수/포매터
    │   └── types/
    ├── App.tsx
    └── package.json
```

---

## 🧱 기술 스택

**Backend**: FastAPI, Uvicorn, SQLAlchemy, Alembic, PyMySQL, Redis, httpx, python-jose(JWT)
**Infra**: Docker / docker-compose, Nginx, MySQL, Redis
**Frontend**: React Native Web, TypeScript, React Navigation, RTK Query, React Hook Form, Zod, Axios

---

## 아키텍처
![alt text](아키텍처_최종수정.png)

---

## 🔧 개발 환경 준비

### 공통 요구 사항

* Python 3.11+
* Node.js 18+
* Docker / docker-compose (선택: 컨테이너 기반 실행 시)

### 백엔드 환경 변수

`backend/.env` (예시)

```env
DATABASE_URL=mysql+pymysql://quest_user:questpass123@mysql:3306/quest_db
REDIS_URL=redis://redis:6379
# JWT_SECRET, SENTRY_DSN 등 민감값은 여기(또는 배포 비밀 관리자)에 설정
```

> SSAFY 금융 명세는 제공된 엑셀 파일(비번 **ssafy**)을 참고하세요. 키/기관코드 등 민감정보는 저장소에 커밋하지 말고 환경변수/비밀 저장소로 관리합니다.

---

## ▶️ 빠른 시작 (Docker 추천)

```bash
cd backend
docker-compose up --build -d
```

접속 경로:

* API: `http://localhost/api/v1`
* Swagger: `http://localhost/docs`
* Redoc: `http://localhost/redoc`
* Health: `http://localhost/health`

> Nginx가 프록시로 `app:8000`(FastAPI)로 라우팅합니다. 정적 웹 배포를 함께 쓰는 경우, `/`는 정적, `/api/`는 FastAPI로 분리하는 구성이 일반적입니다.

---

## 🧑‍💻 로컬 개발 (비도커)

### 1) Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

* Swagger: `http://localhost:8000/docs`
* Redoc: `http://localhost:8000/redoc`
* Health: `http://localhost:8000/health`

#### DB 마이그레이션

```bash
cd backend
alembic revision --autogenerate -m "init or changes"
alembic upgrade head
```

> 운영/스테이징 DB 스키마는 **항상 Alembic으로 버전 관리**합니다.

### 2) Frontend (React Native Web)

```bash
cd frontend
npm install
npm start          # 개발 서버
# 웹 빌드
npm run build
```

환경 설정 샘플(웹 빌드 시 API 주소):

```ts
// 예: src/utils/env.ts
export const ENV = {
  API_BASE_URL: 'http://localhost:8000/api/v1',
  APP_NAME: 'SolQuest',
  DEBUG: true,
};
```

---

## 🔌 프론트엔드 주요 플로우 & 파일

### 1. 회원가입

```
회원가입 → 적금 가입 → 설문조사 → 메인
```

* `screens/signup/SignupScreen.tsx`
* `screens/signup/SavingOpenScreen.tsx`
* `store/api/baseApi.ts` (회원가입)
* `store/api/savingApi.ts` (설문)

### 2. 로그인

```
로그인 → 메인(자동 리다이렉트)
```

* `screens/auth/LoginScreen.tsx`
* `store/api/baseApi.ts` (로그인)
* `App.tsx` (인증 라우팅)

### 3. 적금 가입

```
적금 정보 → 상시입출금 계좌 생성 → 설문 → 적금 가입 → 메인
```

* `screens/signup/SavingOpenScreen.tsx`
* `screens/signup/DepositOpenScreen.tsx`
* `store/api/baseApi.ts` (계좌 생성)
* `hooks/useUser.ts` (사용자/계좌)

### 4. 입금

```
메인 → 입금하기 → DD 계좌 입금 → 메인
```

* `screens/deposit/DepositMoneyScreen.tsx`
* `store/api/baseApi.ts` (입금)
* `hooks/useUser.ts`

### 5. 퀘스트

```
퀘스트 목록 → 수행 → 경험치 수령 → 티어 증가
```

* `screens/quests/QuestsScreen.tsx`
* `screens/quests/QuestDetailScreen.tsx`
* `screens/quests/QuestUploadScreen.tsx`
* `navigation/QuestsStack.tsx`
* `store/api/baseApi.ts` (퀘스트)

### 6. 리더보드

```
메인 → 리더보드 → 학교별 순위
```

* `screens/leaderboard/LeaderboardScreen.tsx`
* `store/api/baseApi.ts`
* `services/rankService.ts`

**상태 관리 규칙**

* 서버 상태: **RTK Query** (`store/api/*`)
* 전역 클라이언트 상태: Redux Slice
* 로컬 UI 상태: React 훅(useState/useReducer)

---

## 📡 SSAFY 금융망 API

* `ENV.py`에서 **헤더 생성**/고정값 유틸 제공 (기관코드, 앱번호, 거래고유번호 등)
* 지원 기능 예시:

  * 수시입출금/적금 **계좌 개설**
  * **입금/출금** 트랜잭션
* 실제 키/식별자는 환경변수로 주입(운영 커밋 금지)
* 참고 명세: `SSAFY_교육용_금융망_API_Interface_예제_v4_해커톤용.xlsx` (암호 **ssafy**)

---

## 📑 대표 API (요약)

* 인증

  * `POST /api/v1/auth/login` — 로그인
  * `POST /api/v1/auth/register` — 회원가입
* 사용자/계좌

  * `GET /api/v1/users/me` — 내 프로필
  * `GET /api/v1/accounts/demand-deposit` — 수시입출금 목록
  * `GET /api/v1/accounts/savings` — 적금 목록
  * `POST /api/v1/accounts/demand-deposit` — 수시입출금 생성
  * `POST /api/v1/accounts/savings` — 적금 생성
* 퀘스트

  * `GET /api/v1/quests` — 필터/정렬/페이지 지원 목록(유저 최신 진행상태 포함)
  * `POST /api/v1/quests/{quest_id}/complete` — (데모) 즉시 완료
* 랭킹/출석

  * `GET /api/v1/universities/leaderboard` — 학교 랭킹(총/평균 + 내 학교)
  * `GET /api/v1/attendance/{year}/{month}` — 출석 내역
  * `POST /api/v1/attendance/check-in` — 출석

> 모든 엔드포인트 스키마·예시는 Swagger(`/docs`)에서 확인하세요.

---

## 🧠 추천 시스템 (요약)

* **Cold Start**: 가입 정보+설문으로 카테고리 점수화 → 3개 추천(다양성 보장)
* **하이브리드 자동전환**: 상호작용/활성 사용자/퀘스트 수/평균 상호작용 기준 충족 시
  `hybrid_score = 0.6 * CF + 0.4 * CBF`
* 지표: CTR, 완료율, 다양성 / 인덱스 권장:

  ```sql
  CREATE INDEX idx_user_date ON quest_recommendations(user_id, recommendation_date);
  CREATE INDEX idx_interactions ON quest_recommendations(is_click, is_cleared);
  ```

---

## 🛰️ 배포 가이드

### A. 컨테이너 기반(권장)

* `docker-compose.yml`에 Nginx(리버스 프록시), FastAPI, MySQL, Redis 정의
* API는 `/api/` 경로로 프록시, 정적 웹은 `/`로 서빙하도록 구성 가능

### B. 수동(예시, 백엔드 systemd)

```bash
# 서버
cd ~/quest-backend/backend
git pull
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
sudo systemctl daemon-reload
sudo systemctl restart quest-backend
sudo systemctl status quest-backend
```

### C. 프론트 정적 배포(웹)

```bash
cd frontend
npm ci
npm run build  # 웹 빌드 산출물 생성

# 서버 복사 (예: Nginx 루트 /var/www/app)
scp -i ../backend/solquest.pem -r dist/* ubuntu@SERVER:/var/www/app/

# 검증
curl -I http://SERVER/
curl -I http://SERVER/index.html
```

> Nginx에서 **정적 파일 경로**와 **API 프록시(/api/)** 라우팅을 반드시 분리하세요.

---

## 🧯 트러블슈팅

* **404 (경로 오타/프록시 이슈)**

  * Nginx `/api/` 프록시 경로 매칭 확인
  * FastAPI 라우터 prefix(`/api/v1`) 일치 확인
* **422 (요청 바디 불일치)**

  * Pydantic 스키마와 요청 JSON 키/타입 확인
  * Query/Path/Body 구분(예: `proof_url`은 **Body**)
* **500/502 (서버 내부/프록시 실패)**

  * `journalctl -u quest-backend -f`로 백엔드 로그
  * DB 연결/마이그레이션 일치 여부 확인
  * Nginx 업스트림 포트/헬스체크 점검
* **정적 404**

  * 빌드 산출물 폴더명(`dist/` vs `web-build/`)과 Nginx `root` 일치

---

## 🔐 보안 & 운영 체크리스트

* 비밀키/토큰/금융 API 키는 **환경변수/비밀관리**로만 주입 (커밋 금지)
* CORS: 개발/운영 분리
* 파일 업로드 크기 제한 (Nginx `client_max_body_size`)
* 헬스체크 `/health` 제공
* 로그/모니터링: 필요 시 Sentry/CloudWatch 등 연동

---

## 📞 문의

이슈 트래커에 버그·요청을 등록해주세요.
재현 절차, 요청/응답 샘플, 로그를 포함하면 빠르게 대응할 수 있습니다.

---

**Last Updated**: 2025-08-30


[노션]: https://meeting.ssafy.com/s13p01b01/pl/1wdu7z1rubyk9ryqut4xq8swaw