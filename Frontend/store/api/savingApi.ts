/**
 * savingApi.ts
 * 
 * 적금 가입 관련 API 엔드포인트 정의
 * 
 * 주요 기능:
 * - 개인정보 조회
 * - 설문 문제 조회
 * - 적금 가입 제출
 * - 설문 응답 제출
 */

import { baseApi } from './baseApi';
import { 
  PersonalInfo, 
  SurveyQuestion, 
  SavingSignupData, 
  SurveyResponse,
  ApiResponse 
} from '../../types/saving';

/**
 * 적금 가입 API 엔드포인트 정의
 */
export const savingApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    /**
     * 개인정보 조회
     * GET /saving/personal-info
     * 적금 가입에 필요한 사용자 개인정보 조회
     */
    getPersonalInfo: builder.query<ApiResponse<PersonalInfo>, void>({
      query: () => ({
        url: '/saving/personal-info',
        method: 'GET',
      }),
    }),

    /**
     * 설문 문제 조회
     * GET /saving/survey/{questionNumber}
     * 특정 번호의 설문 문제 조회
     */
    getSurveyQuestion: builder.query<ApiResponse<SurveyQuestion>, number>({
      query: (questionNumber) => ({
        url: `/saving/survey/${questionNumber}`,
        method: 'GET',
      }),
    }),

    /**
     * 적금 가입 제출
     * POST /saving/signup
     * 적금 가입 정보 제출
     */
    submitSavingSignup: builder.mutation<ApiResponse<any>, SavingSignupData>({
      query: (data) => ({
        url: '/saving/signup',
        method: 'POST',
        data,
      }),
    }),

    /**
     * 설문 응답 제출
     * POST /saving/survey-responses
     * 설문 응답 데이터 제출
     */
    submitSurveyResponses: builder.mutation<ApiResponse<any>, SurveyResponse[]>({
      query: (data) => ({
        url: '/saving/survey-responses',
        method: 'POST',
        data,
      }),
    }),
  }),
});

export const {
  useGetPersonalInfoQuery,
  useGetSurveyQuestionQuery,
  useSubmitSavingSignupMutation,
  useSubmitSurveyResponsesMutation,
} = savingApi;
