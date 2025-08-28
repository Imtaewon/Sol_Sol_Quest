/**
 * useAuth.ts
 * 
 * 인증 관련 커스텀 훅들
 * 
 * 주요 기능:
 * - 로그인/회원가입/로그아웃 API 호출
 * - 토큰 관리 및 저장
 * - 사용자 정보 캐시 관리
 * - 인증 상태에 따른 UI 피드백
 * 
 * 포함된 훅들:
 * - useLogin: 로그인 처리 및 토큰 저장
 * - useSignup: 회원가입 처리 및 자동 로그인
 * - useLogout: 로그아웃 처리 및 토큰 삭제
 * 
 * 상태 관리:
 * - AsyncStorage를 통한 토큰 영구 저장
 * - React Query 캐시를 통한 사용자 정보 관리
 * - Toast 메시지를 통한 사용자 피드백
 * 
 * 에러 처리:
 * - API 호출 실패 시 에러 로깅
 * - 로그아웃 실패 시에도 로컬 토큰 삭제
 */

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
