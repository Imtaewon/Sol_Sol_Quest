import apiClient from './apiClient';
import { ApiResponse } from './apiClient';

// 사용자 정보 타입
export interface UserInfo {
  user_id: string;
  name: string;
  email: string;
  university_name?: string;
  current_tier?: string;
  total_exp?: number;
  has_savings?: boolean;
}

// 계좌 정보 타입
export interface AccountInfo {
  demand_deposit?: {
    account_no: string;
    balance: number;
  };
  savings?: {
    monthly_amount: number;
    interest_rate: number;
    maturity_date: string;
  };
  total_balance: number;
  monthly_savings: number;
}

// 적금 계좌 응답 타입
export interface SavingsAccountsResponse {
  data: Array<{
    id: string;
    user_id: string;
    product_code: string;
    linked_dd_account_id: string;
    term_months: number;
    monthly_amount: number;
    interest_rate: number;
    opened_at: string;
    maturity_date: string;
    status: 'active' | 'matured' | 'closed';
  }>;
}

// 예금 계좌 응답 타입
export interface DemandDepositAccountsResponse {
  data: Array<{
    id: string;
    user_id: string;
    account_no: string;
    balance: number;
    opened_at: string;
    closed_at?: string;
  }>;
}

// 개인정보 요청 타입 (적금 가입용)
export interface PersonalInfoForSaving {
  name: string;
  phone: string;
  email: string;
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

// 사용자 서비스 클래스
class UserService {
  // 사용자 정보 조회
  async getUserInfo(): Promise<ApiResponse<UserInfo>> {
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
  }

  // 적금 가입용 개인정보 조회
  async getPersonalInfoForSaving(): Promise<ApiResponse<PersonalInfoForSaving>> {
    const response = await apiClient.get<ApiResponse<PersonalInfoForSaving>>('/user/personal-info/saving');
    return response.data;
  }

  // 예금 가입용 개인정보 조회
  async getPersonalInfoForDeposit(): Promise<ApiResponse<PersonalInfoForDeposit>> {
    const response = await apiClient.get<ApiResponse<PersonalInfoForDeposit>>('/user/personal-info/deposit');
    return response.data;
  }

  // 적금 계좌 정보 조회
  async getSavingsAccount(): Promise<ApiResponse<SavingsAccountsResponse>> {
    console.log('🌐 userService.getSavingsAccount HTTP 요청 시작');
    try {
      // user_id를 쿼리 파라미터로 전송해야 함
      const userInfo = await this.getUserInfo();
      const userId = userInfo?.data?.user_id;
      
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
  }

  // 예금 계좌 정보 조회
  async getDepositAccount(): Promise<ApiResponse<DemandDepositAccountsResponse>> {
    console.log('🌐 userService.getDepositAccount HTTP 요청 시작');
    try {
      // user_id를 쿼리 파라미터로 전송해야 함
      const userInfo = await this.getUserInfo();
      const userId = userInfo?.data?.user_id;
      
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
  }

  // 기존 계좌 정보 조회 (호환성을 위해 유지)
  async getAccountInfo(): Promise<ApiResponse<AccountInfo>> {
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
  }
}

// 싱글톤 인스턴스 생성
export const userService = new UserService();
