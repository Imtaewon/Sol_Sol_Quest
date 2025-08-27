# SolSolQuest Frontend

React Native 기반의 쏠쏠한 퀘스트 앱입니다.

## 🚀 시작하기

### 필수 요구사항
- Node.js 18+
- npm 또는 yarn
- React Native CLI 또는 Expo CLI

### 설치
```bash
npm install
# 또는
yarn install
```

### 실행
```bash
# 개발 서버 시작
npm start
# 또는
yarn start

# iOS 시뮬레이터에서 실행
npm run ios
# 또는
yarn ios

# Android 에뮬레이터에서 실행
npm run android
# 또는
yarn android
```

## ⚙️ 환경 설정

### 환경변수 설정

앱은 환경별로 다른 설정을 사용합니다:

#### 개발 환경 (Development)
- **API URL**: `http://localhost:8000/api/v1`
- **설정 파일**: `config/env.development.ts`
- **디버그 모드**: 활성화
- **로그 레벨**: debug

#### 스테이징 환경 (Staging)
- **API URL**: `https://staging-api.solsolquest.com/api/v1`
- **설정 파일**: `config/env.staging.ts`
- **디버그 모드**: 활성화
- **로그 레벨**: info

#### 프로덕션 환경 (Production)
- **API URL**: `https://api.solsolquest.com/api/v1`
- **설정 파일**: `config/env.production.ts`
- **디버그 모드**: 비활성화
- **로그 레벨**: error

### 환경 변경 방법

1. **개발 환경에서 실행** (기본값)
   ```bash
   npm start
   ```

2. **프로덕션 빌드**
   ```bash
   npm run build:production
   ```

3. **환경변수 직접 설정**
   ```bash
   NODE_ENV=staging npm start
   ```

### 백엔드 개발자를 위한 설정

백엔드 개발자가 로컬에서 개발할 때는 다음 설정을 사용합니다:

```typescript
// config/env.development.ts
export const developmentConfig = {
  API_BASE_URL: 'http://localhost:8000/api/v1', // 백엔드 로컬 서버
  // ... 기타 설정
};
```

백엔드 서버가 다른 포트에서 실행되는 경우, 해당 포트로 변경하세요:

```typescript
API_BASE_URL: 'http://localhost:3000/api/v1', // 예: 3000번 포트
```

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
├── screens/            # 화면 컴포넌트
├── navigation/         # 네비게이션 설정
├── services/           # API 서비스
├── hooks/              # 커스텀 훅
├── utils/              # 유틸리티 함수
├── config/             # 환경 설정
│   ├── env.ts          # 메인 환경 설정
│   ├── env.development.ts
│   ├── env.staging.ts
│   └── env.production.ts
└── types/              # TypeScript 타입 정의
```

## 🔧 주요 기능

- ✅ 사용자 인증 (로그인/회원가입)
- ✅ 퀘스트 시스템
- ✅ 대학 랭킹
- ✅ 계좌 관리 (입출금/적금)
- ✅ 출석 체크
- ✅ 환경별 설정 관리

## 🛠️ 기술 스택

- **Framework**: React Native + Expo
- **Language**: TypeScript
- **State Management**: Redux Toolkit + React Query
- **Navigation**: React Navigation
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form + Zod
- **Storage**: AsyncStorage

## 📝 개발 가이드

### API 호출 예시
```typescript
import { authService } from '../services/authService';

// 로그인
const result = await authService.login({
  login_id: 'username',
  password: 'password'
});
```

### 환경변수 사용 예시
```typescript
import { Config } from '../config/env';

console.log('API URL:', Config.API_BASE_URL);
console.log('App Name:', Config.APP_NAME);
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
