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

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

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
      const token = await AsyncStorage.getItem('auth_token');
      console.log('🔑 API 요청 토큰 확인:', {
        url: config.url,
        method: config.method,
        hasToken: !!token,
        tokenLength: token?.length || 0
      });
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ 토큰이 헤더에 추가됨');
      } else {
        console.log('⚠️ 토큰이 없음');
      }
    } catch (error) {
      console.error('토큰 가져오기 실패:', error);
    }
    return config;
  },
  (error) => {
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
