import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useGetAttendanceDataQuery, useCheckAttendanceMutation } from '../store/api/baseApi';
import Toast from 'react-native-toast-message';

// 출석 데이터 조회 훅
export const useAttendanceData = (year: number, month: number) => {
  return useGetAttendanceDataQuery({ year, month });
};

// 출석 체크 훅
export const useCheckAttendance = () => {
  const queryClient = useQueryClient();
  const [checkAttendance] = useCheckAttendanceMutation();

  const checkAttendanceWithToast = async (data: { year: number; month: number; day: number }) => {
    try {
      const result = await checkAttendance(data).unwrap();
      if (result.success) {
        // 출석 데이터 무효화하여 리페치
        queryClient.invalidateQueries({ 
          queryKey: ['attendance', data.year, data.month] 
        });
        
        Toast.show({
          type: 'success',
          text1: '출석 완료!',
          text2: '오늘도 화이팅!',
        });
      }
      return result;
    } catch (error) {
      console.error('출석 체크 실패:', error);
      Toast.show({
        type: 'error',
        text1: '출석 체크 실패',
        text2: '다시 시도해주세요.',
      });
      throw error;
    }
  };

  return {
    mutateAsync: checkAttendanceWithToast,
    isPending: false, // RTK Query에서는 isLoading 사용
  };
};
