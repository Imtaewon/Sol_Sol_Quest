/**
 * env.development.ts
 * 
 * 배포용 환경 설정 파일
 * 
 * 주요 설정:
 * - 배포 서버 URL
 * - 프로덕션 모드
 * - 로그 비활성화
 * - 오프라인 대체 데이터
 * - 네트워크 타임아웃 설정
 * 
 * 사용법:
 * - 실제 서비스 배포용 설정
 * - 모든 디버그 로그 비활성화
 * - 성능 최적화 적용
 */

/**
 * 배포용 설정 객체
 * 실제 서비스 운영에 사용
 */
export const developmentConfig = {
  // 배포 서버 URL
  API_BASE_URL: 'http://15.165.185.135',
  
  // 앱 기본 정보
  APP_NAME: 'SolQuest',
  APP_VERSION: '1.0.0',
  NODE_ENV: 'development',
  
  // 배포용 핵심 설정
  DEBUG_MODE: false,               // 배포용 디버그 비활성화
  LOG_LEVEL: 'none',               // 로그 완전 비활성화
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
