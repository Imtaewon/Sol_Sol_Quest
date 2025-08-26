import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import Toast from 'react-native-toast-message';

const API_BASE_URL = Config.API_BASE_URL || 'https://api.solquest.com';
const API_TIMEOUT = parseInt(Config.API_TIMEOUT || '10000');

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

// API 에러 타입
export interface ApiError {
  status: number;
  message: string;
  data?: any;
}

// axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 자동 주입
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('토큰 로드 실패:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || '알 수 없는 오류가 발생했습니다.';

    // 401 Unauthorized - 토큰 만료 또는 무효
    if (status === 401) {
      try {
        await AsyncStorage.removeItem('auth_token');
        // 로그인 화면으로 리디렉션 로직은 네비게이션 컨텍스트에서 처리
      } catch (storageError) {
        console.error('토큰 삭제 실패:', storageError);
      }
    }

    // 에러 토스트 표시
    Toast.show({
      type: 'error',
      text1: '오류',
      text2: message,
    });

    return Promise.reject(error);
  }
);

export default apiClient;
