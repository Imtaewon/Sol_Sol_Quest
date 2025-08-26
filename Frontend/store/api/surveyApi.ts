import { baseApi } from './baseApi';
import { 
  SurveyQuestion,
  SurveyAnswer,
  ApiResponse
} from '../../types/database';

export interface SubmitSurveyRequest {
  answers: {
    question_id: string;
    question_type: number;
    option_id?: string;
  }[];
}

export const surveyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 설문 문항 조회
    getSurveyQuestions: builder.query<SurveyQuestion[], void>({
      query: () => ({
        url: '/survey/questions',
        method: 'GET',
      }),
    }),

    // 설문 문항별 조회
    getSurveyQuestion: builder.query<SurveyQuestion, string>({
      query: (questionId) => ({
        url: `/survey/questions/${questionId}`,
        method: 'GET',
      }),
    }),

    // 내 설문 응답 조회
    getMySurveyAnswers: builder.query<SurveyAnswer[], void>({
      query: () => ({
        url: '/survey/my-answers',
        method: 'GET',
      }),
    }),

    // 설문 응답 제출
    submitSurveyAnswers: builder.mutation<ApiResponse<void>, SubmitSurveyRequest>({
      query: (data) => ({
        url: '/survey/submit',
        method: 'POST',
        data,
      }),
    }),

    // 설문 완료 여부 확인
    checkSurveyCompletion: builder.query<{ completed: boolean; progress: number }, void>({
      query: () => ({
        url: '/survey/completion-status',
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetSurveyQuestionsQuery,
  useGetSurveyQuestionQuery,
  useGetMySurveyAnswersQuery,
  useSubmitSurveyAnswersMutation,
  useCheckSurveyCompletionQuery,
} = surveyApi;
