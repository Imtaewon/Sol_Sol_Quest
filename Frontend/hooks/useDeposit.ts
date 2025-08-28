import { useMutation, useQueryClient } from '@tanstack/react-query';
import { depositService, DepositSignupRequest } from '../services/depositService';
import Toast from 'react-native-toast-message';

// 예금 가입 훅
export const useDepositSignup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DepositSignupRequest) => depositService.signup(data),
    onSuccess: (response) => {
      if (response.success) {
        // 사용자 정보 무효화하여 리페치
        queryClient.invalidateQueries({ queryKey: ['user'] });
        queryClient.invalidateQueries({ queryKey: ['account'] });
        
        Toast.show({
          type: 'success',
          text1: '예금 가입 완료!',
          text2: '축하합니다!',
        });
      }
    },
    onError: (error) => {
      console.error('예금 가입 실패:', error);
      Toast.show({
        type: 'error',
        text1: '예금 가입 실패',
        text2: '다시 시도해주세요.',
      });
    },
  });
};
