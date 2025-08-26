# SolQuest - React Native 앱

적금과 함께하는 재미있는 퀘스트 앱입니다.

## 주요 변경사항

### 1. API 연동 완료
- 모든 더미 데이터를 실제 API 연동으로 교체
- React Query를 사용한 상태 관리
- Axios 기반 API 클라이언트 구성

### 2. 새로운 기술 스택
- **@tanstack/react-query**: 서버 상태 관리
- **@react-native-async-storage/async-storage**: 토큰 저장
- **axios**: HTTP 클라이언트
- **react-native-toast-message**: 토스트 알림

### 3. 화면별 구현 완료
- **랜딩**: 로그인/회원가입 버튼
- **로그인**: 아이디/비밀번호 입력, 토큰 저장
- **회원가입**: 개인정보 입력, API 연동
- **메인**: 계좌 정보, 랭킹, 추천 퀘스트
- **적금 가입**: 개인정보 표시, 설문 연동
- **예금 가입**: 간단한 개설 프로세스
- **출석**: 달력 표시, 출석 체크 API
- **GPS·만보기**: 위치 권한, 만보기 UI
- **QR 결제**: QR 스캔/생성 UI

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 앱 실행
```bash
# Android
npm run android

# iOS
npm run ios

# 개발 서버
npm start
```

## 프로젝트 구조

```
SolQuest/
├── components/
│   ├── common/          # 공용 컴포넌트
│   │   ├── LoadingView.tsx
│   │   ├── ErrorView.tsx
│   │   ├── EmptyView.tsx
│   │   ├── PrimaryButton.tsx
│   │   ├── FormTextInput.tsx
│   │   ├── AppHeader.tsx
│   │   ├── ModalBase.tsx
│   │   ├── Skeleton.tsx
│   │   └── BottomTabBar.tsx
│   └── payment/         # 결제 관련 컴포넌트
│       └── QRScanner.tsx
├── hooks/               # React Query 훅
│   ├── useAuth.ts
│   ├── useUser.ts
│   ├── useRanks.ts
│   ├── useQuests.ts
│   ├── useAttendance.ts
│   ├── useSaving.ts
│   └── useDeposit.ts
├── services/            # API 서비스
│   ├── apiClient.ts     # Axios 인스턴스
│   ├── authService.ts
│   ├── userService.ts
│   ├── rankService.ts
│   ├── questService.ts
│   ├── attendanceService.ts
│   ├── savingService.ts
│   ├── depositService.ts
│   ├── locationService.ts
│   ├── stepCounterService.ts
│   ├── schools.ts
│   └── emailVerify.ts
├── screens/             # 화면 컴포넌트
│   ├── auth/           # 인증 화면
│   │   ├── LandingScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   └── SignupScreen.tsx
│   ├── home/           # 메인 화면
│   │   └── HomeScreen.tsx
│   ├── mypage/         # 마이페이지
│   │   ├── MyPageScreen.tsx
│   │   ├── AttendanceScreen.tsx
│   │   └── GPSScreen.tsx
│   ├── payment/        # 결제 화면
│   │   ├── PaymentScreen.tsx
│   │   ├── PaymentHistoryScreen.tsx
│   │   ├── QRPayScreen.tsx
│   │   └── QRGeneratorScreen.tsx
│   ├── quests/         # 퀘스트 화면
│   │   ├── QuestsScreen.tsx
│   │   ├── QuestDetailScreen.tsx
│   │   └── QuestTrackerScreen.tsx
│   ├── signup/         # 가입 화면
│   │   ├── SavingOpenScreen.tsx
│   │   ├── SavingsSignupScreen.tsx
│   │   ├── SavingsBasicInfoScreen.tsx
│   │   ├── SavingsTestScreen.tsx
│   │   ├── DepositOpenScreen.tsx
│   │   ├── DepositSignupScreen.tsx
│   │   ├── DepositNewSignupScreen.tsx
│   │   ├── DepositRegisterScreen.tsx
│   │   └── TestScreen.tsx
│   ├── assets/         # 자산 화면
│   │   └── AssetsScreen.tsx
│   └── leaderboard/    # 랭킹 화면
│       └── LeaderboardScreen.tsx
├── navigation/          # 네비게이션
│   ├── AuthStack.tsx
│   ├── MainTabs.tsx
│   ├── HomeStack.tsx
│   ├── MyPageStack.tsx
│   ├── PaymentStack.tsx
│   └── AssetsStack.tsx
├── store/              # Redux 상태 관리
│   ├── index.ts
│   ├── slices/
│   │   ├── authSlice.ts
│   │   └── userSlice.ts
│   └── api/
│       ├── baseApi.ts
│       ├── authApi.ts
│       ├── userApi.ts
│       ├── questApi.ts
│       ├── rankService.ts
│       ├── paymentApi.ts
│       ├── surveyApi.ts
│       ├── accountApi.ts
│       └── leaderboardApi.ts
├── utils/              # 유틸리티
│   ├── constants.ts
│   ├── formatters.ts
│   └── validators.ts
├── types/              # 타입 정의
│   └── database.ts
├── assets/             # 에셋
│   ├── icon.png
│   ├── splash-icon.png
│   ├── adaptive-icon.png
│   └── favicon.png
├── App.tsx             # 메인 앱 컴포넌트
├── index.ts            # 앱 시작점
├── package.json        # 프로젝트 설정
├── tsconfig.json       # TypeScript 설정
├── app.json           # Expo 설정
├── eas.json           # EAS 빌드 설정
├── metro.config.js    # Metro 번들러 설정
├── babel.config.js    # Babel 설정
└── .gitignore         # Git 무시 파일
```

