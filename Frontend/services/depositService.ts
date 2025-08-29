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
