import apiClient from './apiClient';
import { ApiResponse } from './apiClient';

// 백엔드 UniversityLeaderboardResponse 구조에 맞춘 타입
export interface UniversityItem {
  university_code: string;
  university_name: string;
  savings_students: number;
  total_exp: number;
  avg_exp: number;
  rank_overall?: number;
  rank_avg?: number;
  user_total_exp?: number;
}

export interface UniversityLeaderboardResponse {
  my_university: UniversityItem | null;
  top10_overall: UniversityItem[];
  top10_avg: UniversityItem[];
}

// 기존 호환성을 위한 타입들
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
  // 전체 랭킹 데이터 조회 (내 학교 + 상위 10개 학교)
  getLeaderboard: async (): Promise<ApiResponse<UniversityLeaderboardResponse>> => {
    console.log('🌐 rankService.getLeaderboard HTTP 요청 시작');
    try {
      const response = await apiClient.get<ApiResponse<UniversityLeaderboardResponse>>('/api/v1/universities/leaderboard');
      console.log('🌐 rankService.getLeaderboard HTTP 요청 완료:', response.status);
      console.log('🌐 rankService.getLeaderboard 응답 데이터:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('🌐 rankService.getLeaderboard 에러:', error);
      throw error;
    }
  },

  // 내 학교 랭킹 조회 (비가입자) - 기존 호환성을 위해 유지
  getMySchoolRank: async (): Promise<ApiResponse<MySchoolRank>> => {
    console.log('🌐 rankService.getMySchoolRank HTTP 요청 시작');
    console.log('🌐 rankService.getMySchoolRank 요청 URL:', '/api/v1/universities/leaderboard');
    try {
      const response = await apiClient.get<ApiResponse<UniversityLeaderboardResponse>>('/api/v1/universities/leaderboard');
      console.log('🌐 rankService.getMySchoolRank HTTP 요청 완료:', response.status);
      console.log('🌐 rankService.getMySchoolRank 응답 헤더:', response.headers);
      console.log('🌐 rankService.getMySchoolRank 전체 응답 데이터:', JSON.stringify(response.data, null, 2));
      
      // 응답 구조 분석
      console.log('🌐 rankService.getMySchoolRank 응답 구조 분석:', {
        hasMyUniversity: !!response.data.my_university,
        hasTop10Overall: !!response.data.top10_overall,
        hasTop10Avg: !!response.data.top10_avg,
        responseKeys: Object.keys(response.data)
      });
      
      // 백엔드 응답 데이터 상세 로그
      console.log('🌐 rankService.getMySchoolRank 백엔드 응답 상세:', {
        my_university: response.data.my_university,
        top10_overall: response.data.top10_overall?.length || 0,
        top10_avg: response.data.top10_avg?.length || 0
      });
      
      // my_university 데이터를 MySchoolRank 형식으로 변환
      // 백엔드에서 UniversityLeaderboardResponse를 직접 반환하므로 response.data에서 직접 접근
      const myUniversity = response.data.my_university;
      console.log('🌐 rankService.getMySchoolRank my_university 원본 데이터:', myUniversity);
      
      if (!myUniversity) {
        console.log('🌐 rankService.getMySchoolRank my_university 데이터 없음 - 기본값 반환');
        return {
          success: true,
          data: {
            rank: 0,
            school: '',
            totalExp: 0,
            averageExp: 0,
            memberCount: 0
          }
        };
      }

      const result: MySchoolRank = {
        rank: myUniversity.rank_overall || 0,
        school: myUniversity.university_name,
        totalExp: myUniversity.total_exp,
        averageExp: myUniversity.avg_exp,
        memberCount: myUniversity.savings_students
      };

      console.log('🌐 rankService.getMySchoolRank 변환된 데이터:', JSON.stringify(result, null, 2));
      console.log('🌐 rankService.getMySchoolRank 최종 반환 데이터:', { success: true, data: result });
      return { success: true, data: result };
    } catch (error: any) {
      console.error('🌐 rankService.getMySchoolRank 에러:', error);
      console.error('🌐 rankService.getMySchoolRank 에러 메시지:', error.message);
      console.error('🌐 rankService.getMySchoolRank 에러 응답:', error.response?.data);
      console.error('🌐 rankService.getMySchoolRank 에러 상태:', error.response?.status);
      throw error;
    }
  },

  // 내 학교 랭킹 조회 (가입자) - 기존 호환성을 위해 유지
  getMySchoolRankWithUser: async (): Promise<ApiResponse<MySchoolRankWithUser>> => {
    console.log('🌐 rankService.getMySchoolRankWithUser HTTP 요청 시작');
    try {
      const response = await apiClient.get<ApiResponse<UniversityLeaderboardResponse>>('/api/v1/universities/leaderboard');
      console.log('🌐 rankService.getMySchoolRankWithUser HTTP 요청 완료:', response.status);
      
      // my_university 데이터를 MySchoolRankWithUser 형식으로 변환
      // 백엔드에서 UniversityLeaderboardResponse를 직접 반환하므로 response.data에서 직접 접근
      const myUniversity = response.data.my_university;
      if (!myUniversity) {
        return {
          success: true,
          data: {
            rank: 0,
            school: '',
            totalExp: 0,
            averageExp: 0,
            memberCount: 0,
            myTotalExp: 0
          }
        };
      }

      const result: MySchoolRankWithUser = {
        rank: myUniversity.rank_overall || 0,
        school: myUniversity.university_name,
        totalExp: myUniversity.total_exp,
        averageExp: myUniversity.avg_exp,
        memberCount: myUniversity.savings_students,
        myTotalExp: myUniversity.user_total_exp || 0
      };

      console.log('🌐 rankService.getMySchoolRankWithUser 변환된 데이터:', JSON.stringify(result, null, 2));
      return { success: true, data: result };
    } catch (error) {
      console.error('🌐 rankService.getMySchoolRankWithUser 에러:', error);
      throw error;
    }
  },

  // 상위 10개 학교 조회 (총점 기준) - 기존 호환성을 위해 유지
  getTopSchoolsByTotal: async (): Promise<ApiResponse<SchoolRank[]>> => {
    console.log('🌐 rankService.getTopSchoolsByTotal HTTP 요청 시작');
    try {
      const response = await apiClient.get<ApiResponse<UniversityLeaderboardResponse>>('/api/v1/universities/leaderboard');
      console.log('🌐 rankService.getTopSchoolsByTotal HTTP 요청 완료:', response.status);
      
      // top10_overall 데이터를 SchoolRank[] 형식으로 변환
      const topSchools = response.data.top10_overall || [];
      const result: SchoolRank[] = topSchools.map(school => ({
        rank: school.rank_overall || 0,
        school: school.university_name,
        totalExp: school.total_exp,
        averageExp: school.avg_exp,
        memberCount: school.savings_students
      }));

      console.log('🌐 rankService.getTopSchoolsByTotal 변환된 데이터:', JSON.stringify(result, null, 2));
      return { success: true, data: result };
    } catch (error) {
      console.error('🌐 rankService.getTopSchoolsByTotal 에러:', error);
      throw error;
    }
  },

  // 상위 10개 학교 조회 (평균 기준) - 기존 호환성을 위해 유지
  getTopSchoolsByAverage: async (): Promise<ApiResponse<SchoolRank[]>> => {
    console.log('🌐 rankService.getTopSchoolsByAverage HTTP 요청 시작');
    try {
      const response = await apiClient.get<ApiResponse<UniversityLeaderboardResponse>>('/api/v1/universities/leaderboard');
      console.log('🌐 rankService.getTopSchoolsByAverage HTTP 요청 완료:', response.status);
      
      // top10_avg 데이터를 SchoolRank[] 형식으로 변환
      const topSchools = response.data.top10_avg || [];
      const result: SchoolRank[] = topSchools.map(school => ({
        rank: school.rank_avg || 0,
        school: school.university_name,
        totalExp: school.total_exp,
        averageExp: school.avg_exp,
        memberCount: school.savings_students
      }));

      console.log('🌐 rankService.getTopSchoolsByAverage 변환된 데이터:', JSON.stringify(result, null, 2));
      return { success: true, data: result };
    } catch (error) {
      console.error('🌐 rankService.getTopSchoolsByAverage 에러:', error);
      throw error;
    }
  },
};
