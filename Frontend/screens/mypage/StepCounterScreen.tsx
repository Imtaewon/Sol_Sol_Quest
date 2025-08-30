/**
 * StepCounterScreen.tsx
 * 
 * 만보기 기능 화면
 * 
 * 주요 기능:
 * - 만보기 시작/중지 기능
 * - 걸음 수 카운터
 * - 센서 권한 관리
 * 
 * 화면 구성:
 * - 만보기 섹션: 시작/중지 버튼 및 걸음 수 표시
 * - 권한 요청: 센서 권한 관리
 * 
 * 사용 라이브러리:
 * - expo-sensors: 만보기 센서 데이터
 * 
 * 상태 관리:
 * - 만보기 활성화 상태
 * - 걸음 수 카운터
 * 
 * 제한사항:
 * - 적금 가입자만 접근 가능
 * - 센서 권한 필요
 * - 백그라운드에서도 동작 가능
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';
import { MyPageStackParamList } from '../../navigation/MyPageStack';

type StepCounterScreenNavigationProp = StackNavigationProp<MyPageStackParamList, 'StepCounter'>;

export const StepCounterScreen: React.FC = () => {
  const navigation = useNavigation<StepCounterScreenNavigationProp>();
  const [isTracking, setIsTracking] = useState(false);
  const [stepCount, setStepCount] = useState(0);

  const handleStartTracking = () => {
    setIsTracking(true);
    // TODO: 실제 만보기 시작 로직 구현
    console.log('만보기 시작');
  };

  const handleStopTracking = () => {
    setIsTracking(false);
    // TODO: 실제 만보기 중지 로직 구현
    console.log('만보기 중지');
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="만보기"
        showBack
        onBackPress={() => navigation.goBack()}
        showNotification={false}
      />
      
      <View style={styles.content}>
        {/* 만보기 섹션 */}
        <View style={styles.stepSection}>
          <Text style={styles.sectionTitle}>만보기</Text>
          <View style={styles.stepCard}>
            <View style={styles.stepDisplay}>
              <Text style={styles.stepCount}>{stepCount}</Text>
              <Text style={styles.stepLabel}>걸음</Text>
            </View>
            
            <View style={styles.stepControls}>
              {!isTracking ? (
                <PrimaryButton
                  title="만보기 시작"
                  onPress={handleStartTracking}
                  style={styles.startButton}
                />
              ) : (
                <PrimaryButton
                  title="만보기 중지"
                  onPress={handleStopTracking}
                  style={styles.stopButton}
                />
              )}
            </View>
          </View>
        </View>

        {/* 안내 메시지 */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color={COLORS.primary} />
            <Text style={styles.infoText}>
              만보기를 시작하면 걸음 수가 자동으로 카운트됩니다.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
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
  stepSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.md,
  },
  stepCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  stepDisplay: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  stepCount: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  stepLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
  },
  stepControls: {
    width: '100%',
  },
  startButton: {
    backgroundColor: COLORS.primary,
  },
  stopButton: {
    backgroundColor: COLORS.error,
  },
  infoSection: {
    marginBottom: SPACING.xl,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    marginLeft: SPACING.sm,
    flex: 1,
  },
});
