/**
 * useUser.ts
 * 
 * 사용자 정보 관련 커스텀 훅들
 * 
 * 주요 기능:
 * - 사용자 정보 조회 및 캐싱
 * - 계좌 정보 조회
 * - 적금/예금 가입용 개인정보 조회
 * 
 * 포함된 훅들:
 * - useUserInfo: 사용자 기본 정보 조회
 * - usePersonalInfoForSaving: 적금 가입용 개인정보 조회
 * - usePersonalInfoForDeposit: 예금 가입용 개인정보 조회
 * - useAccountInfo: 계좌 정보 조회
 * 
 * 캐싱 전략:
 * - 사용자 정보: 5분 stale time, 10분 gc time
 * - 개인정보: 5분 stale time, 10분 gc time
 * - 계좌 정보: 1분 stale time, 5분 gc time (자주 변경됨)
 * 
 * 에러 처리:
 * - API 호출 실패 시 자동 재시도
 * - 캐시된 데이터 우선 사용
 */

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
