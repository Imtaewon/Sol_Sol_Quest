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
  Platform,
  Linking,
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
import { useClaimQuestRewardMutation } from '../../store/api/baseApi';
import { useSavingsAccount } from '../../hooks/useUser';
import { RootState } from '../../store';
import { HomeStackParamList } from '../../navigation/HomeStack';
import { useQueryClient } from '@tanstack/react-query';

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
   * 외부 링크 열기 함수
   * React Native Web 환경에서 새 창/탭으로 링크를 엽니다
   */
  const openExternalLink = async (url: string) => {
    console.log('🔗 openExternalLink 함수 호출됨');
    console.log('🔗 받은 URL:', url);
    console.log('🔗 Platform.OS:', Platform.OS);
    
    try {
      if (Platform.OS === 'web') {
        console.log('🔗 웹 환경에서 직접 window.open 사용');
        console.log('🔗 window 객체 존재 여부:', typeof window !== 'undefined');
        console.log('🔗 window.open 함수 존재 여부:', typeof window.open === 'function');
        
        // 직접 URL로 새 창 열기
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
        console.log('🔗 window.open 호출 완료, 새 창 객체:', newWindow);
        
        if (newWindow) {
          console.log('🔗 새 창이 성공적으로 열렸습니다');
        } else {
          console.log('🔗 새 창 열기 실패 - 팝업 차단 가능성');
          Alert.alert('팝업 차단됨', '브라우저에서 팝업을 차단했습니다. 팝업 차단을 해제해주세요.');
        }
      } else {
        console.log('🔗 모바일 환경에서 Linking API 사용');
        // 모바일 환경에서는 Linking API 사용
        console.log('🔗 Linking.canOpenURL 호출 시작');
        const supported = await Linking.canOpenURL(url);
        console.log('🔗 Linking.canOpenURL 결과:', supported);
        
        if (supported) {
          console.log('🔗 Linking.openURL 호출 시작');
          await Linking.openURL(url);
          console.log('🔗 Linking.openURL 호출 완료');
        } else {
          console.log('🔗 링크를 열 수 없음 - Alert 표시');
          Alert.alert('오류', '이 링크를 열 수 없습니다.');
        }
      }
      console.log('🔗 openExternalLink 함수 성공적으로 완료');
    } catch (error) {
      console.error('🔗 openExternalLink 함수에서 에러 발생:', error);
      console.error('🔗 에러 타입:', typeof error);
      console.error('🔗 에러 메시지:', error instanceof Error ? error.message : 'Unknown error');
      Alert.alert('오류', '링크를 여는 중 오류가 발생했습니다.');
    }
  };

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

  // 퀘스트 수령 훅 (새로운 API 사용)
  const claimQuestRewardMutation = useClaimQuestRewardMutation();
  const queryClient = useQueryClient();

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
         await claimQuestRewardMutation[0]({ 
           quest_id: quest.id
         });
         
         // 성공적으로 완료되면 모든 관련 데이터 새로고침
         console.log('🎯 퀘스트 완료 후 데이터 새로고침 시작');
         
         // 1. 캐시 무효화
         await Promise.all([
           queryClient.invalidateQueries({ queryKey: ['user'] }),
           queryClient.invalidateQueries({ queryKey: ['account'] }),
           queryClient.invalidateQueries({ queryKey: ['savingsAccount'] }),
           queryClient.invalidateQueries({ queryKey: ['depositAccount'] }),
           queryClient.invalidateQueries({ queryKey: ['ranks'] }),
           queryClient.invalidateQueries({ queryKey: ['leaderboard'] }),
         ]);
         
         // 2. 실제 데이터 새로고침
         await Promise.all([
           refetch(), // 퀘스트 목록 새로고침
           refetchGrowth(), // 성장 퀘스트 새로고침
           refetchDaily(), // 일상 퀘스트 새로고침
           refetchSurprise(), // 돌발 퀘스트 새로고침
         ]);
         
         // 3. 강제로 화면 새로고침 (상태 업데이트)
         setRefreshing(true);
         setTimeout(() => setRefreshing(false), 100);
         
         // 4. 성공 메시지 표시
         Alert.alert(
           '퀘스트 완료',
           '경험치를 성공적으로 받았습니다!',
           [{ text: '확인' }]
         );
         
         console.log('🎯 퀘스트 완료 후 데이터 새로고침 완료');
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
     if (quest.user_status === 'SUBMITTED') return '승인대기';
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
     const isSubmitted = quest.user_status === 'SUBMITTED';

         console.log('🎯 퀘스트 상태 계산:', {
       progress,
       statusText,
       isInProgress,
       canClaim,
       isCompleted,
       isSubmitted
     });

    // 링크 열기 버튼 렌더링 조건 로그
    console.log('🔗 링크 열기 버튼 렌더링 조건 확인:', {
      verify_method: quest.verify_method,
      link_url: quest.link_url,
      hasLinkUrl: !!quest.link_url,
      isLinkQuest: quest.verify_method === 'LINK',
      shouldRenderLinkButton: quest.verify_method === 'LINK' && quest.link_url
    });

    return (
      <TouchableOpacity 
        style={styles.questCard}
        onPress={() => handleQuestPress(quest)}
      >
                 <View style={styles.questContent}>
           {/* 제목 (왼쪽) */}
           <View style={styles.questTitleRow}>
             <Ionicons 
               name="trophy" 
               size={20} 
               color={COLORS.gray[600]} 
             />
             <Text style={styles.questTitle}>{quest.title}</Text>
           </View>

           {/* 경험치 (오른쪽) */}
           <View style={styles.questRewardRow}>
             <View style={styles.questReward}>
               <Ionicons name="star" size={16} color={COLORS.secondary} />
               <Text style={styles.questRewardText}>{quest.expReward} EXP</Text>
             </View>
           </View>

           {/* 진행도 */}
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

           {/* 시작여부 (왼쪽) + 수령하기/완료/링크열기 (오른쪽) */}
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

                                                                                   {/* 링크 퀘스트인 경우 링크 열기 버튼 */}
                {quest.verify_method === 'LINK' && quest.link_url && !isCompleted && (
                  <TouchableOpacity
                    style={[styles.startButton, styles.linkButton]}
                    onPress={async () => {
                      console.log('🔗 링크 열기 버튼 클릭됨');
                      console.log('🔗 퀘스트 정보:', {
                        id: quest.id,
                        title: quest.title,
                        verify_method: quest.verify_method,
                        link_url: quest.link_url,
                        hasSavings: hasSavings
                      });
                      
                                             try {
                         // 1) 퀘스트 완료 API 호출 (경험치 수령)
                         console.log('🎯 링크 퀘스트 완료 API 호출 시작');
                         await handleClaimQuest(quest);
                         console.log('🎯 링크 퀘스트 완료 API 호출 완료');
                         
                         // 2) 사용자 정보 및 리더보드 데이터 새로고침
                         console.log('🔄 사용자 정보 및 리더보드 새로고침 시작');
                         await Promise.all([
                           queryClient.invalidateQueries({ queryKey: ['user'] }),
                           queryClient.invalidateQueries({ queryKey: ['ranks'] }),
                           queryClient.invalidateQueries({ queryKey: ['leaderboard'] }),
                         ]);
                         console.log('🔄 사용자 정보 및 리더보드 새로고침 완료');
                         
                         // 3) 링크 열기
                         console.log('🔗 링크 열기 시작');
                         openExternalLink(quest.link_url);
                         console.log('🔗 링크 열기 완료');
                         
                       } catch (error) {
                         console.error('🔗 링크 열기 중 에러:', error);
                         Alert.alert('오류', '링크를 여는 중 오류가 발생했습니다.');
                       }
                    }}
                  >
                    <Ionicons name="open-outline" size={16} color={COLORS.white} />
                    <Text style={styles.startButtonText}>링크 열기</Text>
                  </TouchableOpacity>
                )}

                {/* 파일 업로드 퀘스트인 경우 파일 제출 버튼 또는 승인대기 표시 */}
                {quest.verify_method === 'UPLOAD' && !isCompleted && !isSubmitted && (
                  <TouchableOpacity
                    style={[styles.startButton, styles.uploadButton]}
                                         onPress={() => {
                       console.log('📁 파일 제출 버튼 클릭됨');
                       console.log('📁 퀘스트 정보:', {
                         id: quest.id,
                         title: quest.title,
                         verify_method: quest.verify_method,
                         hasSavings: hasSavings
                       });
                       
                       console.log('📁 navigation 객체:', navigation);
                       console.log('📁 QuestUpload로 이동 시도...');
                       
                       // 즉시 네비게이션 시도 (try-catch 없이)
                       console.log('📁 QuestUpload로 이동 시도:', {
                         questId: quest.id,
                         questTitle: quest.title,
                         questDescription: quest.description || quest.title,
                       });
                       
                       // 네비게이션 객체 확인
                       console.log('📁 navigation 객체 타입:', typeof navigation);
                       console.log('📁 navigation.navigate 존재:', !!navigation.navigate);
                       
                                               // React Navigation v7 호환성을 위한 네비게이션 처리
                        try {
                          // 1. 먼저 네비게이션 객체 상태 확인
                          console.log('📁 네비게이션 상태 확인:', {
                            canGoBack: navigation.canGoBack(),
                            getState: navigation.getState(),
                          });
                          
                          // 2. 강제로 QuestUpload 화면으로 이동 (v7 호환)
                          navigation.navigate('QuestUpload', {
                            quest: {
                              id: quest.id,
                              title: quest.title,
                              description: quest.description || quest.title,
                            },
                          });
                          
                          // 3. 네비게이션 완료 확인
                          console.log('📁 QuestUpload로 이동 성공');
                        } catch (navError) {
                          console.error('📁 네비게이션 에러:', navError);
                          // 대안: push 방식으로 시도
                          try {
                            navigation.push('QuestUpload', {
                              quest: {
                                id: quest.id,
                                title: quest.title,
                                description: quest.description || quest.title,
                              },
                            });
                            console.log('📁 QuestUpload로 push 이동 성공');
                          } catch (pushError) {
                            console.error('📁 push 네비게이션도 실패:', pushError);
                            Alert.alert('오류', '화면 이동에 실패했습니다.');
                          }
                        }
                     }}
                  >
                    <Ionicons name="cloud-upload-outline" size={16} color={COLORS.white} />
                    <Text style={styles.startButtonText}>파일 제출</Text>
                  </TouchableOpacity>
                )}

                {/* 파일 제출 후 승인대기 상태 */}
                {quest.verify_method === 'UPLOAD' && isSubmitted && (
                  <View style={[styles.startButton, styles.waitingButton]}>
                    <Ionicons name="time-outline" size={16} color={COLORS.white} />
                    <Text style={styles.startButtonText}>승인대기</Text>
                  </View>
                )}

             {/* EXP 받기 가능한 경우 */}
             {canClaim && (
               <TouchableOpacity
                 style={[styles.startButton, styles.claimButton]}
                 onPress={() => handleClaimQuest(quest)}
               >
                 <Text style={styles.startButtonText}>수령하기</Text>
               </TouchableOpacity>
             )}

             {/* 완료된 경우 */}
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
   questRewardRow: {
     flexDirection: 'row',
     justifyContent: 'flex-end',
     marginBottom: SPACING.md,
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
     linkButton: {
     backgroundColor: COLORS.accent,
     flexDirection: 'row',
     alignItems: 'center',
     gap: SPACING.xs,
   },
       uploadButton: {
      backgroundColor: COLORS.warning,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
    },
    waitingButton: {
      backgroundColor: COLORS.gray[500],
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
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

