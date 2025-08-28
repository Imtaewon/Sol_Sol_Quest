import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
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
  };
}

interface SignupRequest {
  name: string;
  gender: '남' | '여' | '기타';
  age: number;
  username: string;
  password: string;
  email: string;
  school: string;
}

interface UsernameCheckRequest {
  username: string;
}

interface UsernameCheckResponse {
  available: boolean;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.solquest.com',
  }),
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/api/auth/login', // FastAPI 예상 경로
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
    signup: builder.mutation<LoginResponse, SignupRequest>({
      query: (userData) => ({
        url: '/api/members/signup', // FastAPI 예상 경로
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth'],
    }),
    checkUsername: builder.query<UsernameCheckResponse, UsernameCheckRequest>({
      query: ({ username }) => ({
        url: `/api/members/check-username?username=${username}`, // FastAPI 예상 경로
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useCheckUsernameQuery,
} = authApi;

