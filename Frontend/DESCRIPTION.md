# SolQuest Frontend 프로젝트 파일 설명서

## 📁 프로젝트 구조 및 파일 설명

### 🏗️ **루트 레벨 파일들**

#### **설정 파일들**
- **`package.json`** - 프로젝트 의존성, 스크립트, 메타데이터 관리
  - 웹 빌드 스크립트: `npm run build:static`
  - 개발 서버: `npm run web`
  - 해커톤 시연용 스크립트들 포함

- **`app.json`** - Expo 앱 설정
  - PWA 설정 (Progressive Web App)
  - 앱 아이콘, 테마 색상, 디스플레이 모드
  - 웹에서 모바일 앱처럼 보이도록 설정

- **`tsconfig.json`** - TypeScript 컴파일러 설정
- **`babel.config.js`** - Babel 트랜스파일러 설정
- **`metro.config.js`** - Metro 번들러 설정
- **`eas.json`** - Expo Application Services 빌드 설정

#### **진입점 파일들**
- **`index.ts`** - 앱 진입점
- **`App.tsx`** - 메인 앱 컴포넌트
  - Redux Provider, Navigation Container 설정
  - 웹에서 모바일 뷰 강제하는 MobileContainer 포함

#### **문서 파일들**
- **`README.md`** - 프로젝트 전체 설명서
- **`.gitignore`** - Git에서 제외할 파일들 설정

---

### 📁 **config/** - 환경 설정

- **`env.development.ts`** - 해커톤 시연용 환경 설정
  - API 서버 URL: `http://15.165.185.135/api/v1`
  - 디버그 모드, 시연 모드, 네트워크 타임아웃 등
  - 테스트/개발/배포 모든 환경에서 사용

- **`env.ts`** - 메인 설정 파일
  - 개발 환경 설정을 직접 export
  - 단순화된 구조로 해커톤 시연에 최적화

---

### 📁 **store/** - 상태 관리 (Redux Toolkit)

#### **`index.ts`** - Redux 스토어 설정
- Redux store 생성 및 미들웨어 설정
- RTK Query API 미들웨어 통합

#### **`slices/`** - Redux 슬라이스
- **`authSlice.ts`** - 인증 상태 관리 (로그인/로그아웃)
- **`userSlice.ts`** - 사용자 정보 상태 관리

#### **`api/`** - RTK Query API 정의

- **`baseApi.ts`** - 기본 API 설정
  - 인증 관련: 로그인, 회원가입, 아이디 중복확인
  - 사용자 정보: 사용자 정보 조회
  - 결제 관련: 결제 내역 조회
  - 랭킹 관련: 내 학교 순위, 상위 학교 목록

- **`questApi.ts`** - 퀘스트 관련 API
  - 퀘스트 목록 조회, 상세 조회
  - 퀘스트 시작, 제출, 인증
  - 추천 퀘스트 조회

- **`savingApi.ts`** - 적금 관련 API
  - 개인정보 조회, 설문 문제 조회
  - 적금 가입 제출, 설문 응답 제출

- **`index.ts`** - API export 파일

---

### 📁 **components/** - 재사용 가능한 컴포넌트들

#### **`common/`** - 공통 컴포넌트
- **`AppHeader.tsx`** - 앱 헤더 (뒤로가기, 제목)
- **`PrimaryButton.tsx`** - 주요 액션 버튼
- **`Skeleton.tsx`** - 로딩 스켈레톤 UI
- **`LoadingSpinner.tsx`** - 로딩 스피너

#### **`auth/`** - 인증 관련 컴포넌트
- **`LoginForm.tsx`** - 로그인 폼
- **`SignupForm.tsx`** - 회원가입 폼

#### **`main/`** - 메인 페이지 컴포넌트
- **`AccountSection.tsx`** - 내 계좌 섹션
- **`SchoolRankingSection.tsx`** - 학교 랭킹 섹션
- **`RecommendedQuestsSection.tsx`** - 추천 퀘스트 섹션

#### **`quest/`** - 퀘스트 관련 컴포넌트
- **`QuestCard.tsx`** - 퀘스트 카드
- **`QuestProgress.tsx`** - 퀘스트 진행도
- **`QuestList.tsx`** - 퀘스트 목록

#### **`saving/`** - 적금 관련 컴포넌트
- **`SavingForm.tsx`** - 적금 가입 폼
- **`SurveyForm.tsx`** - 설문 폼

#### **`payment/`** - 결제 관련 컴포넌트
- **`PaymentHistory.tsx`** - 결제 내역
- **`QRPayment.tsx`** - QR 결제

