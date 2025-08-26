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
    const response = await apiClient.get<ApiResponse<MySchoolRank>>('/ranks/my-school');
    return response.data;
  },

  // 내 학교 랭킹 조회 (가입자)
  getMySchoolRankWithUser: async (): Promise<ApiResponse<MySchoolRankWithUser>> => {
    const response = await apiClient.get<ApiResponse<MySchoolRankWithUser>>('/ranks/my-school-with-user');
    return response.data;
  },

  // 상위 10개 학교 조회 (총점 기준)
  getTopSchoolsByTotal: async (): Promise<ApiResponse<SchoolRank[]>> => {
    const response = await apiClient.get<ApiResponse<SchoolRank[]>>('/ranks/top-schools/total');
    return response.data;
  },

  // 상위 10개 학교 조회 (평균 기준)
  getTopSchoolsByAverage: async (): Promise<ApiResponse<SchoolRank[]>> => {
    const response = await apiClient.get<ApiResponse<SchoolRank[]>>('/ranks/top-schools/average');
    return response.data;
  },
};
