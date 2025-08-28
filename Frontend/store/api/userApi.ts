import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  gender: '남' | '여' | '기타';
  age: number;
  school: string;
  hasSavings: boolean;
  tier: string;
  exp: number;
  profileImage?: string;
}

interface UpdateProfileRequest {
  name?: string;
  email?: string;
  school?: string;
}

interface SchoolRanking {
  rank: number;
  schoolName: string;
  totalScore: number;
  averageScore: number;
  memberCount: number;
}

interface MySchoolRanking {
  myRank: number;
  mySchool: string;
  myScore: number;
  myExp: number;
}

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.solquest.com',
  }),
  tagTypes: ['User', 'SchoolRanking'],
  endpoints: (builder) => ({
    getProfile: builder.query<User, void>({
      query: () => ({
        url: '/api/members/profile', // FastAPI 예상 경로
        method: 'GET',
      }),
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation<User, UpdateProfileRequest>({
      query: (profileData) => ({
        url: '/api/members/profile', // FastAPI 예상 경로
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['User'],
    }),
    getSchoolRankings: builder.query<SchoolRanking[], { mode: 'total' | 'avg'; page?: number; size?: number }>({
      query: ({ mode, page = 1, size = 10 }) => ({
        url: `/api/rankings/schools?mode=${mode}&page=${page}&size=${size}`, // FastAPI 예상 경로
        method: 'GET',
      }),
      providesTags: ['SchoolRanking'],
    }),
    getMySchoolRanking: builder.query<MySchoolRanking, void>({
      query: () => ({
        url: '/api/rankings/schools/me', // FastAPI 예상 경로
        method: 'GET',
      }),
      providesTags: ['SchoolRanking'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetSchoolRankingsQuery,
  useGetMySchoolRankingQuery,
} = userApi;

