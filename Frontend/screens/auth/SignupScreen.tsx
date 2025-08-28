/**
 * SignupScreen.tsx
 * 
 * 사용자 회원가입 화면
 * 
 * 주요 기능:
 * - 한 페이지에서 모든 회원가입 정보 입력
 * - 학교 선택 모달
 * - 회원가입 API 호출
 * 
 * 입력 필드:
 * - 기본정보: 이름, 성별, 출생년도, 아이디, 비밀번호, 이메일
 * - 학교정보: 학교, 학과, 학년
 * 
 * 상태 관리:
 * - React Hook Form을 통한 폼 상태 관리
 * - 학교 선택 상태 관리
 * 
 * 유효성 검사:
 * - Zod 스키마를 통한 폼 유효성 검사
 */

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
import { FrontendSignupRequest } from '../../services/authService';
import { useGetSchoolsQuery } from '../../store/api/baseApi';

type SignupScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'SignUp'>;

export const SignupScreen: React.FC = () => {
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const signupMutation = useSignup();
  const { data: schools, isLoading: schoolsLoading } = useGetSchoolsQuery();
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [schoolSearchText, setSchoolSearchText] = useState('');
  // 선택된 학교 정보 저장
  const [selectedSchool, setSelectedSchool] = useState<{ code: string; name: string } | null>(null);

  // 학교 검색 필터링
  const filteredSchools = schools?.filter(school =>
    school.university_name.toLowerCase().includes((schoolSearchText || '').toLowerCase()) ||
    school.university_code.toLowerCase().includes((schoolSearchText || '').toLowerCase())
  ) || [];

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
    mode: 'onChange',
  });

  const onSubmit = async (data: SignupFormData) => {
    console.log('🎯 === onSubmit 함수 호출됨 ===');
    console.log('🎯 호출 시간:', new Date().toISOString());
    console.log('🎯 받은 데이터:', data);
    
    try {
      console.log('1. 폼 데이터 검증 시작');
      console.log('받은 폼 데이터:', data);
      console.log('선택된 학교:', selectedSchool);
      
      // 학교 선택 필수 검증
      if (!selectedSchool) {
        console.error('❌ 학교를 선택해주세요.');
        return;
      }
      console.log('✅ 학교 선택 검증 통과');

      // 최종 API 요청 데이터 구성
      const finalData: FrontendSignupRequest = {
        ...data,
        school: selectedSchool.code, // 선택된 학교 코드만 사용
        schoolName: selectedSchool.name, // 선택된 학교 이름만 사용
      };
      
      console.log('2. 최종 요청 데이터 구성 완료');
      console.log('최종 요청 데이터:', JSON.stringify(finalData, null, 2));
      
      console.log('3. signupMutation.mutateAsync 호출 시작');
      const result = await signupMutation.mutateAsync(finalData);
      console.log('4. signupMutation.mutateAsync 완료');
      console.log('API 응답 전체:', JSON.stringify(result, null, 2));
      
             if (result.success) {
                 console.log('✅ 회원가입 성공!');
         console.log('성공 응답 데이터:', JSON.stringify(result, null, 2));
        console.log('useSignup 훅에서 자동으로 Redux store를 업데이트하여 메인 화면으로 이동합니다.');
      } else {
        console.error('❌ 회원가입 실패: API 응답에서 success가 false입니다.');
        console.log('실패 응답:', JSON.stringify(result, null, 2));
      }
    } catch (error) {
      console.error('❌ 회원가입 중 예외 발생:', error);
      console.error('에러 타입:', typeof error);
      console.error('에러 상세:', JSON.stringify(error, null, 2));
      
      // 사용자에게 에러 메시지 표시
      if (error instanceof Error) {
        console.error('에러 메시지:', error.message);
        console.error('에러 스택:', error.stack);
        
        // 500 에러인 경우 사용자에게 안내
        if (error.message.includes('500')) {
          alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else {
          alert(`회원가입 중 오류가 발생했습니다: ${error.message}`);
        }
      }
    }
    
    console.log('=== 회원가입 프로세스 완료 ===');
  };

  const handleSchoolSelected = (selectedSchoolName: string) => {
    console.log('학교 선택됨:', selectedSchoolName);
    // 학교 코드와 이름을 모두 저장
    const schoolData = schools?.find(school => school.university_name === selectedSchoolName);
    if (schoolData) {
      setSelectedSchool({ code: schoolData.university_code, name: schoolData.university_name });
      setValue('school', schoolData.university_name);
      console.log('선택된 학교 정보:', { code: schoolData.university_code, name: schoolData.university_name });
    }
    setShowSchoolModal(false);
    setSchoolSearchText('');
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
                {/* 기본 정보 */}
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, value } }) => (
                    <FormTextInput
                      label="이름"
                      placeholder="이름을 입력해주세요"
                      value={value || ''}
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
                            value === 'M' && styles.genderButtonActive,
                          ]}
                          onPress={() => onChange('M')}
                        >
                          <Text
                            style={[
                              styles.genderButtonText,
                              value === 'M' && styles.genderButtonTextActive,
                            ]}
                          >
                            남성
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.genderButton,
                            value === 'F' && styles.genderButtonActive,
                          ]}
                          onPress={() => onChange('F')}
                        >
                          <Text
                            style={[
                              styles.genderButtonText,
                              value === 'F' && styles.genderButtonTextActive,
                            ]}
                          >
                            여성
                          </Text>
                        </TouchableOpacity>
                      </View>
                      {errors.gender && (
                        <Text style={styles.errorText}>{errors.gender?.message}</Text>
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
                      value={value ? value.toString() : ''}
                      onChangeText={(text) => onChange(text ? parseInt(text) : null)}
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
                      value={value || ''}
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
                      value={value || ''}
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
                      value={value || ''}
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
                      value={value || ''}
                      onChangeText={onChange}
                      error={errors.email?.message}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  )}
                />

                {/* 학교 정보 */}
                <Text style={styles.sectionTitle}>학교 정보</Text>
                
                <Controller
                  control={control}
                  name="school"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.schoolInput}>
                      <Text style={styles.label}>학교</Text>
                      <TouchableOpacity
                        style={styles.schoolSelectButton}
                        onPress={() => setShowSchoolModal(true)}
                      >
                        {value ? (
                          <Text style={styles.schoolSelectedText}>{value}</Text>
                        ) : (
                          <Text style={styles.schoolPlaceholderText}>학교를 선택해주세요</Text>
                        )}
                        <Text style={styles.schoolArrow}>▼</Text>
                      </TouchableOpacity>
                      {errors.school && (
                        <Text style={styles.errorText}>{errors.school?.message}</Text>
                      )}
                    </View>
                  )}
                />

                <Controller
                  control={control}
                  name="department"
                  render={({ field: { onChange, value } }) => (
                    <FormTextInput
                      label="학과"
                      placeholder="학과를 입력해주세요"
                      value={value || ''}
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
                        <Text style={styles.errorText}>{errors.grade?.message}</Text>
                      )}
                    </View>
                  )}
                />

                {/* 회원가입 버튼 */}
                <View style={{ pointerEvents: 'auto' }}>
                  <PrimaryButton
                    title="회원가입하기"
                    onPress={() => {
                      console.log('🔘 회원가입 버튼 클릭됨! (모바일)');
                      console.log('현재 폼 상태:', getValues());
                      console.log('현재 에러 상태:', errors);
                      console.log('선택된 학교:', selectedSchool);
                      console.log('handleSubmit 함수 존재 여부:', !!handleSubmit);
                      console.log('onSubmit 함수 존재 여부:', !!onSubmit);
                      
                      // 유효성 검사를 우회하고 직접 onSubmit 호출
                      console.log('유효성 검사 우회하고 직접 onSubmit 호출...');
                      const currentFormData = getValues();
                      const combinedData = {
                        ...currentFormData,
                        school: selectedSchool?.name || currentFormData.school,
                      };
                      console.log('결합된 데이터:', combinedData);
                      onSubmit(combinedData);
                    }}
                    loading={signupMutation.isPending || false}
                    size="large"
                    style={styles.signupButton}
                  />
                </View>
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
              {/* 기본 정보 */}
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value } }) => (
                  <FormTextInput
                    label="이름"
                    placeholder="이름을 입력해주세요"
                    value={value || ''}
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
                          value === 'M' && styles.genderButtonActive,
                        ]}
                        onPress={() => onChange('M')}
                      >
                        <Text
                          style={[
                            styles.genderButtonText,
                            value === 'M' && styles.genderButtonTextActive,
                          ]}
                        >
                          남성
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.genderButton,
                          value === 'F' && styles.genderButtonActive,
                        ]}
                        onPress={() => onChange('F')}
                      >
                        <Text
                          style={[
                            styles.genderButtonText,
                            value === 'F' && styles.genderButtonTextActive,
                          ]}
                        >
                          여성
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {errors.gender && (
                      <Text style={styles.errorText}>{errors.gender?.message}</Text>
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
                    value={value ? value.toString() : ''}
                    onChangeText={(text) => onChange(text ? parseInt(text) : null)}
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
                    value={value || ''}
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
                    value={value || ''}
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
                    value={value || ''}
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
                    value={value || ''}
                    onChangeText={onChange}
                    error={errors.email?.message}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                )}
              />

              {/* 학교 정보 */}
              <Text style={styles.sectionTitle}>학교 정보</Text>
              
              <Controller
                control={control}
                name="school"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.schoolInput}>
                    <Text style={styles.label}>학교</Text>
                    <TouchableOpacity
                      style={styles.schoolSelectButton}
                      onPress={() => setShowSchoolModal(true)}
                    >
                      {value ? (
                        <Text style={styles.schoolSelectedText}>{value}</Text>
                      ) : (
                        <Text style={styles.schoolPlaceholderText}>학교를 선택해주세요</Text>
                      )}
                      <Text style={styles.schoolArrow}>▼</Text>
                    </TouchableOpacity>
                    {errors.school && (
                      <Text style={styles.errorText}>{errors.school?.message}</Text>
                    )}
                  </View>
                )}
              />

              <Controller
                control={control}
                name="department"
                render={({ field: { onChange, value } }) => (
                  <FormTextInput
                    label="학과"
                    placeholder="학과를 입력해주세요"
                    value={value || ''}
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
                      <Text style={styles.errorText}>{errors.grade?.message}</Text>
                    )}
                  </View>
                )}
              />

              {/* 회원가입 버튼 */}
              <View style={{ pointerEvents: 'auto' }}>
                <PrimaryButton
                  title="회원가입하기"
                  onPress={() => {
                    console.log('🔘 회원가입 버튼 클릭됨!');
                    console.log('현재 폼 상태:', getValues());
                    console.log('현재 에러 상태:', errors);
                    console.log('선택된 학교:', selectedSchool);
                    console.log('handleSubmit 함수 존재 여부:', !!handleSubmit);
                    console.log('onSubmit 함수 존재 여부:', !!onSubmit);
                    
                    // 유효성 검사를 우회하고 직접 onSubmit 호출
                    console.log('유효성 검사 우회하고 직접 onSubmit 호출...');
                    const currentFormData = getValues();
                    const combinedData = {
                      ...currentFormData,
                      school: selectedSchool?.name || currentFormData.school,
                    };
                    console.log('결합된 데이터:', combinedData);
                    onSubmit(combinedData);
                  }}
                  loading={signupMutation.isPending || false}
                  size="large"
                  style={styles.signupButton}
                />
              </View>
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
          <FormTextInput
            placeholder="학교명을 검색해주세요"
            value={schoolSearchText || ''}
            onChangeText={setSchoolSearchText}
            style={styles.modalSearchInput}
          />
          {schoolsLoading ? (
            <Text style={styles.loadingText}>학교 목록을 불러오는 중...</Text>
          ) : filteredSchools.length > 0 ? (
                         <ScrollView 
               style={styles.schoolListContainer} 
               showsVerticalScrollIndicator={true}
               contentContainerStyle={styles.schoolListContent}
               nestedScrollEnabled={true}
             >
              {filteredSchools.map((school) => (
                <TouchableOpacity
                  key={school.university_code}
                  style={styles.schoolListItem}
                  onPress={() => {
                    handleSchoolSelected(school.university_name);
                  }}
                >
                  <Text style={styles.schoolListItemText}>
                    {school.university_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.noResultsText}>검색 결과가 없습니다.</Text>
          )}
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
  loadingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
    textAlign: 'center',
    marginVertical: SPACING.md,
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
     maxHeight: '80%', // 모달 최대 높이를 화면의 80%로 제한
     overflow: 'hidden', // 내용이 넘치지 않도록 제한
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
  modalSearchInput: {
    marginBottom: SPACING.md,
  },
  schoolSearchInput: {
    marginTop: SPACING.xs,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  schoolSearchResults: {
    marginTop: SPACING.xs,
    maxHeight: 150, // 결과 목록의 최대 높이
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },

  noResultsText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[400],
    textAlign: 'center',
    paddingVertical: SPACING.md,
  },
     selectedSchool: {
     marginTop: SPACING.md,
     paddingVertical: SPACING.md,
     paddingHorizontal: SPACING.lg,
     borderWidth: 1,
     borderColor: COLORS.primary,
     borderRadius: 8,
     backgroundColor: COLORS.gray[100],
   },
  selectedSchoolText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
     schoolSelectButton: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'space-between',
     paddingVertical: SPACING.md,
     paddingHorizontal: SPACING.lg,
     borderWidth: 1,
     borderColor: COLORS.gray[300],
     borderRadius: 8,
     backgroundColor: COLORS.white,
     marginTop: SPACING.xs,
   },
   schoolSelectedText: {
     fontSize: FONT_SIZES.md,
     color: COLORS.dark,
     flex: 1,
   },
   schoolPlaceholderText: {
     fontSize: FONT_SIZES.md,
     color: COLORS.gray[400],
     flex: 1,
   },
   schoolListContainer: {
     maxHeight: 200, // 모달 내 스크롤 가능한 최대 높이 제한
   },
   schoolListContent: {
     paddingBottom: SPACING.md,
   },
   schoolListItem: {
     paddingVertical: SPACING.md,
     paddingHorizontal: SPACING.lg,
     borderBottomWidth: 1,
     borderBottomColor: COLORS.gray[100],
   },
       schoolListItemText: {
      fontSize: FONT_SIZES.md,
      color: COLORS.dark,
    },
    step1Summary: {
      backgroundColor: COLORS.gray[50],
      padding: SPACING.md,
      borderRadius: 8,
      marginBottom: SPACING.lg,
      borderWidth: 1,
      borderColor: COLORS.gray[200],
    },
    summaryTitle: {
      fontSize: FONT_SIZES.lg,
      fontWeight: '600',
      color: COLORS.dark,
      marginBottom: SPACING.sm,
    },
    summaryItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: SPACING.xs,
    },
    summaryLabel: {
      fontSize: FONT_SIZES.sm,
      color: COLORS.gray[600],
      fontWeight: '500',
    },
    summaryValue: {
      fontSize: FONT_SIZES.sm,
      color: COLORS.dark,
      fontWeight: '600',
    },
    sectionTitle: {
      fontSize: FONT_SIZES.lg,
      fontWeight: '600',
      color: COLORS.dark,
      marginBottom: SPACING.md,
      marginTop: SPACING.lg,
    },
});




