import apiClient from './apiClient';
import { ApiResponse } from './apiClient';

// 백엔드 QuestListItem 구조에 맞춘 퀘스트 타입
export interface QuestListItem {
  id: number;
  type: string;
  title: string;
  verify_method: string;
  category: 'growth' | 'life' | 'surprise'; // 백엔드 카테고리: growth, life, surprise
  verify_params: any;
  reward_exp: number;
  target_count: number;
  period_scope: string;
  active: boolean;
  created_at?: string;
  lat?: number;
  lng?: number;
  
  // 사용자 진행 상태
  attempt_id?: number;
  user_status: 'DEACTIVE' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  progress_count: number;
  user_target_count: number;
  started_at?: string;
  submitted_at?: string;
  approved_at?: string;
}

// 프론트엔드에서 사용할 퀘스트 타입 (기존 호환성 유지)
export interface Quest {
  id: number;
  title: string;
  description: string;
  category: 'growth' | 'daily' | 'surprise';
  expReward: number;
  progress?: number;
  maxProgress?: number;
  isCompleted?: boolean;
  isClaimed?: boolean;
}

// 퀘스트 목록 응답 타입
export interface QuestListResponse {
  quests: QuestListItem[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
  };
}

// 새로운 추천 퀘스트 응답 타입
export interface RecommendedQuestsResponse {
  quest_ids: string[];
  message: string;
}

// 기존 추천 퀘스트 타입 (호환성을 위해 유지)
export interface RecommendedQuest {
  id: number;
  title: string;
  progress: number;
  maxProgress: number;
  expReward: number;
  isCompleted: boolean;
  isClaimed: boolean;
}

// 퀘스트 진행 내역 타입
export interface QuestHistory {
  id: number;
  title: string;
  category: 'growth' | 'daily' | 'surprise';
  progress: number;
  maxProgress: number;
  expReward: number;
  isCompleted: boolean;
  isClaimed: boolean;
}

// 퀘스트 수령 요청 타입
export interface ClaimQuestRequest {
  questId: number;
  expReward: number;
}

// 퀘스트 서비스
export const questService = {
  // 추천 퀘스트 조회 (새로운 응답 형식)
  getRecommendedQuests: async (): Promise<ApiResponse<RecommendedQuestsResponse>> => {
    console.log('🌐 questService.getRecommendedQuests HTTP 요청 시작');
    try {
      const response = await apiClient.get<ApiResponse<RecommendedQuestsResponse>>('/api/recommendations/quests');
      console.log('🌐 questService.getRecommendedQuests HTTP 요청 완료:', response.status);
      console.log('🌐 questService.getRecommendedQuests 응답 데이터:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('🌐 questService.getRecommendedQuests 에러:', error);
      throw error;
    }
  },

  // 전체 퀘스트 목록 조회 (하나의 API로 모든 퀘스트 가져오기)
  getAllQuests: async (): Promise<ApiResponse<QuestListResponse>> => {
    console.log('🌐 questService.getAllQuests HTTP 요청 시작');
    try {
      const response = await apiClient.get<ApiResponse<QuestListResponse>>('/api/v1/quests');
      console.log('🌐 questService.getAllQuests HTTP 요청 완료:', response.status);
      console.log('🌐 questService.getAllQuests 응답 데이터:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('🌐 questService.getAllQuests 에러:', error);
      throw error;
    }
  },

  // 퀘스트 수령
  claimQuest: async (data: ClaimQuestRequest): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/api/v1/quests/claim', data);
    return response.data;
  },
};

// 퀘스트 카테고리별 분류 함수
export const categorizeQuests = (quests: QuestListItem[]) => {
  const categorized = {
    growth: quests.filter(quest => quest.category === 'growth'),
    daily: quests.filter(quest => quest.category === 'life'), // 백엔드의 'life'를 프론트의 'daily'로 매핑
    surprise: quests.filter(quest => quest.category === 'surprise')
  };
  
  console.log('📊 퀘스트 카테고리별 분류 결과:', {
    growth: categorized.growth.length,
    daily: categorized.daily.length,
    surprise: categorized.surprise.length,
    total: quests.length
  });
  
  return categorized;
};

// 백엔드 QuestListItem을 프론트엔드 Quest로 변환하는 함수
export const convertQuestListItemToQuest = (questItem: QuestListItem): Quest => {
  return {
    id: questItem.id,
    title: questItem.title,
    description: questItem.title, // 백엔드에 description 필드가 없으므로 title 사용
    category: questItem.category === 'life' ? 'daily' : questItem.category as 'growth' | 'daily' | 'surprise',
    expReward: questItem.reward_exp,
    progress: questItem.progress_count,
    maxProgress: questItem.user_target_count,
    isCompleted: questItem.user_status === 'APPROVED',
    isClaimed: questItem.user_status === 'APPROVED'
  };
};
