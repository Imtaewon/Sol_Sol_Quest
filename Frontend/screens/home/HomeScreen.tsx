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
import { useUserInfo } from '../../hooks/useUser';
import { useAccountInfo } from '../../hooks/useUser';
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
  const hasSavings = user?.savingStatus ?? false;

  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // API 훅들
  const { data: userInfo, isLoading: userLoading, error: userError, refetch: refetchUser } = useUserInfo();
  const { data: accountInfo, isLoading: accountLoading, error: accountError, refetch: refetchAccount } = useAccountInfo();
  
  // 적금 가입 여부에 따라 다른 랭킹 API 호출
  const { 
    data: schoolRank, 
    isLoading: rankLoading, 
    error: rankError, 
    refetch: refetchRank 
  } = hasSavings ? useMySchoolRankWithUser() : useMySchoolRank();
  
  const { 
    data: recommendedQuests, 
    isLoading: questsLoading, 
    error: questsError, 
    refetch: refetchQuests 
  } = useRecommendedQuests();

  const claimQuestMutation = useClaimQuest();

  // 새로고침 처리
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchUser(),
        refetchAccount(),
        refetchRank(),
        refetchQuests(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  // 로딩 상태 처리
  if (userLoading || accountLoading || rankLoading || questsLoading) {
    return <LoadingView message="데이터를 불러오는 중..." />;
  }

  // 에러 상태 처리
  if (userError || accountError || rankError || questsError) {
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

  const carouselRef = React.useRef<ScrollView>(null);

  // 퀘스트 수령 처리
  const handleClaimQuest = async (questId: number, expReward: number) => {
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
      >
        {hasSavings ? (
          // 가입자: 실제 계좌 정보 표시
          <>
            {accountInfo?.data?.saving && (
              <TouchableOpacity 
                style={[styles.accountCard, { width: width - SPACING.lg * 2 }]}
                onPress={() => navigation.navigate('Assets')}
                accessibilityRole="button"
                accessibilityLabel="적금 계좌 카드"
              >
                <View style={styles.accountHeader}>
                  <Text style={styles.accountType}>적금</Text>
                  <Ionicons name="trending-up" size={20} color={COLORS.secondary} />
                </View>
                <Text style={styles.accountBalance}>
                  {formatCurrency(accountInfo.data.saving.currentBalance)}
                </Text>
                <Text style={styles.accountNumber}>
                  {accountInfo.data.saving.accountNumber}
                </Text>
                <Text style={styles.monthlyAmount}>
                  월 {formatCurrency(accountInfo.data.saving.monthlyAmount)} 납입
                </Text>
              </TouchableOpacity>
            )}
            {accountInfo?.data?.deposit && (
              <TouchableOpacity 
                style={[styles.accountCard, { width: width - SPACING.lg * 2 }]}
                onPress={() => navigation.navigate('Assets')}
                accessibilityRole="button"
                accessibilityLabel="예금 계좌 카드"
              >
                <View style={styles.accountHeader}>
                  <Text style={styles.accountType}>예금</Text>
                  <Ionicons name="wallet" size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.accountBalance}>
                  {formatCurrency(accountInfo.data.deposit.currentBalance)}
                </Text>
                <Text style={styles.accountNumber}>
                  {accountInfo.data.deposit.accountNumber}
                </Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          // 비가입자: CTA 카드
          <>
            <View 
              style={[
                styles.accountCard, 
                styles.savingsCTACard,
                { width: width - SPACING.lg * 2 }
              ]}
            >
              <View style={styles.accountHeader}>
                <Text style={styles.accountType}>적금</Text>
                <Ionicons name="trending-up" size={20} color={COLORS.secondary} />
              </View>
              <View style={styles.savingsCTAContent}>
                <Text style={styles.savingsCTATitle}>적금 가입하고</Text>
                <Text style={styles.savingsCTASubtitle}>퀘스트 시작하기</Text>
                <PrimaryButton
                  title="적금 가입하기"
                  onPress={() => navigation.navigate('SavingOpen')}
                  size="small"
                  style={styles.savingsCTAButton}
                  accessibilityRole="button"
                  accessibilityLabel="적금 가입하기 버튼"
                />
              </View>
            </View>
            <View 
              style={[
                styles.accountCard, 
                styles.depositCTACard,
                { width: width - SPACING.lg * 2 }
              ]}
            >
              <View style={styles.accountHeader}>
                <Text style={styles.accountType}>예금</Text>
                <Ionicons name="wallet" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.depositCTAContent}>
                <Text style={styles.depositCTATitle}>예금 계좌 개설하고</Text>
                <Text style={styles.depositCTASubtitle}>자산 관리 시작하기</Text>
                <PrimaryButton
                  title="예금 가입하기"
                  onPress={() => navigation.navigate('DepositOpen')}
                  size="small"
                  style={styles.depositCTAButton}
                  accessibilityRole="button"
                  accessibilityLabel="예금 가입하기 버튼"
                />
              </View>
            </View>
          </>
        )}
      </ScrollView>
      
      {/* 페이지 인디케이터 */}
      <View style={styles.pageIndicator}>
        {hasSavings ? 
          [accountInfo?.data?.saving, accountInfo?.data?.deposit].filter(Boolean).map((_, index) => (
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
    <View style={[styles.questsCard, !hasSavings && styles.blurredCard]}>
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
        recommendedQuests?.data && recommendedQuests.data.length > 0 ? (
          <View style={styles.questsList}>
            {recommendedQuests.data.slice(0, 3).map((quest) => (
              <View key={quest.id} style={styles.questItem}>
                <View style={styles.questInfo}>
                  <Text style={styles.questTitle}>{quest.title}</Text>
                  <View style={styles.questProgress}>
                    <Text style={styles.questProgressText}>
                      {quest.progress}/{quest.maxProgress}
                    </Text>
                  </View>
                </View>
                <View style={styles.questReward}>
                  <Text style={styles.questRewardText}>{quest.expReward} EXP</Text>
                  {quest.isCompleted && !quest.isClaimed && (
                    <PrimaryButton
                      title="수령하기"
                      onPress={() => handleClaimQuest(quest.id, quest.expReward)}
                      size="small"
                      style={styles.claimButton}
                      accessibilityRole="button"
                      accessibilityLabel="퀘스트 보상 수령"
                    />
                  )}
                  {quest.isClaimed && (
                    <Text style={styles.completedText}>완료</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <EmptyView message="추천 퀘스트가 없습니다." icon="🎯" />
        )
      ) : (
        <View style={styles.noSavingsOverlay}>
          <Text style={styles.noSavingsText}>
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
    paddingRight: SPACING.md,
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
    backgroundColor: COLORS.gray[50],
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    borderStyle: 'dashed',
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
    backgroundColor: COLORS.gray[50],
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    borderStyle: 'dashed',
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