---

### 📁 **screens/** - 화면 컴포넌트들

#### **인증 화면**
- **`auth/LoginScreen.tsx`** - 로그인 화면
- **`auth/SignupScreen.tsx`** - 회원가입 화면

#### **메인 화면**
- **`main/HomeScreen.tsx`** - 메인 홈 화면
- **`main/QuestListScreen.tsx`** - 퀘스트 목록 화면
- **`main/LeaderboardScreen.tsx`** - 리더보드 화면
- **`main/MyPageScreen.tsx`** - 마이페이지 화면

#### **적금 관련 화면**
- **`saving/SavingSignupScreen.tsx`** - 적금 가입 화면
- **`saving/DepositSignupScreen.tsx`** - 예금 가입 화면

#### **퀘스트 관련 화면**
- **`quest/QuestDetailScreen.tsx`** - 퀘스트 상세 화면
- **`quest/QuestProgressScreen.tsx`** - 퀘스트 진행 화면

#### **기타 화면**
- **`attendance/AttendanceScreen.tsx`** - 출석체크 화면
- **`gps/GpsStepScreen.tsx`** - GPS/만보기 화면
- **`payment/PaymentHistoryScreen.tsx`** - 결제 내역 화면

---

### 📁 **navigation/** - 네비게이션 설정

- **`AuthStack.tsx`** - 인증 관련 스택 네비게이션
- **`MainTabs.tsx`** - 메인 탭 네비게이션
- **`index.ts`** - 네비게이션 타입 정의

---

### 📁 **utils/** - 유틸리티 함수들

- **`constants.ts`** - 앱에서 사용하는 상수들
  - 색상, 간격, 폰트 크기, 테두리 반경 등
- **`formatters.ts`** - 데이터 포맷팅 함수들
  - 날짜, 통화, 숫자 포맷팅
- **`validators.ts`** - 입력값 검증 함수들
- **`helpers.ts`** - 기타 헬퍼 함수들

---

### 📁 **types/** - TypeScript 타입 정의

- **`database.ts`** - 데이터베이스 관련 타입
- **`saving.ts`** - 적금 관련 타입
- **`api.ts`** - API 응답 타입
- **`navigation.ts`** - 네비게이션 타입

---

### 📁 **services/** - 외부 서비스 연동

- **`api.ts`** - API 호출 함수들
- **`storage.ts`** - 로컬 스토리지 관리
- **`auth.ts`** - 인증 관련 서비스

---

### 📁 **hooks/** - 커스텀 훅들

- **`useAuth.ts`** - 인증 관련 훅
- **`useApi.ts`** - API 호출 관련 훅
- **`useStorage.ts`** - 스토리지 관련 훅

---

### 📁 **assets/** - 정적 자산들

- **`icon.png`** - 앱 아이콘
- **`favicon.png`** - 웹 파비콘
- **`images/`** - 이미지 파일들
- **`fonts/`** - 폰트 파일들

---

### 📁 **dist/** - 빌드된 웹 파일들

- **`index.html`** - 메인 HTML 파일
- **`_expo/`** - Expo 관련 정적 파일들
- **`assets/`** - 번들된 자산들

---

## 🚀 **해커톤 시연용 주요 특징**

### **웹 최적화**
- React Native Web으로 웹에서 모바일 앱처럼 동작
- PWA 설정으로 앱 설치 가능
- 모바일 뷰 강제 (375x812 크기)

### **API 연동**
- 해커톤 서버 (`15.165.185.135`)와 완벽 연동
- RTK Query로 효율적인 API 상태 관리
- 자동 캐싱 및 리페치 기능

### **시연 안정성**
- 디버그 모드 활성화 (문제 발생 시 확인용)
- 에러 바운더리 활성화
- 오프라인 대체 데이터 지원
- 20초 네트워크 타임아웃

### **사용자 경험**
- 로딩 인디케이터 표시
- 30초 자동 새로고침
- 시연 모드 활성화

---

## 📝 **시연 후 수정 사항**

시연이 끝난 후에는 다음 설정만 변경하면 됩니다:

```typescript
// config/env.development.ts
DEBUG_MODE: false,  // 디버그 모드 비활성화
```

---

## 🔧 **빌드 및 배포**

```bash
# 웹 빌드
npm run build:static

# 개발 서버 실행
npm run web

# 로컬 웹 서버 실행
npm run serve:web
```

빌드된 파일들은 `dist/` 폴더에 생성되며, 이를 서버에 업로드하여 배포할 수 있습니다.
