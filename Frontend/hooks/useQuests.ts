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
import { questService, ClaimQuestRequest, categorizeQuests, convertQuestListItemToQuest } from '../services/questService';
import Toast from 'react-native-toast-message';

// 추천 퀘스트 조회 훅
export const useRecommendedQuests = (hasSavings: boolean = false) => {
  console.log('🔍 useRecommendedQuests 훅 호출됨, hasSavings:', hasSavings);
  return useQuery({
    queryKey: ['quests', 'recommended'],
    queryFn: async () => {
      console.log('📡 useRecommendedQuests API 호출 시작');
      const result = await questService.getRecommendedQuests();
      console.log('📡 useRecommendedQuests API 호출 완료:', result.success ? '성공' : '실패');
      return result;
    },
    staleTime: 1 * 60 * 1000, // 1분
    gcTime: 3 * 60 * 1000, // 3분
  });
};

// 전체 퀘스트 조회 훅 (하나의 API로 모든 퀘스트 가져오기)
export const useAllQuests = () => {
  console.log('🔍 useAllQuests 훅 호출됨');
  return useQuery({
    queryKey: ['quests', 'all'],
    queryFn: async () => {
      console.log('📡 useAllQuests API 호출 시작');
      const result = await questService.getAllQuests();
      console.log('📡 useAllQuests API 호출 완료: 성공');
      console.log('📡 useAllQuests 결과 데이터 구조:', {
        hasQuests: !!result.quests,
        questsLength: result.quests?.length || 0,
        resultKeys: Object.keys(result)
      });
      return result;
    },
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 5 * 60 * 1000, // 5분
  });
};

// 카테고리별 퀘스트 조회 훅들 (기존 호환성을 위해 유지)
export const useGrowthQuestsInProgress = () => {
  const allQuestsQuery = useAllQuests();
  
  console.log('🔍 useGrowthQuestsInProgress - allQuestsQuery.data:', allQuestsQuery.data);
  
  if (!allQuestsQuery.data?.quests) {
    console.log('🔍 useGrowthQuestsInProgress - 퀘스트 데이터 없음');
    return {
      ...allQuestsQuery,
      data: { success: true, data: [] }
    };
  }

  console.log('🔍 useGrowthQuestsInProgress - 퀘스트 데이터 있음, 개수:', allQuestsQuery.data.quests.length);
  const categorized = categorizeQuests(allQuestsQuery.data.quests);
  const growthQuests = categorized.growth
    .filter(quest => quest.user_status === 'IN_PROGRESS')
    .slice(0, 5)
    .map(convertQuestListItemToQuest);

  console.log('🔍 useGrowthQuestsInProgress - 분류된 growth 퀘스트:', growthQuests.length);
  return {
    ...allQuestsQuery,
    data: { success: true, data: growthQuests }
  };
};

export const useAllGrowthQuests = () => {
  const allQuestsQuery = useAllQuests();
  
  if (!allQuestsQuery.data?.quests) {
    return {
      ...allQuestsQuery,
      data: { success: true, data: [] }
    };
  }

  const categorized = categorizeQuests(allQuestsQuery.data.quests);
  const growthQuests = categorized.growth.map(convertQuestListItemToQuest);

  return {
    ...allQuestsQuery,
    data: { success: true, data: growthQuests }
  };
};

export const useDailyQuests = () => {
  const allQuestsQuery = useAllQuests();
  
  console.log('🔍 useDailyQuests - allQuestsQuery.data:', allQuestsQuery.data);
  
  if (!allQuestsQuery.data?.quests) {
    console.log('🔍 useDailyQuests - 퀘스트 데이터 없음');
    return {
      ...allQuestsQuery,
      data: { success: true, data: [] }
    };
  }

  console.log('🔍 useDailyQuests - 퀘스트 데이터 있음, 개수:', allQuestsQuery.data.quests.length);
  const categorized = categorizeQuests(allQuestsQuery.data.quests);
  const dailyQuests = categorized.daily.map(convertQuestListItemToQuest);

  console.log('🔍 useDailyQuests - 분류된 daily 퀘스트:', dailyQuests.length);
  return {
    ...allQuestsQuery,
    data: { success: true, data: dailyQuests }
  };
};

export const useSurpriseQuests = () => {
  const allQuestsQuery = useAllQuests();
  
  console.log('🔍 useSurpriseQuests - allQuestsQuery.data:', allQuestsQuery.data);
  
  if (!allQuestsQuery.data?.quests) {
    console.log('🔍 useSurpriseQuests - 퀘스트 데이터 없음');
    return {
      ...allQuestsQuery,
      data: { success: true, data: [] }
    };
  }

  console.log('🔍 useSurpriseQuests - 퀘스트 데이터 있음, 개수:', allQuestsQuery.data.quests.length);
  const categorized = categorizeQuests(allQuestsQuery.data.quests);
  const surpriseQuests = categorized.surprise.map(convertQuestListItemToQuest);

  console.log('🔍 useSurpriseQuests - 분류된 surprise 퀘스트:', surpriseQuests.length);
  return {
    ...allQuestsQuery,
    data: { success: true, data: surpriseQuests }
  };
};

// 퀘스트 진행 내역 조회 훅 (완료된 퀘스트만 필터링)
export const useQuestHistory = (category: string) => {
  const allQuestsQuery = useAllQuests();
  
  if (!allQuestsQuery.data?.quests) {
    return {
      ...allQuestsQuery,
      data: { success: true, data: [] }
    };
  }

  const categorized = categorizeQuests(allQuestsQuery.data.quests);
  const categoryKey = category === 'daily' ? 'daily' : category;
  const categoryQuests = categorized[categoryKey as keyof typeof categorized] || [];
  const completedQuests = categoryQuests
    .filter(quest => quest.user_status === 'APPROVED')
    .map(convertQuestListItemToQuest);

  return {
    ...allQuestsQuery,
    data: { success: true, data: completedQuests }
  };
};

// 퀘스트 수령 훅
export const useClaimQuest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ClaimQuestRequest) => questService.claimQuest(data),
    onSuccess: (response) => {
      if (response.success) {
        // 관련 쿼리 무효화하여 리페치
        queryClient.invalidateQueries({ queryKey: ['quests'] });
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
