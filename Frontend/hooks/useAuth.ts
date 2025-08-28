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
import { useDispatch } from 'react-redux';
import { loginSuccess, logout } from '../store/slices/authSlice';
import { Platform } from 'react-native';

// AsyncStorage fallback 함수들
const setStorageItem = async (key: string, value: string): Promise<void> => {
  console.log(`🔧 setStorageItem 호출됨 - key: ${key}, value: ${value ? `${value.substring(0, 20)}...` : 'null'}`);
  
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // 웹 환경에서는 직접 localStorage 사용
    try {
      localStorage.setItem(key, value);
      console.log(`✅ localStorage에 ${key} 저장 성공`);
      
      // 저장 후 즉시 확인
      const storedValue = localStorage.getItem(key);
      console.log(`🔧 localStorage 저장 확인 - ${key}:`, storedValue ? '저장됨' : '저장 안됨');
    } catch (error) {
      console.error('❌ localStorage 저장 실패:', error);
    }
  } else {
    // 네이티브 환경에서는 AsyncStorage 사용
    try {
      await AsyncStorage.setItem(key, value);
      console.log(`✅ AsyncStorage에 ${key} 저장 성공`);
    } catch (error) {
      console.error('❌ AsyncStorage 저장 실패:', error);
    }
  }
};

const getStorageItem = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // 웹 환경에서는 직접 localStorage 사용
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('❌ localStorage 읽기 실패:', error);
      return null;
    }
  } else {
    // 네이티브 환경에서는 AsyncStorage 사용
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('❌ AsyncStorage 읽기 실패:', error);
      return null;
    }
  }
};

const clearStorage = async (): Promise<void> => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // 웹 환경에서는 직접 localStorage 사용
    try {
      localStorage.clear();
      console.log('✅ localStorage 클리어 성공');
    } catch (error) {
      console.error('❌ localStorage 클리어 실패:', error);
    }
  } else {
    // 네이티브 환경에서는 AsyncStorage 사용
    try {
      await AsyncStorage.clear();
      console.log('✅ AsyncStorage 클리어 성공');
    } catch (error) {
      console.error('❌ AsyncStorage 클리어 실패:', error);
    }
  }
};

// 로그인 훅
export const useLogin = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      console.log('🔄 useLogin mutationFn 호출됨');
      console.log('전송할 데이터:', data);
      
      // AsyncStorage 클리어
      try {
        await clearStorage();
        console.log('🧹 AsyncStorage 클리어 완료');
        
        // 클리어 후 확인
        const allKeys = await AsyncStorage.getAllKeys();
        console.log('🧹 클리어 후 AsyncStorage 키들:', allKeys);
      } catch (error) {
        console.error('❌ AsyncStorage 클리어 실패:', error);
      }
      
      return authService.login(data);
    },
    onSuccess: async (response: any) => {
      console.log('로그인 응답:', response);
      
      if (response.data?.success) {
        try {
          // 토큰 저장 (access_token으로 변경)
          const token = response.data.data.access_token;
          console.log('🔐 저장할 토큰:', token ? `${token.substring(0, 20)}...` : 'null');
          
          await setStorageItem('access_token', token);
          console.log('🔐 토큰 저장 완료');
          
          // 즉시 토큰 검증
          const storedToken = await getStorageItem('access_token');
          console.log('DEBUG: 로그인 후 토큰 검증:', {
            hasToken: !!storedToken,
            tokenLength: storedToken?.length || 0,
            tokenPreview: storedToken ? `${storedToken.substring(0, 20)}...` : 'null'
          });
          
          // 더미 키도 확인
          const dummyValue = await getStorageItem('dummy_key');
          console.log('DEBUG: 로그인 후 dummy_key 확인:', dummyValue);
          
          // 사용자 정보 캐시에 저장 (Backend 응답 형식에 맞춤)
          queryClient.setQueryData(['user'], response.data.data.user);
          queryClient.setQueryData(['token'], response.data.data.access_token);
          queryClient.setQueryData(['savingStatus'], response.data.data.user.has_savings);
          
          // Redux store 업데이트 (AsyncStorage와 동기화)
          dispatch(loginSuccess({ token }));
          console.log('🔐 Redux loginSuccess 액션 호출됨');
          console.log('토큰:', token);
          
          Toast.show({
            type: 'success',
            text1: '로그인 성공',
            text2: '환영합니다!',
          });
        } catch (error) {
          console.error('❌ 토큰 저장 중 에러:', error);
        }
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
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: (data: FrontendSignupRequest) => {
      console.log('🔄 useSignup mutationFn 호출됨');
      console.log('전송할 데이터:', JSON.stringify(data, null, 2));
      return authService.signup(data);
    },
    onSuccess: (response) => {
      console.log('회원가입 성공:', response.data);
    },
    onError: (error) => {
      console.error('❌ useSignup onError 호출됨');
      console.error('에러 타입:', typeof error);
      console.error('에러 상세:', JSON.stringify(error, null, 2));
      
      if (error instanceof Error) {
        console.error('에러 메시지:', error.message);
        console.error('에러 스택:', error.stack);
      }
      
      Toast.show({
        type: 'error',
        text1: '회원가입 실패',
        text2: '다시 시도해주세요.',
      });
    },
  });
};

// 로그아웃 훅
export const useLogout = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: async () => {
      // 토큰 삭제 (AsyncStorage와 Redux 모두)
      await clearStorage();
      
      // Redux state도 클리어
      dispatch(logout());
      
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
      await clearStorage();
      queryClient.clear();
    },
  });
};
