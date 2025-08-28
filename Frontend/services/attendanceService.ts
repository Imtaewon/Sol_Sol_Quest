import apiClient from './apiClient';
import { ApiResponse } from './apiClient';

// 출석 데이터 타입
export interface AttendanceData {
  year: number;
  month: number;
  days: {
    [day: number]: boolean;
  };
}

// 출석 체크 요청 타입
export interface AttendanceCheckRequest {
  year: number;
  month: number;
  day: number;
}

// 출석 서비스
export const attendanceService = {
  // 해당 달 출석 데이터 조회
  getAttendanceData: async (year: number, month: number): Promise<ApiResponse<AttendanceData>> => {
    const response = await apiClient.get<ApiResponse<AttendanceData>>(`/attendance/${year}/${month}`);
    return response.data;
  },

  // 출석 체크
  checkAttendance: async (data: AttendanceCheckRequest): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/attendance/check-in', data);
    return response.data;
  },
};
