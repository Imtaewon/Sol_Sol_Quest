# Sol_Sol_Quest 에러 가이드 및 디버깅 매뉴얼

## 목차
1. [HTTP 상태 코드별 에러 분석](#http-상태-코드별-에러-분석)
2. [백엔드 에러 분석](#백엔드-에러-분석)
3. [프론트엔드 에러 분석](#프론트엔드-에러-분석)
4. [API 통신 에러](#api-통신-에러)
5. [데이터베이스 관련 에러](#데이터베이스-관련-에러)
6. [인증/권한 관련 에러](#인증권한-관련-에러)
7. [타입 불일치 에러](#타입-불일치-에러)
8. [디버깅 체크리스트](#디버깅-체크리스트)

---

## HTTP 상태 코드별 에러 분석

### 400 Bad Request
**발생 원인:**
- 잘못된 요청 형식
- 필수 파라미터 누락
- 타입 불일치

**확인할 파일들:**
- `backend/app/quests/router.py` - 퀘스트 API 파라미터 검증
- `backend/app/users/router.py` - 사용자 정보 업데이트 파라미터
- `Sol_Sol_Quest/Frontend/services/questService.ts` - API 요청 형식

### 401 Unauthorized
**발생 원인:**
- 토큰 누락 또는 만료
- 잘못된 인증 정보

**확인할 파일들:**
- `backend/app/auth/deps.py` - 인증 미들웨어
- `Sol_Sol_Quest/Frontend/services/authService.ts` - 토큰 관리
- `Sol_Sol_Quest/Frontend/services/apiClient.ts` - 헤더 설정

### 403 Forbidden
**발생 원인:**
- 권한 부족
- 접근 제한된 리소스

**확인할 파일들:**
- `backend/app/models.py` - UserRoleEnum 확인
- `backend/app/auth/deps.py` - 권한 검증 로직
- `Sol_Sol_Quest/Frontend/store/api/baseApi.ts` - 사용자 권한 상태

### 404 Not Found
**발생 원인:**
- 존재하지 않는 리소스
- 잘못된 URL 경로
- 데이터베이스 레코드 없음

**확인할 파일들:**
- `backend/app/main.py` - 라우터 등록
- `backend/app/quests/router.py` - 퀘스트 조회 로직
- `Sol_Sol_Quest/Frontend/navigation/` - 네비게이션 경로

### 500 Internal Server Error
**발생 원인:**
- 서버 내부 오류
- 데이터베이스 연결 실패
- 예외 처리되지 않은 에러

**확인할 파일들:**
- `backend/app/database.py` - DB 연결 설정
- `backend/app/models.py` - 모델 정의
- `backend/app/quests/service.py` - 비즈니스 로직

---

## 백엔드 에러 분석

### 1. 데이터베이스 연결 에러
**파일:** `backend/app/database.py`

**에러 상황:**
```python
# 에러 예시
sqlalchemy.exc.OperationalError: (pymysql.err.OperationalError) (2003, "Can't connect to MySQL server")
```

**해결 방법:**
1. MySQL 서버 실행 상태 확인
2. 데이터베이스 연결 정보 확인
3. 방화벽 설정 확인

**체크 포인트:**
- `get_db_url()` 함수의 연결 정보
- MySQL 서비스 상태
- 네트워크 연결

### 2. 모델 정의 에러
**파일:** `backend/app/models.py`

**에러 상황:**
```python
# 에러 예시
sqlalchemy.exc.ProgrammingError: (pymysql.err.ProgrammingError) (1146, "Table 'quest_db.quests' doesn't exist")
```

**해결 방법:**
1. 데이터베이스 스키마 확인
2. 마이그레이션 실행
3. 테이블 생성 스크립트 실행

**체크 포인트:**
- `quest_db (1).sql` 파일의 스키마
- 테이블명과 컬럼명 일치 여부
- Enum 값들의 정확성

### 3. API 라우터 에러
**파일:** `backend/app/quests/router.py`

**에러 상황:**
```python
# 에러 예시
fastapi.exceptions.HTTPException: 400 Bad Request - "필수 파라미터가 누락되었습니다"
```

**해결 방법:**
1. 요청 파라미터 검증 로직 확인
2. Pydantic 스키마 정의 확인
3. 클라이언트 요청 형식 확인

**체크 포인트:**
- Query 파라미터 정의
- Request body 스키마
- 응답 모델 정의

### 4. 인증/권한 에러
**파일:** `backend/app/auth/deps.py`

**에러 상황:**
```python
# 에러 예시
fastapi.exceptions.HTTPException: 401 Unauthorized - "Invalid token"
```

**해결 방법:**
1. JWT 토큰 검증 로직 확인
2. 토큰 만료 시간 설정 확인
3. 시크릿 키 설정 확인

**체크 포인트:**
- `get_current_user()` 함수
- 토큰 디코딩 로직
- 권한 검증 로직

---

## 프론트엔드 에러 분석

### 1. API 클라이언트 에러
**파일:** `Sol_Sol_Quest/Frontend/services/apiClient.ts`

**에러 상황:**
```typescript
// 에러 예시
AxiosError: Request failed with status code 500
```

**해결 방법:**
1. API 엔드포인트 URL 확인
2. 요청 헤더 설정 확인
3. 인터셉터 로직 확인

**체크 포인트:**
- `baseURL` 설정
- `Authorization` 헤더
- 에러 핸들링 로직

### 2. 타입 불일치 에러
**파일:** `Sol_Sol_Quest/Frontend/types/database.ts`

**에러 상황:**
```typescript
// 에러 예시
Type 'string' is not assignable to type 'QuestTypeEnum'
```

**해결 방법:**
1. 백엔드와 프론트엔드 타입 일치 확인
2. Enum 값 매핑 확인
3. 타입 변환 로직 확인

**체크 포인트:**
- QuestTypeEnum 값들
- QuestCategoryEnum 값들
- QuestAttemptStatusEnum 값들

### 3. 상태 관리 에러
**파일:** `Sol_Sol_Quest/Frontend/store/`

**에러 상황:**
```typescript
// 에러 예시
Cannot read property 'quests' of undefined
```

**해결 방법:**
1. Redux store 초기화 확인
2. 액션 디스패치 로직 확인
3. 리듀서 상태 업데이트 확인

**체크 포인트:**
- `store/index.ts` - 스토어 설정
- `store/slices/` - 리듀서 로직
- `store/api/` - RTK Query 설정

### 4. 네비게이션 에러
**파일:** `Sol_Sol_Quest/Frontend/navigation/`

**에러 상황:**
```typescript
// 에러 예시
The route 'QuestDetail' doesn't exist
```

**해결 방법:**
1. 라우트 정의 확인
2. 네비게이션 파라미터 확인
3. 스택 네비게이터 설정 확인

**체크 포인트:**
- `AppNavigator.tsx` - 메인 네비게이터
- `QuestNavigator.tsx` - 퀘스트 네비게이터
- 라우트 파라미터 타입 정의

---

## API 통신 에러

### 1. 퀘스트 API 에러
**백엔드 파일:** `backend/app/quests/router.py`
**프론트엔드 파일:** `Sol_Sol_Quest/Frontend/services/questService.ts`

**일반적인 에러:**
- 404: 퀘스트 ID가 존재하지 않음
- 400: 잘못된 필터 파라미터
- 500: 데이터베이스 조회 실패

**디버깅 방법:**
1. 백엔드 로그 확인
2. 프론트엔드 네트워크 탭 확인
3. API 요청/응답 데이터 확인

### 2. 사용자 API 에러
**백엔드 파일:** `backend/app/users/router.py`
**프론트엔드 파일:** `Sol_Sol_Quest/Frontend/services/userService.ts`

**일반적인 에러:**
- 401: 토큰 만료
- 403: 권한 부족
- 404: 사용자 정보 없음

**디버깅 방법:**
1. 토큰 유효성 확인
2. 사용자 권한 확인
3. 데이터베이스 사용자 레코드 확인

### 3. 인증 API 에러
**백엔드 파일:** `backend/app/auth/`
**프론트엔드 파일:** `Sol_Sol_Quest/Frontend/services/authService.ts`

**일반적인 에러:**
- 401: 잘못된 로그인 정보
- 400: 회원가입 정보 누락
- 500: 비밀번호 해싱 실패

**디버깅 방법:**
1. 로그인 정보 확인
2. 비밀번호 해싱 로직 확인
3. 데이터베이스 연결 확인

---

## 데이터베이스 관련 에러

### 1. 연결 에러
**파일:** `backend/app/database.py`

**에러 코드:**
- 2003: MySQL 서버 연결 실패
- 1045: 인증 실패
- 1049: 데이터베이스 없음

**해결 방법:**
```bash
# MySQL 서비스 상태 확인
sudo systemctl status mysql

# 데이터베이스 생성
mysql -u root -p
CREATE DATABASE quest_db;

# 사용자 권한 설정
GRANT ALL PRIVILEGES ON quest_db.* TO 'quest_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. 스키마 에러
**파일:** `quest_db (1).sql`

**에러 코드:**
- 1146: 테이블 없음
- 1054: 컬럼 없음
- 1064: SQL 문법 에러

**해결 방법:**
```sql
-- 스키마 확인
SHOW TABLES;
DESCRIBE quests;

-- 테이블 재생성
DROP TABLE IF EXISTS quests;
-- quest_db (1).sql 실행
```

### 3. 데이터 무결성 에러
**파일:** `backend/app/models.py`

**에러 코드:**
- 1452: 외래키 제약조건 위반
- 1062: 중복 키 에러
- 1366: 잘못된 데이터 타입

**해결 방법:**
1. 외래키 관계 확인
2. 중복 데이터 제거
3. 데이터 타입 일치 확인

---

## 인증/권한 관련 에러

### 1. JWT 토큰 에러
**파일:** `backend/app/auth/`

**에러 상황:**
- 토큰 만료
- 잘못된 시크릿 키
- 토큰 형식 오류

**해결 방법:**
```python
# 토큰 검증 로직 확인
def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

### 2. 권한 검증 에러
**파일:** `backend/app/auth/deps.py`

**에러 상황:**
- 권한 부족
- 역할 불일치
- 접근 제한

**해결 방법:**
```python
# 권한 검증 로직
def check_permission(user: User, required_role: UserRoleEnum):
    if user.role != required_role:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
```

---

## 타입 불일치 에러

### 1. Enum 값 불일치
**백엔드:** `backend/app/models.py`
**프론트엔드:** `Sol_Sol_Quest/Frontend/types/database.ts`

**문제 상황:**
```typescript
// 백엔드: 'LIFE', 'GROWTH', 'SURPRISE'
// 프론트엔드: 'life', 'growth', 'surprise'
```

**해결 방법:**
1. 백엔드와 프론트엔드 enum 값 통일
2. 변환 함수 작성
3. 타입 가드 사용

### 2. API 응답 타입 불일치
**백엔드:** `backend/app/quests/schemas.py`
**프론트엔드:** `Sol_Sol_Quest/Frontend/services/questService.ts`

**문제 상황:**
```typescript
// 백엔드 응답과 프론트엔드 타입 정의 불일치
interface QuestListItem {
  id: string;
  type: QuestTypeEnum;
  // ...
}
```

**해결 방법:**
1. Pydantic 스키마와 TypeScript 인터페이스 일치
2. API 응답 구조 통일
3. 타입 변환 로직 개선

---

## 디버깅 체크리스트

### 백엔드 디버깅
- [ ] FastAPI 서버 실행 상태 확인
- [ ] 데이터베이스 연결 상태 확인
- [ ] 로그 레벨 설정 확인
- [ ] API 엔드포인트 접근 가능 확인
- [ ] 인증 토큰 유효성 확인
- [ ] 데이터베이스 스키마 일치 확인

### 프론트엔드 디버깅
- [ ] React Native 앱 실행 상태 확인
- [ ] API 클라이언트 설정 확인
- [ ] 네트워크 요청/응답 확인
- [ ] Redux store 상태 확인
- [ ] 타입 정의 일치 확인
- [ ] 네비게이션 라우트 확인

### API 통신 디버깅
- [ ] 요청 URL 정확성 확인
- [ ] 요청 헤더 설정 확인
- [ ] 요청 바디 형식 확인
- [ ] 응답 상태 코드 확인
- [ ] 응답 데이터 구조 확인
- [ ] 에러 핸들링 로직 확인

### 데이터베이스 디버깅
- [ ] MySQL 서비스 실행 상태 확인
- [ ] 데이터베이스 연결 정보 확인
- [ ] 테이블 존재 여부 확인
- [ ] 데이터 무결성 확인
- [ ] 인덱스 설정 확인
- [ ] 쿼리 성능 확인

---

## 로그 확인 방법

### 백엔드 로그
```bash
# FastAPI 서버 로그
uvicorn app.main:app --reload --log-level debug

# 데이터베이스 로그
tail -f /var/log/mysql/error.log
```

### 프론트엔드 로그
```typescript
// 콘솔 로그 확인
console.log('API 요청:', requestData);
console.log('API 응답:', responseData);
console.log('에러 정보:', error);
```

### 네트워크 로그
- 브라우저 개발자 도구 Network 탭
- React Native Debugger
- Flipper 네트워크 플러그인

---

## 자주 발생하는 에러와 해결책

### 1. CORS 에러
**에러:** `Access to fetch at 'http://localhost:8000' from origin 'http://localhost:3000' has been blocked by CORS policy`

**해결책:**
```python
# backend/app/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2. 토큰 만료 에러
**에러:** `401 Unauthorized - Token has expired`

**해결책:**
```typescript
// Sol_Sol_Quest/Frontend/services/apiClient.ts
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 토큰 갱신 로직
      await refreshToken();
    }
    return Promise.reject(error);
  }
);
```

### 3. 타입 에러
**에러:** `Type 'string' is not assignable to type 'QuestTypeEnum'`

**해결책:**
```typescript
// 타입 가드 함수 작성
function isQuestType(value: string): value is QuestTypeEnum {
  return ['LIFE', 'GROWTH', 'SURPRISE'].includes(value);
}
```

---

## 성능 최적화 팁

### 백엔드 최적화
1. 데이터베이스 인덱스 추가
2. 쿼리 최적화
3. 캐싱 구현
4. 비동기 처리 활용

### 프론트엔드 최적화
1. 불필요한 리렌더링 방지
2. 이미지 최적화
3. 번들 크기 최소화
4. 메모이제이션 활용

---

## 모니터링 도구

### 백엔드 모니터링
- FastAPI 자체 로깅
- Prometheus + Grafana
- Sentry 에러 추적

### 프론트엔드 모니터링
- React Native Debugger
- Flipper
- Crashlytics

---

이 문서를 참고하여 에러를 체계적으로 디버깅하고 해결하시기 바랍니다.
