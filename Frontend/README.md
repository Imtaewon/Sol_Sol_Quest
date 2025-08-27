# SolQuest Frontend

React Native + Expo 기반의 적금과 퀘스트를 결합한 모바일 앱입니다.

## 📋 목차

- [🚀 시작하기](#-시작하기)
- [📁 프로젝트 구조](#-프로젝트-구조)
- [🔄 전체 파일 흐름](#-전체-파일-흐름)
- [🔌 백엔드 API 요구사항](#-백엔드-api-요구사항)
- [⚙️ 환경 설정](#️-환경-설정)
- [🛠️ 기술 스택](#️-기술-스택)
- [📝 개발 가이드](#-개발-가이드)

## 🚀 시작하기

### 필수 요구사항
- Node.js 18+
- npm 또는 yarn
- Expo CLI

### 설치 및 실행
```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm start

# iOS 시뮬레이터에서 실행
npm run ios

# Android 에뮬레이터에서 실행
npm run android
```

## 📁 프로젝트 구조

```
Sol_Sol_Quest/Frontend/
├── App.tsx                    # 앱 메인 진입점
├── package.json               # 의존성 및 스크립트
├── components/                # 재사용 가능한 컴포넌트
│   └── common/               # 공통 컴포넌트
│       ├── AppHeader.tsx     # 앱 헤더
│       ├── PrimaryButton.tsx # 기본 버튼
│       ├── FormTextInput.tsx # 폼 입력 필드
│       ├── ModalBase.tsx     # 모달 베이스
│       ├── LoadingView.tsx   # 로딩 화면
│       ├── ErrorView.tsx     # 에러 화면
│       ├── EmptyView.tsx     # 빈 상태 화면
│       ├── Skeleton.tsx      # 스켈레톤 로딩
│       └── BottomTabBar.tsx  # 하단 탭바
├── screens/                  # 화면 컴포넌트
│   ├── auth/                # 인증 관련 화면
│   │   ├── LandingScreen.tsx    # 랜딩 페이지
│   │   ├── LoginScreen.tsx      # 로그인 화면
│   │   └── SignupScreen.tsx     # 회원가입 화면
│   ├── home/                # 홈 관련 화면
│   │   └── HomeScreen.tsx       # 메인 홈 화면
│   ├── mypage/              # 마이페이지 관련 화면
│   │   ├── MyPageScreen.tsx     # 마이페이지 메인
│   │   ├── AttendanceScreen.tsx # 출석체크 화면
│   │   └── GPSScreen.tsx        # GPS/만보기 화면
│   ├── quests/              # 퀘스트 관련 화면
│   │   ├── QuestsScreen.tsx     # 퀘스트 목록
│   │   ├── QuestDetailScreen.tsx # 퀘스트 상세
│   │   └── QuestTrackerScreen.tsx # 퀘스트 추적
│   ├── leaderboard/         # 리더보드 관련 화면
│   │   └── LeaderboardScreen.tsx # 학교 랭킹
│   ├── assets/              # 자산 관련 화면
│   │   └── AssetsScreen.tsx     # 자산 관리
│   ├── signup/              # 가입 관련 화면
│   │   ├── SavingOpenScreen.tsx # 적금 가입
│   │   ├── DepositOpenScreen.tsx # 예금 가입
│   │   └── TestScreen.tsx       # 테스트 화면
│   └── payment/             # 결제 관련 화면
│       ├── PaymentScreen.tsx    # 결제 메인
│       ├── QRPayScreen.tsx      # QR 결제
│       ├── QRGeneratorScreen.tsx # QR 생성
│       └── PaymentHistoryScreen.tsx # 결제 내역
├── navigation/              # 네비게이션 설정
│   ├── AuthStack.tsx        # 인증 스택
│   ├── HomeStack.tsx        # 홈 스택
│   ├── MyPageStack.tsx      # 마이페이지 스택
│   ├── AssetsStack.tsx      # 자산 스택
│   ├── PaymentStack.tsx     # 결제 스택
│   └── MainTabs.tsx         # 메인 탭 네비게이션
├── services/                # API 서비스
│   ├── apiClient.ts         # Axios 클라이언트
│   ├── authService.ts       # 인증 서비스
│   ├── userService.ts       # 사용자 서비스
│   ├── questService.ts      # 퀘스트 서비스
│   ├── rankService.ts       # 랭킹 서비스
│   └── savingService.ts     # 적금 서비스
├── hooks/                   # 커스텀 훅
│   ├── useAuth.ts           # 인증 관련 훅
│   ├── useUser.ts           # 사용자 정보 훅
│   ├── useQuests.ts         # 퀘스트 관련 훅
│   └── useRanks.ts          # 랭킹 관련 훅
├── store/                   # Redux 스토어
│   ├── index.ts             # 스토어 설정
│   ├── slices/              # Redux 슬라이스
│   │   ├── authSlice.ts     # 인증 상태
│   │   └── userSlice.ts     # 사용자 상태
│   └── api/                 # RTK Query API
│       ├── baseApi.ts       # 기본 API 설정
│       ├── authApi.ts       # 인증 API
│       ├── questApi.ts      # 퀘스트 API
│       ├── userApi.ts       # 사용자 API
│       ├── savingApi.ts     # 적금 API
│       └── index.ts         # API 인덱스
├── types/                   # TypeScript 타입 정의
│   ├── database.ts          # 데이터베이스 타입
│   └── saving.ts            # 적금 관련 타입
├── utils/                   # 유틸리티 함수
│   ├── constants.ts         # 앱 상수
│   ├── formatters.ts        # 포맷터 함수
│   └── validators.ts        # 폼 유효성 검사
└── config/                  # 환경 설정
    └── env.development.ts   # 개발 환경 설정
```

## 🔄 전체 파일 흐름

### 1. 앱 시작 흐름
```
App.tsx → 인증 상태 확인 → AuthStack 또는 MainTabs
```

### 2. 인증 플로우
```
LandingScreen → LoginScreen/SignupScreen → HomeScreen
```

### 3. 메인 앱 플로우
```
MainTabs (Home, Assets, Quests, Leaderboard, MyPage)
├── HomeStack: HomeScreen
├── AssetsStack: AssetsScreen → SavingOpenScreen/DepositOpenScreen
├── QuestsStack: QuestsScreen → QuestDetailScreen
├── LeaderboardStack: LeaderboardScreen
└── MyPageStack: MyPageScreen → AttendanceScreen/GPSScreen
```

### 4. 데이터 흐름
```
API 호출 → RTK Query → Redux Store → React Component
```

### 5. 상태 관리 흐름
```
Redux (전역 상태) + React Query (서버 상태) + Local State (컴포넌트 상태)
```

## 🔌 백엔드 API 요구사항

### 인증 관련 API

#### 1. 로그인 API
```
POST /api/auth/login
Request: { login_id: string, password: string }
Response: { 
  success: boolean, 
  data: { 
    access_token: string, 
    user: User 
  } 
}
```

#### 2. 회원가입 API
```
POST /api/members/signup
Request: {
  name: string,
  gender: '남' | '여' | '기타',
  birthYear: number,
  username: string,
  password: string,
  email: string,
  school: string,
  department: string,
  grade: number
}
Response: { 
  success: boolean, 
  data: { 
    access_token: string, 
    user: User 
  } 
}
```

#### 3. 아이디 중복 확인 API
```
GET /api/members/check-username?username={username}
Response: { available: boolean }
```

### 사용자 정보 관련 API

#### 4. 사용자 정보 조회 API
```
GET /api/user/info
Response: {
  success: boolean,
  data: {
    id: string,
    name: string,
    school: string,
    department: string,
    grade: number,
    tier: string,
    total_exp: number,
    interest_rate: number,
    has_savings: boolean
  }
}
```

#### 5. 계좌 정보 조회 API
```
GET /api/user/accounts
Response: {
  success: boolean,
  data: {
    savings_accounts: SavingAccount[],
    deposit_accounts: DepositAccount[]
  }
}
```

#### 6. 개인정보 조회 API (적금용)
```
GET /api/saving/personal-info
Response: {
  success: boolean,
  data: {
    name: string,
    birthYear: string,
    school: string,
    department: string,
    grade: number
  }
}
```

#### 7. 개인정보 조회 API (예금용)
```
GET /api/deposit/personal-info
Response: {
  success: boolean,
  data: {
    name: string,
    phone: string,
    email: string
  }
}
```

### 퀘스트 관련 API

#### 8. 퀘스트 목록 조회 API
```
GET /api/quests?type={type}&category={category}
Response: {
  success: boolean,
  data: QuestWithAttempt[]
}
```

#### 9. 퀘스트 상세 조회 API
```
GET /api/quests/{questId}
Response: {
  success: boolean,
  data: QuestWithAttempt
}
```

#### 10. 퀘스트 시작 API
```
POST /api/quests/start
Request: { quest_id: string }
Response: { success: boolean, data: QuestAttempt }
```

#### 11. 퀘스트 제출 API
```
POST /api/quests/submit
Request: { quest_id: string, verify_data: any }
Response: { success: boolean, data: QuestAttempt }
```

#### 12. 퀘스트 검증 API
```
POST /api/quests/verify
Request: { quest_id: string, verify_data: any }
Response: { success: boolean, data: QuestAttempt }
```

#### 13. 추천 퀘스트 조회 API
```
GET /api/quests/recommended
Response: {
  success: boolean,
  data: {
    quests: QuestWithAttempt[],
    user_progress: number
  }
}
```

#### 14. 퀘스트 수령 API
```
POST /api/quests/claim
Request: { quest_id: string, exp_amount: number }
Response: { success: boolean, data: { exp_gained: number } }
```

### 랭킹 관련 API

#### 15. 내 학교 랭킹 조회 API (비가입자)
```
GET /api/ranks/my-school
Response: {
  success: boolean,
  data: {
    rank: number,
    school_name: string,
    total_exp: number,
    avg_exp: number,
    member_count: number
  }
}
```

#### 16. 내 학교 랭킹 조회 API (가입자)
```
GET /api/ranks/my-school-with-user
Response: {
  success: boolean,
  data: {
    rank: number,
    school_name: string,
    total_exp: number,
    avg_exp: number,
    member_count: number,
    my_exp: number
  }
}
```

#### 17. 상위 10개 학교 조회 API (총점 기준)
```
GET /api/ranks/top-schools/total
Response: {
  success: boolean,
  data: {
    schools: {
      rank: number,
      school_name: string,
      total_exp: number
    }[]
  }
}
```

#### 18. 상위 10개 학교 조회 API (평균 기준)
```
GET /api/ranks/top-schools/average
Response: {
  success: boolean,
  data: {
    schools: {
      rank: number,
      school_name: string,
      avg_exp: number,
      member_count: number
    }[]
  }
}
```

### 적금 관련 API

#### 19. 적금 가입 제출 API
```
POST /api/saving/signup
Request: {
  monthlyAmount: number,
  accountNumber: string,
  surveyResponses: SurveyResponse[]
}
Response: { success: boolean, data: { account_id: string } }
```

#### 20. 설문 문제 조회 API
```
GET /api/saving/survey/{questionNumber}
Response: {
  success: boolean,
  data: {
    id: number,
    question: string,
    type: 'multiple_choice' | 'text' | 'number',
    options?: string[]
  }
}
```

#### 21. 설문 응답 제출 API
```
POST /api/saving/survey-responses
Request: SurveyResponse[]
Response: { success: boolean }
```

### 예금 관련 API

#### 22. 예금 가입 API
```
POST /api/deposit/signup
Request: {
  name: string,
  phone: string,
  email: string
}
Response: { success: boolean, data: { account_id: string } }
```

### 출석 관련 API

#### 23. 출석 내역 조회 API
```
GET /api/attendance/{year}/{month}
Response: {
  success: boolean,
  data: {
    attendance_dates: string[],
    total_days: number,
    attended_days: number
  }
}
```

#### 24. 출석하기 API
```
POST /api/attendance/check-in
Request: { date: string }
Response: { success: boolean, data: { exp_gained: number } }
```

### 공통 응답 형식

모든 API는 다음 형식을 따릅니다:

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
```

### 에러 처리

- **400**: 잘못된 요청 (잘못된 파라미터, 유효성 검사 실패)
- **401**: 인증 실패 (토큰 없음, 토큰 만료)
- **403**: 권한 없음 (적금 미가입자 접근 제한)
- **404**: 리소스 없음
- **500**: 서버 내부 오류

## ⚙️ 환경 설정

### 환경변수 설정
```typescript
// config/env.development.ts
export const developmentConfig = {
  API_BASE_URL: 'http://localhost:8000/api/v1',
  APP_NAME: 'SolQuest',
  DEBUG_MODE: true,
  LOG_LEVEL: 'debug'
};
```

## 🛠️ 기술 스택

- **Framework**: React Native + Expo
- **Language**: TypeScript
- **State Management**: Redux Toolkit + React Query
- **Navigation**: React Navigation v7
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form + Zod
- **Storage**: AsyncStorage
- **UI Icons**: Expo Vector Icons
- **Toast**: React Native Toast Message

## 📝 개발 가이드

### 새로운 화면 추가
1. `screens/` 폴더에 화면 컴포넌트 생성
2. `navigation/` 폴더에 네비게이션 스택 추가
3. `types/` 폴더에 필요한 타입 정의
4. `services/` 폴더에 API 서비스 추가
5. `hooks/` 폴더에 커스텀 훅 추가

### API 호출 예시
```typescript
import { useLogin } from '../hooks/useAuth';

const loginMutation = useLogin();
const result = await loginMutation.mutateAsync({
  login_id: 'username',
  password: 'password'
});
```

### 상태 관리 예시
```typescript
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';

const user = useSelector((state: RootState) => state.user.user);
const dispatch = useDispatch();
```

## 🚀 배포

### Android 빌드
```bash
npm run build:android
```

### iOS 빌드
```bash
npm run build:ios
```

## 📞 지원

문제가 발생하면 이슈를 등록해주세요.
