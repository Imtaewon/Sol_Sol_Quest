import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService, AttendanceCheckRequest } from '../services/attendanceService';
import Toast from 'react-native-toast-message';

// 출석 데이터 조회 훅
export const useAttendanceData = (year: number, month: number) => {
  return useQuery({
    queryKey: ['attendance', year, month],
    queryFn: () => attendanceService.getAttendanceData(year, month),
    staleTime: 1 * 60 * 1000, // 1분
    gcTime: 3 * 60 * 1000, // 3분
  });
};


// 출석 체크 훅
export const useCheckAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AttendanceCheckRequest) => attendanceService.checkAttendance(data),
    onSuccess: (response) => {
      if (response.success) {
        // 출석 데이터 무효화하여 리페치
        const today = new Date();
        queryClient.invalidateQueries({ 
          queryKey: ['attendance', today.getFullYear(), today.getMonth() + 1] 
        });
        
        Toast.show({
          type: 'success',
          text1: '출석 완료!',
          text2: '오늘도 화이팅!',
        });
      }
    },
    onError: (error) => {
      console.error('출석 체크 실패:', error);
      Toast.show({
        type: 'error',
        text1: '출석 체크 실패',
        text2: '다시 시도해주세요.',
      });
    },
  });
};
