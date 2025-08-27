/**
 * env.development.ts
 * 
 * 개발 환경 설정 파일
 * 
 * 주요 설정:
 * - API 서버 URL
 * - 앱 정보 (이름, 버전)
 * - 개발 환경 플래그
 * - 디버그 모드 설정
 * - 로그 레벨 설정
 * 
 * 사용법:
 * - 개발 서버에서 실행 시 이 설정이 적용됨
 * - 프로덕션 빌드 시에는 env.production.ts 사용
 */

/**
 * 개발 환경 설정 객체
 * 개발 중에 사용되는 모든 설정값들을 정의
 */
export const developmentConfig = {
  // API 서버 기본 URL (서버 담당자가 제공한 IP)
  API_BASE_URL: 'http://15.165.185.135/api/v1',
  
  // 앱 기본 정보
  APP_NAME: 'SolSolQuest (Dev)',  // 개발용 앱 이름
  APP_VERSION: '1.0.0',           // 앱 버전
  NODE_ENV: 'development',        // Node.js 환경
  
  // 개발 환경 특별 설정
  DEBUG_MODE: true,               // 디버그 모드 활성화
  LOG_LEVEL: 'debug',             // 로그 레벨 (debug/info/warn/error)
  MOCK_API: false,                // 실제 API 사용 (false: 실제 서버, true: 목업 데이터)
};
