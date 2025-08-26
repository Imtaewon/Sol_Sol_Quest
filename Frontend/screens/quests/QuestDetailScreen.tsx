import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';
import { QuestWithAttempt, QuestAttempt } from '../../types/database';
import { 
  useGetQuestDetailQuery,
  useStartQuestMutation,
  useSubmitQuestMutation,
  useVerifyQuestMutation,
  useLogQuestInteractionMutation
} from '../../store/api/questApi';
import { HomeStackParamList } from '../../navigation/HomeStack';

type QuestDetailRouteProp = RouteProp<HomeStackParamList, 'QuestDetail'>;
type QuestDetailNavigationProp = StackNavigationProp<HomeStackParamList, 'QuestDetail'>;

const { width } = Dimensions.get('window');

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

// 인증 방식별 설명
const VERIFY_METHOD_DESCRIPTIONS = {
  GPS: '지정된 위치에 방문하여 인증하세요',
  STEPS: '목표 걸음 수를 달성하세요',
  LINK: '링크를 통해 인증하세요',
  UPLOAD: '증빙 자료를 업로드하세요',
  PAYMENT: '결제를 통해 인증하세요',
  ATTENDANCE: '출석을 통해 인증하세요',
  CERTIFICATION: '자격증을 통해 인증하세요',
  CONTEST: '대회 참여를 통해 인증하세요',
};

