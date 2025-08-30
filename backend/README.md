## 📌 프로젝트 개요

이 레포지토리는 **FastAPI 기반 백엔드 서버**와 **Docker 기반 인프라 환경**을 포함합니다.
주요 기능:

* 사용자 인증 (JWT 기반)
* 퀘스트 시스템 (EXP/티어/리더보드)
* 출석 체크
* 수시입출금/적금 계좌 관리 (SSAFY 금융망 API 연동)
* 대학별 랭킹 시스템
* Redis 기반 캐싱

---

## ⚙️ 기술 스택

### Backend

* **FastAPI** (웹 프레임워크)
* **SQLAlchemy** (ORM)
* **Alembic** (DB 마이그레이션)
* **PyMySQL** (MySQL 드라이버)
* **Redis** (캐시/세션)
* **httpx** (외부 금융 API 호출)
* **JWT (python-jose)** (인증/인가)

### Infra

* **Docker / docker-compose**
* **Nginx** (Reverse Proxy, CORS/보안 헤더)
* **MySQL** (데이터베이스)
* **Redis** (세션/캐시)
* **Uvicorn** (ASGI 서버)

---

## 🗂️ 프로젝트 구조

```
backend/
 ├── app/
 │   ├── accounts/      # 계좌 관련 API
 │   ├── auth/          # 인증/인가
 │   ├── quests/        # 퀘스트 관련 기능
 │   ├── universities/  # 대학 랭킹 API
 │   ├── users/         # 사용자 프로필/정보
 │   ├── attendance/    # 출석 체크 API
 │   ├── models.py      # SQLAlchemy 모델 정의
 │   ├── database.py    # DB 연결 세션 관리
 │   ├── cache.py       # Redis 연결
 │   ├── ENV.py         # SSAFY 금융망 API 설정
 │   └── main.py        # FastAPI 엔트리포인트
 ├── requirements.txt   # Python 패키지 의존성
 ├── Dockerfile         # FastAPI 앱 컨테이너 빌드
 ├── docker-compose.yml # 전체 서비스 오케스트레이션
 ├── nginx.conf         # Nginx 리버스 프록시 설정
 └── .gitignore
```

---

## 🚀 실행 방법

### 1) 환경 변수 설정

`.env` 파일을 프로젝트 루트에 생성:

```env
DATABASE_URL=mysql+pymysql://quest_user:questpass123@mysql:3306/quest_db
REDIS_URL=redis://redis:6379
```

### 2) Docker Compose 실행

```bash
docker-compose up --build -d
```

### 3) 서비스 확인

* API 서버: [http://localhost/api/v1](http://localhost/api/v1)
* API Docs (Swagger): [http://localhost/docs](http://localhost/docs)
* Redoc 문서: [http://localhost/redoc](http://localhost/redoc)
* Health Check: [http://localhost/health](http://localhost/health)

---

## 🛠️ 데이터베이스 관리

### DB 마이그레이션

```bash
alembic revision --autogenerate -m "add new table"
alembic upgrade head
```

### 초기 테이블 생성

```python
from app.database import create_tables
create_tables()
```

---

## 📡 SSAFY 금융망 API 연동

* `ENV.py` 내에 `API_KEY`, `DEPOSIT_ACCOUNT_UNIQUE_NO`, `SAVINGS_ACCOUNT_UNIQUE_NO` 등 고정값을 사용.
* 요청 시 `make_header()`를 통해 표준 헤더 자동 생성.
* 예시: 수시입출금 계좌 개설, 적금 계좌 개설, 입금/출금 트랜잭션 API 연동.

---

## 📑 Nginx 설정

* **Reverse Proxy → FastAPI (app:8000)**
* **CORS 허용** (개발 환경)
* **헬스체크 엔드포인트** `/health`
* **클라이언트 업로드 제한**: 10MB

---

## 🧪 테스트

* **pytest + pytest-asyncio** 기반 단위/통합 테스트 지원.

```bash
pytest -v
```

---

## 📌 배포 아키텍처

1. **클라이언트 (웹/모바일) → Nginx**
2. **Nginx → FastAPI (Uvicorn)**
3. **FastAPI → MySQL/Redis/외부 SSAFY 금융망 API**
4. **Docker Compose 기반 서비스 관리**

---
