import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppHeader } from '../../components/common/AppHeader';
import { FormTextInput } from '../../components/common/FormTextInput';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { LoadingView } from '../../components/common/LoadingView';
import { ErrorView } from '../../components/common/ErrorView';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';
import { HomeStackParamList } from '../../navigation/HomeStack';
import { usePersonalInfoForSaving } from '../../hooks/useUser';

type SavingOpenScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'SavingOpen'>;

// 폼 스키마
const savingFormSchema = z.object({
  monthlyAmount: z.number().min(10000, '최소 10,000원 이상 입력해주세요'),
  accountNumber: z.string().min(1, '계좌번호를 입력해주세요'),
});

type SavingFormData = z.infer<typeof savingFormSchema>;

export const SavingOpenScreen: React.FC = () => {
  const navigation = useNavigation<SavingOpenScreenNavigationProp>();
  const [currentStep, setCurrentStep] = useState(1);
  const [surveyResponses, setSurveyResponses] = useState<Array<{questionId: number, type: number, answer: string | number}>>([]);

  const { data: personalInfo, isLoading, error } = usePersonalInfoForSaving();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SavingFormData>({
    resolver: zodResolver(savingFormSchema),
    defaultValues: {
      monthlyAmount: 100000,
      accountNumber: '',
    },
  });

  const onSubmit = (data: SavingFormData) => {
    if (currentStep === 1) {
      // 첫 번째 단계: 계좌 정보 입력
      setCurrentStep(2);
    } else {
      // 두 번째 단계: 설문 완료 후 적금 가입
      console.log('적금 가입 데이터:', { ...data, surveyResponses });
      // TODO: 적금 가입 API 호출
      navigation.navigate('DepositOpen');
    }
  };

  const handleNext = () => {
    setCurrentStep(2);
  };

  if (isLoading) {
    return <LoadingView message="개인정보를 불러오는 중..." />;
  }

  if (error) {
    return <ErrorView message="개인정보를 불러오는데 실패했습니다." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="적금 가입"
        showBack
        onBackPress={() => navigation.goBack()}
        showNotification={false}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>적금 가입</Text>
          <Text style={styles.subtitle}>
            {currentStep === 1 ? '적금 정보를 입력해주세요' : '설문을 완료해주세요'}
          </Text>

          {currentStep === 1 ? (
            // 첫 번째 단계: 계좌 정보 입력
            <View style={styles.form}>
              {/* 개인정보 표시 (읽기 전용) */}
              <View style={styles.personalInfoSection}>
                <Text style={styles.sectionTitle}>개인정보</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>이름</Text>
                  <Text style={styles.infoValue}>{personalInfo?.data?.name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>출생연도</Text>
                  <Text style={styles.infoValue}>{personalInfo?.data?.birthYear}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>학교</Text>
                  <Text style={styles.infoValue}>{personalInfo?.data?.school}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>학과</Text>
                  <Text style={styles.infoValue}>{personalInfo?.data?.department}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>학년</Text>
                  <Text style={styles.infoValue}>{personalInfo?.data?.grade}학년</Text>
                </View>
              </View>

              {/* 적금 정보 입력 */}
              <View style={styles.savingInfoSection}>
                <Text style={styles.sectionTitle}>적금 정보</Text>
                <Controller
                  control={control}
                  name="monthlyAmount"
                  render={({ field: { onChange, value } }) => (
                    <FormTextInput
                      label="자동이체 금액"
                      placeholder="월 납입 금액을 입력해주세요"
                      value={value.toString()}
                      onChangeText={(text) => onChange(parseInt(text) || 0)}
                      error={errors.monthlyAmount?.message}
                      keyboardType="numeric"
                      accessibilityRole="text"
                      accessibilityLabel="자동이체 금액 입력 필드"
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="accountNumber"
                  render={({ field: { onChange, value } }) => (
                    <FormTextInput
                      label="자동이체 계좌"
                      placeholder="계좌번호를 입력해주세요"
                      value={value}
                      onChangeText={onChange}
                      error={errors.accountNumber?.message}
                      keyboardType="numeric"
                      accessibilityRole="text"
                      accessibilityLabel="자동이체 계좌 입력 필드"
                    />
                  )}
                />
              </View>

              <View style={styles.buttonContainer}>
                <PrimaryButton
                  title="계좌 가입하기"
                  onPress={() => navigation.navigate('DepositOpen')}
                  variant="outline"
                  size="large"
                  style={styles.secondaryButton}
                  accessibilityRole="button"
                  accessibilityLabel="계좌 가입하기 버튼"
                />
                <PrimaryButton
                  title="다음"
                  onPress={handleSubmit(onSubmit)}
                  size="large"
                  style={styles.primaryButton}
                  accessibilityRole="button"
                  accessibilityLabel="다음 버튼"
                />
              </View>
            </View>
          ) : (
            // 두 번째 단계: 설문 (UI만 구현)
            <View style={styles.form}>
              <View style={styles.surveySection}>
                <Text style={styles.sectionTitle}>설문 조사</Text>
                <Text style={styles.surveyDescription}>
                  설문을 완료하면 적금 가입이 완료됩니다.
                </Text>
                
                {/* 설문 UI는 별도 구현 필요 */}
                <View style={styles.surveyPlaceholder}>
                  <Text style={styles.placeholderText}>설문 문항이 여기에 표시됩니다</Text>
                </View>
              </View>

              <PrimaryButton
                title="제출하기"
                onPress={handleSubmit(onSubmit)}
                size="large"
                style={styles.submitButton}
                accessibilityRole="button"
                accessibilityLabel="설문 제출하기 버튼"
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    marginBottom: SPACING.xl,
  },
  form: {
    marginTop: SPACING.lg,
  },
  personalInfoSection: {
    marginBottom: SPACING.xl,
  },
  savingInfoSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
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
  buttonContainer: {
    gap: SPACING.md,
  },
  primaryButton: {
    marginTop: SPACING.md,
  },
  secondaryButton: {
    marginTop: SPACING.md,
  },
  surveySection: {
    marginBottom: SPACING.xl,
  },
  surveyDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    marginBottom: SPACING.lg,
  },
  surveyPlaceholder: {
    backgroundColor: COLORS.gray[100],
    padding: SPACING.lg,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[500],
    textAlign: 'center',
  },
  submitButton: {
    marginTop: SPACING.lg,
  },
});
