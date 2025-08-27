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
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
        await AsyncStorage.removeItem('access_token');
        
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
