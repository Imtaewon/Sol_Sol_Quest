import apiClient from './apiClient';
import { ApiResponse } from './apiClient';

// 사용자 정보 타입
export interface UserInfo {
  user_id: string; // 백엔드 응답과 일치
  name: string;
  email: string;
  university_code?: string;
  university_name?: string;
  major?: string;
  grade?: number;
  current_tier?: string;
  total_exp?: number;
  gender?: string;
  has_savings?: boolean; // 백엔드에서 제공하는지 확인 필요
}

// 백엔드 응답 구조에 맞춘 타입들
export interface SavingsAccountDTO {
  id: string;
  product_code: string;
  term_months: number;
  monthly_amount: number;
  interest_rate: number;
  opened_at: string;
  maturity_date?: string;
  status: string;
}

export interface DemandDepositAccountDTO {
  account_no: string;
}

// 백엔드 응답 타입
export interface SavingsAccountsResponse {
  success: boolean;
  data: SavingsAccountDTO[];
  message?: string;
}

export interface DemandDepositAccountsResponse {
  success: boolean;
  data: DemandDepositAccountDTO[];
  message?: string;
}

// 기존 호환성을 위한 타입들 (점진적 제거 예정)
export interface SavingInfo {
  monthlyAmount: number;
  currentBalance: number;
  interestRate: number;
  startDate: string;
  maturityDate: string;
  accountNumber: string;
}

export interface DepositInfo {
  currentBalance: number;
  accountNumber: string;
}

// 계좌 정보 타입
export interface AccountInfo {
  saving?: SavingInfo;
  deposit?: DepositInfo;
}

// 개인정보 요청 타입 (적금 가입용)
export interface PersonalInfoForSaving {
  name: string;
  birthYear: number;
  school: string;
  department: string;
  grade: number;
}

// 개인정보 요청 타입 (예금 가입용)
export interface PersonalInfoForDeposit {
  name: string;
  phone: string;
  email: string;
}

// 사용자 서비스
export const userService = {
  // 사용자 정보 조회
  getUserInfo: async (): Promise<ApiResponse<UserInfo>> => {
    console.log('🌐 userService.getUserInfo HTTP 요청 시작');
    try {
      const response = await apiClient.get<ApiResponse<UserInfo>>('/api/v1/users/me');
      console.log('🌐 userService.getUserInfo HTTP 요청 완료:', response.status);
      console.log('🌐 userService.getUserInfo 응답 데이터:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('🌐 userService.getUserInfo 에러:', error);
      throw error;
    }
  },

  // 적금 가입용 개인정보 조회
  getPersonalInfoForSaving: async (): Promise<ApiResponse<PersonalInfoForSaving>> => {
    const response = await apiClient.get<ApiResponse<PersonalInfoForSaving>>('/user/personal-info/saving');
    return response.data;
  },

  // 예금 가입용 개인정보 조회
  getPersonalInfoForDeposit: async (): Promise<ApiResponse<PersonalInfoForDeposit>> => {
    const response = await apiClient.get<ApiResponse<PersonalInfoForDeposit>>('/user/personal-info/deposit');
    return response.data;
  },

  // 적금 계좌 정보 조회
  getSavingsAccount: async (): Promise<ApiResponse<SavingsAccountsResponse>> => {
    console.log('🌐 userService.getSavingsAccount HTTP 요청 시작');
    try {
      // user_id를 쿼리 파라미터로 전송해야 함
      const userInfo = await this.getUserInfo();
      const userId = userInfo.data?.user_id;
      
      if (!userId) {
        throw new Error('사용자 ID를 찾을 수 없습니다.');
      }
      
      const response = await apiClient.get<SavingsAccountsResponse>(`/api/v1/accounts/savings?user_id=${userId}`);
      console.log('🌐 userService.getSavingsAccount HTTP 요청 완료:', response.status);
      console.log('🌐 userService.getSavingsAccount 응답 데이터:', JSON.stringify(response.data, null, 2));
      return { success: true, data: response.data };
    } catch (error) {
      console.error('🌐 userService.getSavingsAccount 에러:', error);
      throw error;
    }
  },

  // 예금 계좌 정보 조회
  getDepositAccount: async (): Promise<ApiResponse<DemandDepositAccountsResponse>> => {
    console.log('🌐 userService.getDepositAccount HTTP 요청 시작');
    try {
      // user_id를 쿼리 파라미터로 전송해야 함
      const userInfo = await this.getUserInfo();
      const userId = userInfo.data?.user_id;
      
      if (!userId) {
        throw new Error('사용자 ID를 찾을 수 없습니다.');
      }
      
      const response = await apiClient.get<DemandDepositAccountsResponse>(`/api/v1/accounts/demand-deposit?user_id=${userId}`);
      console.log('🌐 userService.getDepositAccount HTTP 요청 완료:', response.status);
      console.log('🌐 userService.getDepositAccount 응답 데이터:', JSON.stringify(response.data, null, 2));
      return { success: true, data: response.data };
    } catch (error) {
      console.error('🌐 userService.getDepositAccount 에러:', error);
      throw error;
    }
  },

  // 기존 계좌 정보 조회 (호환성을 위해 유지)
  getAccountInfo: async (): Promise<ApiResponse<AccountInfo>> => {
    console.log('🌐 userService.getAccountInfo HTTP 요청 시작');
    try {
      const response = await apiClient.get<ApiResponse<AccountInfo>>('/api/v1/accounts');
      console.log('🌐 userService.getAccountInfo HTTP 요청 완료:', response.status);
      console.log('🌐 userService.getAccountInfo 응답 데이터:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('🌐 userService.getAccountInfo 에러:', error);
      throw error;
    }
  },
};
