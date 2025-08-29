/**
 * savingApi.ts
 * 
 * 적금 가입 관련 API 엔드포인트 정의
 * 
 * 주요 기능:
 * - 설문 문제 조회 (백엔드 개발자 요청 예정)
 * - 설문 응답 제출 (백엔드 개발자 요청 예정)
 */

import { baseApi } from './baseApi';
import { 
  SurveyQuestion, 
  SurveyResponse,
  SurveyAnswerIn,
  ApiResponse 
} from '../../types/saving';

/**
 * 설문 응답 제출 응답 타입
 */
export interface SurveySubmitResponse {
  success: boolean;
  data: {
    submitted_count: number;
    user_id: string;
    survey_completed: boolean;
  };
  message?: string;
}

/**
 * 적금 가입 API 엔드포인트 정의
 */
export const savingApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    /**
     * 설문 문제 조회
     * GET /api/v1/saving/survey/questions/{questionNumber}
     * 특정 번호의 설문 문제 조회
     */
           getSurveyQuestion: builder.query<ApiResponse<SurveyQuestion>, number>({
         query: (questionNumber) => {
           console.log('🔍 설문 문제 조회 API 호출:', questionNumber);
           console.log('🔍 API URL:', `/api/v1/saving/survey/questions/${questionNumber}`);
           return {
             url: `/api/v1/saving/survey/questions/${questionNumber}`,
             method: 'GET',
           };
         },
       }),

    /**
     * 설문 응답 제출
     * POST /api/v1/saving/survey/responses
     * 설문 응답 데이터 제출
     */
    submitSurveyResponses: builder.mutation<SurveySubmitResponse, { items: SurveyAnswerIn[] }>({
      query: (data) => ({
        url: '/api/v1/saving/survey/responses',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetSurveyQuestionQuery,
  useSubmitSurveyResponsesMutation,
} = savingApi;
