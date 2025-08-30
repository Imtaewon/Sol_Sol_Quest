import apiClient from './apiClient';
import { ApiResponse } from './apiClient';

// 예금 가입 요청 타입
export interface DepositSignupRequest {
  user_id: string;
}

// 예금 가입 응답 타입
export interface DepositSignupResponse {
  message: string;
  accountNumber: string;
}

// 예금 서비스
export const depositService = {
  // 예금 가입
  signup: async (data: DepositSignupRequest): Promise<ApiResponse<DepositSignupResponse>> => {
    const response = await apiClient.post<ApiResponse<DepositSignupResponse>>('/api/v1/accounts/demand-deposit', data);
    return response.data;
  },
};

// 입금 요청 타입
export interface DepositMoneyRequest {
  account_no: string;
  user_id: string;
  amount: number;
}

// 입금 API 호출
export const depositMoney = async (data: DepositMoneyRequest): Promise<ApiResponse> => {
  console.log('🔍 depositMoney API 호출됨');
  console.log('API 엔드포인트:', '/api/v1/accounts/demand-deposit/deposit');
  console.log('요청 데이터:', data);
  
  const response = await apiClient.post<ApiResponse>('/api/v1/accounts/demand-deposit/deposit', data);
  console.log('✅ API 응답:', response.data);
  return response.data;
};
