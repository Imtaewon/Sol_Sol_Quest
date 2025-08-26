import { useQuery } from '@tanstack/react-query';
import { rankService } from '../services/rankService';

// 내 학교 랭킹 조회 훅 (비가입자)
export const useMySchoolRank = () => {
  return useQuery({
    queryKey: ['ranks', 'mySchool'],
    queryFn: () => rankService.getMySchoolRank(),
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 5 * 60 * 1000, // 5분
  });
};

// 내 학교 랭킹 조회 훅 (가입자)
export const useMySchoolRankWithUser = () => {
  return useQuery({
    queryKey: ['ranks', 'mySchoolWithUser'],
    queryFn: () => rankService.getMySchoolRankWithUser(),
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 5 * 60 * 1000, // 5분
  });
};

// 상위 10개 학교 조회 훅 (총점 기준)
export const useTopSchoolsByTotal = () => {
  return useQuery({
    queryKey: ['ranks', 'topSchools', 'total'],
    queryFn: () => rankService.getTopSchoolsByTotal(),
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 5 * 60 * 1000, // 5분
  });
};

// 상위 10개 학교 조회 훅 (평균 기준)
export const useTopSchoolsByAverage = () => {
  return useQuery({
    queryKey: ['ranks', 'topSchools', 'average'],
    queryFn: () => rankService.getTopSchoolsByAverage(),
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 5 * 60 * 1000, // 5분
  });
};
