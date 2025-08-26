import { baseApi } from './baseApi';
import { 
  SchoolLeaderboard,
  LeaderboardEntry,
  ApiResponse,
  PaginatedResponse
} from '../../types/database';

export interface LeaderboardRequest {
  type: 'overall' | 'average'; // 종합 랭킹 또는 평균 랭킹
  page?: number;
  limit?: number;
}

export const leaderboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 학교 리더보드 조회 (종합)
    getOverallLeaderboard: builder.query<PaginatedResponse<LeaderboardEntry>, {
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/leaderboard/overall',
        method: 'GET',
        params,
      }),
    }),

    // 학교 리더보드 조회 (평균)
    getAverageLeaderboard: builder.query<PaginatedResponse<LeaderboardEntry>, {
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/leaderboard/average',
        method: 'GET',
        params,
      }),
    }),

    // 내 학교 순위 조회
    getMySchoolRank: builder.query<LeaderboardEntry, void>({
      query: () => ({
        url: '/leaderboard/my-school',
        method: 'GET',
      }),
    }),

    // 학교 상세 정보 조회
    getSchoolDetail: builder.query<SchoolLeaderboard, string>({
      query: (schoolId) => ({
        url: `/leaderboard/schools/${schoolId}`,
        method: 'GET',
      }),
    }),

    // 상위 학교 목록 (간단 버전)
    getTopSchools: builder.query<LeaderboardEntry[], { limit?: number }>({
      query: (params) => ({
        url: '/leaderboard/top',
        method: 'GET',
        params,
      }),
    }),
  }),
});

export const {
  useGetOverallLeaderboardQuery,
  useGetAverageLeaderboardQuery,
  useGetMySchoolRankQuery,
  useGetSchoolDetailQuery,
  useGetTopSchoolsQuery,
} = leaderboardApi;
