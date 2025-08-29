/**
 * QuestsScreen.tsx
 * 
 * 퀘스트 목록 화면 컴포넌트
 * 
 * 주요 기능:
 * - 퀘스트 목록 조회 및 표시
 * - 퀘스트 타입별 필터링 (일상/성장/돌발)
 * - 퀘스트 상태별 정렬 (진행중 > 완료가능 > 미시작 > 완료)
 * - 퀘스트 시작/완료 기능
 * - 퀘스트 상세 화면으로 이동
 * - 당겨서 새로고침 기능
 * 
 * 퀘스트 상태:
 * - deactive: 미시작 (시작하기 버튼)
 * - in_progress: 진행중 (계속하기 버튼)
 * - clear: 목표달성 (완료하기 버튼)
 * - submitted: 제출됨 (대기중)
 * - approved: 완료 (완료 배지)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { AppHeader } from '../../components/common/AppHeader';
import { Skeleton } from '../../components/common/Skeleton';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';
import { QuestWithAttempt, QuestAttempt } from '../../types/database';
import { 
  useAllGrowthQuests,
  useDailyQuests,
  useSurpriseQuests,
  useClaimQuest
} from '../../hooks/useQuests';
import { useSavingsAccount } from '../../hooks/useUser';
import { RootState } from '../../store';
import { HomeStackParamList } from '../../navigation/HomeStack';

type QuestsScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'Quests'>;

/**
 * 퀘스트 타입별 색상 정의
 * - daily: 일상 퀘스트 (파란색)
 * - growth: 성장 퀘스트 (주황색)
 * - surprise: 돌발 퀘스트 (하늘색)
 */
const QUEST_TYPE_COLORS: Record<string, string> = {
  daily: COLORS.primary,
  growth: COLORS.secondary,
  surprise: COLORS.accent,
};

/**
 * 퀘스트 카테고리별 아이콘 정의
 * 각 카테고리에 맞는 Ionicons 아이콘명
 */
const QUEST_CATEGORY_ICONS = {
  STUDY: 'school',      // 학업
  HEALTH: 'fitness',    // 건강
  ECON: 'trending-up',  // 경제
  LIFE: 'home',         // 일상
  ENT: 'game-controller', // 엔터테인먼트
  SAVING: 'wallet',     // 저축
};

/**
 * 퀘스트 상태별 색상 정의
 * 상태에 따라 다른 색상으로 시각적 구분
 */
const QUEST_STATUS_COLORS = {
  deactive: COLORS.gray[400],   // 미시작: 회색
  in_progress: COLORS.primary,  // 진행중: 파란색
  clear: COLORS.success,        // 목표달성: 초록색
  submitted: COLORS.warning,    // 제출됨: 주황색
  approved: COLORS.success,     // 완료: 초록색
};

/**
 * 퀘스트 목록 화면 메인 컴포넌트
 */
