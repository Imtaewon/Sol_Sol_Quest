import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { savingService, SavingSignupRequest } from '../services/savingService';
import Toast from 'react-native-toast-message';

// 설문 문항 조회 훅
export const useSurveyQuestion = (questionNumber: number) => {
  return useQuery({
    queryKey: ['survey', questionNumber],
    queryFn: () => savingService.getSurveyQuestion(questionNumber),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
};

// 적금 가입 훅
export const useSavingSignup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SavingSignupRequest) => savingService.signup(data),
    onSuccess: (response) => {
      if (response.success) {
        // 사용자 정보 무효화하여 리페치
        queryClient.invalidateQueries({ queryKey: ['user'] });
        queryClient.invalidateQueries({ queryKey: ['account'] });
        
        Toast.show({
          type: 'success',
          text1: '적금 가입 완료!',
          text2: '축하합니다!',
        });
      }
    },
    onError: (error) => {
      console.error('적금 가입 실패:', error);
      Toast.show({
        type: 'error',
        text1: '적금 가입 실패',
        text2: '다시 시도해주세요.',
      });
    },
  });
};
