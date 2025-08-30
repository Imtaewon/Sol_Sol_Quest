/**
 * useRanks.ts
 * 
 * 랭킹 관련 커스텀 훅들
 * 
 * 주요 기능:
 * - 학교 랭킹 정보 조회 및 캐싱
 * - 적금 가입 여부에 따른 랭킹 데이터 분기
 * - 총점/평균 기준 랭킹 전환
 * 
 * 포함된 훅들:
 * - useMySchoolRank: 내 학교 랭킹 조회 (비가입자)
 * - useMySchoolRankWithUser: 내 학교 랭킹 조회 (가입자)
 * - useTopSchoolsByTotal: 총점 기준 상위 10개 학교 조회
 * - useTopSchoolsByAverage: 평균 기준 상위 10개 학교 조회
 * 
 * 캐싱 전략:
 * - 랭킹 데이터: 2분 stale time, 5분 gc time
 * - 실시간성보다는 성능 최적화 우선
 * 
 * 조건부 데이터:
 * - 적금 미가입자: 기본 학교 랭킹만 조회
 * - 적금 가입자: 사용자 개인 정보 포함 랭킹 조회
 */

import { useQuery } from '@tanstack/react-query';
import { rankService } from '../services/rankService';

// 내 학교 랭킹 조회 훅 (비가입자)
export const useMySchoolRank = () => {
  console.log('🔍 useMySchoolRank 훅 호출됨');
  return useQuery({
    queryKey: ['ranks', 'mySchool'],
    queryFn: async () => {
      console.log('📡 useMySchoolRank API 호출 시작');
      const result = await rankService.getMySchoolRank();
      console.log('📡 useMySchoolRank API 호출 완료:', result.success ? '성공' : '실패');
      console.log('📡 useMySchoolRank 결과 데이터 구조:', {
        hasData: !!result.data,
        resultKeys: Object.keys(result),
        dataKeys: result.data ? Object.keys(result.data) : []
      });
      console.log('📡 useMySchoolRank 결과 데이터:', JSON.stringify(result, null, 2));
      return result;
    },
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 5 * 60 * 1000, // 5분
  });
};

// 내 학교 랭킹 조회 훅 (가입자)
export const useMySchoolRankWithUser = () => {
  console.log('🔍 useMySchoolRankWithUser 훅 호출됨');
  return useQuery({
    queryKey: ['ranks', 'mySchoolWithUser'],
    queryFn: async () => {
      console.log('📡 useMySchoolRankWithUser API 호출 시작');
      const result = await rankService.getMySchoolRankWithUser();
      console.log('📡 useMySchoolRankWithUser API 호출 완료:', result.success ? '성공' : '실패');
      return result;
    },
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 5 * 60 * 1000, // 5분
  });
};

// 상위 10개 학교 조회 훅 (총점 기준)
export const useTopSchoolsByTotal = () => {
  console.log('🔍 useTopSchoolsByTotal 훅 호출됨');
  return useQuery({
    queryKey: ['ranks', 'topSchools', 'total'],
    queryFn: async () => {
      console.log('📡 useTopSchoolsByTotal API 호출 시작');
      const result = await rankService.getTopSchoolsByTotal();
      console.log('📡 useTopSchoolsByTotal API 호출 완료:', result.success ? '성공' : '실패');
      return result;
    },
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 5 * 60 * 1000, // 5분
  });
};

// 상위 10개 학교 조회 훅 (평균 기준)
export const useTopSchoolsByAverage = () => {
  console.log('🔍 useTopSchoolsByAverage 훅 호출됨');
  return useQuery({
    queryKey: ['ranks', 'topSchools', 'average'],
    queryFn: async () => {
      console.log('📡 useTopSchoolsByAverage API 호출 시작');
      const result = await rankService.getTopSchoolsByAverage();
      console.log('📡 useTopSchoolsByAverage API 호출 완료:', result.success ? '성공' : '실패');
      return result;
    },
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 5 * 60 * 1000, // 5분
  });
};
