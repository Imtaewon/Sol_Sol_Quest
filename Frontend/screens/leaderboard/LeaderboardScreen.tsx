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

// 더미 데이터
const mockTopSchools = [
  {
    id: '1',
    name: '서울고등학교',
    totalScore: 2500,
    averageScore: 85.5,
    memberCount: 120,
    predictedDonation: 500000,
  },
  {
    id: '2',
    name: '부산고등학교',
    totalScore: 2200,
    averageScore: 82.3,
    memberCount: 95,
    predictedDonation: 450000,
  },
  {
    id: '3',
    name: '대구고등학교',
    totalScore: 2000,
    averageScore: 78.9,
    memberCount: 88,
    predictedDonation: 400000,
  },
  {
    id: '4',
    name: '인천고등학교',
    totalScore: 1800,
    averageScore: 76.2,
    memberCount: 75,
    predictedDonation: 350000,
  },
  {
    id: '5',
    name: '광주고등학교',
    totalScore: 1700,
    averageScore: 74.8,
    memberCount: 68,
    predictedDonation: 320000,
  },
  {
    id: '6',
    name: '대전고등학교',
    totalScore: 1600,
    averageScore: 73.1,
    memberCount: 62,
    predictedDonation: 300000,
  },
  {
    id: '7',
    name: '울산고등학교',
    totalScore: 1500,
    averageScore: 71.5,
    memberCount: 58,
    predictedDonation: 280000,
  },
  {
    id: '8',
    name: '세종고등학교',
    totalScore: 1400,
    averageScore: 70.2,
    memberCount: 55,
    predictedDonation: 260000,
  },
  {
    id: '9',
    name: '제주고등학교',
    totalScore: 1300,
    averageScore: 69.8,
    memberCount: 52,
    predictedDonation: 240000,
  },
  {
    id: '10',
    name: '강릉고등학교',
    totalScore: 1200,
    averageScore: 68.5,
    memberCount: 48,
    predictedDonation: 220000,
  },
];

const mockMySchoolRank = {
  rank: 15,
  schoolName: '테스트 고등학교',
  totalScore: 1250,
  averageScore: 72.5,
  memberCount: 45,
  predictedDonation: 250000,
  myExp: 1250,
};

export const LeaderboardScreen: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<'총점' | '평균'>('총점');

  const renderModeToggle = () => (
    <View style={styles.modeToggle}>
      {APP_CONSTANTS.LEADERBOARD_MODES.map((mode) => (
        <TouchableOpacity
          key={mode}
          style={[
            styles.modeButton,
            selectedMode === mode && styles.modeButtonActive,
          ]}
          onPress={() => setSelectedMode(mode)}
        >
          <Text
            style={[
              styles.modeButtonText,
              selectedMode === mode && styles.modeButtonTextActive,
            ]}
          >
            {mode}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTopSchools = () => (
    <View style={styles.topSchoolsSection}>
      <Text style={styles.sectionTitle}>상위 10개 학교</Text>
      
      {mockTopSchools.map((school, index) => (
        <View key={school.id} style={[
          styles.schoolCard,
          index >= 3 && styles.schoolCardSmall
        ]}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankNumber}>{index + 1}</Text>
          </View>
          
          <View style={styles.schoolInfo}>
            <Text style={styles.schoolName}>{school.name}</Text>
            <Text style={styles.schoolStats}>
              {selectedMode === '총점' 
                ? `총 EXP: ${formatNumber(school.totalScore)} • ${school.memberCount}명`
                : `평균 EXP: ${school.averageScore} • ${school.memberCount}명`
              }
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderMySchoolRank = () => (
    <View style={styles.mySchoolSection}>
      <Text style={styles.sectionTitle}>내 학교 순위</Text>
      
      <View style={styles.mySchoolCard}>
        <View style={styles.mySchoolHeader}>
          <Text style={styles.mySchoolRank}>#{mockMySchoolRank.rank}</Text>
          <Text style={styles.mySchoolName}>{mockMySchoolRank.schoolName}</Text>
        </View>
        
                 <View style={styles.myImpactSection}>
           <Text style={styles.impactTitle}>내 임팩트</Text>
           <View style={styles.impactContent}>
             <View style={styles.impactLeft}>
               <Text style={styles.impactLabel}>내 임팩트</Text>
             </View>
             <View style={styles.impactRight}>
               <Text style={styles.expAmount}>{mockMySchoolRank.myExp} EXP</Text>
               <Text style={styles.expLabel}>내 기여도</Text>
             </View>
           </View>
         </View>
         
         <View style={styles.mySchoolStats}>
           <View style={styles.statItem}>
             <Text style={styles.statLabel}>총점</Text>
             <Text style={styles.statValue}>{formatNumber(mockMySchoolRank.totalScore)}점</Text>
           </View>
           <View style={styles.statItem}>
             <Text style={styles.statLabel}>평균</Text>
             <Text style={styles.statValue}>{mockMySchoolRank.averageScore}점</Text>
           </View>
           <View style={styles.statItem}>
             <Text style={styles.statLabel}>참여자</Text>
             <Text style={styles.statValue}>{mockMySchoolRank.memberCount}명</Text>
           </View>
         </View>
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
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  rankNumber: {
    fontSize: FONT_SIZES.lg,
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
  schoolStats: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
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
  mySchoolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  mySchoolRank: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: SPACING.md,
  },
  mySchoolName: {
    fontSize: FONT_SIZES.lg,
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
});




