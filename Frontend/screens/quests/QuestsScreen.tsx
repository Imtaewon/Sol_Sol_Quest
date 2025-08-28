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
  useGetQuestsQuery, 
  useStartQuestMutation,
  useSubmitQuestMutation,
  useLogQuestClickMutation,
  useLogQuestInteractionMutation 
} from '../../store/api/questApi';
import { RootState } from '../../store';
import { HomeStackParamList } from '../../navigation/HomeStack';

type QuestsScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'Quests'>;

/**
 * 퀘스트 타입별 색상 정의
 * - life: 일상 퀘스트 (파란색)
 * - growth: 성장 퀘스트 (주황색)
 * - surprise: 돌발 퀘스트 (하늘색)
 */
const QUEST_TYPE_COLORS = {
  life: COLORS.primary,
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
  
  // 선택된 퀘스트 타입 (일상/성장/돌발)
  const [selectedType, setSelectedType] = useState<'life' | 'growth' | 'surprise'>('life');
  
  // 새로고침 상태 관리
  const [refreshing, setRefreshing] = useState(false);

  /**
   * 퀘스트 목록 조회 API 호출
   * 선택된 타입에 따라 퀘스트 목록을 가져옴
   */
  const { 
    data: questsData, 
    isLoading, 
    error, 
    refetch 
  } = useGetQuestsQuery({ 
    type: selectedType,
    limit: 50 
  });

  // 퀘스트 관련 API 뮤테이션 훅들
  const [startQuest] = useStartQuestMutation();        // 퀘스트 시작
  const [submitQuest] = useSubmitQuestMutation();      // 퀘스트 완료
  const [logQuestClick] = useLogQuestClickMutation();  // 퀘스트 클릭 로그
  const [logQuestInteraction] = useLogQuestInteractionMutation(); // 퀘스트 상호작용 로그

  // API에서 받아온 퀘스트 데이터
  const quests = questsData?.data || [];

  /**
   * 퀘스트 타입별 필터링
   * 선택된 타입(일상/성장/돌발)에 맞는 퀘스트만 필터링
   */
  const filteredQuests = quests.filter(quest => quest.type === selectedType);

  /**
   * 퀘스트 상태별 정렬
   * 우선순위: 진행중 > 완료가능 > 미시작 > 완료
   * 사용자가 먼저 해야 할 퀘스트를 상단에 배치
   */
  const sortedQuests = [...filteredQuests].sort((a, b) => {
    const getStatusPriority = (status: QuestAttempt['status']) => {
      switch (status) {
        case 'in_progress': return 0;
        case 'clear': return 1; // 완료 가능한 상태를 높은 우선순위로
        case 'deactive': return 2;
        case 'submitted': return 3;
        case 'approved': return 4;
        default: return 5;
      }
    };

    const aStatus = a.attempt?.status || 'deactive';
    const bStatus = b.attempt?.status || 'deactive';
    
    return getStatusPriority(aStatus) - getStatusPriority(bStatus);
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
   * 퀘스트 상세 화면으로 이동하며 로그 기록
   */
  const handleQuestPress = async (quest: QuestWithAttempt) => {
    try {
      // 퀘스트 클릭 로그 기록
      await logQuestClick({ 
        quest_id: quest.id,
        context: `quests_screen_${selectedType}`
      });

      // 퀘스트 상세 클릭 상호작용 로그 기록
      await logQuestInteraction({
        quest_id: quest.id,
        event: 'detail_click',
        context: `quests_screen_${selectedType}`
      });

      // 퀘스트 상세 화면으로 이동 (quest 객체 전체 전달)
      navigation.navigate('QuestDetail', { quest: quest });
    } catch (error) {
      console.error('퀘스트 클릭 로그 실패:', error);
    }
  };

  /**
   * 퀘스트 시작 처리 함수
   * 퀘스트를 시작하고 상호작용 로그 기록
   */
  const handleStartQuest = async (quest: QuestWithAttempt) => {
    try {
      // 퀘스트 시작 API 호출
      await startQuest({ quest_id: quest.id });
      
      // 퀘스트 시작 상호작용 로그 기록
      await logQuestInteraction({
        quest_id: quest.id,
        event: 'start',
        context: `quests_screen_${selectedType}`
      });

      Alert.alert('퀘스트 시작', `${quest.title} 퀘스트를 시작했습니다!`);
    } catch (error) {
      Alert.alert('오류', '퀘스트 시작에 실패했습니다.');
    }
  };

  /**
   * 퀘스트 완료 처리 함수
   * 퀘스트를 완료하고 경험치를 획득하며 로그 기록
   */
  const handleCompleteQuest = async (quest: QuestWithAttempt) => {
    try {
      // 퀘스트 완료 API 호출 (백엔드에서 검증 후 완료 처리)
      await submitQuest({ quest_id: quest.id });
      
      // 퀘스트 완료 상호작용 로그 기록
      await logQuestInteraction({
        quest_id: quest.id,
        event: 'complete',
        context: `quests_screen_${selectedType}`
      });

      Alert.alert('퀘스트 완료', `${quest.title} 퀘스트가 완료되었습니다! ${quest.reward_exp} EXP를 획득했습니다!`);
    } catch (error) {
      Alert.alert('오류', '퀘스트 완료에 실패했습니다.');
    }
  };

  /**
   * 퀘스트 진행률 계산 함수
   * @param quest 퀘스트 객체
   * @returns 진행률 퍼센트 (0-100)
   */
  const getQuestProgress = (quest: QuestWithAttempt) => {
    if (!quest.attempt) return 0;
    return Math.min((quest.attempt.progress_count / quest.attempt.target_count) * 100, 100);
  };

  /**
   * 퀘스트 상태 텍스트 반환 함수
   * @param quest 퀘스트 객체
   * @returns 상태에 따른 한글 텍스트
   */
  const getQuestStatusText = (quest: QuestWithAttempt) => {
    if (!quest.attempt) return '미시작';
    
    switch (quest.attempt.status) {
      case 'in_progress': return '진행중';
      case 'clear': return '목표 달성';
      case 'submitted': return '제출됨';
      case 'approved': return '완료';
      default: return '미시작';
    }
  };

  /**
   * 퀘스트 카드 렌더링 함수
   * 각 퀘스트의 정보를 카드 형태로 표시
   */
  const renderQuestCard = ({ item: quest }: { item: QuestWithAttempt }) => {
    // 퀘스트 진행률 및 상태 정보 계산
    const progress = getQuestProgress(quest);
    const statusText = getQuestStatusText(quest);
    
    // 퀘스트 상태별 버튼 표시 조건
    const isInProgress = quest.attempt?.status === 'in_progress';  // 진행중
    const canStart = !quest.attempt || quest.attempt.status === 'deactive';  // 시작 가능
    const canComplete = quest.attempt?.status === 'clear';  // 완료 가능
    const isApproved = quest.attempt?.status === 'approved';  // 완료됨

    return (
      <TouchableOpacity 
        style={styles.questCard}
        onPress={() => handleQuestPress(quest)}
      >
        <View style={styles.questHeader}>
          <View style={styles.questTypeContainer}>
            <View 
              style={[
                styles.questTypeIndicator, 
                { backgroundColor: QUEST_TYPE_COLORS[quest.type] }
              ]} 
            />
            <Text style={styles.questTypeText}>
              {quest.type === 'life' ? '일상' : quest.type === 'growth' ? '성장' : '돌발'}
            </Text>
          </View>
          
          <View style={styles.questReward}>
            <Ionicons name="star" size={16} color={COLORS.secondary} />
            <Text style={styles.questRewardText}>{quest.reward_exp} EXP</Text>
          </View>
        </View>

        <View style={styles.questContent}>
          <View style={styles.questTitleRow}>
            <Ionicons 
              name={QUEST_CATEGORY_ICONS[quest.category] as any} 
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
                    backgroundColor: isApproved ? COLORS.success : QUEST_TYPE_COLORS[quest.type]
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {quest.attempt?.progress_count || 0} / {quest.target_count}
            </Text>
          </View>

          <View style={styles.questFooter}>
            <View style={styles.questStatus}>
              <View 
                style={[
                  styles.statusDot, 
                  { backgroundColor: QUEST_STATUS_COLORS[quest.attempt?.status || 'deactive'] }
                ]} 
              />
              <Text style={styles.statusText}>{statusText}</Text>
            </View>

            {canStart && (
              <TouchableOpacity
                style={styles.startButton}
                onPress={() => handleStartQuest(quest)}
              >
                <Text style={styles.startButtonText}>시작하기</Text>
              </TouchableOpacity>
            )}

            {isInProgress && (
              <TouchableOpacity
                style={[styles.startButton, styles.continueButton]}
                onPress={() => handleQuestPress(quest)}
              >
                <Text style={styles.startButtonText}>계속하기</Text>
              </TouchableOpacity>
            )}

            {canComplete && (
              <TouchableOpacity
                style={[styles.startButton, styles.completeButton]}
                onPress={() => handleCompleteQuest(quest)}
              >
                <Text style={styles.startButtonText}>완료하기</Text>
              </TouchableOpacity>
            )}

            {isApproved && (
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
  const renderTypeTab = (type: 'life' | 'growth' | 'surprise', label: string) => (
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
        {renderTypeTab('life', '일상')}
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
                {selectedType === 'life' ? '일상' : selectedType === 'growth' ? '성장' : '돌발'} 퀘스트가 없습니다
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
    alignItems: 'center',
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
});

