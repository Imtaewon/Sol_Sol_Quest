/**
 * LeaderboardScreen.tsx
 * 
 * 학교 랭킹 리더보드 화면
 * 
 * 주요 기능:
 * - 적금 가입 여부에 따른 조건부 렌더링
 * - 내 학교 순위 정보 표시
 * - 상위 10개 학교 목록 표시 (총점/평균 기준)
 * - 카테고리별 랭킹 전환 (총점 ↔ 평균)
 * 
 * 화면 구성:
 * - 내 학교 순위 섹션: 등수, 학교명, 누적EXP, 평균EXP, 인원수
 * - 내 임펙트 섹션: 적금 가입자만 표시 (내 누적EXP)
 * - 상위 10개 학교 섹션: 등수, 학교명, 누적EXP, 인원수
 * - 카테고리 탭: 총점/평균 기준 전환
 * 
 * API 연동:
 * - useMySchoolRank: 내 학교 순위 조회 (비가입자)
 * - useMySchoolRankWithUser: 내 학교 순위 조회 (가입자)
 * - useTopSchoolsByTotal: 총점 기준 상위 학교 조회
 * - useTopSchoolsByAverage: 평균 기준 상위 학교 조회
 * 
 * 조건부 렌더링:
 * - 적금 미가입자: 내 임펙트 섹션 숨김
 * - 적금 가입자: 내 임펙트 섹션 표시
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, APP_CONSTANTS } from '../../utils/constants';
import { formatNumber } from '../../utils/formatters';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { 
  useMySchoolRank, 
  useMySchoolRankWithUser, 
  useTopSchoolsByTotal, 
  useTopSchoolsByAverage 
} from '../../hooks/useRanks';

export const LeaderboardScreen: React.FC = () => {
  // Redux에서 사용자 정보 가져오기
  const user = useSelector((state: RootState) => state.user.user);
  const hasSavings = user?.savingStatus ?? false;

  // 선택된 카테고리 (총점/평균)
  const [selectedCategory, setSelectedCategory] = useState<'total' | 'average'>('total');

  // API 훅들
  const { 
    data: mySchoolRank, 
    isLoading: mySchoolLoading, 
    error: mySchoolError 
  } = hasSavings ? useMySchoolRankWithUser() : useMySchoolRank();

  const { 
    data: topSchools, 
    isLoading: topSchoolsLoading, 
    error: topSchoolsError 
  } = selectedCategory === 'total' ? useTopSchoolsByTotal() : useTopSchoolsByAverage();

  // API 요청 로그
  console.log('🏆 LeaderboardScreen API 상태:', {
    mySchoolRank: { loading: mySchoolLoading, error: mySchoolError, data: mySchoolRank?.data ? '있음' : '없음' },
    topSchools: { loading: topSchoolsLoading, error: topSchoolsError, data: topSchools?.data ? `${topSchools.data.length}개` : '없음' },
    selectedCategory,
    hasSavings
  });

  // 로딩 상태 처리
  if (mySchoolLoading || topSchoolsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>랭킹 정보를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 에러 상태 처리
  if (mySchoolError || topSchoolsError) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>랭킹 정보를 불러오는데 실패했습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderModeToggle = () => (
    <View style={styles.modeToggle}>
      <TouchableOpacity
        style={[
          styles.modeButton,
          selectedCategory === 'total' && styles.modeButtonActive,
        ]}
        onPress={() => setSelectedCategory('total')}
      >
        <Text
          style={[
            styles.modeButtonText,
            selectedCategory === 'total' && styles.modeButtonTextActive,
          ]}
        >
          총점
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.modeButton,
          selectedCategory === 'average' && styles.modeButtonActive,
        ]}
        onPress={() => setSelectedCategory('average')}
      >
        <Text
          style={[
            styles.modeButtonText,
            selectedCategory === 'average' && styles.modeButtonTextActive,
          ]}
        >
          평균
        </Text>
      </TouchableOpacity>
    </View>
  );



  const renderTopSchools = () => (
    <View style={styles.topSchoolsSection}>
      <Text style={styles.sectionTitle}>상위 10개 학교</Text>
      
      {topSchools?.data?.map((school, index) => {
        const rank = index + 1;
        const isTopThree = rank <= 3;
        
        return (
          <View key={school.school} style={[
            styles.schoolCard,
            isTopThree && styles.schoolCardTopThree,
            !isTopThree && styles.schoolCardSmall
          ]}>
            <View style={[
              styles.rankBadge,
              isTopThree && styles.rankBadgeTopThree
            ]}>
              <Text style={[
                styles.rankNumber,
                isTopThree && styles.rankNumberTopThree
              ]}>
                {rank}
              </Text>
            </View>
            
            <View style={styles.schoolInfo}>
              <Text style={[
                styles.schoolName,
                isTopThree && styles.schoolNameTopThree
              ]}>
                {school.school}
              </Text>
              <Text style={[
                styles.schoolStats,
                isTopThree && styles.schoolStatsTopThree
              ]}>
                {selectedCategory === 'total' 
                  ? `총 EXP: ${formatNumber(school.totalExp)} • ${school.memberCount}명`     
                  : `평균 EXP: ${school.averageExp} • ${school.memberCount}명`
                }
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );

  const renderMySchoolRank = () => (
    <View style={styles.mySchoolSection}>
      <Text style={styles.sectionTitle}>내 학교 순위</Text>
      
      <View style={styles.mySchoolCard}>
        <View style={styles.mySchoolHeader}>
          <Text style={styles.mySchoolRank}>#{mySchoolRank?.data?.rank}</Text>
          <Text style={styles.mySchoolName}>{mySchoolRank?.data?.school}</Text>
          <Text style={styles.mySchoolMemberCount}>{mySchoolRank?.data?.memberCount || 0}명</Text>
        </View>
        
        <View style={styles.mySchoolExpStats}>
          <Text style={styles.mySchoolTotalExp}>총 EXP: {formatNumber(mySchoolRank?.data?.totalExp || 0)}</Text>
          <Text style={styles.mySchoolAverageExp}>평균 EXP: {mySchoolRank?.data?.averageExp || 0}</Text>
        </View>

        {hasSavings && mySchoolRank?.data?.myTotalExp && (
          <View style={styles.myImpactSection}>
            <Text style={styles.impactTitle}>내 임팩트</Text>
            <View style={styles.impactContent}>
              <View style={styles.impactLeft}>
                <Text style={styles.impactLabel}>내 임팩트</Text>
              </View>
              <View style={styles.impactRight}>
                <Text style={styles.expAmount}>{formatNumber(mySchoolRank.data.myTotalExp)} EXP</Text>
                <Text style={styles.expLabel}>내 기여도</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="리더보드" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 모드 토글 */}
        <View style={styles.toggleSection}>
          {renderModeToggle()}
        </View>

        {/* 내 학교 순위 */}
        <View style={styles.mySection}>
          {renderMySchoolRank()}
        </View>

        {/* 상위 10개 학교 */}
        <View style={styles.topSection}>
          {renderTopSchools()}
        </View>
      </ScrollView>
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
  },
  toggleSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xs,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modeButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  modeButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.gray[600],
  },
  modeButtonTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  topSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  topSchoolsSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.md,
  },
  schoolCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  schoolCardSmall: {
    padding: SPACING.md,
  },
  schoolCardTopThree: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  rankBadgeTopThree: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.secondary,
  },
  rankNumber: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  rankNumberTopThree: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.xs,
  },
  schoolNameTopThree: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  schoolStats: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  schoolStatsTopThree: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.secondary,
  },
  donationInfo: {
    alignItems: 'flex-end',
  },
  donationAmount: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  donationLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
  },
  mySection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  mySchoolSection: {
    marginBottom: SPACING.lg,
  },
  mySchoolCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mySchoolStatsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  mySchoolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  mySchoolRank: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  mySchoolName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.dark,
    flex: 1,
    marginLeft: SPACING.md,
  },
  mySchoolMemberCount: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.gray[600],
  },
  mySchoolExpStats: {
    marginBottom: SPACING.lg,
  },
  mySchoolTotalExp: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.xs,
  },
  mySchoolAverageExp: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.dark,
  },
  mySchoolStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.dark,
  },
  myImpactSection: {
    marginTop: SPACING.md,
  },
  impactTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.md,
  },
  impactContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  impactLeft: {
    flex: 1,
  },
  impactRight: {
    alignItems: 'flex-end',
  },
  impactLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.dark,
  },
  expInfo: {
    alignItems: 'center',
  },
  expAmount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  expLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    textAlign: 'center',
  },
});




