/**
 * HomeScreen.tsx
 * 
 * 앱의 메인 홈 화면
 * 
 * 주요 기능:
 * - 적금 가입 여부에 따른 조건부 렌더링
 * - 내 계좌 정보 표시 (적금/예금)
 * - 학교 랭킹 정보 표시
 * - 추천 퀘스트 목록 및 수령 기능
 * 
 * 화면 구성:
 * - 내 계좌 섹션: 적금/예금 잔액 및 가입하기 버튼
 * - 학교 랭킹 섹션: 내 학교 순위 및 상위 학교 목록
 * - 추천 퀘스트 섹션: 진행중인 퀘스트 및 수령하기 버튼
 * 
 * API 연동:
 * - useUserInfo: 사용자 정보 조회
 * - useAccountInfo: 계좌 정보 조회
 * - useMySchoolRank: 학교 랭킹 조회
 * - useRecommendedQuests: 추천 퀘스트 조회
 * - useClaimQuest: 퀘스트 수령
 * 
 * 상태 관리:
 * - 적금 가입 여부에 따른 UI 분기
 * - 새로고침 기능
 * - 로딩/에러 상태 처리
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { LoadingView } from '../../components/common/LoadingView';
import { ErrorView } from '../../components/common/ErrorView';
import { EmptyView } from '../../components/common/EmptyView';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { RootState } from '../../store';
import { HomeStackParamList } from '../../navigation/HomeStack';
import { MainTabsParamList } from '../../navigation/MainTabs';
import { useUserInfo, useSavingsAccount, useDepositAccount } from '../../hooks/useUser';
import { useMySchoolRank, useMySchoolRankWithUser } from '../../hooks/useRanks';
import { useRecommendedQuests, useClaimQuest } from '../../hooks/useQuests';

const { width } = Dimensions.get('window');

type HomeScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<HomeStackParamList, 'Home'>,
  BottomTabNavigationProp<MainTabsParamList>
>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const user = useSelector((state: RootState) => state.user.user);

  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const carouselRef = React.useRef<ScrollView>(null);

  // API 훅들
  const { data: userInfo, isLoading: userLoading, error: userError, refetch: refetchUser } = useUserInfo();
  
  // 계좌 정보 조회 (항상 호출하되, 데이터 존재 여부로 판단)
  const { data: savingsAccount, isLoading: savingsLoading, error: savingsError, refetch: refetchSavings } = useSavingsAccount();
  const { data: depositAccount, isLoading: depositLoading, error: depositError, refetch: refetchDeposit } = useDepositAccount();
  
  // 계좌 존재 여부로 hasSavings 판단
  const hasSavings = (savingsAccount?.data?.data && savingsAccount.data.data.length > 0) || 
                     (depositAccount?.data?.data && depositAccount.data.data.length > 0);
  
  // 학교 랭킹 API 호출 (적금 가입 여부와 관계없이 동일한 API 사용)
  const { 
    data: schoolRank, 
    isLoading: rankLoading, 
    error: rankError, 
    refetch: refetchRank 
  } = useMySchoolRank();
  
  // has_savings가 true일 때만 추천 퀘스트 조회
  const questsQuery = hasSavings ? useRecommendedQuests(hasSavings) : { data: undefined, isLoading: false, error: undefined, refetch: () => Promise.resolve() };
  const { 
    data: recommendedQuests, 
    isLoading: questsLoading, 
    error: questsError, 
    refetch: refetchQuests 
  } = questsQuery;

  // API 요청 로그
  console.log('🏠 HomeScreen API 상태:', {
    userInfo: { loading: userLoading, error: userError, data: userInfo?.data ? '있음' : '없음' },
    savingsAccount: { loading: savingsLoading, error: savingsError, data: savingsAccount?.data ? '있음' : '없음' },
    depositAccount: { loading: depositLoading, error: depositError, data: depositAccount?.data ? '있음' : '없음' },
    schoolRank: { loading: rankLoading, error: rankError, data: schoolRank?.data ? '있음' : '없음' },
    recommendedQuests: { loading: questsLoading, error: questsError, data: recommendedQuests?.data ? '있음' : '없음' }
  });

  const claimQuestMutation = useClaimQuest();

  // 새로고침 처리
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchUser();
      await refetchRank();
      
      // has_savings가 true일 때만 계좌 정보 새로고침
      if (hasSavings) {
        await refetchSavings();
        await refetchDeposit();
        await refetchQuests();
      }
    } finally {
      setRefreshing(false);
    }
  };

  // 로딩 상태 처리 - has_savings가 false면 계좌 관련 로딩은 무시
  const isLoading = userLoading || rankLoading || (hasSavings && (savingsLoading || depositLoading || questsLoading));
  
  console.log('🏠 HomeScreen 로딩 상태:', {
    userLoading,
    savingsLoading,
    depositLoading,
    rankLoading,
    questsLoading,
    hasSavings,
    isLoading
  });
  
  if (isLoading) {
    console.log('🏠 HomeScreen 로딩 화면 표시');
    return <LoadingView message="데이터를 불러오는 중..." />;
  }

  // 에러 상태 처리
  const hasError = userError || rankError || (hasSavings && (savingsError || depositError || questsError));
  if (hasError) {
    return (
      <ErrorView 
        message="데이터를 불러오는데 실패했습니다." 
        onRetry={onRefresh}
      />
    );
  }

  const handleCarouselScroll = (event: any) => {
    const slideSize = width - SPACING.lg * 2;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentCarouselIndex(index);
  };

  const scrollToIndex = (index: number) => {
    const slideSize = width - SPACING.lg * 2;
    carouselRef.current?.scrollTo({
      x: index * slideSize,
      animated: true
    });
    setCurrentCarouselIndex(index);
  };

  // 퀘스트 수령 처리
  const handleClaimQuest = async (questId: string, expReward: number) => {
    try {
      await claimQuestMutation.mutateAsync({ questId, expReward });
    } catch (error) {
      console.error('퀘스트 수령 실패:', error);
    }
  };

  const renderAccountCarousel = () => (
    <View style={styles.accountsSection}>
      <Text style={styles.sectionTitle}>내 계좌</Text>
      <ScrollView 
        ref={carouselRef}
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.carouselContainer}
        pagingEnabled
        onScroll={handleCarouselScroll}
        scrollEventThrottle={16}
        decelerationRate={0.8}
        snapToInterval={width - SPACING.lg * 2}
        snapToAlignment="start"
      >
        {hasSavings ? (
          // 가입자: 실제 계좌 정보 표시
          <>
                         {savingsAccount?.data?.data && savingsAccount.data.data.length > 0 && (
               <TouchableOpacity 
                 style={styles.accountCard}
                 accessibilityRole="button"
                 accessibilityLabel="적금 계좌 카드"
               >
                 <View style={styles.accountHeader}>
                   <Text style={styles.accountType}>적금</Text>
                   <Ionicons name="trending-up" size={20} color={COLORS.secondary} />
                 </View>
                 <Text style={styles.accountBalance}>
                   월 {formatCurrency(savingsAccount.data.data[0].monthly_amount)} 납입
                 </Text>
                 <Text style={styles.accountNumber}>
                   계좌번호: {savingsAccount.data.data[0].id}
                 </Text>
                 <Text style={styles.monthlyAmount}>
                   이율: {savingsAccount.data.data[0].interest_rate}%
                 </Text>
               </TouchableOpacity>
             )}
                         {depositAccount?.data?.data && depositAccount.data.data.length > 0 && (
               <TouchableOpacity 
                 style={styles.accountCard}
                 accessibilityRole="button"
                 accessibilityLabel="예금 계좌 카드"
               >
                 <View style={styles.accountHeader}>
                   <Text style={styles.accountType}>예금</Text>
                   <Ionicons name="wallet" size={20} color={COLORS.primary} />
                 </View>
                 <Text style={styles.accountBalance}>
                   입출금 계좌
                 </Text>
                 <Text style={styles.accountNumber}>
                   계좌번호: {depositAccount.data.data[0].account_no}
                 </Text>
               </TouchableOpacity>
             )}
          </>
        ) : (
          // 비가입자: CTA 카드
          <>
            <TouchableOpacity 
              style={[
                styles.accountCard, 
                styles.savingsCTACard
              ]}
              onPress={() => navigation.navigate('SavingOpen')}
            >
              <View style={styles.newAccountIconContainer}>
                <Ionicons name="add-circle" size={32} color={COLORS.primary} />
              </View>
              <Text style={styles.newAccountText}>새 적금 개설</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.accountCard, 
                styles.depositCTACard
              ]}
              onPress={() => navigation.navigate('DepositOpen')}
            >
              <View style={styles.newAccountIconContainer}>
                <Ionicons name="add-circle" size={32} color={COLORS.primary} />
              </View>
              <Text style={styles.newAccountText}>새 예금 개설</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
      
             {/* 페이지 인디케이터 */}
       <View style={styles.pageIndicator}>
         {hasSavings ? 
           [
             savingsAccount?.data?.data && savingsAccount.data.data.length > 0,
             depositAccount?.data?.data && depositAccount.data.data.length > 0
           ].filter(Boolean).map((_, index) => (
             <TouchableOpacity
               key={index}
               style={[
                 styles.indicatorDot,
                 index === currentCarouselIndex && styles.indicatorDotActive
               ]}
               onPress={() => scrollToIndex(index)}
               accessibilityRole="button"
               accessibilityLabel={`${index + 1}번째 계좌`}
             />
           )) :
           [1, 2].map((_, index) => (
             <TouchableOpacity
               key={index}
               style={[
                 styles.indicatorDot,
                 index === currentCarouselIndex && styles.indicatorDotActive
               ]}
               onPress={() => scrollToIndex(index)}
               accessibilityRole="button"
               accessibilityLabel={`${index + 1}번째 카드`}
             />
           ))
         }
       </View>
    </View>
  );

  const renderSchoolRanking = () => (
    <View style={styles.rankingCard}>
      <View style={styles.rankingHeader}>
        <Text style={styles.rankingTitle}>학교 랭킹</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Leaderboard')}
          accessibilityRole="button"
          accessibilityLabel="리더보드 더보기"
        >
          <Text style={styles.rankingMore}>더보기</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.rankingContent}>
        <View style={styles.rankingItem}>
          <Text style={styles.rankingRank}>#{schoolRank?.data?.rank}</Text>
          <Text style={styles.rankingSchool}>{schoolRank?.data?.school}</Text>
          <Text style={styles.rankingScore}>{formatNumber(schoolRank?.data?.totalExp || 0)}점</Text>
        </View>
        <Text style={styles.rankingMemberCount}>
          {schoolRank?.data?.memberCount}명 참여
        </Text>
        {hasSavings && schoolRank?.data?.myTotalExp && (
          <Text style={styles.myExpText}>
            내 누적 경험치: {formatNumber(schoolRank.data.myTotalExp)}점
          </Text>
        )}
      </View>
    </View>
  );

  const renderQuestsPreview = () => (
    <View style={styles.questsCard}>
      <View style={styles.questsHeader}>
        <Text style={styles.questsTitle}>추천 퀘스트</Text>
        <View style={styles.questsHeaderButtons}>
          <TouchableOpacity 
            style={styles.questTrackerButton}
            onPress={() => navigation.navigate('QuestTracker')}
            accessibilityRole="button"
            accessibilityLabel="퀘스트 추적기"
          >
            <Ionicons name="location" size={16} color={COLORS.primary} />
            <Text style={styles.questTrackerText}>추적기</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Quests')}
            accessibilityRole="button"
            accessibilityLabel="퀘스트 전체보기"
          >
            <Text style={styles.questsMore}>전체보기</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {hasSavings ? (
        recommendedQuests?.data && recommendedQuests.data.quest_ids && recommendedQuests.data.quest_ids.length > 0 ? (
          <View style={styles.questsList}>
            {recommendedQuests.data.quest_ids.slice(0, 3).map((questId, index) => (
              <View key={questId} style={styles.questItem}>
                <View style={styles.questInfo}>
                  <Text style={styles.questTitle}>추천 퀘스트 {index + 1}</Text>
                  <Text style={styles.questDescription}>퀘스트 ID: {questId}</Text>
                </View>
                <View style={styles.questReward}>
                  <Text style={styles.questRewardText}>EXP 보상</Text>
                  <PrimaryButton
                    title="시작하기"
                    onPress={() => {
                      // 퀘스트 상세 페이지로 이동하거나 퀘스트 시작 로직
                      console.log('퀘스트 시작:', questId);
                    }}
                    size="small"
                    style={styles.claimButton}
                    accessibilityRole="button"
                    accessibilityLabel="퀘스트 시작"
                  />
                </View>
              </View>
            ))}
            {recommendedQuests.data.message && (
              <Text style={styles.recommendationMessage}>
                {recommendedQuests.data.message}
              </Text>
            )}
          </View>
        ) : (
          <EmptyView message="추천 퀘스트가 없습니다." icon="🎯" />
        )
      ) : (
        <View style={styles.noSavingsOverlay}>
          <Text style={[styles.noSavingsText, styles.blurredText]}>
            적금 가입 후 이용 가능합니다
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 계좌 캐러셀 */}
        {renderAccountCarousel()}

        {/* 학교 랭킹 */}
        <View style={styles.rankingSection}>
          {renderSchoolRanking()}
        </View>

        {/* 퀘스트 미리보기 */}
        <View style={styles.questsSection}>
          {renderQuestsPreview()}
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
  accountsSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.md,
  },
  carouselContainer: {
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginRight: SPACING.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: width - SPACING.lg * 2,
    height: 200, // 고정 높이 설정
    flexShrink: 0,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  accountType: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    fontWeight: '500',
  },
  accountBalance: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: SPACING.xs,
  },
  accountNumber: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
  },
  monthlyAmount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
    marginTop: SPACING.xs,
  },
  rankingSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  rankingCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rankingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  rankingTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.dark,
  },
  rankingMore: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  rankingContent: {
    alignItems: 'center',
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  rankingRank: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: SPACING.sm,
  },
  rankingSchool: {
    fontSize: FONT_SIZES.md,
    color: COLORS.dark,
    flex: 1,
  },
  rankingScore: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  rankingMemberCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
  },
  myExpText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
    marginTop: SPACING.xs,
  },
  questsSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  questsCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  blurredCard: {
    opacity: 0.5,
  },
  blurredText: {
    opacity: 0.3,
    filter: 'blur(1px)',
  },
  questsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  questsHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  questTrackerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.xs,
  },
  questTrackerText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '500',
  },
  questsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.dark,
  },
  questsMore: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  questsList: {
    gap: SPACING.md,
  },
  questItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  questInfo: {
    flex: 1,
  },
  questTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.dark,
    marginBottom: SPACING.xs,
  },
  questDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
    marginTop: SPACING.xs,
  },
  questProgress: {
    alignItems: 'flex-start',
  },
  questProgressText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
  },
  questReward: {
    alignItems: 'flex-end',
  },
  questRewardText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  claimButton: {
    minWidth: 60,
  },
  completedText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
    fontStyle: 'italic',
  },
  recommendationMessage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  noSavingsOverlay: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  noSavingsText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[500],
    textAlign: 'center',
  },
  savingsCTACard: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    borderStyle: 'dashed',
    height: 200, // 고정 높이 설정
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingsCTAContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  savingsCTATitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.xs,
  },
  savingsCTASubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.md,
  },
  savingsCTAButton: {
    width: '80%',
  },
  depositCTACard: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    borderStyle: 'dashed',
    height: 200, // 고정 높이 설정
    justifyContent: 'center',
    alignItems: 'center',
  },
  depositCTAContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  depositCTATitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.xs,
  },
  depositCTASubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.md,
  },
  depositCTAButton: {
    width: '80%',
  },
  // 새로운 계좌 가입 카드 스타일
  newAccountIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  newAccountText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
  },
  pageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray[300],
  },
  indicatorDotActive: {
    backgroundColor: COLORS.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

