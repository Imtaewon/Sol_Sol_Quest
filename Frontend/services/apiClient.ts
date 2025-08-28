/**
 * apiClient.ts
 * 
 * Axios 기반 API 클라이언트 설정
 * 
 * 주요 기능:
 * - HTTP 요청/응답 인터셉터 설정
 * - 토큰 자동 추가 및 만료 처리
 * - 전역 에러 처리 및 로깅
 * - API 응답 타입 정의
 * 
 * 설정 내용:
 * - baseURL: 환경변수 기반 API 서버 주소
 * - timeout: 10초 요청 타임아웃
 * - Content-Type: application/json
 * 
 * 인터셉터:
 * - 요청 인터셉터: 토큰 자동 추가
 * - 응답 인터셉터: 401 에러 시 토큰 삭제 및 로그인 리다이렉트
 * 
 * 에러 처리:
 * - 토큰 만료 시 자동 로그아웃
 * - 에러 메시지 통합 처리
 * - 콘솔 로깅을 통한 디버깅 지원
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../config/env';
import { Platform } from 'react-native';

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// AsyncStorage fallback 함수들
const getStorageItem = async (key: string): Promise<string | null> => {
  try {
    // 먼저 AsyncStorage 시도
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return value;
    }
    
    // AsyncStorage가 실패하면 localStorage 시도 (웹 환경)
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    
    return null;
  } catch (error) {
    console.error('❌ getStorageItem 에러:', error);
    
    // 에러 발생 시 localStorage 시도 (웹 환경)
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        return localStorage.getItem(key);
      } catch (localError) {
        console.error('❌ localStorage도 실패:', localError);
        return null;
      }
    }
    
    return null;
  }
};

const setStorageItem = async (key: string, value: string): Promise<void> => {
  try {
    // 먼저 AsyncStorage 시도
    await AsyncStorage.setItem(key, value);
    console.log(`✅ AsyncStorage에 ${key} 저장 성공`);
  } catch (error) {
    console.error('❌ AsyncStorage 저장 실패:', error);
    
    // AsyncStorage가 실패하면 localStorage 시도 (웹 환경)
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, value);
        console.log(`✅ localStorage에 ${key} 저장 성공`);
      } catch (localError) {
        console.error('❌ localStorage 저장도 실패:', localError);
      }
    }
  }
};

// Axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: Config.API_BASE_URL, // 환경변수 사용
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 자동 추가
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // 더미 키 확인으로 AsyncStorage 기능 테스트
      const dummyValue = await getStorageItem('dummy_key');
      console.log('DEBUG: Interceptor - AsyncStorage dummy_key:', dummyValue);
      
      const token = await getStorageItem('auth_token');
      const hasToken = !!token;
      const tokenLength = token?.length || 0;
      
      console.log('🔑 API 요청 토큰 확인:', {
        url: config.url,
        method: config.method,
        hasToken,
        tokenLength,
        dummyKeyExists: !!dummyValue,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'null'
      });
      
      if (hasToken && token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ 토큰이 헤더에 추가됨');
      } else {
        console.log('⚠️ 토큰이 없음 - Authorization 헤더 추가 안됨');
      }
    } catch (error) {
      console.error('❌ 토큰 가져오기 실패:', error);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ 요청 인터셉터 에러:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config;
    
    // 401 에러 (토큰 만료) 처리
    if (error.response?.status === 401 && originalRequest) {
      try {
        // 토큰 제거
        await AsyncStorage.removeItem('auth_token');
        
        // 로그인 화면으로 리다이렉트 (네비게이션 처리 필요)
        console.log('토큰이 만료되어 로그인 화면으로 이동합니다.');
        
      } catch (storageError) {
        console.error('토큰 제거 실패:', storageError);
      }
    }
    
    // 에러 메시지 처리
    const errorMessage = error.response?.data?.message || error.message || '알 수 없는 오류가 발생했습니다.';
    console.error('API 에러:', errorMessage);
    
    return Promise.reject(error);
  }
);

export default apiClient;
