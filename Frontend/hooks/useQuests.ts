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
