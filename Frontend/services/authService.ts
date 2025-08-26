import apiClient from './apiClient';
import { ApiResponse } from './apiClient';

// 로그인 요청 타입
export interface LoginRequest {
  username: string;
  password: string;
}

// 회원가입 요청 타입
export interface SignupRequest {
  name: string;
  gender: 'male' | 'female';
  birthYear: number;
  username: string;
  password: string;
  email: string;
  school: string;
  department: string;
  grade: number;
}

// 로그인 응답 타입
export interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    username: string;
    email: string;
    gender: 'male' | 'female';
    birthYear: number;
    school: string;
    department: string;
    grade: number;
    savingStatus: boolean;
  };
}

// 회원가입 응답 타입
export interface SignupResponse {
  message: string;
}

// 인증 서비스
export const authService = {
  // 로그인
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data);
    return response.data;
  },

  // 회원가입
  signup: async (data: SignupRequest): Promise<ApiResponse<SignupResponse>> => {
    const response = await apiClient.post<ApiResponse<SignupResponse>>('/auth/signup', data);
    return response.data;
  },

  // 로그아웃
  logout: async (): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/auth/logout');
    return response.data;
  },
};
