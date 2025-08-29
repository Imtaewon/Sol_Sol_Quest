/**
 * LoginScreen.tsx
 * 
 * 사용자 로그인 화면
 * 
 * 주요 기능:
 * - 아이디/비밀번호 입력 폼
 * - 로그인 API 호출 및 토큰 관리
 * - 로그인 성공 시 메인 화면으로 이동
 * - 회원가입 화면으로 이동 버튼
 * 
 * 상태 관리:
 * - Redux를 통한 인증 상태 관리
 * - React Hook Form을 통한 폼 상태 관리
 * - 로그인 성공 시 토큰과 사용자 정보 저장
 * 
 * 에러 처리:
 * - 로그인 실패 시 에러 메시지 표시
 * - 폼 유효성 검사 (Zod 스키마 사용)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/slices/authSlice';
import { setUser } from '../../store/slices/userSlice';
import { AppHeader } from '../../components/common/AppHeader';
import { FormTextInput } from '../../components/common/FormTextInput';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';
import { loginSchema, LoginFormData } from '../../utils/validators';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { useLogin } from '../../hooks/useAuth';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'SignIn'>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useDispatch();
  const loginMutation = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      login_id: '',  // username → login_id로 변경
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      console.log('로그인 요청 데이터:', data);
      const result: any = await loginMutation.mutateAsync(data);
      console.log('로그인 응답:', result);
      if (result.success) {
        // Redux 상태 업데이트 (Backend 응답 형식에 맞춤)
        dispatch(loginSuccess({ token: result.data.access_token }));
        // 사용자 정보는 백엔드 응답 구조에 맞춰 변환
        const userData = {
          id: parseInt(result.data.user.user_id) || 0,
          name: result.data.user.name,
          real_name: result.data.user.name,
          username: result.data.user.login_id,
          email: result.data.user.email,
          gender: 'male' as const,
          birthYear: 2000,
          school: result.data.user.university_name || '',
          school_id: '',
          department: '',
          grade: 1,
          savingStatus: result.data.user.has_savings || false,
          hasSavings: result.data.user.has_savings || false,
        };
        dispatch(setUser(userData));
        // 로그인 성공 후 메인 화면으로 이동
        console.log('로그인 성공:', result.data);
      }
    } catch (error) {
      console.error('로그인 실패:', error);
      console.error('에러 상세:', JSON.stringify(error, null, 2));
    }
  };

  const handleSignupPress = () => {
    navigation.navigate('SignUp');
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="로그인"
        showBack
        onBackPress={() => navigation.goBack()}
        showNotification={false}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>안녕하세요!</Text>
          <Text style={styles.subtitle}>
            쏠쏠한 퀘스트에 오신 것을 환영합니다
          </Text>

          <View style={styles.form}>
            <Controller
              control={control}
              name="login_id"
              render={({ field: { onChange, value } }) => (
                <FormTextInput
                  label="아이디"
                  placeholder="아이디를 입력해주세요"
                  value={value}
                  onChangeText={onChange}
                  error={errors.login_id?.message}
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityRole="text"
                  accessibilityLabel="아이디 입력 필드"
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <FormTextInput
                  label="비밀번호"
                  placeholder="비밀번호를 입력해주세요"
                  value={value}
                  onChangeText={onChange}
                  error={errors.password?.message}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityRole="text"
                  accessibilityLabel="비밀번호 입력 필드"
                />
              )}
            />

            <PrimaryButton
              title="로그인"
              onPress={handleSubmit(onSubmit)}
              loading={loginMutation.isPending}
              size="large"
              style={styles.loginButton}
              accessibilityRole="button"
              accessibilityLabel="로그인 버튼"
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>또는</Text>
              <View style={styles.dividerLine} />
            </View>

            <PrimaryButton
              title="회원가입"
              onPress={handleSignupPress}
              variant="outline"
              size="large"
              accessibilityRole="button"
              accessibilityLabel="회원가입 버튼"
            />
          </View>
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
  loginButton: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray[300],
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
  },
});




