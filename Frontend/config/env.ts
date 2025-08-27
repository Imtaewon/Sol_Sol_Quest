import { developmentConfig } from './env.development';
import { stagingConfig } from './env.staging';
import { productionConfig } from './env.production';

// 환경변수 설정
interface Config {
  API_BASE_URL: string;
  APP_NAME: string;
  APP_VERSION: string;
  NODE_ENV: string;
  DEBUG_MODE: boolean;
  LOG_LEVEL: string;
  MOCK_API: boolean;
}

// 환경별 설정
const configs: Record<string, Config> = {
  development: developmentConfig,
  staging: stagingConfig,
  production: productionConfig,
};

// 현재 환경 가져오기
const getCurrentEnvironment = (): string => {
  // React Native에서는 __DEV__ 사용 (타입 단언으로 해결)
  if ((global as any).__DEV__) return 'development';
  
  // 환경변수에서 가져오기 (빌드 시 설정)
  return (process.env as any).NODE_ENV || 'development';
};

// 최종 설정 생성
const createConfig = (): Config => {
  const env = getCurrentEnvironment();
  return configs[env] || configs.development;
};

export const Config = createConfig();
