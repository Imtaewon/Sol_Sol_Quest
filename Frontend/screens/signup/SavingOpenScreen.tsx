/**
 * SavingOpenScreen.tsx
 * 
 * 적금 가입 화면 컴포넌트
 * 
 * 주요 기능:
 * - 1단계: 적금 정보 입력 + 상시입출금 계좌 생성
 * - 2단계: 설문 조사 (12문제)
 * - 최종 제출: 설문 응답 제출
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { AppHeader } from '../../components/common/AppHeader';
import { FormTextInput } from '../../components/common/FormTextInput';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import { useGetUserInfoQuery, useCreateDemandAccountMutation, useCreateSavingsAccountMutation } from '../../store/api/baseApi';
import { useQueryClient } from '@tanstack/react-query';
import { useDepositAccount } from '../../hooks/useUser';
import { 
  useGetSurveyQuestionQuery,
  useSubmitSurveyResponsesMutation 
} from '../../store/api/savingApi';

import { 
  SurveyQuestion, 
  SurveyResponse,
  SurveyAnswerIn,
  QUESTION_TYPE_MAPPING 
} from '../../types/saving';
import { HomeStackParamList } from '../../navigation/HomeStack';

type SavingOpenScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'SavingOpen'>;

// 적금 정보 입력 폼 타입
interface SavingFormData {
  monthlyAmount: number;
  accountNumber: string;
}

// 설문 응답 저장용 상태
interface SurveyState {
  responses: { [key: number]: { answer: number; questionId: string; optionId: string } };
  currentQuestion: number;
}

export const SavingOpenScreen: React.FC = () => {
  const navigation = useNavigation<SavingOpenScreenNavigationProp>();
  const queryClient = useQueryClient();
  
  // 현재 단계 (1: 적금 정보 입력, 2: 설문 조사)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  
  // 설문 상태 관리
  const [surveyState, setSurveyState] = useState<SurveyState>({
    responses: {},
    currentQuestion: 1,
  });



  // 폼 컨트롤
  const { control, handleSubmit, formState: { errors }, watch, setValue } = useForm<SavingFormData>({
    defaultValues: {
      monthlyAmount: 0,
      accountNumber: '',
    },
  });

  // API 호출 - 로그인한 사용자 정보 조회
  const { 
    data: userInfo, 
    isLoading: isUserInfoLoading, 
    error: userInfoError 
  } = useGetUserInfoQuery();

  // 상시입출금 계좌 정보 조회
  const { 
    data: depositAccount, 
    isLoading: isDepositLoading, 
    error: depositError 
  } = useDepositAccount();

  const { 
    data: surveyQuestion, 
    isLoading: isSurveyLoading,
    error: surveyError,
    isFetching: isSurveyFetching,
    isError: isSurveyError
  } = useGetSurveyQuestionQuery(surveyState.currentQuestion, {
    skip: currentStep !== 2,
  });

  // 설문 API 호출 상태 상세 로그
  console.log('🔍 설문 API 호출 상태:', {
    currentStep,
    currentQuestion: surveyState.currentQuestion,
    skip: currentStep !== 2,
    isSurveyLoading,
    isSurveyFetching,
    isSurveyError,
    surveyError,
    surveyQuestion,
    hasData: !!surveyQuestion
  });

  // 설문 에러 처리
  React.useEffect(() => {
    if (surveyError && currentStep === 2) {
      console.error('❌ 설문 문제 조회 실패:', surveyError);
      Alert.alert(
        '설문 조회 실패',
        '설문 문제를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.',
        [
          {
            text: '확인',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  }, [surveyError, currentStep, navigation]);

  // currentStep 변경 감지
  React.useEffect(() => {
    console.log('🔄 currentStep 변경됨:', {
      currentStep,
      currentQuestion: surveyState.currentQuestion,
      willSkip: currentStep !== 2
    });
  }, [currentStep, surveyState.currentQuestion]);


  const [createSavingsAccount, { isLoading: isCreatingSavings }] = useCreateSavingsAccountMutation();
  const [submitSurveyResponses, { isLoading: isSubmittingSurvey }] = useSubmitSurveyResponsesMutation();

  // API 요청 로그
  console.log('💰 SavingOpenScreen API 상태:', {
    userInfo: { loading: isUserInfoLoading, error: userInfoError, data: userInfo ? '있음' : '없음' },
    depositAccount: { loading: isDepositLoading, error: depositError, data: depositAccount?.data ? '있음' : '없음' },
    surveyQuestion: { loading: isSurveyLoading, data: surveyQuestion ? '있음' : '없음' },
    currentStep,
    currentQuestion: surveyState.currentQuestion
  });

  // 설문 데이터 상세 로그
  console.log('📝 설문 데이터 상세:', {
    surveyQuestion: surveyQuestion,
    options: surveyQuestion?.options,
    optionsLength: surveyQuestion?.options?.length,
    question: surveyQuestion?.question,
    currentStep,
    isSurveyLoading,
    surveyError: surveyError
  });

  // 설문 에러 상세 로그
  if (surveyError) {
    console.error('❌ 설문 에러 상세:', {
      error: surveyError,
      errorType: typeof surveyError,
      errorKeys: Object.keys(surveyError || {}),
      errorData: 'error' in surveyError ? surveyError.error : undefined,
      errorStatus: 'status' in surveyError ? surveyError.status : undefined,
      errorMessage: 'message' in surveyError ? surveyError.message : undefined
    });
  }

  // 사용자 정보 상세 로그
  console.log('👤 SavingOpenScreen 사용자 정보:', {
    userInfo,
    birth_year: userInfo?.birth_year,
    department: userInfo?.department,
    name: userInfo?.name,
    university_name: userInfo?.university_name,
    grade: userInfo?.grade
  });

  // 입력된 값들 감시
  const monthlyAmount = watch('monthlyAmount');
  const accountNumber = watch('accountNumber');

  // 상시입출금 계좌 정보
  const hasDepositAccount = depositAccount?.data?.data && depositAccount.data.data.length > 0;
  const depositAccountInfo = depositAccount?.data?.data?.[0];

  // 상시입출금 계좌가 있으면 자동으로 계좌번호 설정
  useEffect(() => {
    if (hasDepositAccount && depositAccountInfo?.account_no) {
      setValue('accountNumber', depositAccountInfo.account_no);
    }
  }, [hasDepositAccount, depositAccountInfo?.account_no, setValue]);

  /**
   * 상시입출금 계좌 생성 페이지로 이동
   */
  const handleCreateDemandAccount = () => {
    navigation.navigate('DepositOpen');
  };

  // 적금 정보 임시 저장용 상태
  const [savingFormData, setSavingFormData] = useState<SavingFormData | null>(null);

  /**
   * 설문 버튼 클릭 처리 (설문 시작)
   */
  const handleStartSurvey = async (data: SavingFormData) => {
    try {
      if (!userInfo?.user_id) {
        Alert.alert('오류', '사용자 정보를 불러올 수 없습니다.');
        return;
      }

      if (!data.monthlyAmount || data.monthlyAmount <= 0) {
        Alert.alert('오류', '월 납입 금액을 입력해주세요.');
        return;
      }

      if (!data.accountNumber || data.accountNumber.trim() === '') {
        Alert.alert('오류', '자동이체 계좌번호를 입력해주세요.');
        return;
      }

      // 적금 정보를 임시 저장
      setSavingFormData(data);
      
      console.log('📝 설문 단계로 이동:', {
        savingFormData: data,
        beforeStep: currentStep,
        afterStep: 2
      });
      
      // 설문 단계로 이동
      setCurrentStep(2);
    } catch (error) {
      Alert.alert('오류', '설문을 시작할 수 없습니다.');
    }
  };

  /**
   * 설문 응답 처리
   */
  const handleSurveyAnswer = (answer: number) => {
    console.log('📝 설문 응답 처리:', {
      currentQuestion: surveyState.currentQuestion,
      answer: answer,
      beforeResponses: surveyState.responses,
      currentQuestionData: surveyQuestion
    });

         // 현재 문제의 정보 가져오기
     const currentQuestionData = surveyQuestion;
     const selectedOption = currentQuestionData?.options?.[answer - 1]; // answer는 1부터 시작하므로 -1

    setSurveyState(prev => {
      const newState = {
        ...prev,
        responses: {
          ...prev.responses,
          [prev.currentQuestion]: {
            answer: answer,
                         questionId: currentQuestionData?.id || '1',
            optionId: selectedOption?.id || '',
          },
        },
      };
      
      console.log('📝 설문 응답 업데이트 후:', {
        newResponses: newState.responses,
        responsesCount: Object.keys(newState.responses).length
      });
      
      return newState;
    });
  };

  /**
   * 설문 다음 문제로 이동
   */
  const handleNextQuestion = () => {
    if (surveyState.currentQuestion < 12) {
      setSurveyState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
      }));
    }
  };

  /**
   * 설문 이전 문제로 이동
   */
  const handlePrevQuestion = () => {
    if (surveyState.currentQuestion > 1) {
      setSurveyState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion - 1,
      }));
    }
  };

  /**
   * 설문 제출 처리
   */
  const handleSurveySubmit = async () => {
    try {
      if (!savingFormData || !userInfo?.user_id) {
        Alert.alert('오류', '적금 정보가 없습니다.');
        return;
      }

      // 설문 응답 데이터 검증
      console.log('📝 설문 제출 전 응답 데이터:', {
        surveyState: surveyState,
        responses: surveyState.responses,
        responsesCount: Object.keys(surveyState.responses).length,
        currentQuestion: surveyState.currentQuestion,
        allQuestionsAnswered: Object.keys(surveyState.responses).length === 12
      });

      // 모든 문제에 답변이 있는지 확인
      if (Object.keys(surveyState.responses).length !== 12) {
        Alert.alert('오류', '모든 설문 문제에 답변해주세요.');
        return;
      }

      // 1. 설문 응답 데이터 변환 (백엔드 요구사항에 맞춤)
      const surveyAnswers: SurveyAnswerIn[] = Object.entries(surveyState.responses).map(([questionNum, responseData]) => ({
        question_id: responseData.questionId,
        option_id: responseData.optionId,
      }));

      console.log('📝 변환된 설문 응답 데이터:', {
        surveyAnswers: surveyAnswers,
        responsesLength: surveyAnswers.length,
        currentQuestion: surveyQuestion
      });

      // 2. 설문 응답 제출 (백엔드 요구사항에 맞춤)
      await submitSurveyResponses({ items: surveyAnswers }).unwrap();

      // 3. 적금 가입 API 호출 (설문 완료 후)
      const savingsResult = await createSavingsAccount({
        user_id: userInfo.user_id,
        deposit_balance: savingFormData.monthlyAmount,
        account_no: savingFormData.accountNumber,
      }).unwrap();

      if (!savingsResult.success) {
        Alert.alert('오류', '적금 가입에 실패했습니다.');
        return;
      }

      Alert.alert(
        '설문 완료',
        '적금 계좌 개설이 완료되었습니다!',
        [
          {
            text: '확인',
            onPress: async () => {
              try {
                // 캐시 무효화 후 메인페이지로 이동
                await Promise.all([
                  queryClient.invalidateQueries({ queryKey: ['user'] }),
                  queryClient.invalidateQueries({ queryKey: ['account'] }),
                  queryClient.invalidateQueries({ queryKey: ['savingsAccount'] }),
                  queryClient.invalidateQueries({ queryKey: ['depositAccount'] }),
                  queryClient.invalidateQueries({ queryKey: ['ranks'] }),
                  queryClient.invalidateQueries({ queryKey: ['quests'] }),
                  queryClient.invalidateQueries({ queryKey: ['dailyQuests'] }),
                  queryClient.invalidateQueries({ queryKey: ['growthQuests'] }),
                  queryClient.invalidateQueries({ queryKey: ['surpriseQuests'] }),
                  queryClient.invalidateQueries({ queryKey: ['recommendedQuests'] }),
                ]);
                
                // 강제로 메인페이지로 이동
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                });
              } catch (error) {
                console.error('캐시 무효화 중 오류:', error);
                // 오류가 발생해도 메인페이지로 이동
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                });
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('설문 제출 오류:', error);
      Alert.alert('오류', '적금 가입 또는 설문 제출에 실패했습니다.');
    }
  };

  /**
   * 입출금 통장 가입 페이지로 이동
   */
  const handleOpenDemandAccount = () => {
    navigation.navigate('DepositOpen');
  };

  // 로딩 상태 처리
  if (isUserInfoLoading || isDepositLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="적금 가입" showBack />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>사용자 정보를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 에러 상태 처리
  if (userInfoError || depositError) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="적금 가입" showBack />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>사용자 정보를 불러오는데 실패했습니다.</Text>
          <TouchableOpacity style={styles.retryButton}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader 
        title="적금 가입" 
        showBack 
        onBackPress={() => {
          if (currentStep === 2) {
            setCurrentStep(1);
          } else {
            navigation.goBack();
          }
        }}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 진행 단계 표시 */}
        <View style={styles.progressContainer}>
          <View style={styles.progressStep}>
            <View style={[styles.progressDot, currentStep >= 1 && styles.progressDotActive]} />
            <Text style={[styles.progressText, currentStep >= 1 && styles.progressTextActive]}>
              적금 정보 입력
            </Text>
          </View>
          <View style={[styles.progressLine, currentStep >= 2 && styles.progressLineActive]} />
          <View style={styles.progressStep}>
            <View style={[styles.progressDot, currentStep >= 2 && styles.progressDotActive]} />
            <Text style={[styles.progressText, currentStep >= 2 && styles.progressTextActive]}>
              설문 조사
            </Text>
          </View>
        </View>

        {currentStep === 1 ? (
          // 1단계: 개인정보 + 적금 정보 입력
          <View style={styles.step1Container}>
            <Text style={styles.title}>적금 가입</Text>
            <Text style={styles.subtitle}>개인정보를 확인하고 적금 정보를 입력해주세요</Text>

            {/* 개인정보 섹션 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>개인정보</Text>
              <View style={styles.personalInfoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>이름</Text>
                  <Text style={styles.infoValue}>{userInfo?.name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>출생연도</Text>
                  <Text style={styles.infoValue}>{userInfo?.birth_year}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>학교</Text>
                  <Text style={styles.infoValue}>{userInfo?.university_name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>학과</Text>
                  <Text style={styles.infoValue}>{userInfo?.major}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>학년</Text>
                  <Text style={styles.infoValue}>{userInfo?.grade}학년</Text>
                </View>
              </View>
            </View>

            {/* 적금 정보 입력 섹션 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>적금 정보</Text>
              <View style={styles.savingInfoCard}>
                <Controller
                  control={control}
                  name="monthlyAmount"
                  rules={{ required: '월 납입 금액을 입력해주세요' }}
                  render={({ field: { onChange, value } }) => (
                    <FormTextInput
                      label="자동이체 금액"
                      placeholder="월 납입 금액을 입력해주세요"
                      value={value ? value.toLocaleString() : ''}
                      onChangeText={(text) => {
                        // 콤마 제거 후 숫자만 추출
                        const numericValue = parseInt(text.replace(/,/g, '')) || 0;
                        onChange(numericValue);
                      }}
                      error={errors.monthlyAmount?.message}
                      keyboardType="numeric"
                    />
                  )}
                />
                
                {/* 계좌 잔액 초과 경고 메시지 */}
                {monthlyAmount > (depositAccountInfo?.balance || 0) && hasDepositAccount && (
                  <Text style={styles.balanceWarningText}>
                    계좌 잔액보다 큽니다
                  </Text>
                )}

                <View style={styles.accountSection}>
                  <Text style={styles.accountLabel}>자동이체 계좌</Text>
                  
                  {hasDepositAccount ? (
                    // 상시입출금 계좌가 있는 경우
                    <View style={styles.existingAccountContainer}>
                                             <FormTextInput
                         label="계좌번호"
                         placeholder="계좌번호를 입력해주세요"
                         value={depositAccountInfo?.account_no || ''}
                         onChangeText={(text) => {
                           setValue('accountNumber', text);
                         }}
                         error={errors.accountNumber?.message}
                         keyboardType="numeric"
                         disabled={true}
                       />
                      <View style={styles.balanceInfo}>
                        <Text style={styles.balanceLabel}>현재 계좌 잔액</Text>
                        <Text style={styles.balanceAmount}>
                          {formatCurrency(depositAccountInfo?.balance || 0)}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    // 상시입출금 계좌가 없는 경우
                    <>
                      <FormTextInput
                        placeholder="계좌번호를 입력해주세요"
                        value={accountNumber}
                        onChangeText={(text) => {
                          setValue('accountNumber', text);
                        }}
                        error={errors.accountNumber?.message}
                        keyboardType="numeric"
                      />
                      <TouchableOpacity 
                        style={styles.openAccountButton}
                        onPress={handleCreateDemandAccount}
                      >
                        <Text style={styles.openAccountButtonText}>
                          상시입출금 계좌 만들기
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            </View>

                         {/* 다음 버튼 */}
             <PrimaryButton
               title="다음"
               onPress={handleSubmit(handleStartSurvey)}
               style={styles.nextButton}
             />
          </View>
        ) : (
          // 2단계: 설문 조사
          <View style={styles.step2Container}>
            <Text style={styles.title}>설문 조사</Text>
            <Text style={styles.subtitle}>
              {surveyState.currentQuestion} / 12
            </Text>

            {isSurveyLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>설문을 불러오는 중...</Text>
              </View>
            ) : (
              <View style={styles.surveyContainer}>
                                 <View style={styles.questionCard}>
                   <Text style={styles.questionText}>
                     {surveyQuestion?.question}
                   </Text>
                 </View>

                 {/* 답변 옵션 */}
                 {surveyQuestion?.options && 
                  surveyQuestion?.options?.length > 0 && (
                   <View style={styles.optionsContainer}>
                     {surveyQuestion?.options?.map((option: any, index: number) => (
                      <TouchableOpacity
                        key={option.id}
                                                 style={[
                           styles.optionButton,
                           surveyState.responses[surveyState.currentQuestion]?.answer === index + 1 && 
                           styles.optionButtonSelected
                         ]}
                         onPress={() => handleSurveyAnswer(index + 1)}
                       >
                         <Text style={[
                           styles.optionText,
                           surveyState.responses[surveyState.currentQuestion]?.answer === index + 1 && 
                           styles.optionTextSelected
                         ]}>
                          {option.option_text}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* 이전/다음/제출 버튼 */}
                <View style={styles.surveyButtons}>
                  {surveyState.currentQuestion > 1 && (
                    <TouchableOpacity 
                      style={styles.prevButton}
                      onPress={handlePrevQuestion}
                    >
                      <Text style={styles.prevButtonText}>이전</Text>
                    </TouchableOpacity>
                  )}

                  {surveyState.currentQuestion < 12 ? (
                    <TouchableOpacity 
                                             style={[
                         styles.nextSurveyButton,
                         !surveyState.responses[surveyState.currentQuestion]?.answer && styles.nextSurveyButtonDisabled
                       ]}
                       onPress={handleNextQuestion}
                       disabled={!surveyState.responses[surveyState.currentQuestion]?.answer}
                    >
                      <Text style={styles.nextSurveyButtonText}>다음</Text>
                    </TouchableOpacity>
                  ) : (
                                         <TouchableOpacity 
                                               style={[
                          styles.submitButton,
                          !surveyState.responses[surveyState.currentQuestion]?.answer && styles.submitButtonDisabled
                        ]}
                        onPress={handleSurveySubmit}
                        disabled={!surveyState.responses[surveyState.currentQuestion]?.answer || isCreatingSavings || isSubmittingSurvey}
                     >
                       <Text style={styles.submitButtonText}>
                         {isCreatingSavings || isSubmittingSurvey ? '처리 중...' : '제출하기'}
                       </Text>
                     </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
        )}
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
    padding: SPACING.lg,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  progressStep: {
    alignItems: 'center',
  },
  progressDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.gray[300],
    marginBottom: SPACING.xs,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  progressTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  progressLine: {
    width: 60,
    height: 2,
    backgroundColor: COLORS.gray[300],
    marginHorizontal: SPACING.md,
  },
  progressLineActive: {
    backgroundColor: COLORS.primary,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    marginBottom: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.md,
  },
  personalInfoCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  infoLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
  },
  infoValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.dark,
    fontWeight: '500',
  },
  savingInfoCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accountSection: {
    marginTop: SPACING.lg,
  },
  accountLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.dark,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  openAccountButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.sm,
    alignItems: 'center',
  },
  openAccountButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  nextButton: {
    marginTop: SPACING.xl,
  },
  step1Container: {
    flex: 1,
  },
  step2Container: {
    flex: 1,
  },
  surveyContainer: {
    flex: 1,
  },
  questionCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.dark,
    fontWeight: '600',
    lineHeight: 24,
  },
  optionsContainer: {
    gap: SPACING.md,
  },
  optionButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  optionButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  optionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.dark,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  surveyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xl,
  },
  prevButton: {
    backgroundColor: COLORS.gray[200],
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  prevButtonText: {
    color: COLORS.dark,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  nextSurveyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  nextSurveyButtonDisabled: {
    backgroundColor: COLORS.gray[300],
  },
  nextSurveyButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.gray[300],
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
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
  accountCreatedText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  // 상시입출금 계좌 관련 스타일
     existingAccountContainer: {
     marginBottom: SPACING.md,
   },
  balanceInfo: {
    marginTop: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  balanceLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.xs,
  },
     balanceAmount: {
     fontSize: FONT_SIZES.lg,
     fontWeight: '700',
     color: COLORS.dark,
   },
   // 계좌 잔액 초과 경고 메시지 스타일
   balanceWarningText: {
     fontSize: FONT_SIZES.sm,
     color: COLORS.error,
     marginTop: SPACING.xs,
     marginBottom: SPACING.sm,
   },
 });
