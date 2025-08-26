import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppHeader } from '../../components/common/AppHeader';
import { FormTextInput } from '../../components/common/FormTextInput';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { ModalBase } from '../../components/common/ModalBase';
import { COLORS, SPACING, FONT_SIZES, APP_CONSTANTS } from '../../utils/constants';
import { signupSchema, SignupFormData } from '../../utils/validators';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { useSignup } from '../../hooks/useAuth';

type SignupScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'SignUp'>;

export const SignupScreen: React.FC = () => {
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const signupMutation = useSignup();
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailCode, setEmailCode] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: 기본정보, 2: 학교정보
  // 1단계 데이터 임시저장
  const [step1Data, setStep1Data] = useState<Partial<SignupFormData>>({});

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      gender: undefined,
      birthYear: undefined,
      username: '',
      password: '',
      passwordConfirm: '',
      email: '',
      school: '',
      department: '',
      grade: undefined,
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    if (!emailVerified) {
      // 이메일 인증이 필요하다는 토스트 메시지가 API 에러 인터셉터에서 표시됨
      return;
    }

    try {
      // 1단계 데이터와 2단계 데이터를 합쳐서 API 요청
      const finalData = {
        ...step1Data,
        ...data,
      };
      
      const result = await signupMutation.mutateAsync(finalData);
      if (result.success) {
        // 회원가입 성공 후 로그인 화면으로 이동
        navigation.navigate('SignIn');
      }
    } catch (error) {
      console.error('회원가입 실패:', error);
    }
  };

  const handleEmailVerification = () => {
    setShowEmailModal(true);
  };

  const handleSchoolSelect = () => {
    setShowSchoolModal(true);
  };

  const handleSchoolSelected = (selectedSchool: string) => {
    setValue('school', selectedSchool);
    setShowSchoolModal(false);
  };

  const handleNextStep = () => {
    // 1단계 데이터를 임시저장하고 2단계로 이동
    const currentValues = getValues();
    setStep1Data({
      name: currentValues.name,
      gender: currentValues.gender,
      birthYear: currentValues.birthYear,
      username: currentValues.username,
      password: currentValues.password,
      passwordConfirm: currentValues.passwordConfirm,
      email: currentValues.email,
    });
    
    // 2단계에서는 학교 정보만 입력받도록 폼 완전 초기화
    reset({
      name: '',
      gender: undefined,
      birthYear: undefined,
      username: '',
      password: '',
      passwordConfirm: '',
      email: '',
      school: '',
      department: '',
      grade: undefined,
    });
    
    setCurrentStep(2);
  };

  const handlePrevStep = () => {
    // 1단계로 돌아갈 때 임시저장된 데이터로 폼 복원
    reset({
      name: step1Data.name || '',
      gender: step1Data.gender,
      birthYear: step1Data.birthYear,
      username: step1Data.username || '',
      password: step1Data.password || '',
      passwordConfirm: step1Data.passwordConfirm || '',
      email: step1Data.email || '',
      school: '',
      department: '',
      grade: undefined,
    });
    
    setCurrentStep(1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="회원가입"
        showBack
        onBackPress={() => navigation.goBack()}
      />
      
      {Platform.OS !== 'web' ? (
        <KeyboardAvoidingView 
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView 
            style={styles.content} 
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={true}
          >
            <View style={styles.formContainer}>
              <Text style={styles.title}>회원가입</Text>
              <Text style={styles.subtitle}>
                쏠쏠한 퀘스트와 함께 시작해보세요
              </Text>

              <View style={styles.form}>
                {currentStep === 1 ? (
                  // 1단계: 기본정보
                  <>
                    <Controller
                      control={control}
                      name="name"
                      render={({ field: { onChange, value } }) => (
                        <FormTextInput
                          label="이름"
                          placeholder="이름을 입력해주세요"
                          value={value}
                          onChangeText={onChange}
                          error={errors.name?.message}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="gender"
                      render={({ field: { onChange, value } }) => (
                        <View style={styles.selectContainer}>
                          <Text style={styles.label}>성별</Text>
                          <View style={styles.genderButtons}>
                            <TouchableOpacity
                              style={[
                                styles.genderButton,
                                value === 'male' && styles.genderButtonActive,
                              ]}
                              onPress={() => onChange('male')}
                            >
                              <Text
                                style={[
                                  styles.genderButtonText,
                                  value === 'male' && styles.genderButtonTextActive,
                                ]}
                              >
                                남성
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.genderButton,
                                value === 'female' && styles.genderButtonActive,
                              ]}
                              onPress={() => onChange('female')}
                            >
                              <Text
                                style={[
                                  styles.genderButtonText,
                                  value === 'female' && styles.genderButtonTextActive,
                                ]}
                              >
                                여성
                              </Text>
                            </TouchableOpacity>
                          </View>
                          {errors.gender && (
                            <Text style={styles.errorText}>{errors.gender.message}</Text>
                          )}
                        </View>
                      )}
                    />

                    <Controller
                      control={control}
                      name="birthYear"
                      render={({ field: { onChange, value } }) => (
                        <FormTextInput
                          label="출생년도"
                          placeholder="출생년도를 입력해주세요 (예: 2000)"
                          value={value?.toString() || ''}
                          onChangeText={(text) => onChange(parseInt(text) || undefined)}
                          error={errors.birthYear?.message}
                          keyboardType="numeric"
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="username"
                      render={({ field: { onChange, value } }) => (
                        <FormTextInput
                          label="아이디"
                          placeholder="아이디를 입력해주세요"
                          value={value}
                          onChangeText={onChange}
                          error={errors.username?.message}
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="password"
                      render={({ field: { onChange, value } }) => (
                        <FormTextInput
                          label="비밀번호"
                          placeholder="비밀번호를 입력해주세요 (8자 이상)"
                          value={value}
                          onChangeText={onChange}
                          error={errors.password?.message}
                          secureTextEntry
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="passwordConfirm"
                      render={({ field: { onChange, value } }) => (
                        <FormTextInput
                          label="비밀번호 확인"
                          placeholder="비밀번호를 다시 입력해주세요"
                          value={value}
                          onChangeText={onChange}
                          error={errors.passwordConfirm?.message}
                          secureTextEntry
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="email"
                      render={({ field: { onChange, value } }) => (
                        <FormTextInput
                          label="이메일"
                          placeholder="이메일을 입력해주세요"
                          value={value}
                          onChangeText={onChange}
                          error={errors.email?.message}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          rightIcon="mail"
                          onRightIconPress={handleEmailVerification}
                        />
                      )}
                    />

                    <PrimaryButton
                      title="다음"
                      onPress={handleNextStep}
                      size="large"
                      style={styles.nextButton}
                    />
                  </>
                ) : (
                  // 2단계: 학교정보
                  <>
                    <Controller
                      control={control}
                      name="school"
                      render={({ field: { onChange, value } }) => (
                        <TouchableOpacity
                          style={styles.schoolInput}
                          onPress={handleSchoolSelect}
                        >
                          <Text style={styles.label}>학교</Text>
                          <View style={styles.schoolButton}>
                            <Text style={value ? styles.schoolText : styles.schoolPlaceholder}>
                              {value || '학교를 선택해주세요'}
                            </Text>
                            <Text style={styles.schoolArrow}>▼</Text>
                          </View>
                          {errors.school && (
                            <Text style={styles.errorText}>{errors.school.message}</Text>
                          )}
                        </TouchableOpacity>
                      )}
                    />

                    <Controller
                      control={control}
                      name="department"
                      render={({ field: { onChange, value } }) => (
                        <FormTextInput
                          label="학과"
                          placeholder="학과를 입력해주세요"
                          value={value}
                          onChangeText={onChange}
                          error={errors.department?.message}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="grade"
                      render={({ field: { onChange, value } }) => (
                        <View style={styles.selectContainer}>
                          <Text style={styles.label}>학년</Text>
                          <View style={styles.gradeButtons}>
                            {[1, 2, 3, 4].map((grade) => (
                              <TouchableOpacity
                                key={grade}
                                style={[
                                  styles.gradeButton,
                                  value === grade && styles.gradeButtonActive,
                                ]}
                                onPress={() => onChange(grade)}
                              >
                                <Text
                                  style={[
                                    styles.gradeButtonText,
                                    value === grade && styles.gradeButtonTextActive,
                                  ]}
                                >
                                  {grade}학년
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                          {errors.grade && (
                            <Text style={styles.errorText}>{errors.grade.message}</Text>
                          )}
                        </View>
                      )}
                    />

                    <View style={styles.buttonContainer}>
                      <PrimaryButton
                        title="이전"
                        onPress={handlePrevStep}
                        size="large"
                        style={styles.prevButton}
                        variant="outline"
                      />
                      <PrimaryButton
                        title="회원가입하기"
                        onPress={handleSubmit(onSubmit)}
                        loading={signupMutation.isPending}
                        size="large"
                        style={styles.signupButton}
                      />
                    </View>
                  </>
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={true}
        >
          <View style={styles.formContainer}>
            <Text style={styles.title}>회원가입</Text>
            <Text style={styles.subtitle}>
              쏠쏠한 퀘스트와 함께 시작해보세요
            </Text>

            <View style={styles.form}>
              {currentStep === 1 ? (
                // 1단계: 기본정보 (웹용)
                <>
                  <Controller
                    control={control}
                    name="name"
                    render={({ field: { onChange, value } }) => (
                      <FormTextInput
                        label="이름"
                        placeholder="이름을 입력해주세요"
                        value={value}
                        onChangeText={onChange}
                        error={errors.name?.message}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="gender"
                    render={({ field: { onChange, value } }) => (
                      <View style={styles.selectContainer}>
                        <Text style={styles.label}>성별</Text>
                        <View style={styles.genderButtons}>
                          <TouchableOpacity
                            style={[
                              styles.genderButton,
                              value === 'male' && styles.genderButtonActive,
                            ]}
                            onPress={() => onChange('male')}
                          >
                            <Text
                              style={[
                                styles.genderButtonText,
                                value === 'male' && styles.genderButtonTextActive,
                              ]}
                            >
                              남성
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.genderButton,
                              value === 'female' && styles.genderButtonActive,
                            ]}
                            onPress={() => onChange('female')}
                          >
                            <Text
                              style={[
                                styles.genderButtonText,
                                value === 'female' && styles.genderButtonTextActive,
                              ]}
                            >
                              여성
                            </Text>
                          </TouchableOpacity>
                        </View>
                        {errors.gender && (
                          <Text style={styles.errorText}>{errors.gender.message}</Text>
                        )}
                      </View>
                    )}
                  />

                  <Controller
                    control={control}
                    name="birthYear"
                    render={({ field: { onChange, value } }) => (
                      <FormTextInput
                        label="출생년도"
                        placeholder="출생년도를 입력해주세요 (예: 2000)"
                        value={value?.toString() || ''}
                        onChangeText={(text) => onChange(parseInt(text) || undefined)}
                        error={errors.birthYear?.message}
                        keyboardType="numeric"
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="username"
                    render={({ field: { onChange, value } }) => (
                      <FormTextInput
                        label="아이디"
                        placeholder="아이디를 입력해주세요"
                        value={value}
                        onChangeText={onChange}
                        error={errors.username?.message}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, value } }) => (
                      <FormTextInput
                        label="비밀번호"
                        placeholder="비밀번호를 입력해주세요 (8자 이상)"
                        value={value}
                        onChangeText={onChange}
                        error={errors.password?.message}
                        secureTextEntry
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="passwordConfirm"
                    render={({ field: { onChange, value } }) => (
                      <FormTextInput
                        label="비밀번호 확인"
                        placeholder="비밀번호를 다시 입력해주세요"
                        value={value}
                        onChangeText={onChange}
                        error={errors.passwordConfirm?.message}
                        secureTextEntry
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, value } }) => (
                      <FormTextInput
                        label="이메일"
                        placeholder="이메일을 입력해주세요"
                        value={value}
                        onChangeText={onChange}
                        error={errors.email?.message}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        rightIcon="mail"
                        onRightIconPress={handleEmailVerification}
                      />
                    )}
                  />

                  <PrimaryButton
                    title="다음"
                    onPress={handleNextStep}
                    size="large"
                    style={styles.nextButton}
                  />
                </>
              ) : (
                // 2단계: 학교정보 (웹용)
                <>
                  <Controller
                    control={control}
                    name="school"
                    render={({ field: { onChange, value } }) => (
                      <TouchableOpacity
                        style={styles.schoolInput}
                        onPress={handleSchoolSelect}
                      >
                        <Text style={styles.label}>학교</Text>
                        <View style={styles.schoolButton}>
                          <Text style={value ? styles.schoolText : styles.schoolPlaceholder}>
                            {value || '학교를 선택해주세요'}
                          </Text>
                          <Text style={styles.schoolArrow}>▼</Text>
                        </View>
                        {errors.school && (
                          <Text style={styles.errorText}>{errors.school.message}</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  />

                  <Controller
                    control={control}
                    name="department"
                    render={({ field: { onChange, value } }) => (
                      <FormTextInput
                        label="학과"
                        placeholder="학과를 입력해주세요"
                        value={value}
                        onChangeText={onChange}
                        error={errors.department?.message}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="grade"
                    render={({ field: { onChange, value } }) => (
                      <View style={styles.selectContainer}>
                        <Text style={styles.label}>학년</Text>
                        <View style={styles.gradeButtons}>
                          {[1, 2, 3, 4].map((grade) => (
                            <TouchableOpacity
                              key={grade}
                              style={[
                                styles.gradeButton,
                                value === grade && styles.gradeButtonActive,
                              ]}
                              onPress={() => onChange(grade)}
                            >
                              <Text
                                style={[
                                  styles.gradeButtonText,
                                  value === grade && styles.gradeButtonTextActive,
                                ]}
                              >
                                {grade}학년
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                        {errors.grade && (
                          <Text style={styles.errorText}>{errors.grade.message}</Text>
                        )}
                      </View>
                    )}
                  />

                  <View style={styles.buttonContainer}>
                    <PrimaryButton
                      title="이전"
                      onPress={handlePrevStep}
                      size="large"
                      style={styles.prevButton}
                      variant="outline"
                    />
                    <PrimaryButton
                      title="회원가입하기"
                      onPress={handleSubmit(onSubmit)}
                      loading={signupMutation.isPending}
                      size="large"
                      style={styles.signupButton}
                    />
                  </View>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      )}

      {/* 학교 검색 모달 */}
      <ModalBase
        visible={showSchoolModal}
        onClose={() => setShowSchoolModal(false)}
        title="학교 검색"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>대학교를 선택해주세요.</Text>
          <PrimaryButton
            title="서울대학교"
            onPress={() => {
              handleSchoolSelected('서울대학교');
            }}
            style={styles.modalButton}
          />
          <PrimaryButton
            title="연세대학교"
            onPress={() => {
              handleSchoolSelected('연세대학교');
            }}
            style={styles.modalButton}
          />
          <PrimaryButton
            title="고려대학교"
            onPress={() => {
              handleSchoolSelected('고려대학교');
            }}
            style={styles.modalButton}
          />
        </View>
      </ModalBase>

      {/* 이메일 인증 모달 */}
      <ModalBase
        visible={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        title="이메일 인증"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>이메일 인증 기능이 여기에 구현됩니다.</Text>
          <FormTextInput
            label="인증 코드"
            placeholder="인증 코드를 입력해주세요"
            value={emailCode}
            onChangeText={setEmailCode}
          />
          <PrimaryButton
            title="인증 확인"
            onPress={() => {
              setEmailVerified(true);
              setShowEmailModal(false);
            }}
            style={styles.modalButton}
          />
        </View>
      </ModalBase>
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
  keyboardAvoidingView: {
    // flex: 1 제거됨
  },
  contentContainer: {
    paddingBottom: SPACING.xl,
  },
  formContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg, // 간격 줄임
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: SPACING.xs, // 간격 줄임
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    marginBottom: SPACING.lg, // 간격 줄임
  },
  form: {
    marginTop: SPACING.md, // 간격 줄임
  },
  selectContainer: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.xs,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  genderButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: 8,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
  },
  genderButtonTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  gradeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  gradeButton: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: 8,
    alignItems: 'center',
  },
  gradeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  gradeButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
  },
  gradeButtonTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  schoolInput: {
    marginBottom: SPACING.md,
  },
  schoolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  schoolText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.dark,
  },
  schoolPlaceholder: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[400],
  },
  schoolArrow: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
  },
  errorText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  nextButton: {
    marginTop: SPACING.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  prevButton: {
    flex: 1,
  },
  signupButton: {
    flex: 2,
  },
  modalContent: {
    padding: SPACING.md,
  },
  modalText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  modalButton: {
    marginTop: SPACING.md,
  },
});




