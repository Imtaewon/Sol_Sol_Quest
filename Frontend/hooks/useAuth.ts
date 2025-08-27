import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService, LoginRequest, FrontendSignupRequest } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

// 로그인 훅
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: async (response) => {
      if (response.success) {
        // 토큰 저장 (access_token으로 변경)
        await AsyncStorage.setItem('auth_token', response.data.access_token);
        
        // 사용자 정보 캐시에 저장 (Backend 응답 형식에 맞춤)
        queryClient.setQueryData(['user'], response.data.user);
        queryClient.setQueryData(['token'], response.data.access_token);
        queryClient.setQueryData(['savingStatus'], response.data.user.has_savings);
        
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FrontendSignupRequest) => authService.signup(data),
    onSuccess: async (response) => {
      if (response.success) {
        // 회원가입 성공 시 자동 로그인 처리
        await AsyncStorage.setItem('auth_token', response.data.access_token);
        
        // 사용자 정보 캐시에 저장
        queryClient.setQueryData(['user'], response.data.user);
        queryClient.setQueryData(['token'], response.data.access_token);
        queryClient.setQueryData(['savingStatus'], response.data.user.has_savings);
        
        Toast.show({
          type: 'success',
          text1: '회원가입 성공',
          text2: '자동으로 로그인되었습니다.',
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
