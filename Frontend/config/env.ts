import { developmentConfig } from './env.development';

// 환경변수 설정
interface Config {
  API_BASE_URL: string;
  APP_NAME: string;
  APP_VERSION: string;
  NODE_ENV: string;
  DEBUG_MODE: boolean;
  LOG_LEVEL: string;
  MOCK_API: boolean;
  // 해커톤 시연용 추가 설정
  DEMO_MODE?: boolean;
  OFFLINE_FALLBACK?: boolean;
  NETWORK_TIMEOUT?: number;
  SHOW_LOADING_INDICATORS?: boolean;
  ENABLE_ERROR_BOUNDARIES?: boolean;
  AUTO_REFRESH_INTERVAL?: number;
}

// 해커톤 시연용으로 개발 환경 설정만 사용
export const Config: Config = developmentConfig;