## 주요 기능

### 1. 인증 시스템
- 로그인/회원가입 API 연동
- 토큰 자동 저장/삭제
- 401 에러 시 자동 로그아웃

### 2. 상태 관리
- React Query로 서버 상태 관리
- Redux로 클라이언트 상태 관리
- 캐싱 및 자동 리페치

### 3. 네비게이션
- Stack Navigator 기반 화면 전환
- Bottom Tab Navigator로 메인 탭 구성
- 적금 가입 여부에 따른 조건부 라우팅
- 접근성 지원

### 4. API 연동
- 모든 화면에서 실제 API 호출
- 에러 처리 및 로딩 상태 표시
- 토스트 메시지로 사용자 피드백

## 개발 가이드

### 1. 새로운 API 추가
1. `services/` 폴더에 서비스 파일 생성
2. `hooks/` 폴더에 React Query 훅 생성
3. 화면에서 훅 사용

### 2. 새로운 화면 추가
1. `screens/` 폴더에 화면 컴포넌트 생성
2. 네비게이션 스택에 화면 추가
3. 타입 정의 업데이트

### 3. 공용 컴포넌트 사용
- `LoadingView`: 로딩 상태 표시
- `ErrorView`: 에러 상태 표시 (재시도 버튼 포함)
- `EmptyView`: 빈 상태 표시
- `PrimaryButton`: 기본 버튼 컴포넌트
- `FormTextInput`: 폼 입력 컴포넌트
- `AppHeader`: 앱 헤더 컴포넌트

## 환경 설정

### 개발 환경
- Node.js 18+
- React Native 0.79+
- Expo SDK 53

## 주의사항

1. **토큰 보안**: 민감한 정보는 콘솔에 출력하지 않음
2. **에러 처리**: 모든 API 호출에 적절한 에러 처리 구현
3. **접근성**: 모든 버튼에 accessibilityRole/accessibilityLabel 추가
4. **성능**: React Query 캐싱을 활용한 최적화

## API 엔드포인트

### 인증
- `POST /auth/login`: 로그인
- `POST /auth/signup`: 회원가입
- `POST /auth/logout`: 로그아웃

### 사용자
- `GET /user/info`: 사용자 정보
- `GET /user/account`: 계좌 정보
- `GET /user/personal-info/saving`: 적금 가입용 개인정보
- `GET /user/personal-info/deposit`: 예금 가입용 개인정보

### 랭킹
- `GET /ranks/my-school`: 내 학교 랭킹 (비가입자)
- `GET /ranks/my-school-with-user`: 내 학교 랭킹 (가입자)
- `GET /ranks/top-schools/total`: 상위 학교 (총점)
- `GET /ranks/top-schools/average`: 상위 학교 (평균)

### 퀘스트
- `GET /quests/recommended`: 추천 퀘스트
- `GET /quests/growth/in-progress`: 성장 퀘스트 (진행중)
- `GET /quests/growth/all`: 성장 퀘스트 (전체)
- `POST /quests/claim`: 퀘스트 수령

### 출석
- `GET /attendance/{year}/{month}`: 출석 데이터
- `POST /attendance/check`: 출석 체크

### 적금/예금
- `GET /saving/survey/{questionNumber}`: 설문 문항
- `POST /saving/signup`: 적금 가입
- `POST /deposit/signup`: 예금 가입
