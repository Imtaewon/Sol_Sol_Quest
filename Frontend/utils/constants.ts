/**
 * constants.ts
 * 
 * 앱 전역에서 사용하는 상수 정의
 * 
 * 주요 기능:
 * - 앱 브랜딩 정보 정의
 * - 색상 팔레트 정의
 * - 간격 및 크기 상수 정의
 * - 탭 및 카테고리 정의
 * 
 * 포함된 상수들:
 * - APP_CONSTANTS: 앱 기본 정보 (브랜딩, 탭, 카테고리)
 * - COLORS: 색상 팔레트 (primary, secondary, gray 등)
 * - SPACING: 간격 상수 (xs, sm, md, lg, xl, xxl)
 * - FONT_SIZES: 폰트 크기 상수
 * - BORDER_RADIUS: 테두리 반경 상수
 * 
 * 사용 목적:
 * - 일관된 디자인 시스템 구축
 * - 테마 변경 시 중앙 집중식 관리
 * - 코드 재사용성 및 유지보수성 향상
 */

export const APP_CONSTANTS = {
  BRANDING: {
  // Use an image asset for the logo instead of plain text
  // path is relative to this file
  LOGO_IMAGE: require('../assets/heyoung_logo.png'),
    APP_NAME: '쏠쏠한 퀘스트',
  },
  TABS: ['Home', 'Assets', 'Quests', 'Leaderboard', 'MyPage'] as const,
  QUEST_CATEGORIES: ['성장퀘스트', '일상퀘스트', '돌발퀘스트'] as const,
  LEADERBOARD_MODES: ['총점', '평균'] as const,
  GENDER_OPTIONS: ['남', '여'] as const,
};

export const COLORS = {
  primary: '#4A90E2',
  secondary: '#F5A623',
  success: '#7ED321',
  error: '#D0021B',
  warning: '#F5A623',
  info: '#4A90E2',
  accent: '#FF6B6B',
  light: '#F8F9FA',
  dark: '#212529',
  white: '#FFFFFF',
  black: '#000000',
  background: '#F8F9FA',
  gray: {
    50: '#FAFAFA',
    100: '#F8F9FA',
    200: '#E9ECEF',
    300: '#DEE2E6',
    400: '#CED4DA',
    500: '#ADB5BD',
    600: '#6C757D',
    700: '#495057',
    800: '#343A40',
    900: '#212529',
  },
  green: {
    100: '#D4EDDA',
    500: '#28A745',
    700: '#1E7E34',
  },
  red: {
    100: '#F8D7DA',
    500: '#DC3545',
    700: '#C82333',
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
};

