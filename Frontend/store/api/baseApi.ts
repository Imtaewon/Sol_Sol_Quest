import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Config } from '../../config/env';

// 타입 정의
interface LoginRequest {
  login_id: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  data: {
    access_token: string;
    user: {
      id: string;
      name: string;
      username: string;
      email: string;
      gender: '남' | '여' | '기타';
      birthYear: number;
      school: string;
      department: string;
      grade: number;
      has_savings: boolean;
      tier: string;
      total_exp: number;
    };
  };
}

interface SignupRequest {
  name: string;
  gender: '남' | '여' | '기타';
  birthYear: number;
  username: string;
  password: string;
  email: string;
  school: string;
  department: string;
  grade: number;
}

interface UsernameCheckResponse {
  available: boolean;
}

interface UserInfoResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    school: string;
    department: string;
    grade: number;
    tier: string;
    total_exp: number;
    interest_rate: number;
    has_savings: boolean;
  };
}

interface PaymentHistory {
  id: string;
  amount: number;
  status: 'completed' | 'failed';
  merchantName?: string;
  description?: string;
  createdAt: string;
}

interface School {
  id: string;
  name: string;
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: Config.API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // 토큰이 있다면 헤더에 추가
      const token = (getState() as any).auth?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Quest', 'Leaderboard', 'Assets', 'Account', 'Survey', 'Payment', 'Saving', 'Auth', 'Schools'],
  endpoints: (builder) => ({
    // 인증 관련
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
    
    signup: builder.mutation<LoginResponse, SignupRequest>({
      query: (userData) => ({
        url: '/members/signup',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth'],
    }),
    
    checkUsername: builder.query<UsernameCheckResponse, string>({
      query: (username) => ({
        url: `/members/check-username?username=${username}`,
        method: 'GET',
      }),
    }),
    
    // 사용자 정보
    getUserInfo: builder.query<UserInfoResponse, void>({
      query: () => ({
        url: '/user/info',
        method: 'GET',
      }),
      providesTags: ['User'],
    }),
    
    // 학교 목록
    getSchools: builder.query<School[], void>({
      query: () => ({
        url: '/schools',
        method: 'GET',
      }),
      providesTags: ['Schools'],
    }),
    
    // 결제 관련
    getPaymentHistory: builder.query<PaymentHistory[], void>({
      query: () => '/payments/history',
      providesTags: ['Payment'],
    }),
    
    // 랭킹 관련
    getMySchoolRank: builder.query<any, void>({
      query: () => ({
        url: '/ranks/my-school',
        method: 'GET',
      }),
      providesTags: ['Leaderboard'],
    }),
    
    getTopSchools: builder.query<any, { type: 'total' | 'average' }>({
      query: (params) => ({
        url: `/ranks/top-schools/${params.type}`,
        method: 'GET',
      }),
      providesTags: ['Leaderboard'],
    }),
  }),
});

export const {
  // 인증
  useLoginMutation,
  useSignupMutation,
  useCheckUsernameQuery,
  
  // 사용자
  useGetUserInfoQuery,
  
  // 학교
  useGetSchoolsQuery,
  
  // 결제
  useGetPaymentHistoryQuery,
  
  // 랭킹
  useGetMySchoolRankQuery,
  useGetTopSchoolsQuery,
} = baseApi;

