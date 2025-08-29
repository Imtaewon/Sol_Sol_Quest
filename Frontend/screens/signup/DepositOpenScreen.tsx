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
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { LoadingView } from '../../components/common/LoadingView';
import { ErrorView } from '../../components/common/ErrorView';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';
import { HomeStackParamList } from '../../navigation/HomeStack';
import { useGetUserInfoQuery } from '../../store/api/baseApi';
import { useDepositSignup } from '../../hooks/useDeposit';


type DepositOpenScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'DepositOpen'>;

export const DepositOpenScreen: React.FC = () => {
  const navigation = useNavigation<DepositOpenScreenNavigationProp>();
  const { data: userInfo, isLoading, error } = useGetUserInfoQuery();
  const depositSignupMutation = useDepositSignup();

  const handleDepositSignup = async () => {
    try {
      const result = await depositSignupMutation.mutateAsync({ user_id: userInfo?.id || '' });
      if (result.success) {
        // 예금 가입 성공 후 메인 화면으로 이동
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('예금 가입 실패:', error);
    }
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
        title="예금 가입"
        showBack
        onBackPress={() => navigation.goBack()}
        showNotification={false}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>예금 가입</Text>
          <Text style={styles.subtitle}>
            입출금 통장을 개설합니다
          </Text>

          <View style={styles.form}>
            {/* 개인정보 표시 (읽기 전용) */}
            <View style={styles.personalInfoSection}>
              <Text style={styles.sectionTitle}>개인정보</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>이름</Text>
                <Text style={styles.infoValue}>{userInfo?.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>이메일</Text>
                <Text style={styles.infoValue}>{userInfo?.email}</Text>
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

            {/* 예금 가입 안내 */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>예금 안내</Text>
              <View style={styles.infoCard}>
                <Text style={styles.infoText}>
                  • 입출금이 자유로운 통장입니다{'\n'}
                  • 적금 자동이체를 위한 계좌로 사용됩니다{'\n'}
                  • 계좌번호는 가입 완료 후 발급됩니다
                </Text>
              </View>
            </View>

            <PrimaryButton
              title="개설하기"
              onPress={handleDepositSignup}
              loading={depositSignupMutation.isPending}
              size="large"
              style={styles.submitButton}
              accessibilityRole="button"
              accessibilityLabel="예금 개설하기 버튼"
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
  personalInfoSection: {
    marginBottom: SPACING.xl,
  },
  infoSection: {
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
  infoCard: {
    backgroundColor: COLORS.gray[50],
    padding: SPACING.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  infoText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[700],
    lineHeight: 24,
  },
  submitButton: {
    marginTop: SPACING.lg,
  },
});