export const QuestDetailScreen: React.FC = () => {
  const route = useRoute<QuestDetailRouteProp>();
  const navigation = useNavigation<QuestDetailNavigationProp>();
  const { questId } = route.params;

  const [isSubmitting, setIsSubmitting] = useState(false);

  // API 호출
  const { 
    data: quest, 
    isLoading, 
    error, 
    refetch 
  } = useGetQuestDetailQuery(questId);

  const [startQuest] = useStartQuestMutation();
  const [submitQuest] = useSubmitQuestMutation();
  const [verifyQuest] = useVerifyQuestMutation();
  const [logQuestInteraction] = useLogQuestInteractionMutation();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppHeader title="퀘스트 상세" showBackButton />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>퀘스트 정보를 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  if (error || !quest) {
    return (
      <View style={styles.container}>
        <AppHeader title="퀘스트 상세" showBackButton />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>퀘스트 정보를 불러오는데 실패했습니다</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const getQuestProgress = () => {
    if (!quest.attempt) return 0;
    return Math.min((quest.attempt.progress_count / quest.attempt.target_count) * 100, 100);
  };

  const getQuestStatusText = () => {
    if (!quest.attempt) return '미시작';
    
    switch (quest.attempt.status) {
      case 'in_progress': return '진행중';
      case 'clear': return '목표 달성';
      case 'submitted': return '제출됨';
      case 'approved': return '완료';
      default: return '미시작';
    }
  };

  const getQuestStatusColor = () => {
    if (!quest.attempt) return COLORS.gray[400];
    
    switch (quest.attempt.status) {
      case 'in_progress': return COLORS.primary;
      case 'clear': return COLORS.success;
      case 'submitted': return COLORS.warning;
      case 'approved': return COLORS.success;
      default: return COLORS.gray[400];
    }
  };

  const handleStartQuest = async () => {
    try {
      await startQuest({ quest_id: quest.id });
      
      await logQuestInteraction({
        quest_id: quest.id,
        event: 'start',
        context: 'quest_detail'
      });

      Alert.alert('퀘스트 시작', `${quest.title} 퀘스트를 시작했습니다!`);
      refetch();
    } catch (error) {
      Alert.alert('오류', '퀘스트 시작에 실패했습니다.');
    }
  };

  const handleSubmitQuest = async () => {
    try {
      setIsSubmitting(true);
      await submitQuest({ quest_id: quest.id });
      
      await logQuestInteraction({
        quest_id: quest.id,
        event: 'complete',
        context: 'quest_detail'
      });

      Alert.alert('퀘스트 제출', '퀘스트가 성공적으로 제출되었습니다!');
      refetch();
    } catch (error) {
      Alert.alert('오류', '퀘스트 제출에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyQuest = async () => {
    try {
      // 인증 방식에 따른 처리
      let verifyData = {};
      
      switch (quest.verify_method) {
        case 'GPS':
          // GPS 인증 로직
          verifyData = { lat: quest.lat, lng: quest.lng };
          break;
        case 'STEPS':
          // 걸음 수 인증 로직
          verifyData = { steps: quest.attempt?.progress_count || 0 };
          break;
        case 'PAYMENT':
          // 결제 인증 로직
          verifyData = { payment_id: 'sample_payment_id' };
          break;
        case 'ATTENDANCE':
          // 출석 인증 로직
          verifyData = { attendance_date: new Date().toISOString() };
          break;
        default:
          verifyData = {};
      }

      await verifyQuest({ 
        quest_id: quest.id, 
        verify_data: verifyData 
      });

      Alert.alert('인증 완료', '퀘스트 인증이 완료되었습니다!');
      refetch();
    } catch (error) {
      Alert.alert('오류', '퀘스트 인증에 실패했습니다.');
    }
  };

  const canStart = !quest.attempt || quest.attempt.status === 'deactive';
  const canSubmit = quest.attempt?.status === 'clear';
  const canVerify = quest.attempt?.status === 'in_progress';
  const isCompleted = quest.attempt?.status === 'approved';

  return (
    <View style={styles.container}>
      <AppHeader title="퀘스트 상세" showBackButton />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 퀘스트 헤더 */}
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
            <Ionicons name="star" size={20} color={COLORS.secondary} />
            <Text style={styles.questRewardText}>{quest.reward_exp} EXP</Text>
          </View>
        </View>

        {/* 퀘스트 제목 */}
        <View style={styles.questTitleContainer}>
          <Ionicons 
            name={QUEST_CATEGORY_ICONS[quest.category] as any} 
            size={24} 
            color={COLORS.gray[600]} 
          />
          <Text style={styles.questTitle}>{quest.title}</Text>
        </View>

        {/* 퀘스트 상태 */}
        <View style={styles.questStatusContainer}>
          <View style={styles.statusBadge}>
            <View 
              style={[
                styles.statusDot, 
                { backgroundColor: getQuestStatusColor() }
              ]} 
            />
            <Text style={styles.statusText}>{getQuestStatusText()}</Text>
          </View>
        </View>

        {/* 진행률 */}
        {quest.attempt && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>진행률</Text>
              <Text style={styles.progressText}>
                {quest.attempt.progress_count} / {quest.attempt.target_count}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${getQuestProgress()}%`,
                    backgroundColor: isCompleted ? COLORS.success : QUEST_TYPE_COLORS[quest.type]
                  }
                ]} 
              />
            </View>
          </View>
        )}

        {/* 인증 방식 */}
        <View style={styles.verifyMethodContainer}>
          <Text style={styles.sectionTitle}>인증 방식</Text>
          <View style={styles.verifyMethodCard}>
            <Ionicons 
              name={quest.verify_method === 'GPS' ? 'location' : 
                   quest.verify_method === 'STEPS' ? 'footsteps' :
                   quest.verify_method === 'PAYMENT' ? 'card' :
                   quest.verify_method === 'ATTENDANCE' ? 'calendar' :
                   'checkmark-circle'} 
              size={24} 
              color={QUEST_TYPE_COLORS[quest.type]} 
            />
            <View style={styles.verifyMethodContent}>
              <Text style={styles.verifyMethodTitle}>
                {quest.verify_method === 'GPS' ? '위치 인증' :
                 quest.verify_method === 'STEPS' ? '걸음 수 인증' :
                 quest.verify_method === 'PAYMENT' ? '결제 인증' :
                 quest.verify_method === 'ATTENDANCE' ? '출석 인증' :
                 '일반 인증'}
              </Text>
              <Text style={styles.verifyMethodDescription}>
                {VERIFY_METHOD_DESCRIPTIONS[quest.verify_method]}
              </Text>
            </View>
          </View>
        </View>

        {/* 퀘스트 설명 */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>퀘스트 설명</Text>
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionText}>
              이 퀘스트는 {quest.category === 'STUDY' ? '학업' :
                          quest.category === 'HEALTH' ? '건강' :
                          quest.category === 'ECON' ? '경제' :
                          quest.category === 'LIFE' ? '일상' :
                          quest.category === 'ENT' ? '엔터테인먼트' : '저축'} 
              카테고리에 속하며, {quest.target_count}회 달성을 목표로 합니다.
            </Text>
          </View>
        </View>

        {/* 액션 버튼 */}
        <View style={styles.actionContainer}>
          {canStart && (
            <PrimaryButton
              title="퀘스트 시작하기"
              onPress={handleStartQuest}
              size="large"
            />
          )}

          {canVerify && (
            <PrimaryButton
              title="인증하기"
              onPress={handleVerifyQuest}
              size="large"
              variant="secondary"
            />
          )}

          {canSubmit && (
            <PrimaryButton
              title="퀘스트 제출하기"
              onPress={handleSubmitQuest}
              size="large"
              variant="success"
              loading={isSubmitting}
            />
          )}

          {isCompleted && (
            <View style={styles.completedContainer}>
              <Ionicons name="checkmark-circle" size={48} color={COLORS.success} />
              <Text style={styles.completedText}>퀘스트 완료!</Text>
              <Text style={styles.completedSubtext}>
                {quest.reward_exp} EXP를 획득했습니다
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
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
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  questTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questTypeIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: SPACING.sm,
  },
  questTypeText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    fontWeight: '600',
  },
  questReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary + '10',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  questRewardText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.secondary,
    fontWeight: '700',
    marginLeft: SPACING.xs,
  },
  questTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  questTitle: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.dark,
    fontWeight: '700',
    marginLeft: SPACING.md,
    flex: 1,
  },
  questStatusContainer: {
    marginBottom: SPACING.lg,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.sm,
  },
  statusText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.dark,
    fontWeight: '600',
  },
  progressContainer: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressTitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.dark,
    fontWeight: '600',
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.gray[200],
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  verifyMethodContainer: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: SPACING.md,
  },
  verifyMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verifyMethodContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  verifyMethodTitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.dark,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  verifyMethodDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    lineHeight: 18,
  },
  descriptionContainer: {
    marginBottom: SPACING.xl,
  },
  descriptionCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descriptionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[700],
    lineHeight: 22,
  },
  actionContainer: {
    marginBottom: SPACING.xl,
  },
  completedContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.success + '10',
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.success + '30',
  },
  completedText: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.success,
    fontWeight: '700',
    marginTop: SPACING.md,
  },
  completedSubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    marginTop: SPACING.sm,
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
