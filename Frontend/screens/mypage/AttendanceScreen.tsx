import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZES, BORDER_RADIUS, COLORS } from '../../utils/constants';
import { AppHeader } from '../../components/common/AppHeader';
import { LoadingView } from '../../components/common/LoadingView';
import { ErrorView } from '../../components/common/ErrorView';
import { useAttendanceData, useCheckAttendance } from '../../hooks/useAttendance';

const { width } = Dimensions.get('window');

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'];

export const AttendanceScreen: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [checkAnimation] = useState(new Animated.Value(1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const day = currentDate.getDate();

  const { data: attendanceData, isLoading, error, refetch } = useAttendanceData(year, month);
  const checkAttendanceMutation = useCheckAttendance();

  const isAttendedToday = attendanceData?.data?.days?.[day] || false;

  const handleAttendanceCheck = async () => {
    if (isAttendedToday) {
      return;
    }

    // 출석 체크 애니메이션
    Animated.sequence([
      Animated.timing(checkAnimation, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(checkAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await checkAttendanceMutation.mutateAsync({ year, month, day });
      // 성공 시 데이터 리페치
      refetch();
    } catch (error) {
      console.error('출석 체크 실패:', error);
    }
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getCalendarData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const today = new Date();
    
    const calendarData = [];
    
    // 이전 달의 마지막 날들 (첫 주를 채우기 위해)
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(firstDay);
      prevDate.setDate(prevDate.getDate() - i - 1);
      
      calendarData.push({
        date: prevDate.toISOString().split('T')[0],
        isAttended: false,
        isToday: false,
        isPast: true,
        isCurrentMonth: false,
      });
    }
    
    // 현재 달의 날들
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month - 1, day);
      const dateString = date.toISOString().split('T')[0];
      const isToday = date.toDateString() === today.toDateString();
      
      calendarData.push({
        date: dateString,
        isAttended: attendanceData?.data?.days?.[day] || false,
        isToday,
        isPast: date <= today,
        isCurrentMonth: true,
      });
    }
    
    // 다음 달의 첫 날들 (마지막 주를 채우기 위해)
    const remainingDays = 42 - calendarData.length; // 6주 * 7일 = 42
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(lastDay);
      nextDate.setDate(lastDay.getDate() + day);
      
      calendarData.push({
        date: nextDate.toISOString().split('T')[0],
        isAttended: false,
        isToday: false,
        isPast: false,
        isCurrentMonth: false,
      });
    }
    
    return calendarData;
  };

  if (isLoading) {
    return <LoadingView message="출석 데이터를 불러오는 중..." />;
  }

  if (error) {
    return <ErrorView message="출석 데이터를 불러오는데 실패했습니다." onRetry={refetch} />;
  }

  const renderAttendanceCard = () => (
    <View style={styles.attendanceCard}>
      <View style={styles.attendanceHeader}>
        <Ionicons name="calendar" size={24} color={COLORS.primary} />
        <Text style={styles.attendanceTitle}>오늘의 출석</Text>
      </View>
      
      <View style={styles.attendanceContent}>
        <View style={styles.streakInfo}>
          <Text style={styles.streakNumber}>
            {Object.values(attendanceData?.data?.days || {}).filter(Boolean).length}
          </Text>
          <Text style={styles.streakLabel}>이번 달 출석</Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.checkButton,
            isAttendedToday && styles.checkedButton
          ]}
          onPress={handleAttendanceCheck}
          disabled={isAttendedToday || checkAttendanceMutation.isPending}
          accessibilityRole="button"
          accessibilityLabel={isAttendedToday ? "출석 완료" : "출석하기"}
        >
          <Animated.View style={{ transform: [{ scale: checkAnimation }] }}>
            <Ionicons 
              name={isAttendedToday ? "checkmark-circle" : "checkmark-circle-outline"} 
              size={48} 
              color={isAttendedToday ? COLORS.success : COLORS.primary} 
            />
          </Animated.View>
          <Text style={[
            styles.checkButtonText,
            isAttendedToday && styles.checkedButtonText
          ]}>
            {isAttendedToday ? '출석 완료' : '출석하기'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCalendar = () => {
    const calendarData = getCalendarData();
    const monthYear = `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`;
    
    return (
      <View style={styles.calendarCard}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity 
            onPress={() => changeMonth('prev')}
            accessibilityRole="button"
            accessibilityLabel="이전 달"
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.gray[600]} />
          </TouchableOpacity>
          <Text style={styles.calendarTitle}>{monthYear}</Text>
          <TouchableOpacity 
            onPress={() => changeMonth('next')}
            accessibilityRole="button"
            accessibilityLabel="다음 달"
          >
            <Ionicons name="chevron-forward" size={24} color={COLORS.gray[600]} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.calendarGrid}>
          {/* 요일 헤더 */}
          {DAYS_OF_WEEK.map((day, index) => (
            <View key={index} style={styles.dayHeader}>
              <Text style={[
                styles.dayHeaderText,
                index === 0 && styles.sundayText
              ]}>
                {day}
              </Text>
            </View>
          ))}
          
          {/* 달력 날짜들 */}
          {calendarData.map((day, index) => (
            <View key={index} style={styles.dayCell}>
              <View style={[
                styles.dayContent,
                day.isToday && styles.todayCell,
                day.isAttended && styles.attendedCell,
                !day.isPast && styles.futureCell,
                !day.isCurrentMonth && styles.otherMonthCell
              ]}>
                <Text style={[
                  styles.dayText,
                  day.isToday && styles.todayText,
                  day.isAttended && styles.attendedText,
                  !day.isPast && styles.futureText,
                  !day.isCurrentMonth && styles.otherMonthText
                ]}>
                  {new Date(day.date).getDate()}
                </Text>
                {day.isAttended && (
                  <Ionicons 
                    name="checkmark" 
                    size={12} 
                    color={COLORS.success} 
                    style={styles.attendanceIcon}
                  />
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title="출석 관리" showBackButton />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderAttendanceCard()}
        {renderCalendar()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  attendanceCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  attendanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  attendanceTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginLeft: SPACING.sm,
  },
  attendanceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakInfo: {
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  streakLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    marginTop: SPACING.xs,
  },
  checkButton: {
    alignItems: 'center',
    padding: SPACING.md,
  },
  checkedButton: {
    opacity: 0.7,
  },
  checkButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
  checkedButtonText: {
    color: COLORS.success,
  },
  calendarCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  calendarTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.dark,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayHeader: {
    width: (width - SPACING.lg * 2 - SPACING.md * 6) / 7,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  dayHeaderText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray[600],
  },
  sundayText: {
    color: COLORS.error,
  },
  dayCell: {
    width: (width - SPACING.lg * 2 - SPACING.md * 6) / 7,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  dayContent: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  todayCell: {
    backgroundColor: COLORS.primary,
  },
  attendedCell: {
    backgroundColor: COLORS.success + '20',
  },
  futureCell: {
    opacity: 0.3,
  },
  otherMonthCell: {
    opacity: 0.2,
  },
  dayText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[700],
  },
  todayText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  attendedText: {
    color: COLORS.success,
    fontWeight: '600',
  },
  futureText: {
    color: COLORS.gray[400],
  },
  otherMonthText: {
    color: COLORS.gray[400],
  },
  attendanceIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
});