export const QuestsScreen: React.FC = () => {
  // 네비게이션 훅
  const navigation = useNavigation<QuestsScreenNavigationProp>();
  
  // Redux에서 사용자 정보 가져오기
  const user = useSelector((state: RootState) => state.user.user);
  
  // 적금 계좌 정보 조회
  const { data: savingsAccount } = useSavingsAccount();
  
  // 적금 가입 여부 판단 (실제 계좌 데이터 기반)
  const hasSavings = savingsAccount?.data?.data && savingsAccount.data.data.length > 0;
  
  // 선택된 퀘스트 타입 (일상/성장/돌발)
  const [selectedType, setSelectedType] = useState<'daily' | 'growth' | 'surprise'>('daily');
  
  // 새로고침 상태 관리
  const [refreshing, setRefreshing] = useState(false);

  /**
   * 퀘스트 목록 조회 API 호출
   * 선택된 타입에 따라 퀘스트 목록을 가져옴
   */
  const { 
    data: growthQuests, 
    isLoading: growthLoading, 
    error: growthError, 
    refetch: refetchGrowth 
  } = useAllGrowthQuests();

  const { 
    data: dailyQuests, 
    isLoading: dailyLoading, 
    error: dailyError, 
    refetch: refetchDaily 
  } = useDailyQuests();

  const { 
    data: surpriseQuests, 
    isLoading: surpriseLoading, 
    error: surpriseError, 
    refetch: refetchSurprise 
  } = useSurpriseQuests();

  // 퀘스트 수령 훅
  const claimQuestMutation = useClaimQuest();

  // 선택된 타입에 따른 데이터와 로딩 상태
  const getQuestsData = () => {
    switch (selectedType) {
      case 'growth':
        return { data: growthQuests?.data || [], loading: growthLoading, error: growthError, refetch: refetchGrowth };
      case 'daily':
        return { data: dailyQuests?.data || [], loading: dailyLoading, error: dailyError, refetch: refetchDaily };
      case 'surprise':
        return { data: surpriseQuests?.data || [], loading: surpriseLoading, error: surpriseError, refetch: refetchSurprise };
      default:
        return { data: [], loading: false, error: null, refetch: () => {} };
    }
  };

  const { data: quests, loading: isLoading, error, refetch } = getQuestsData();

  // API 요청 로그
  console.log('🎯 QuestsScreen API 상태:', {
    growthQuests: { loading: growthLoading, error: growthError, data: growthQuests?.data ? `${growthQuests.data.length}개` : '없음' },
    dailyQuests: { loading: dailyLoading, error: dailyError, data: dailyQuests?.data ? `${dailyQuests.data.length}개` : '없음' },
    surpriseQuests: { loading: surpriseLoading, error: surpriseError, data: surpriseQuests?.data ? `${surpriseQuests.data.length}개` : '없음' },
    selectedType,
    currentQuests: { loading: isLoading, error, data: quests ? `${quests.length}개` : '없음' },
    hasSavings
  });

  // 퀘스트 데이터 상세 로그
  if (quests && quests.length > 0) {
    console.log('🎯 QuestsScreen 퀘스트 데이터 상세:', quests.map(quest => ({
      id: quest.id,
      title: quest.title,
      category: quest.category,
      expReward: quest.expReward,
      progress: quest.progress,
      maxProgress: quest.maxProgress,
      isCompleted: quest.isCompleted,
      isClaimed: quest.isClaimed,
      progressPercent: quest.progress && quest.maxProgress ? Math.round((quest.progress / quest.maxProgress) * 100) : 0
    })));
  }

  /**
   * 퀘스트 상태별 정렬
   * 우선순위: 수령 가능 > 진행중(진행률 높은 순) > 미시작 > 완료
   * 사용자가 먼저 해야 할 퀘스트를 상단에 배치
   */
  const sortedQuests = [...quests].sort((a, b) => {
    // 상태별 우선순위 점수 계산
    const getStatusPriority = (quest: any) => {
      if (quest.user_status === 'CLEAR') return 4;      // 수령 가능 (최우선)
      if (quest.user_status === 'IN_PROGRESS') return 3; // 진행중
      if (quest.user_status === 'DEACTIVE') return 2;    // 미시작
      if (quest.user_status === 'APPROVED') return 1;    // 완료 (최후순위)
      return 0;
    };

    const aPriority = getStatusPriority(a);
    const bPriority = getStatusPriority(b);

    // 상태가 다르면 우선순위로 정렬
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }

    // 같은 상태 내에서는 진행률로 정렬 (진행률 높은 순)
    const aProgressPercent = a.progress && a.maxProgress ? (a.progress / a.maxProgress) * 100 : 0;
    const bProgressPercent = b.progress && b.maxProgress ? (b.progress / b.maxProgress) * 100 : 0;
    
    return bProgressPercent - aProgressPercent;
  });

  /**
   * 새로고침 처리 함수
   * 당겨서 새로고침 시 퀘스트 목록을 다시 불러옴
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  /**
   * 퀘스트 카드 클릭 처리 함수
   * 퀘스트 상세 화면으로 이동
   */
  const handleQuestPress = (quest: QuestWithAttempt) => {
    navigation.navigate('QuestDetail', { quest: quest as any });
  };



  /**
   * 퀘스트 완료 처리 함수
   * 완료된 퀘스트의 보상을 수령
   */
  const handleClaimQuest = async (quest: any) => {
    try {
      console.log('🎯 퀘스트 완료 요청:', quest.id);
      await claimQuestMutation.mutateAsync({ 
        questId: quest.id
      });
    } catch (error) {
      console.error('퀘스트 완료 실패:', error);
    }
  };

  /**
   * 퀘스트 진행률 계산 함수
   * @param quest 퀘스트 객체
   * @returns 진행률 퍼센트 (0-100)
   */
  const getQuestProgress = (quest: any) => {
    // 변환된 데이터 구조 사용 (progress, maxProgress)
    if (!quest.progress || !quest.maxProgress) return 0;
    return Math.min((quest.progress / quest.maxProgress) * 100, 100);
  };

  /**
   * 퀘스트 상태 텍스트 반환 함수
   * @param quest 퀘스트 객체
   * @returns 상태에 따른 한글 텍스트
   */
  const getQuestStatusText = (quest: any) => {
    if (quest.isCompleted) return '완료';
    if (quest.user_status === 'CLEAR') return '수령 가능';
    if (quest.progress && quest.progress > 0) return '진행중';
    return '미시작';
  };

  /**
   * 퀘스트 카드 렌더링 함수
   * 각 퀘스트의 정보를 카드 형태로 표시
   */
  const renderQuestCard = ({ item: quest }: { item: any }) => {
    console.log('🎯 renderQuestCard 호출됨:', {
      questId: quest.id,
      questTitle: quest.title,
      hasSavings,
      progress: quest.progress,
      maxProgress: quest.maxProgress,
      isCompleted: quest.isCompleted,
      isClaimed: quest.isClaimed,
      user_status: quest.user_status, // 원본 백엔드 데이터
      rawQuestData: quest // 전체 원본 데이터 확인
    });

    // 적금 미가입자인 경우 간단한 카드 표시
    if (!hasSavings) {
      console.log('🎯 적금 비가입자용 간단 카드 렌더링');
      return (
        <TouchableOpacity 
          style={styles.questCardSimple}
          onPress={() => handleQuestPress(quest)}
        >
          <View style={styles.questContentSimple}>
            <View style={styles.questTitleRow}>
              <Ionicons 
                name="trophy" 
                size={20} 
                color={COLORS.gray[600]} 
              />
              <Text style={styles.questTitle}>{quest.title}</Text>
            </View>
            {/* 적금 비가입자는 경험치 표시 안함 */}
          </View>
        </TouchableOpacity>
      );
    }

    // 적금 가입자인 경우 기존 상세 카드 표시
    console.log('🎯 적금 가입자용 상세 카드 렌더링');
    
    // 퀘스트 진행률 및 상태 정보 계산
    const progress = getQuestProgress(quest);
    const statusText = getQuestStatusText(quest);
    
    // 퀘스트 상태별 버튼 표시 조건 (변환된 데이터 구조 사용)
    const isInProgress = quest.progress && quest.progress > 0 && !quest.isCompleted;
    const canClaim = quest.user_status === 'CLEAR';
    const isCompleted = quest.isCompleted;

    console.log('🎯 퀘스트 상태 계산:', {
      progress,
      statusText,
      isInProgress,
      canClaim,
      isCompleted
    });

    return (
      <TouchableOpacity 
        style={styles.questCard}
        onPress={() => handleQuestPress(quest)}
      >
        <View style={styles.questContent}>
          <View style={styles.questTitleRow}>
            <Ionicons 
              name="trophy" 
              size={20} 
              color={COLORS.gray[600]} 
            />
            <Text style={styles.questTitle}>{quest.title}</Text>
          </View>

          <View style={styles.questProgressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${progress}%`,
                    backgroundColor: isCompleted ? COLORS.success : QUEST_TYPE_COLORS[quest.type]
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {quest.progress || 0} / {quest.maxProgress || 1}
            </Text>
          </View>

                     <View style={styles.questFooter}>
             <View style={styles.questStatus}>
               <View 
                 style={[
                   styles.statusDot, 
                   { backgroundColor: isCompleted ? COLORS.success : isInProgress ? COLORS.primary : COLORS.gray[400] }
                 ]} 
               />
               <Text style={styles.statusText}>{statusText}</Text>
             </View>

             <View style={styles.questReward}>
               <Ionicons name="star" size={16} color={COLORS.secondary} />
               <Text style={styles.questRewardText}>{quest.expReward} EXP</Text>
             </View>

             {canClaim && (
               <TouchableOpacity
                 style={[styles.startButton, styles.claimButton]}
                 onPress={() => handleClaimQuest(quest)}
               >
                 <Text style={styles.startButtonText}>수령하기</Text>
               </TouchableOpacity>
             )}

             {isCompleted && (
               <View style={styles.completedBadge}>
                 <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                 <Text style={styles.completedText}>완료</Text>
               </View>
             )}
           </View>
        </View>
      </TouchableOpacity>
    );
  };

  /**
   * 퀘스트 타입 탭 렌더링 함수
   * 일상/성장/돌발 탭을 생성
   */
  const renderTypeTab = (type: 'daily' | 'growth' | 'surprise', label: string) => (
    <TouchableOpacity
      style={[
        styles.typeTab,
        selectedType === type && styles.typeTabActive
      ]}
      onPress={() => setSelectedType(type)}
    >
      <Text style={[
        styles.typeTabText,
        selectedType === type && styles.typeTabTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (error) {
    return (
      <View style={styles.container}>
        <AppHeader title="퀘스트" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>퀘스트를 불러오는데 실패했습니다</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="퀘스트" />
      
      {/* 퀘스트 타입 탭 */}
      <View style={styles.typeTabs}>
        {renderTypeTab('daily', '일상')}
        {renderTypeTab('growth', '성장')}
        {renderTypeTab('surprise', '돌발')}
      </View>

      {/* 퀘스트 목록 */}
      <FlatList
        data={sortedQuests}
        renderItem={renderQuestCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.questList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height={120} style={styles.skeletonCard} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="trophy-outline" size={48} color={COLORS.gray[400]} />
              <Text style={styles.emptyText}>
                {selectedType === 'daily' ? '일상' : selectedType === 'growth' ? '성장' : '돌발'} 퀘스트가 없습니다
              </Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  typeTabs: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  typeTab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  typeTabActive: {
    backgroundColor: COLORS.primary + '10',
  },
  typeTabText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    fontWeight: '500',
  },
  typeTabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  questList: {
    padding: SPACING.lg,
  },
  questCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  questTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questTypeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.xs,
  },
  questTypeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    fontWeight: '500',
  },
  questReward: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questRewardText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.secondary,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  questContent: {
    flex: 1,
  },
  questTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  questTitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.dark,
    fontWeight: '600',
    marginLeft: SPACING.sm,
    flex: 1,
  },
  questProgressContainer: {
    marginBottom: SPACING.md,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.gray[200],
    borderRadius: 3,
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[600],
    textAlign: 'right',
  },
  questFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  questStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  startButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  continueButton: {
    backgroundColor: COLORS.secondary,
  },
  completeButton: {
    backgroundColor: COLORS.success,
  },
  instantCompleteButton: {
    backgroundColor: COLORS.warning,
  },
  claimButton: {
    backgroundColor: COLORS.success,
  },
  startButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '10',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.success + '30',
  },
  completedText: {
    color: COLORS.success,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  loadingContainer: {
    gap: SPACING.md,
  },
  skeletonCard: {
    borderRadius: BORDER_RADIUS.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[500],
    marginTop: SPACING.md,
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
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  questCardSimple: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questContentSimple: {
    flex: 1,
  },
  questRewardSimple: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
});

