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

interface SignupRequest {
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

interface SignupResponse {
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
    prepareHeaders: (headers, { getState }) => {
      // 토큰이 있으면 헤더에 추가
      const token = (getState() as any).auth?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Quest', 'Leaderboard', 'Account', 'Schools'],
  endpoints: (builder) => ({
    // 인증 관련
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    
    signup: builder.mutation<SignupResponse, SignupRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    
    // 사용자 정보
    getUserInfo: builder.query<UserInfoResponse, void>({
      query: () => ({
        url: '/users/me',
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
        url: '/universities',
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
        url: `/universities/leaderboard?limit=${limit}`,
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
      query: ({ type, category, page = 1, limit = 20 }) => ({
        url: `/quests?page=${page}&limit=${limit}${type ? `&type=${type}` : ''}${category ? `&category=${category}` : ''}`,
        method: 'GET',
      }),
      transformResponse: (response: { success: boolean; data: any }) => {
        return response.data || [];
      },
      providesTags: ['Quest'],
    }),

    // 퀘스트 시작
    startQuest: builder.mutation<any, { quest_id: string }>({
      query: ({ quest_id }) => ({
        url: `/quests/${quest_id}/start`,
        method: 'POST',
      }),
      invalidatesTags: ['Quest'],
    }),

    // 퀘스트 제출
    submitQuest: builder.mutation<any, { quest_id: string; proof_url?: string }>({
      query: ({ quest_id, proof_url }) => ({
        url: `/quests/${quest_id}/submit`,
        method: 'POST',
        body: { proof_url },
      }),
      invalidatesTags: ['Quest'],
    }),

    // 적금 계좌 생성
    createSavingsAccount: builder.mutation<any, {
      user_id: string;
      deposit_balance: number;
    }>({
      query: (data) => ({
        url: '/accounts/savings',
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
        url: '/accounts/demand-deposit',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Account'],
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
  useStartQuestMutation,
  useSubmitQuestMutation,
  
  // 계좌
  useCreateSavingsAccountMutation,
  useCreateDemandAccountMutation,
} = baseApi;

