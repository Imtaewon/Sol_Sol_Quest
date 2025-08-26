import React, { useState } from 'react';
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

type GPSScreenNavigationProp = StackNavigationProp<MyPageStackParamList, 'GPS'>;

export const GPSScreen: React.FC = () => {
  const navigation = useNavigation<GPSScreenNavigationProp>();
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
        title="GPS·만보기"
        showBack
        onBackPress={() => navigation.goBack()}
        showNotification={false}
      />
      
      <View style={styles.content}>
        {/* 현재 위치 섹션 */}
        <View style={styles.locationSection}>
          <Text style={styles.sectionTitle}>현재 위치</Text>
          <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <Ionicons name="location" size={24} color={COLORS.primary} />
              <Text style={styles.locationText}>위치 정보를 가져오는 중...</Text>
            </View>
            <Text style={styles.locationSubtext}>
              GPS 권한이 필요합니다
            </Text>
          </View>
        </View>

        {/* 만보기 섹션 */}
        <View style={styles.stepSection}>
          <Text style={styles.sectionTitle}>만보기</Text>
          <View style={styles.stepCard}>
            <View style={styles.stepDisplay}>
              <Text style={styles.stepCount}>{stepCount}</Text>
              <Text style={styles.stepLabel}>걸음</Text>
            </View>
            
            <View style={styles.stepInfo}>
              <View style={styles.stepInfoItem}>
                <Text style={styles.stepInfoLabel}>거리</Text>
                <Text style={styles.stepInfoValue}>{(stepCount * 0.7).toFixed(1)}m</Text>
              </View>
              <View style={styles.stepInfoItem}>
                <Text style={styles.stepInfoLabel}>칼로리</Text>
                <Text style={styles.stepInfoValue}>{(stepCount * 0.04).toFixed(1)}kcal</Text>
              </View>
            </View>

            <PrimaryButton
              title={isTracking ? "만보기 중지" : "만보기 시작"}
              onPress={isTracking ? handleStopTracking : handleStartTracking}
              variant={isTracking ? "outline" : "primary"}
              size="large"
              style={styles.trackingButton}
              accessibilityRole="button"
              accessibilityLabel={isTracking ? "만보기 중지 버튼" : "만보기 시작 버튼"}
            />
          </View>
        </View>

        {/* 권한 요청 섹션 */}
        <View style={styles.permissionSection}>
          <Text style={styles.sectionTitle}>권한 설정</Text>
          <View style={styles.permissionCard}>
            <View style={styles.permissionItem}>
              <Ionicons name="location" size={20} color={COLORS.gray[600]} />
              <Text style={styles.permissionText}>위치 권한</Text>
              <TouchableOpacity 
                style={styles.permissionButton}
                accessibilityRole="button"
                accessibilityLabel="위치 권한 요청"
              >
                <Text style={styles.permissionButtonText}>요청</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.permissionItem}>
              <Ionicons name="footsteps" size={20} color={COLORS.gray[600]} />
              <Text style={styles.permissionText}>활동 권한</Text>
              <TouchableOpacity 
                style={styles.permissionButton}
                accessibilityRole="button"
                accessibilityLabel="활동 권한 요청"
              >
                <Text style={styles.permissionButtonText}>요청</Text>
              </TouchableOpacity>
            </View>
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  locationSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.md,
  },
  locationCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  locationText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.dark,
    marginLeft: SPACING.sm,
  },
  locationSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
  },
  stepSection: {
    marginBottom: SPACING.xl,
  },
  stepCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepDisplay: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  stepCount: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  stepLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    marginTop: SPACING.xs,
  },
  stepInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  stepInfoItem: {
    alignItems: 'center',
  },
  stepInfoLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.xs,
  },
  stepInfoValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.dark,
  },
  trackingButton: {
    marginTop: SPACING.md,
  },
  permissionSection: {
    marginBottom: SPACING.xl,
  },
  permissionCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  permissionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.dark,
    flex: 1,
    marginLeft: SPACING.sm,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  permissionButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    fontWeight: '600',
  },
});
