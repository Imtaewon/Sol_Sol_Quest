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

// 추천 퀘스트 타입
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
  // 추천 퀘스트 조회
  getRecommendedQuests: async (): Promise<ApiResponse<RecommendedQuest[]>> => {
    const response = await apiClient.get<ApiResponse<RecommendedQuest[]>>('/quests/recommended');
    return response.data;
  },

  // 성장 퀘스트 조회 (진행중 최대 5개)
  getGrowthQuestsInProgress: async (): Promise<ApiResponse<Quest[]>> => {
    const response = await apiClient.get<ApiResponse<Quest[]>>('/quests/growth/in-progress');
    return response.data;
  },

  // 성장 퀘스트 전체 조회
  getAllGrowthQuests: async (): Promise<ApiResponse<Quest[]>> => {
    const response = await apiClient.get<ApiResponse<Quest[]>>('/quests/growth/all');
    return response.data;
  },

  // 일상 퀘스트 조회
  getDailyQuests: async (): Promise<ApiResponse<Quest[]>> => {
    const response = await apiClient.get<ApiResponse<Quest[]>>('/quests/daily');
    return response.data;
  },

  // 돌발 퀘스트 조회
  getSurpriseQuests: async (): Promise<ApiResponse<Quest[]>> => {
    const response = await apiClient.get<ApiResponse<Quest[]>>('/quests/surprise');
    return response.data;
  },

  // 퀘스트 진행 내역 조회
  getQuestHistory: async (category: string): Promise<ApiResponse<QuestHistory[]>> => {
    const response = await apiClient.get<ApiResponse<QuestHistory[]>>(`/quests/history/${category}`);
    return response.data;
  },

  // 퀘스트 수령
  claimQuest: async (data: ClaimQuestRequest): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/quests/claim', data);
    return response.data;
  },
};
