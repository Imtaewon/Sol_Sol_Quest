import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Config } from '../../config/env';
import { Platform } from 'react-native';
import { Quest, QuestAttempt, User, SchoolLeaderboard, DemandDepositAccount, InstallmentSavingsAccount, AccountTransaction } from '../../types/database';

// 타입 정의
export interface LoginRequest {
  login_id: string;
  password: string;
}

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
  message?: string;
}

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

interface UserInfoResponse {
  user_id: string;
  name: string;
  email: string;
  university_code?: string;
  university_name?: string;
  current_tier?: string;
  total_exp?: number;
  gender?: string;
  major?: string;
  grade?: number;
  birth_year?: number; // 백엔드 응답 구조에 맞게 수정
  school?: string;
  department?: string;
}

interface School {
  university_code: string;
  university_name: string;
}

interface SchoolLeaderboardResponse {
  my_university?: {
    university_code: string;
    university_name: string;
    savings_students: number;
    total_exp: number;
    avg_exp: number;
    rank_overall?: number;
    rank_avg?: number;
  };
  top10_overall: Array<{
    university_code: string;
    university_name: string;
    savings_students: number;
    total_exp: number;
    avg_exp: number;
    rank_overall?: number;
  }>;
  top10_avg: Array<{
    university_code: string;
    university_name: string;
    savings_students: number;
    total_exp: number;
    avg_exp: number;
    rank_avg?: number;
  }>;
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: Config.API_BASE_URL,
    prepareHeaders: async (headers) => {
      // AsyncStorage에서 토큰 가져오기
      try {
        let token = null;
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          // 웹 환경
          token = localStorage.getItem('access_token');
        } else {
          // 네이티브 환경
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          token = await AsyncStorage.getItem('access_token');
        }
        
        if (token) {
          headers.set('authorization', `Bearer ${token}`);
        }
      } catch (error) {
        console.error('토큰 가져오기 실패:', error);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Quest', 'Leaderboard', 'Account', 'Schools', 'Attendance'],
  endpoints: (builder) => ({
    // 인증 관련
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/api/v1/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    
    signup: builder.mutation<SignupResponse, SignupRequest>({
      query: (userData) => ({
        url: '/api/v1/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    
    // 사용자 정보
    getUserInfo: builder.query<UserInfoResponse, void>({
      query: () => ({
        url: '/api/v1/users/me',
        method: 'GET',
      }),
      transformResponse: (response: { success: boolean; data: UserInfoResponse }) => {
        return response.data;
      },
      providesTags: ['User'],
    }),

    // 학교 목록
    getSchools: builder.query<School[], void>({
      query: () => ({
        url: '/api/v1/universities',
        method: 'GET',
      }),
      transformResponse: (response: { success: boolean; data: School[] }) => {
        return response.data || [];
      },
      providesTags: ['Schools'],
    }),

    // 학교 리더보드
    getSchoolLeaderboard: builder.query<SchoolLeaderboardResponse, { limit?: number }>({
      query: ({ limit = 10 }) => ({
        url: `/api/v1/universities/leaderboard?limit=${limit}`,
        method: 'GET',
      }),
      providesTags: ['Leaderboard'],
    }),

    // 퀘스트 목록
    getQuests: builder.query<any[], {
      type?: string;
      category?: string;
      page?: number;
      limit?: number;
    }>({
      query: ({ type, category, page = 1, limit = 1000 }) => ({  // 20에서 1000으로 변경
        url: `/api/v1/quests?page=${page}&limit=${limit}${type ? `&type=${type}` : ''}${category ? `&category=${category}` : ''}`,
        method: 'GET',
      }),
      transformResponse: (response: { success: boolean; data: any }) => {
        return response.data || [];
      },
      providesTags: ['Quest'],
    }),

    // 퀘스트 즉시 완료 (시연용)
    completeQuest: builder.mutation<any, { quest_id: string }>({
      query: ({ quest_id }) => ({
        url: `/api/v1/quests/${quest_id}/complete`,
        method: 'POST',
      }),
      invalidatesTags: ['Quest'],
    }),

    // 퀘스트 완료 및 경험치 수령 (시도 기록 자동 생성)
    claimQuestReward: builder.mutation<any, { quest_id: string }>({
      query: ({ quest_id }) => ({
        url: `/api/v1/quests/${quest_id}/claim`,
        method: 'POST',
      }),
      invalidatesTags: ['Quest', 'User', 'Account'],
    }),

    // 적금 계좌 생성
    createSavingsAccount: builder.mutation<any, {
      user_id: string;
      deposit_balance: number;
      account_no: string;
    }>({
      query: (data) => ({
        url: '/api/v1/accounts/savings',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Account'],
    }),

    // 수시입출금 계좌 생성
    createDemandAccount: builder.mutation<any, {
      user_id: string;
    }>({
      query: (data) => ({
        url: '/api/v1/accounts/demand-deposit',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Account'],
    }),

    // 출석 내역 조회
    getAttendanceData: builder.query<any, { year: number; month: number }>({
      query: ({ year, month }) => ({
        url: `/api/v1/attendance/${year}/${month}`,
        method: 'GET',
      }),
      providesTags: ['Attendance'],
    }),

    // 출석 체크
    checkAttendance: builder.mutation<any, { year: number; month: number; day: number; user_id: string }>({
      query: (data) => ({
        url: '/api/v1/attendance/check-in',
        method: 'POST',
        body: { 
          user_id: data.user_id,
          date: `${data.year}-${data.month.toString().padStart(2, '0')}-${data.day.toString().padStart(2, '0')}` 
        },
      }),
      invalidatesTags: ['Attendance'],
    }),
  }),
});

export const {
  // 인증
  useLoginMutation,
  useSignupMutation,
  
  // 사용자
  useGetUserInfoQuery,
  
  // 학교
  useGetSchoolsQuery,
  useGetSchoolLeaderboardQuery,
  
  // 퀘스트
  useGetQuestsQuery,
  useCompleteQuestMutation,
  useClaimQuestRewardMutation,
  
  // 계좌
  useCreateSavingsAccountMutation,
  useCreateDemandAccountMutation,
  
  // 출석
  useGetAttendanceDataQuery,
  useCheckAttendanceMutation,
} = baseApi;

