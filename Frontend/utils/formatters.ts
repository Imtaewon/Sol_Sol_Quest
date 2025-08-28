export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ko-KR').format(num);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
};

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

export const formatTimeAgo = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return '방금 전';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}개월 전`;
  return `${Math.floor(diffInSeconds / 31536000)}년 전`;
};

export const formatTier = (tier: string): string => {
  const tierMap: Record<string, string> = {
    'bronze': '브론즈',
    'silver': '실버',
    'gold': '골드',
    'platinum': '플래티넘',
    'diamond': '다이아몬드',
  };
  return tierMap[tier] || tier;
};

export const formatDifficulty = (difficulty: string): string => {
  const difficultyMap: Record<string, string> = {
    'easy': '쉬움',
    'medium': '보통',
    'hard': '어려움',
  };
  return difficultyMap[difficulty] || difficulty;
};

export const formatters = {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  formatDateTime,
  formatTimeAgo,
  formatTier,
  formatDifficulty,
};

