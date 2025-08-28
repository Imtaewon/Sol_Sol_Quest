import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useGetAttendanceDataQuery, useCheckAttendanceMutation } from '../store/api/baseApi';
import Toast from 'react-native-toast-message';

// 출석 데이터 조회 훅
export const useAttendanceData = (year: number, month: number) => {
  console.log('🔍 useAttendanceData 훅 호출됨:', { year, month });
  return useGetAttendanceDataQuery({ year, month });
};

// 출석 체크 훅
export const useCheckAttendance = () => {
  console.log('🔍 useCheckAttendance 훅 호출됨');
  const queryClient = useQueryClient();
  const [checkAttendance] = useCheckAttendanceMutation();

  const checkAttendanceWithToast = async (data: { year: number; month: number; day: number; user_id: string }) => {
    console.log('📡 useCheckAttendance API 호출 시작:', data);
    try {
      const result = await checkAttendance(data).unwrap();
      console.log('📡 useCheckAttendance API 호출 완료:', result.success ? '성공' : '실패');
      if (result.success) {
        // 출석 데이터 무효화하여 리페치
        queryClient.invalidateQueries({ 
          queryKey: ['attendance', data.year, data.month] 
        });
        
        Toast.show({
          type: 'success',
          text1: '출석 완료!',
          text2: `${result.data?.exp_gained || 0} EXP 획득!`,
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
