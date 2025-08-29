/**
 * QuestDetailScreen.tsx
 * 
 * 퀘스트 상세 화면 컴포넌트
 * 
 * 주요 기능:
 * - 퀘스트 상세 정보 표시
 * - 퀘스트 진행률 표시
 * - 퀘스트 시작/인증/제출 기능
 * - 인증 방식별 처리 (GPS, STEPS, PAYMENT, ATTENDANCE 등)
 * - 퀘스트 완료 상태 표시
 * 
 * 데이터 흐름:
 * - QuestsScreen에서 quest 객체를 받아서 표시
 * - 별도의 API 호출 없이 받은 데이터로 렌더링
 * - 액션 수행 후 목록 화면으로 돌아감
 */

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

import { useCompleteQuestMutation } from '../../store/api/baseApi';
import { useSavingsAccount } from '../../hooks/useUser';
import { HomeStackParamList } from '../../navigation/HomeStack';

type QuestDetailRouteProp = RouteProp<HomeStackParamList, 'QuestDetail'>;
type QuestDetailNavigationProp = StackNavigationProp<HomeStackParamList, 'QuestDetail'>;

const { width } = Dimensions.get('window');

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
 * 인증 방식별 설명 텍스트
 * 각 인증 방식에 대한 사용자 안내 메시지
 */
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

/**
 * 퀘스트 상세 화면 메인 컴포넌트
 */
