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
  Platform,
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

// 캐러셀 슬라이드 폭 계산
// 캐러셀 관련 상수들 (마이페이지와 동일하게 고정값 사용)
const CARD_WIDTH = 300; // 마이페이지와 동일한 고정값

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
  
  // 계좌 존재 여부로 hasAccounts 판단 (적금 또는 예금 중 하나라도 있으면 true)
  const hasAccounts = (savingsAccount?.data?.data && savingsAccount.data.data.length > 0) || 
                      (depositAccount?.data?.data && depositAccount.data.data.length > 0);
  
  // 개별 계좌 유무 판단
  const hasSavings = savingsAccount?.data?.data && savingsAccount.data.data.length > 0;
  const hasDeposit = depositAccount?.data?.data && depositAccount.data.data.length > 0;

  // 티어별 이율 계산 함수
  const getInterestRateByTier = (tier: string | undefined): number => {
    switch (tier) {
      case 'BASIC': return 2.5;
      case 'BRONZE': return 3.0;
      case 'SILVER': return 4.5;
      case 'GOLD': return 6.0;
      case 'SOL': return 10.0;
      default: return 2.5; // 기본값
    }
  };

  // 기부금 계산 함수
  const calculateDonationAmount = (): number => {
    if (!hasSavings || !savingsAccount?.data?.data?.[0] || !userInfo?.data?.current_tier) {
      console.log('💝 기부금 계산 조건 미충족:', {
        hasSavings,
        hasSavingsData: !!savingsAccount?.data?.data?.[0],
        currentTier: userInfo?.data?.current_tier
      });
      return 0;
    }

    const monthlyAmount = savingsAccount.data.data[0].monthly_amount || 0;
    const currentTier = userInfo.data.current_tier;
    
    console.log('💝 기부금 계산 데이터:', {
      monthlyAmount,
      currentTier,
      userInfoData: userInfo?.data
    });
    
    // 티어별 기부율 (월 납입액 대비)
    const donationRates: Record<string, number> = {
      'BASIC': 0.01,   // 1%
      'BRONZE': 0.015, // 1.5%
      'SILVER': 0.02,  // 2%
      'GOLD': 0.025,   // 2.5%
      'SOL': 0.03,     // 3%
    };

    const donationRate = donationRates[currentTier] || donationRates['BASIC'];
    const calculatedAmount = Math.round(monthlyAmount * donationRate);
    
    console.log('💝 기부금 계산 결과:', {
      currentTier,
      donationRate,
      monthlyAmount,
      calculatedAmount
    });
    
    return calculatedAmount;
  };
  
  // 학교 랭킹 API 호출 (적금 가입 여부와 관계없이 동일한 API 사용)
  const { 
    data: schoolRank, 
    isLoading: rankLoading, 
    error: rankError, 
    refetch: refetchRank 
  } = useMySchoolRank();
  
  // 추천 퀘스트 조회 (has_savings가 false면 API 요청 안함)
  const { 
    data: recommendedQuests, 
    isLoading: questsLoading, 
    error: questsError, 
    refetch: refetchQuests 
  } = useRecommendedQuests(hasSavings);

  // API 요청 로그
  console.log('🏠 HomeScreen API 상태:', {
    userInfo: { loading: userLoading, error: userError, data: userInfo?.data ? '있음' : '없음' },
    hasAccounts,
    hasSavings,
    hasDeposit,
    savingsAccount: { loading: savingsLoading, error: savingsError, data: savingsAccount?.data ? '있음' : '없음' },
    depositAccount: { loading: depositLoading, error: depositError, data: depositAccount?.data ? '있음' : '없음' },
    schoolRank: { loading: rankLoading, error: rankError, data: schoolRank?.data ? '있음' : '없음' },
    recommendedQuests: { loading: questsLoading, error: questsError, data: recommendedQuests ? '있음' : '없음' }
  });

  const claimQuestMutation = useClaimQuest();

  // 새로고침 처리
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchUser();
      await refetchRank();
      await refetchSavings();
      await refetchDeposit();
      await refetchQuests();
    } finally {
      setRefreshing(false);
    }
  };

  // 로딩 상태 처리
  const isLoading = userLoading || rankLoading || savingsLoading || depositLoading || questsLoading;
  
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
  const hasError = userError || rankError || savingsError || depositError || questsError;
  if (hasError) {
    return (
      <ErrorView 
        message="데이터를 불러오는데 실패했습니다." 
        onRetry={onRefresh}
      />
    );
  }

  const handleCarouselScroll = (event: any) => {
    const x = event.nativeEvent.contentOffset.x;
    const slideSize = CARD_WIDTH + SPACING.md; // 마이페이지와 동일한 계산
    setCurrentCarouselIndex(Math.round(x / slideSize));
  };

  const scrollToIndex = (index: number) => {
    const slideSize = CARD_WIDTH + SPACING.md; // 마이페이지와 동일한 계산
    carouselRef.current?.scrollTo({ x: index * slideSize, animated: true });
  };

  // 퀘스트 완료 처리
  const handleClaimQuest = async (questId: string) => {
    try {
      console.log('🎯 홈 화면 퀘스트 완료 요청:', questId);
      await claimQuestMutation.mutateAsync({ questId });
    } catch (error) {
      console.error('퀘스트 완료 실패:', error);
    }
  };

  const renderDonationCard = () => {
    const donationAmount = calculateDonationAmount();
    
    console.log('💝 renderDonationCard 호출:', {
      hasSavings,
      donationAmount,
      userInfo: userInfo?.data,
      savingsAccount: savingsAccount?.data?.data?.[0]
    });
    
    // 적금이 없으면 기부금 카드 표시 안함
    if (!hasSavings || donationAmount === 0) {
      console.log('💝 기부금 카드 표시 안함:', { hasSavings, donationAmount });
      return null;
    }

    return (
      <View style={styles.donationSection}>
        <View style={styles.donationCard}>
          <View style={styles.donationHeader}>
            <Ionicons name="heart" size={24} color={COLORS.error} />
            <Text style={styles.donationTitle}>사회적 기여</Text>
          </View>
          <Text style={styles.donationMessage}>
            고객님의 성장만큼, 헤이영이 기부합니다
          </Text>
                     <View style={styles.donationAmountRow}>
             <Text style={styles.donationAmount}>
               예상기부금 {formatNumber(donationAmount)}원
             </Text>
             <Text style={styles.donationSubtext}>
               (월납입액 기준)
             </Text>
           </View>
        </View>
      </View>
    );
  };

  const renderAccountCarousel = () => (
    <View style={styles.accountsSection}>
      <Text style={styles.sectionTitle}>내 계좌</Text>
      <ScrollView 
        ref={carouselRef}
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.carouselContainer}
        onScroll={handleCarouselScroll}
        scrollEventThrottle={16}
      >
                 {/* 적금 카드 - hasSavings가 true면 정보, false면 가입하기 버튼 */}
         {hasSavings ? (
           <View style={styles.accountCard}>
             <View style={styles.accountHeader}>
               <View style={styles.accountTypeContainer}>
                 <Text style={styles.accountTypeLabel}>적금</Text>
                 <Text style={styles.accountName}>쏠쏠한 퀘스트 적금</Text>
               </View>
             </View>
             
             <View style={styles.accountBalance}>
               <Text style={styles.balanceLabel}>월 납입금</Text>
               <Text style={styles.balanceAmount}>
                 {savingsAccount?.data?.data?.[0]?.monthly_amount?.toLocaleString()}원
               </Text>
             </View>
             
             <View style={styles.accountDetails}>
               <View style={styles.detailRow}>
                 <Text style={styles.detailLabel}>이율</Text>
                 <Text style={styles.detailValue}>
                   {getInterestRateByTier(userInfo?.data?.current_tier)}%
                 </Text>
               </View>
               <View style={styles.detailRow}>
                 <Text style={styles.detailLabel}>계좌번호</Text>
                 <Text style={styles.detailValue}>{savingsAccount?.data?.data?.[0]?.product_code}</Text>
               </View>
             </View>
           </View>
        ) : (
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
        )}

        {/* 예금 카드 - hasDeposit이 true면 정보, false면 가입하기 버튼 */}
                 {hasDeposit ? (
           <View style={[styles.accountCard, styles.depositAccountCard]}>
             <View style={styles.accountHeader}>
               <Text style={styles.accountType}>상시입출금</Text>
               <Ionicons name="wallet" size={20} color={COLORS.primary} />
             </View>
             <View style={styles.depositAccountContent}>
               <Text style={styles.accountBalance}>
                 {formatCurrency(depositAccount?.data?.data?.[0]?.balance || 0)}
               </Text>
               <Text style={styles.accountNumber}>
                 계좌번호: {depositAccount?.data?.data?.[0]?.account_no || ''}
               </Text>
             </View>
             <View style={styles.depositButtonContainer}>
               <TouchableOpacity 
                 style={styles.depositButton}
                 onPress={() => navigation.navigate('DepositMoney')}
               >
                 <Text style={styles.depositButtonText}>입금하기</Text>
               </TouchableOpacity>
             </View>
           </View>
        ) : (
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
                         <Text style={styles.newAccountText}>새 상시입출금 개설</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      
      {/* 페이지 인디케이터 */}
      <View style={styles.pageIndicator}>
        {[hasSavings, hasDeposit].map((hasAccount, index) => (
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
        ))}
      </View>
    </View>
  );

  const renderSchoolRanking = () => {
    // 리더보드 데이터 디버깅 로그
    console.log('🏆 renderSchoolRanking 호출됨');
    console.log('🏆 schoolRank 전체 데이터:', schoolRank);
    console.log('🏆 schoolRank?.data:', schoolRank?.data);
    console.log('🏆 schoolRank?.data?.rank:', schoolRank?.data?.rank);
    console.log('🏆 schoolRank?.data?.school:', schoolRank?.data?.school);
    console.log('🏆 schoolRank?.data?.totalExp:', schoolRank?.data?.totalExp);
    console.log('🏆 schoolRank?.data?.memberCount:', schoolRank?.data?.memberCount);
    console.log('🏆 schoolRank?.data?.myTotalExp:', schoolRank?.data?.myTotalExp);
    
    return (
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
             <Text style={styles.rankingScore}>{formatNumber(schoolRank?.data?.totalExp || 0)} EXP</Text>
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
  };

  const renderQuestsPreview = () => (
    <View style={styles.questsCard}>
      <View style={styles.questsHeader}>
        <Text style={styles.questsTitle}>추천 퀘스트</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Quests')}
          accessibilityRole="button"
          accessibilityLabel="퀘스트 전체보기"
        >
          <Text style={styles.questsMore}>전체보기</Text>
        </TouchableOpacity>
      </View>
      
      {hasSavings ? (
        recommendedQuests && Array.isArray(recommendedQuests) && recommendedQuests.length > 0 ? (
          <View style={styles.questsList}>
                         {recommendedQuests.slice(0, 3).map((quest, index: number) => (
               <View key={quest.id} style={styles.questItem}>
                 <View style={styles.questInfo}>
                   <Text style={styles.questTitle}>{quest.title}</Text>
                 </View>
                 <View style={styles.questReward}>
                   <Text style={styles.questRewardText}>{quest.reward_exp} EXP</Text>
                 </View>
               </View>
             ))}
            <Text style={styles.recommendationMessage}>
              맞춤형 퀘스트를 추천해드립니다
            </Text>
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

        {/* 기부금 카드 */}
        {renderDonationCard()}

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
    paddingRight: SPACING.lg, // 마이페이지와 동일하게 오른쪽 패딩만
  },
  accountCard: {
    width: CARD_WIDTH, // 마이페이지와 동일한 고정 너비
    marginRight: SPACING.md, // 마이페이지와 동일한 간격
    height: 200,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    paddingTop: SPACING.md, // 상단 패딩 줄임
    paddingBottom: SPACING.lg, // 하단 패딩 늘림
    paddingHorizontal: SPACING.lg, // 좌우 패딩 유지
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
    marginBottom: SPACING.md,
  },
  accountTypeContainer: {
    flex: 1,
  },
  accountTypeLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  accountName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.dark,
  },
  accountType: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    fontWeight: '700', // 볼드체로 변경
  },
  accountBalance: {
    marginBottom: SPACING.md,
  },
  balanceLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.xs,
  },
  balanceAmount: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.dark,
  },
  accountDetails: {
    gap: SPACING.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  detailValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.dark,
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
    gap: SPACING.md,
  },
  rankingRank: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
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
    // RN에선 filter 미지원 → 제거/대체
    // filter: 'blur(1px)',
    opacity: 0.4,
  },
  questsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
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
  // 기부금 카드 스타일
  donationSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  donationCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  donationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  donationTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.error,
    marginLeft: SPACING.sm,
  },
  donationMessage: {
    fontSize: FONT_SIZES.md,
    color: COLORS.dark,
    fontWeight: '500',
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
     donationAmountRow: {
     flexDirection: 'row',
     alignItems: 'center',
     gap: SPACING.sm,
   },
   donationAmount: {
     fontSize: FONT_SIZES.xl,
     fontWeight: '700',
     color: COLORS.error,
   },
   donationSubtext: {
     fontSize: FONT_SIZES.xs,
     color: COLORS.gray[600],
     fontStyle: 'italic',
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
   // 입금하기 버튼 스타일
   depositButton: {
     backgroundColor: COLORS.primary,
     paddingHorizontal: SPACING.md,
     paddingVertical: SPACING.sm,
     borderRadius: BORDER_RADIUS.sm,
     marginTop: SPACING.md,
     alignItems: 'center',
   },
       depositButtonText: {
      color: COLORS.white,
      fontSize: FONT_SIZES.sm,
      fontWeight: '600',
    },
         // 입금하기 버튼 컨테이너 스타일
     depositButtonContainer: {
       marginTop: SPACING.md,
       flex: 1,
       justifyContent: 'flex-end',
     },
     // 상시입출금 계좌 카드 전용 스타일
     depositAccountCard: {
       flexDirection: 'column',
       justifyContent: 'space-between',
     },
     // 상시입출금 계좌 내용 컨테이너
     depositAccountContent: {
       flex: 1,
       justifyContent: 'center',
       marginVertical: SPACING.sm,
     },
   });

