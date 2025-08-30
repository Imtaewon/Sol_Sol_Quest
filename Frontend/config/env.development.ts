/**
 * env.development.ts
 * 
 * 해커톤 시연용 환경 설정 파일
 * 
 * 주요 설정:
 * - 해커톤 서버 URL
 * - 시연 모드 활성화
 * - 디버그 모드 (시연용)
 * - 오프라인 대체 데이터
 * - 네트워크 타임아웃 설정
 * 
 * 사용법:
 * - 해커톤 시연 시 이 설정이 적용됨
 * - 시연 후 DEBUG_MODE만 false로 변경하면 됨
 * - 테스트, 개발, 배포 모두 이 설정 사용
 */

/**
 * 해커톤 시연용 설정 객체
 * 테스트, 개발, 배포 모든 환경에서 사용
 */
export const developmentConfig = {
  // 해커톤 서버 URL (실제 배포 시 사용할 서버)
  API_BASE_URL: 'http://15.165.185.135',
  
  // 앱 기본 정보
  APP_NAME: 'SolQuest',
  APP_VERSION: '1.0.0',
  NODE_ENV: 'development',
  
  // 해커톤 시연용 핵심 설정
  DEBUG_MODE: false,               // 배포용 디버그 비활성화
  LOG_LEVEL: 'error',              // 에러 로그만 (배포용)
  MOCK_API: false,                 // 실제 API 사용
  
  // 배포용 특별 설정
  DEMO_MODE: false,                // 배포 모드 비활성화
  OFFLINE_FALLBACK: true,          // 오프라인 시 대체 데이터 사용
  NETWORK_TIMEOUT: 15000,          // 네트워크 타임아웃 (15초 - 배포용)
  
  // 배포용 추가 설정
  SHOW_LOADING_INDICATORS: true,   // 로딩 인디케이터 표시
  ENABLE_ERROR_BOUNDARIES: true,   // 에러 바운더리 활성화
  AUTO_REFRESH_INTERVAL: 60000,    // 자동 새로고침 간격 (60초 - 배포용)
};
