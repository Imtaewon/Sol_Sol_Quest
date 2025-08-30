# Sol_Sol_Quest Frontend

## 📋 프로젝트 개요

React Native Web 기반의 적금 퀘스트 앱 프론트엔드입니다. 사용자의 적금 가입부터 퀘스트 수행, 경험치 수령까지의 전체 플로우를 관리합니다.

## 🏗️ 프로젝트 구조

```
Sol_Sol_Quest/Frontend/
├── src/
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── common/         # 공통 컴포넌트 (AppHeader, FormTextInput 등)
│   │   └── feature/        # 기능별 컴포넌트
│   ├── screens/            # 화면 컴포넌트
│   │   ├── auth/          # 인증 관련 화면
│   │   ├── signup/        # 회원가입 관련 화면
│   │   ├── quests/        # 퀘스트 관련 화면
│   │   ├── deposit/       # 입금 관련 화면
│   │   └── leaderboard/   # 리더보드 화면
│   ├── navigation/        # 네비게이션 설정
│   ├── store/            # 상태 관리 (RTK Query)
│   │   └── api/          # API 엔드포인트 정의
│   ├── hooks/            # 커스텀 훅
│   ├── utils/            # 유틸리티 함수
│   └── types/            # TypeScript 타입 정의
├── App.tsx               # 앱 진입점
└── package.json
```

## 🔄 주요 플로우 및 파일 관계

### 1. 회원가입 플로우
```
회원가입 → 적금 가입 → 설문조사 → 메인페이지
```

**관련 파일:**
- `screens/signup/SignupScreen.tsx` - 기본 회원가입
- `screens/signup/SavingOpenScreen.tsx` - 적금 가입 + 설문조사
- `store/api/baseApi.ts` - 회원가입 API
- `store/api/savingApi.ts` - 설문조사 API

### 2. 로그인 플로우
```
로그인 → 메인페이지 (자동 리다이렉트)
```

**관련 파일:**
- `screens/auth/LoginScreen.tsx` - 로그인 화면
- `store/api/baseApi.ts` - 로그인 API
- `App.tsx` - 인증 상태에 따른 라우팅

### 3. 적금 가입 플로우
```
적금 정보 입력 → 상시입출금 계좌 생성 → 설문조사 → 적금 가입 → 메인페이지
```

**관련 파일:**
- `screens/signup/SavingOpenScreen.tsx` - 메인 적금 가입 화면
- `screens/signup/DepositOpenScreen.tsx` - 상시입출금 계좌 생성
- `store/api/baseApi.ts` - 계좌 생성 API
- `hooks/useUser.ts` - 사용자 정보 관리

### 4. 입금 플로우
```
메인페이지 → 입금하기 → 상시입출금 계좌 입금 → 메인페이지
```

**관련 파일:**
- `screens/deposit/DepositMoneyScreen.tsx` - 입금 화면
- `store/api/baseApi.ts` - 입금 API
- `hooks/useUser.ts` - 계좌 정보 조회

### 5. 퀘스트 플로우
```
퀘스트 목록 → 퀘스트 수행 → 경험치 수령 → 티어 증가
```

**관련 파일:**
- `screens/quests/QuestsScreen.tsx` - 퀘스트 목록
- `screens/quests/QuestDetailScreen.tsx` - 퀘스트 상세
- `screens/quests/QuestUploadScreen.tsx` - 파일 업로드
- `store/api/baseApi.ts` - 퀘스트 API
- `navigation/QuestsStack.tsx` - 퀘스트 네비게이션

### 6. 리더보드 플로우
```
메인페이지 → 리더보드 → 학교별 순위 확인
```

**관련 파일:**
- `screens/leaderboard/LeaderboardScreen.tsx` - 리더보드 화면
- `store/api/baseApi.ts` - 리더보드 API
- `services/rankService.ts` - 순위 데이터 처리

## 🗂️ 핵심 파일 설명

### 상태 관리
- **`store/api/baseApi.ts`**: RTK Query를 사용한 모든 API 엔드포인트 정의
- **`store/api/savingApi.ts`**: 적금 관련 API (설문조사 등)
- **`hooks/useUser.ts`**: 사용자 정보 및 계좌 정보 관리

### 네비게이션
- **`navigation/MainTabs.tsx`**: 하단 탭 네비게이션
- **`navigation/HomeStack.tsx`**: 홈 스택 네비게이션
- **`navigation/QuestsStack.tsx`**: 퀘스트 스택 네비게이션

### 주요 화면
- **`screens/signup/SavingOpenScreen.tsx`**: 적금 가입 + 설문조사 (핵심 플로우)
- **`screens/quests/QuestsScreen.tsx`**: 퀘스트 목록 및 수행
- **`screens/deposit/DepositMoneyScreen.tsx`**: 입금 기능

### 유틸리티
- **`utils/constants.ts`**: 색상, 폰트, 간격 등 상수
- **`utils/formatters.ts`**: 날짜, 통화 등 포맷팅 함수
- **`services/rankService.ts`**: 순위 데이터 변환 및 처리

## 🔧 주요 기술 스택

- **React Native Web**: 크로스 플랫폼 개발
- **React Navigation**: 네비게이션 관리
- **RTK Query**: API 상태 관리
- **React Hook Form**: 폼 관리
- **TypeScript**: 타입 안정성

## 🚀 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start

# 웹 빌드
npm run build
```

## 📱 주요 기능

1. **회원가입/로그인**: JWT 토큰 기반 인증
2. **적금 가입**: 2단계 프로세스 (정보 입력 + 설문조사)
3. **상시입출금 계좌**: 입금/출금 기능
4. **퀘스트 시스템**: 일상/성장/돌발 퀘스트 수행
5. **파일 업로드**: 퀘스트 증빙 파일 제출
6. **경험치 시스템**: 퀘스트 완료 시 경험치 획득
7. **티어 시스템**: 경험치에 따른 티어 상승
8. **리더보드**: 학교별 순위 및 개인 순위
9. **기부 시스템**: 적금 기반 기부금 계산

## 🔄 데이터 플로우

```
API 호출 → RTK Query → 캐시 업데이트 → UI 리렌더링
```

모든 API 호출은 RTK Query를 통해 관리되며, 자동 캐싱과 에러 처리가 포함됩니다.

## 📊 상태 관리 구조

```
App.tsx (Provider)
├── Redux Store
│   ├── RTK Query API
│   └── Auth Slice
└── React Query Client
    └── 캐시 관리
```

## 🎯 개발 가이드라인

1. **컴포넌트 구조**: 재사용 가능한 컴포넌트는 `components/` 폴더에 배치
2. **API 호출**: 모든 API는 `store/api/` 폴더에서 관리
3. **타입 정의**: TypeScript 타입은 `types/` 폴더에 정의
4. **네비게이션**: 화면 간 이동은 React Navigation 사용
5. **상태 관리**: 전역 상태는 RTK Query, 로컬 상태는 useState 사용
