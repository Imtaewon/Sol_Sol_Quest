import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService, LoginRequest, SignupRequest } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

// 로그인 훅
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: async (response) => {
      if (response.success) {
        // 토큰 저장
        await AsyncStorage.setItem('auth_token', response.data.token);
        
        // 사용자 정보 캐시에 저장
        queryClient.setQueryData(['user'], response.data.user);
        queryClient.setQueryData(['token'], response.data.token);
        queryClient.setQueryData(['savingStatus'], response.data.user.savingStatus);
        
        Toast.show({
          type: 'success',
          text1: '로그인 성공',
          text2: '환영합니다!',
        });
      }
    },
    onError: (error) => {
      console.error('로그인 실패:', error);
    },
  });
};

// 회원가입 훅
export const useSignup = () => {
  return useMutation({
    mutationFn: (data: SignupRequest) => authService.signup(data),
    onSuccess: (response) => {
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: '회원가입 성공',
          text2: '로그인 화면으로 이동합니다.',
        });
      }
    },
    onError: (error) => {
      console.error('회원가입 실패:', error);
    },
  });
};

// 로그아웃 훅
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: async () => {
      // 토큰 삭제
      await AsyncStorage.removeItem('auth_token');
      
      // 모든 쿼리 캐시 초기화
      queryClient.clear();
      
      Toast.show({
        type: 'success',
        text1: '로그아웃',
        text2: '안전하게 로그아웃되었습니다.',
      });
    },
    onError: async (error) => {
      console.error('로그아웃 실패:', error);
      // 에러가 발생해도 로컬 토큰은 삭제
      await AsyncStorage.removeItem('auth_token');
      queryClient.clear();
    },
  });
};
