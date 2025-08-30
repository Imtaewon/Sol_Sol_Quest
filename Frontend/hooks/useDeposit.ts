/**
 * useDeposit.ts
 * 
 * 상시입출금 계좌 관련 커스텀 훅
 * 
 * 주요 기능:
 * - 입금 API 호출
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { depositMoney, DepositMoneyRequest, depositService, DepositSignupRequest } from '../services/depositService';

/**
 * 입금 API 훅
 */
export const useDepositMoney = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DepositMoneyRequest) => {
      console.log('🔍 useDepositMoney 훅 호출됨');
      console.log('입금 요청 데이터:', data);
      return depositMoney(data);
    },
    onSuccess: (data) => {
      console.log('✅ 입금 성공:', data);
      // 계좌 정보 캐시 무효화 (잔액 업데이트를 위해)
      queryClient.invalidateQueries({ queryKey: ['depositAccount'] });
    },
    onError: (error) => {
      console.error('❌ 입금 실패:', error);
    },
  });
};

/**
 * 상시입출금 계좌 생성 API 훅
 */
export const useDepositSignup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DepositSignupRequest) => depositService.signup(data),
    onSuccess: () => {
      // 계좌 정보 캐시 무효화 (새 계좌 생성 후 목록 업데이트를 위해)
      queryClient.invalidateQueries({ queryKey: ['depositAccount'] });
    },
  });
};
