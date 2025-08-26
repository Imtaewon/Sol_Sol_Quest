import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/userService';

// 사용자 정보 조회 훅
export const useUserInfo = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => userService.getUserInfo(),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
};

// 적금 가입용 개인정보 조회 훅
export const usePersonalInfoForSaving = () => {
  return useQuery({
    queryKey: ['personalInfo', 'saving'],
    queryFn: () => userService.getPersonalInfoForSaving(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// 예금 가입용 개인정보 조회 훅
export const usePersonalInfoForDeposit = () => {
  return useQuery({
    queryKey: ['personalInfo', 'deposit'],
    queryFn: () => userService.getPersonalInfoForDeposit(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// 계좌 정보 조회 훅
export const useAccountInfo = () => {
  return useQuery({
    queryKey: ['account'],
    queryFn: () => userService.getAccountInfo(),
    staleTime: 1 * 60 * 1000, // 1분
    gcTime: 5 * 60 * 1000, // 5분
  });
};
