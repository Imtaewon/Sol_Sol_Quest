import apiClient from './apiClient';
import { ApiResponse } from './apiClient';

// 사용자 정보 타입
export interface UserInfo {
  id: number;
  name: string;
  username: string;
  email: string;
  school: string;
  department: string;
  grade: number;
  savingStatus: boolean;
  tier?: string;
  current_tier?: string;
  totalExp?: number;
  interestRate?: number;
}

// 적금 정보 타입
export interface SavingInfo {
  monthlyAmount: number;
  currentBalance: number;
  interestRate: number;
  startDate: string;
  maturityDate: string;
  accountNumber: string;
}

// 예금 정보 타입
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
    const response = await apiClient.get<ApiResponse<UserInfo>>('/user/info');
    console.log('🌐 userService.getUserInfo HTTP 요청 완료:', response.status);
    return response.data;
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

  // 계좌 정보 조회
  getAccountInfo: async (): Promise<ApiResponse<AccountInfo>> => {
    console.log('🌐 userService.getAccountInfo HTTP 요청 시작');
    const response = await apiClient.get<ApiResponse<AccountInfo>>('/user/account');
    console.log('🌐 userService.getAccountInfo HTTP 요청 완료:', response.status);
    return response.data;
  },
};
