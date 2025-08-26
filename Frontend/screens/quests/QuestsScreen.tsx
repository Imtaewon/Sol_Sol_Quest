import React, { useState, useEffect } from 'react';
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
  useLogQuestClickMutation,
  useLogQuestInteractionMutation 
} from '../../store/api/questApi';
import { RootState } from '../../store';
import { HomeStackParamList } from '../../navigation/HomeStack';

type QuestsScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'Quests'>;

// 퀘스트 타입별 색상
const QUEST_TYPE_COLORS = {
  life: COLORS.primary,
  growth: COLORS.secondary,
  surprise: COLORS.accent,
};

// 퀘스트 카테고리별 아이콘
const QUEST_CATEGORY_ICONS = {
  STUDY: 'school',
  HEALTH: 'fitness',
  ECON: 'trending-up',
  LIFE: 'home',
  ENT: 'game-controller',
  SAVING: 'wallet',
};

// 퀘스트 상태별 색상
const QUEST_STATUS_COLORS = {
  deactive: COLORS.gray[400],
  in_progress: COLORS.primary,
  clear: COLORS.success,
  submitted: COLORS.warning,
  approved: COLORS.success,
};

export const QuestsScreen: React.FC = () => {
  const navigation = useNavigation<QuestsScreenNavigationProp>();
  const user = useSelector((state: RootState) => state.user.user);
  const [selectedType, setSelectedType] = useState<'life' | 'growth' | 'surprise'>('life');
  const [refreshing, setRefreshing] = useState(false);

  // API 호출
  const { 
    data: questsData, 
    isLoading, 
    error, 
    refetch 
  } = useGetQuestsQuery({ 
    type: selectedType,
    limit: 50 
  });

  const [startQuest] = useStartQuestMutation();
  const [logQuestClick] = useLogQuestClickMutation();
  const [logQuestInteraction] = useLogQuestInteractionMutation();

  const quests = questsData?.data || [];

  // 퀘스트 타입별 필터링
  const filteredQuests = quests.filter(quest => quest.type === selectedType);

  // 퀘스트 상태별 정렬 (진행중 > 미시작 > 완료)
  const sortedQuests = [...filteredQuests].sort((a, b) => {
    const getStatusPriority = (status: QuestAttempt['status']) => {
      switch (status) {
        case 'in_progress': return 0;
        case 'deactive': return 1;
        case 'clear': return 2;
        case 'submitted': return 3;
        case 'approved': return 4;
        default: return 5;
      }
    };

    const aStatus = a.attempt?.status || 'deactive';
    const bStatus = b.attempt?.status || 'deactive';
    
    return getStatusPriority(aStatus) - getStatusPriority(bStatus);
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleQuestPress = async (quest: QuestWithAttempt) => {
    try {
      // 퀘스트 클릭 로그
      await logQuestClick({ 
        quest_id: quest.id,
        context: `quests_screen_${selectedType}`
      });

      // 상호작용 로그
      await logQuestInteraction({
        quest_id: quest.id,
        event: 'detail_click',
        context: `quests_screen_${selectedType}`
      });

      // 퀘스트 상세 화면으로 이동
      navigation.navigate('QuestDetail', { questId: quest.id });
    } catch (error) {
      console.error('퀘스트 클릭 로그 실패:', error);
    }
  };

  const handleStartQuest = async (quest: QuestWithAttempt) => {
    try {
      await startQuest({ quest_id: quest.id });
      
      // 상호작용 로그
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

  const getQuestProgress = (quest: QuestWithAttempt) => {
    if (!quest.attempt) return 0;
    return Math.min((quest.attempt.progress_count / quest.attempt.target_count) * 100, 100);
  };

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

  const renderQuestCard = ({ item: quest }: { item: QuestWithAttempt }) => {
    const progress = getQuestProgress(quest);
    const statusText = getQuestStatusText(quest);
    const isInProgress = quest.attempt?.status === 'in_progress';
    const isCompleted = quest.attempt?.status === 'approved';
    const canStart = !quest.attempt || quest.attempt.status === 'deactive';

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
                    backgroundColor: isCompleted ? COLORS.success : QUEST_TYPE_COLORS[quest.type]
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
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
  startButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
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

