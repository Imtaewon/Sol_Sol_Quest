/**
 * useQuests.ts
 * 
 * 퀘스트 관련 커스텀 훅들
 * 
 * 주요 기능:
 * - 퀘스트 목록 조회 및 캐싱
 * - 퀘스트 카테고리별 분류
 * - 퀘스트 수령 및 진행 상태 관리
 * - 추천 퀘스트 관리
 * 
 * 포함된 훅들:
 * - useRecommendedQuests: 추천 퀘스트 조회
 * - useGrowthQuestsInProgress: 성장 퀘스트 진행중 목록
 * - useAllGrowthQuests: 성장 퀘스트 전체 목록
 * - useDailyQuests: 일상 퀘스트 목록
 * - useSurpriseQuests: 돌발 퀘스트 목록
 * - useQuestHistory: 퀘스트 진행 내역 조회
 * - useClaimQuest: 퀘스트 수령 처리
 * 
 * 캐싱 전략:
 * - 추천 퀘스트: 1분 stale time, 3분 gc time (자주 변경)
 * - 일반 퀘스트: 2분 stale time, 5분 gc time
 * 
 * 상태 관리:
 * - 퀘스트 수령 시 관련 캐시 무효화
 * - 성공/실패 시 Toast 메시지 표시
 * - 자동 리페치를 통한 실시간 상태 업데이트
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questService, ClaimQuestRequest } from '../services/questService';
import Toast from 'react-native-toast-message';

// 추천 퀘스트 조회 훅
export const useRecommendedQuests = () => {
  return useQuery({
    queryKey: ['quests', 'recommended'],
    queryFn: () => questService.getRecommendedQuests(),
    staleTime: 1 * 60 * 1000, // 1분
    gcTime: 3 * 60 * 1000, // 3분
  });
};

// 성장 퀘스트 조회 훅 (진행중 최대 5개)
export const useGrowthQuestsInProgress = () => {
  return useQuery({
    queryKey: ['quests', 'growth', 'inProgress'],
    queryFn: () => questService.getGrowthQuestsInProgress(),
    staleTime: 1 * 60 * 1000, // 1분
    gcTime: 3 * 60 * 1000, // 3분
  });
};

// 성장 퀘스트 전체 조회 훅
export const useAllGrowthQuests = () => {
  return useQuery({
    queryKey: ['quests', 'growth', 'all'],
    queryFn: () => questService.getAllGrowthQuests(),
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 5 * 60 * 1000, // 5분
  });
};

// 일상 퀘스트 조회 훅
export const useDailyQuests = () => {
  return useQuery({
    queryKey: ['quests', 'daily'],
    queryFn: () => questService.getDailyQuests(),
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 5 * 60 * 1000, // 5분
  });
};

// 돌발 퀘스트 조회 훅
export const useSurpriseQuests = () => {
  return useQuery({
    queryKey: ['quests', 'surprise'],
    queryFn: () => questService.getSurpriseQuests(),
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 5 * 60 * 1000, // 5분
  });
};

// 퀘스트 진행 내역 조회 훅
export const useQuestHistory = (category: string) => {
  return useQuery({
    queryKey: ['quests', 'history', category],
    queryFn: () => questService.getQuestHistory(category),
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 5 * 60 * 1000, // 5분
  });
};

// 퀘스트 수령 훅
export const useClaimQuest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ClaimQuestRequest) => questService.claimQuest(data),
    onSuccess: (response) => {
      if (response.success) {
        // 관련 쿼리 무효화하여 리페치
        queryClient.invalidateQueries({ queryKey: ['quests', 'recommended'] });
        queryClient.invalidateQueries({ queryKey: ['quests', 'growth'] });
        queryClient.invalidateQueries({ queryKey: ['quests', 'history'] });
        queryClient.invalidateQueries({ queryKey: ['user'] });
        
        Toast.show({
          type: 'success',
          text1: '퀘스트 완료!',
          text2: '경험치를 획득했습니다.',
        });
      }
    },
    onError: (error) => {
      console.error('퀘스트 수령 실패:', error);
      Toast.show({
        type: 'error',
        text1: '퀘스트 수령 실패',
        text2: '다시 시도해주세요.',
      });
    },
  });
};