export const QuestDetailScreen: React.FC = () => {
  // 네비게이션 관련 훅들
  const route = useRoute<QuestDetailRouteProp>();
  const navigation = useNavigation<QuestDetailNavigationProp>();
  
  // QuestsScreen에서 전달받은 퀘스트 객체 (별도 API 호출 없음)
  const { quest } = route.params;

  // 적금 계좌 정보 조회
  const { data: savingsAccount } = useSavingsAccount();
  
  // 적금 가입 여부 판단 (실제 계좌 데이터 기반)
  const hasSavings = savingsAccount?.data?.data && savingsAccount.data.data.length > 0;

  // 퀘스트 제출 중 로딩 상태 관리
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 퀘스트 관련 API 뮤테이션 훅들
  const [completeQuest] = useCompleteQuestMutation(); // 퀘스트 즉시 완료 (시연용)

  /**
   * 퀘스트 진행률 계산 함수
   * @returns 진행률 퍼센트 (0-100)
   */
  const getQuestProgress = () => {
    // QuestWithAttempt 구조에 맞게 수정
    if (!quest.attempt?.progress_count || !quest.attempt?.target_count) return 0;
    return Math.min((quest.attempt.progress_count / quest.attempt.target_count) * 100, 100);
  };

  /**
   * 퀘스트 상태 텍스트 반환 함수
   * @returns 상태에 따른 한글 텍스트
   */
  const getStatusText = (status: string) => {
    switch (status) {
      case 'DEACTIVE': return '비활성';
      case 'IN_PROGRESS': return '진행중';
      case 'CLEAR': return '목표 달성';
      case 'SUBMITTED': return '제출됨';
      case 'APPROVED': return '완료';
      default: return '미시작';
    }
  };

  /**
   * 퀘스트 상태 색상 반환 함수
   * @returns 상태에 따른 색상
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DEACTIVE': return COLORS.gray[500];
      case 'IN_PROGRESS': return COLORS.primary;
      case 'CLEAR': return COLORS.success;
      case 'SUBMITTED': return COLORS.warning;
      case 'APPROVED': return COLORS.success;
      default: return COLORS.gray[400];
    }
  };



  const handleCompleteQuest = async () => {
    try {
      setIsSubmitting(true);
      await completeQuest({ quest_id: quest.id });

      Alert.alert('퀘스트 즉시 완료', `${quest.reward_exp} EXP를 획득했습니다!`);
      // 상세 화면에서 데이터 갱신이 필요하면 목록 화면으로 돌아가서 새로고침하도록 안내
      navigation.goBack();
    } catch (error) {
      Alert.alert('오류', '퀘스트 즉시 완료에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyQuest = async () => {
    try {
      // 파일 업로드 시뮬레이션 (UI만)
      Alert.alert(
        '파일 업로드',
        '증빙 파일을 선택해주세요',
        [
          {
            text: '취소',
            style: 'cancel',
          },
          {
            text: '파일 선택',
            onPress: () => {
              // 파일 선택 시뮬레이션
              setTimeout(() => {
                Alert.alert(
                  '제출 완료',
                  '증빙 파일이 성공적으로 업로드되었습니다!\n퀘스트가 완료되었습니다!',
                  [
                    {
                      text: '확인',
                      onPress: () => navigation.goBack(),
                    },
                  ]
                );
              }, 1000);
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('오류', '퀘스트 인증에 실패했습니다.');
    }
  };

  // 퀘스트 상태 디버깅 로그
  console.log('🎯 QuestDetailScreen 퀘스트 상태:', {
    questId: quest.id,
    questTitle: quest.title,
    hasSavings,
    attempt: quest.attempt,
    attemptStatus: quest.attempt?.status,
    progressCount: quest.attempt?.progress_count,
    targetCount: quest.attempt?.target_count,
    verifyMethod: quest.verify_method,
    linkUrl: quest.link_url,
    questKeys: Object.keys(quest), // quest 객체의 모든 키 확인
    questType: typeof quest.verify_method,
    isLinkQuest: quest.verify_method === 'LINK'
  });

  const canStart = false; // 시작 버튼 제거 (적금 가입 시 자동 시작)
  const canSubmit = quest.attempt?.status === 'CLEAR';
  const canVerify = quest.attempt?.status === 'IN_PROGRESS' || !quest.attempt; // 미시작도 인증 가능으로 표시
  const isCompleted = quest.attempt?.status === 'APPROVED';
  const canClaimReward = quest.attempt?.status === 'CLEAR'; // 경험치 받기 가능 여부

  console.log('🎯 QuestDetailScreen 버튼 조건:', {
    canClaimReward,
    canVerify,
    isCompleted,
    verifyMethod: quest.verify_method,
    hasLink: !!quest.link_url,
    linkButtonShouldShow: quest.verify_method === 'LINK'
  });

  return (
    <View style={styles.container}>
      <AppHeader title="퀘스트 상세" showBackButton />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 적금 비가입자인 경우 간단한 정보만 표시 */}
        {!hasSavings ? (
          <View style={styles.simpleContainer}>
            <View style={styles.questHeader}>
              <View style={styles.questReward}>
                <Ionicons name="star" size={20} color={COLORS.secondary} />
                <Text style={styles.questRewardText}>{quest.reward_exp} EXP</Text>
              </View>
            </View>

            <View style={styles.questTitleContainer}>
              <Ionicons 
                name={QUEST_CATEGORY_ICONS[quest.category] as any} 
                size={24} 
                color={COLORS.gray[600]} 
              />
              <Text style={styles.questTitle}>{quest.title}</Text>
            </View>

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

            <View style={styles.noSavingsOverlay}>
              <Ionicons name="lock-closed" size={48} color={COLORS.gray[400]} />
              <Text style={styles.noSavingsText}>적금 가입 후 이용 가능합니다</Text>
              <Text style={styles.noSavingsSubtext}>
                퀘스트 진행, 경험치 획득, 상세 정보 확인이 가능합니다
              </Text>
            </View>
          </View>
        ) : (
          // 적금 가입자인 경우 상세 정보 표시
          <>
            {/* 퀘스트 헤더 */}
            <View style={styles.questHeader}>
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
                { backgroundColor: getStatusColor(quest.attempt?.status || 'DEACTIVE') }
              ]} 
            />
            <Text style={styles.statusText}>{getStatusText(quest.attempt?.status || 'DEACTIVE')}</Text>
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
                    backgroundColor: isCompleted ? COLORS.success : QUEST_TYPE_COLORS[quest.type.toLowerCase() as keyof typeof QUEST_TYPE_COLORS]
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
              color={QUEST_TYPE_COLORS[quest.type.toLowerCase() as keyof typeof QUEST_TYPE_COLORS]} 
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
                {VERIFY_METHOD_DESCRIPTIONS[quest.verify_method as keyof typeof VERIFY_METHOD_DESCRIPTIONS]}
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

          {/* 진행중인 퀘스트의 경우 계속하기 버튼 */}
          {quest.attempt?.status === 'IN_PROGRESS' && (
            <PrimaryButton
              title="계속하기"
              onPress={handleVerifyQuest}
              size="large"
              variant="primary"
            />
          )}

          {/* 목표 달성한 퀘스트의 경우 경험치 받기 버튼 또는 링크 열기 버튼 */}
          {canClaimReward && quest.verify_method === 'LINK' ? (
            <TouchableOpacity
              style={[
                styles.linkButton,
                isSubmitting && styles.linkButtonDisabled
              ]}
              onPress={() => {
                // 링크 열기 및 퀘스트 완료 처리
                Alert.alert(
                  '링크 열기',
                  '외부 링크로 이동하고 퀘스트를 완료하시겠습니까?',
                  [
                    { text: '취소', style: 'cancel' },
                    { 
                      text: '열기 및 완료', 
                      onPress: async () => {
                        try {
                          setIsSubmitting(true);
                          console.log('🎯 링크 퀘스트 완료 요청:', quest.id);
                          
                          // 퀘스트 완료 API 호출
                          await completeQuest({ quest_id: quest.id });
                          
                          Alert.alert(
                            '퀘스트 완료!', 
                            `링크를 열고 ${quest.reward_exp} EXP를 획득했습니다!`,
                            [
                              {
                                text: '확인',
                                onPress: () => navigation.goBack()
                              }
                            ]
                          );
                        } catch (error) {
                          console.error('🎯 링크 퀘스트 완료 실패:', error);
                          Alert.alert('오류', '퀘스트 완료에 실패했습니다.');
                        } finally {
                          setIsSubmitting(false);
                        }
                      }
                    }
                  ]
                );
              }}
              disabled={isSubmitting}
            >
              <Ionicons name="open-outline" size={20} color={COLORS.white} />
              <Text style={styles.linkButtonText}>
                {isSubmitting ? '처리중...' : '링크 열기'}
              </Text>
            </TouchableOpacity>
          ) : canClaimReward && (
            <PrimaryButton
              title={`${quest.reward_exp} EXP 받기`}
              onPress={handleCompleteQuest}
              size="large"
              variant="success"
              loading={isSubmitting}
            />
          )}

          {/* 미시작 퀘스트의 경우 시작하기 버튼 */}
          {(!quest.attempt || quest.attempt.status === 'DEACTIVE') && (
            <PrimaryButton
              title="시작하기"
              onPress={handleVerifyQuest}
              size="large"
              variant="primary"
            />
          )}

          {/* 시연용 퀘스트 즉시 완료 버튼 */}
          {!isCompleted && !canClaimReward && (
            <PrimaryButton
              title="퀘스트 즉시 완료 (시연용)"
              onPress={handleCompleteQuest}
              size="large"
              variant="warning"
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
          </>
        )}
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
    justifyContent: 'flex-end',
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
  // 적금 비가입자용 스타일
  simpleContainer: {
    flex: 1,
  },
  noSavingsOverlay: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    marginTop: SPACING.xl,
  },
  noSavingsText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.gray[500],
    textAlign: 'center',
    marginTop: SPACING.md,
    fontWeight: '600',
  },
  noSavingsSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[400],
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 20,
  },
  // 링크 버튼 스타일
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
     linkButtonText: {
     color: COLORS.white,
     fontSize: FONT_SIZES.md,
     fontWeight: '600',
   },
   linkButtonDisabled: {
     backgroundColor: COLORS.gray[400],
     opacity: 0.6,
   },
});
