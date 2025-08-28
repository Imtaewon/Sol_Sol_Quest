import apiClient from './apiClient';
import { ApiResponse } from './apiClient';

// Frontend에서 사용하는 회원가입 요청 타입 (Backend 형식으로 통일)
export interface FrontendSignupRequest {
  name: string;
  gender: 'M' | 'F' | 'X';  // Backend 형식으로 변경
  birthYear: number;
  username: string;
  password: string;
  email: string;
  school: string; // 학교 코드
  schoolName?: string; // 학교 이름 (선택적)
  department: string;
  grade: number;
}

// Backend에서 요구하는 회원가입 요청 타입
export interface SignupRequest {
  login_id: string;
  email: string;
  password: string;
  password_confirm: string;
  real_name: string;
  gender?: 'M' | 'F' | 'X';
  birth_year?: number;
  university_code: string;
  university_name: string;
  department?: string;
  grade?: number;
}

// 로그인 요청 타입 (Backend 형식에 맞춤)
export interface LoginRequest {
  login_id: string;  // username → login_id로 변경
  password: string;
}

// 로그인 응답 타입 (Backend 응답 형식에 맞춤)
export interface LoginResponse {
  success: boolean;
  data: {
    access_token: string;
    user: {
      user_id: string;
      name: string;
      login_id: string;
      email: string;
      university_name?: string;
      current_tier?: string;
      total_exp?: number;
      has_savings?: boolean;
    };
  };
}

// 회원가입 응답 타입
export interface SignupResponse {
  success: boolean;
  data: {
    access_token: string;
    user: {
      user_id: string;
      name: string;
      email: string;
      university_name: string;
      current_tier: string;
      total_exp: number;
      has_savings: boolean;
    };
  };
  message: string;
}

// Frontend 형식을 Backend 형식으로 변환하는 함수
export const transformSignupData = (frontendData: FrontendSignupRequest): SignupRequest => {
  return {
    login_id: frontendData.username,
    email: frontendData.email,
    password: frontendData.password,
    password_confirm: frontendData.password, // 임시로 같은 값 사용
    real_name: frontendData.name,
    gender: frontendData.gender,  // 이미 Backend 형식이므로 변환 불필요
    birth_year: frontendData.birthYear,
    university_code: frontendData.school, // 학교 코드
    university_name: frontendData.schoolName || '', // 학교 이름 (기본값 빈 문자열)
    department: frontendData.department,
    grade: frontendData.grade,
  };
};

// 인증 서비스
export const authService = {
  // 로그인
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/api/v1/auth/login', data);
    return response.data;
  },

  // 회원가입 (Frontend 형식 받아서 변환)
  signup: async (frontendData: FrontendSignupRequest): Promise<ApiResponse<SignupResponse>> => {
    const backendData = transformSignupData(frontendData);
    console.log('Frontend 데이터:', frontendData);
    console.log('Backend로 변환된 데이터:', backendData);
    
    const response = await apiClient.post<ApiResponse<SignupResponse>>('/api/v1/auth/register', backendData);
    console.log('Backend 응답:', response.data);
    return response.data;
  },

  // 로그아웃
  logout: async (): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/api/v1/auth/logout');
    return response.data;
  },
};
