import apiClient from './apiClient';
import { ApiResponse } from './apiClient';

// 퀘스트 타입
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

  // 성장 퀘스트 조회 (진행중 최대 5개)
  getGrowthQuestsInProgress: async (): Promise<ApiResponse<Quest[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<Quest[]>>('/api/v1/quests?category=growth&status=in-progress');
      console.log('🌐 questService.getGrowthQuestsInProgress 응답 데이터:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('🌐 questService.getGrowthQuestsInProgress 에러:', error);
      throw error;
    }
  },

  // 성장 퀘스트 전체 조회
  getAllGrowthQuests: async (): Promise<ApiResponse<Quest[]>> => {
    const response = await apiClient.get<ApiResponse<Quest[]>>('/api/v1/quests?category=growth');
    return response.data;
  },

  // 일상 퀘스트 조회
  getDailyQuests: async (): Promise<ApiResponse<Quest[]>> => {
    console.log('🌐 questService.getDailyQuests HTTP 요청 시작');
    try {
      const response = await apiClient.get<ApiResponse<Quest[]>>('/api/v1/quests?category=daily');
      console.log('🌐 questService.getDailyQuests HTTP 요청 완료:', response.status);
      console.log('🌐 questService.getDailyQuests 응답 데이터:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('🌐 questService.getDailyQuests 에러:', error);
      throw error;
    }
  },

  // 돌발 퀘스트 조회
  getSurpriseQuests: async (): Promise<ApiResponse<Quest[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<Quest[]>>('/api/v1/quests?category=surprise');
      console.log('🌐 questService.getSurpriseQuests 응답 데이터:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('🌐 questService.getSurpriseQuests 에러:', error);
      throw error;
    }
  },

  // 퀘스트 진행 내역 조회
  getQuestHistory: async (category: string): Promise<ApiResponse<QuestHistory[]>> => {
    const response = await apiClient.get<ApiResponse<QuestHistory[]>>(`/api/v1/quests?category=${category}&status=completed`);
    return response.data;
  },

  // 퀘스트 수령
  claimQuest: async (data: ClaimQuestRequest): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/api/v1/quests/claim', data);
    return response.data;
  },
};
