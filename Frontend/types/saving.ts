/**
 * 적금 가입 관련 타입 정의
 */

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// 개인정보 타입
export interface PersonalInfo {
  name: string;
  birthYear: string;
  school: string;
  department: string;
  grade: number;
}

// 적금 가입 요청 데이터 타입
export interface SavingSignupData {
  monthlyAmount: number;
  accountNumber: string;
  surveyResponses: SurveyResponse[];
}

// 설문 응답 타입
export interface SurveyResponse {
  questionNumber: number;  // 문제 번호 (1-12)
  questionType: number;    // 문제 유형 (1-6)
  answer: number;          // 사용자 응답
}

// 설문 문제 타입
export interface SurveyQuestion {
  id: number;
  question: string;
  type: 'multiple_choice' | 'text' | 'number';
  options?: string[];
}

// 설문 문제 유형 매핑
export const QUESTION_TYPE_MAPPING: { [key: number]: number } = {
  1: 1,  // 1번 문제 -> 유형 1
  2: 1,  // 2번 문제 -> 유형 1
  3: 2,  // 3번 문제 -> 유형 2
  4: 2,  // 4번 문제 -> 유형 2
  5: 3,  // 5번 문제 -> 유형 3
  6: 4,  // 6번 문제 -> 유형 4
  7: 4,  // 7번 문제 -> 유형 4
  8: 5,  // 8번 문제 -> 유형 5
  9: 6,  // 9번 문제 -> 유형 6
  10: 6, // 10번 문제 -> 유형 6
  11: 6, // 11번 문제 -> 유형 6
  12: 6, // 12번 문제 -> 유형 6
};
