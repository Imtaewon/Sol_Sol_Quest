import apiClient from './apiClient';
import { ApiResponse } from './apiClient';

// 설문 문항 타입
export interface SurveyQuestion {
  id: number;
  question: string;
  type: 'multiple_choice' | 'text' | 'number';
  options?: string[];
}

// 설문 응답 타입
export interface SurveyResponse {
  questionId: number;
  type: number;
  answer: string | number;
}

// 적금 가입 요청 타입
export interface SavingSignupRequest {
  monthlyAmount: number;
  accountNumber: string;
  surveyResponses: SurveyResponse[];
}

// 적금 가입 응답 타입
export interface SavingSignupResponse {
  message: string;
  accountNumber: string;
}

// 적금 서비스
export const savingService = {
  // 설문 문항 조회
  getSurveyQuestion: async (questionNumber: number): Promise<ApiResponse<SurveyQuestion>> => {
    const response = await apiClient.get<ApiResponse<SurveyQuestion>>(`/saving/survey/${questionNumber}`);
    return response.data;
  },

  // 적금 가입
  signup: async (data: SavingSignupRequest): Promise<ApiResponse<SavingSignupResponse>> => {
    const response = await apiClient.post<ApiResponse<SavingSignupResponse>>('/saving/signup', data);
    return response.data;
  },
};
