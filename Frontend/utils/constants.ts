export const APP_CONSTANTS = {
  BRANDING: {
    LOGO_TEXT: '헤이영',
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

