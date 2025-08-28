import apiClient from './apiClient';
import { ApiResponse } from './apiClient';

// 학교 랭킹 타입
export interface SchoolRank {
  rank: number;
  school: string;
  totalExp: number;
  averageExp: number;
  memberCount: number;
}

// 내 학교 랭킹 타입 (비가입자)
export interface MySchoolRank {
  rank: number;
  school: string;
  totalExp: number;
  averageExp: number;
  memberCount: number;
  myTotalExp?: number;
}

// 내 학교 랭킹 타입 (가입자)
export interface MySchoolRankWithUser extends MySchoolRank {
  myTotalExp: number;
}

// 랭킹 서비스
export const rankService = {
  // 내 학교 랭킹 조회 (비가입자)
  getMySchoolRank: async (): Promise<ApiResponse<MySchoolRank>> => {
    console.log('🌐 rankService.getMySchoolRank HTTP 요청 시작');
    try {
      const response = await apiClient.get<ApiResponse<MySchoolRank>>('/api/v1/universities/my-school');
      console.log('🌐 rankService.getMySchoolRank HTTP 요청 완료:', response.status);
      console.log('🌐 rankService.getMySchoolRank 응답 데이터:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('🌐 rankService.getMySchoolRank 에러:', error);
      throw error;
    }
  },

  // 내 학교 랭킹 조회 (가입자)
  getMySchoolRankWithUser: async (): Promise<ApiResponse<MySchoolRankWithUser>> => {
    console.log('🌐 rankService.getMySchoolRankWithUser HTTP 요청 시작');
    try {
      const response = await apiClient.get<ApiResponse<MySchoolRankWithUser>>('/api/v1/universities/my-school');
      console.log('🌐 rankService.getMySchoolRankWithUser HTTP 요청 완료:', response.status);
      console.log('🌐 rankService.getMySchoolRankWithUser 응답 데이터:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('🌐 rankService.getMySchoolRankWithUser 에러:', error);
      throw error;
    }
  },

  // 상위 10개 학교 조회 (총점 기준)
  getTopSchoolsByTotal: async (): Promise<ApiResponse<SchoolRank[]>> => {
    console.log('🌐 rankService.getTopSchoolsByTotal HTTP 요청 시작');
    try {
      const response = await apiClient.get<ApiResponse<SchoolRank[]>>('/api/v1/universities/leaderboard?limit=10');
      console.log('🌐 rankService.getTopSchoolsByTotal HTTP 요청 완료:', response.status);
      console.log('🌐 rankService.getTopSchoolsByTotal 응답 데이터:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('🌐 rankService.getTopSchoolsByTotal 에러:', error);
      throw error;
    }
  },

  // 상위 10개 학교 조회 (평균 기준)
  getTopSchoolsByAverage: async (): Promise<ApiResponse<SchoolRank[]>> => {
    const response = await apiClient.get<ApiResponse<SchoolRank[]>>('/ranks/top-schools/average');
    return response.data;
  },
};
