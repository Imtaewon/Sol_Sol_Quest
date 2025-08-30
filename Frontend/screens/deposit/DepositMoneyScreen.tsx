/**
 * DepositMoneyScreen.tsx
 * 
 * 상시입출금 계좌 입금 화면
 * 
 * 주요 기능:
 * - 계좌 정보 표시 (계좌번호, 잔액)
 * - 입금 금액 입력
 * - 입금 API 호출
 * 
 * API 연동:
 * - useUserInfo: 사용자 정보 조회
 * - useDepositAccount: 상시입출금 계좌 정보 조회
 * - 입금 API (새로 구현 필요)
 */

import React, { useState } from 'react';
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
import { LoadingView } from '../../components/common/LoadingView';
import { ErrorView } from '../../components/common/ErrorView';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import { useUserInfo, useDepositAccount } from '../../hooks/useUser';
import { useDepositMoney } from '../../hooks/useDeposit';
import { HomeStackParamList } from '../../navigation/HomeStack';

type DepositMoneyScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'DepositMoney'>;

// 입금 정보 입력 폼 타입
interface DepositFormData {
  amount: number;
}

export const DepositMoneyScreen: React.FC = () => {
  const navigation = useNavigation<DepositMoneyScreenNavigationProp>();
  const [isDepositing, setIsDepositing] = useState(false);

  // 폼 컨트롤
  const { control, handleSubmit, formState: { errors }, watch } = useForm<DepositFormData>({
    defaultValues: {
      amount: 0,
    },
  });

  // API 호출
  const { data: userInfo, isLoading: userLoading, error: userError } = useUserInfo();
  const { data: depositAccount, isLoading: depositLoading, error: depositError } = useDepositAccount();
  const depositMoneyMutation = useDepositMoney();
  
  console.log('🔍 DepositMoneyScreen 렌더링됨');
  console.log('userInfo:', userInfo);
  console.log('depositAccount:', depositAccount);
  console.log('depositMoneyMutation:', depositMoneyMutation);

  // 입력된 값 감시
  const amount = watch('amount');

  // 로딩 상태 처리
  if (userLoading || depositLoading) {
    return <LoadingView message="계좌 정보를 불러오는 중..." />;
  }

  // 에러 상태 처리
  if (userError || depositError) {
    return (
      <ErrorView 
        message="계좌 정보를 불러오는데 실패했습니다." 
        onRetry={() => {
          // 재시도 로직
        }}
      />
    );
  }

  // 상시입출금 계좌 정보
  const depositAccountInfo = depositAccount?.data?.data?.[0];

  // 상시입출금 계좌가 없으면 에러
  if (!depositAccountInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader 
          title="입금하기" 
          showBackButton 
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>상시입출금 계좌가 없습니다.</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * 입금 처리
   */
  const handleDeposit = async (data: DepositFormData) => {
    console.log('🔍 handleDeposit 함수 호출됨');
    console.log('입력 데이터:', data);
    
    try {
      if (!userInfo?.data?.user_id) {
        console.log('❌ user_id 없음');
        Alert.alert('오류', '사용자 정보를 불러올 수 없습니다.');
        return;
      }

      if (!data.amount || data.amount <= 0) {
        console.log('❌ 금액 없음 또는 0 이하');
        Alert.alert('오류', '입금 금액을 입력해주세요.');
        return;
      }

      console.log('✅ 입금 조건 확인 완료');
      console.log('계좌번호:', depositAccountInfo.account_no);
      console.log('사용자ID:', userInfo.data.user_id);
      console.log('입금금액:', data.amount);

      setIsDepositing(true);

             // 입금 API 호출
       console.log('🔍 depositMoneyMutation.mutateAsync 호출 시작');
       const result = await depositMoneyMutation.mutateAsync({
         account_no: depositAccountInfo.account_no,
         user_id: userInfo.data.user_id,
         amount: data.amount,
       });
       console.log('✅ mutateAsync 완료:', result);

       // API 응답 구조 확인 및 처리
       console.log('🔍 API 응답 구조:', result);
       
       // result 자체가 success 필드를 가지고 있는지 확인
       if (result && result.success === true) {
         console.log('✅ 입금 성공, 메인페이지로 이동 시작');
         
         // React Native Web 호환성을 위한 네비게이션 처리
         try {
           console.log('💰 웹 환경에서 메인페이지로 이동 시도');
           navigation.reset({ 
             index: 0, 
             routes: [{ name: 'Home' }] 
           });
           console.log('✅ 메인페이지로 이동 완료');
         } catch (navError) {
           console.error('💰 네비게이션 에러:', navError);
           // 대안: navigate 방식 시도
           try {
             navigation.navigate('Home');
             console.log('✅ navigate 방식으로 메인페이지 이동 완료');
           } catch (navigateError) {
             console.error('💰 navigate도 실패:', navigateError);
             // 최후 수단: 페이지 새로고침
             if (Platform.OS === 'web' && typeof window !== 'undefined') {
               window.location.reload();
             }
           }
         }
       } else {
         console.log('❌ 입금 실패 - 응답:', result);
         throw new Error('입금 실패');
       }
    } catch (error) {
      Alert.alert(
        '입금 실패',
        '입금에 실패하였습니다.',
        [
          {
            text: '확인',
            onPress: () => {
              // 현재 페이지에 머무름
            },
          },
        ]
      );
    } finally {
      setIsDepositing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader 
        title="입금하기" 
        showBackButton 
        onBackPress={() => {
          console.log('💰 뒤로가기 버튼 클릭됨');
          try {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              // 스택에 이전 화면이 없으면 홈으로 이동
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            }
          } catch (error) {
            console.error('💰 뒤로가기 에러:', error);
            // 에러 발생 시 홈으로 강제 이동
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          }
        }}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>상시입출금 입금</Text>
        <Text style={styles.subtitle}>입금할 금액을 입력해주세요</Text>

        {/* 계좌 정보 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>계좌 정보</Text>
          <View style={styles.accountInfoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>상시입출금</Text>
              <Text style={styles.infoValue}>솔 입출금</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>계좌번호</Text>
              <Text style={styles.infoValue}>{depositAccountInfo.account_no}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>계좌 잔액</Text>
              <Text style={styles.infoValue}>
                {formatCurrency(depositAccountInfo.balance || 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* 입금 정보 입력 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>입금 정보</Text>
          <View style={styles.depositInfoCard}>
            <Controller
              control={control}
              name="amount"
              rules={{ required: '입금 금액을 입력해주세요' }}
              render={({ field: { onChange, value } }) => (
                <FormTextInput
                  label="입금 금액"
                  placeholder="입금할 금액을 입력해주세요"
                  value={value ? value.toLocaleString() : ''}
                  onChangeText={(text) => {
                    // 콤마 제거 후 숫자만 추출
                    const numericValue = parseInt(text.replace(/,/g, '')) || 0;
                    onChange(numericValue);
                  }}
                  error={errors.amount?.message}
                  keyboardType="numeric"
                />
              )}
            />
          </View>
        </View>

        {/* 입금하기 버튼 */}
        <PrimaryButton
          title="입금하기"
          onPress={handleSubmit(handleDeposit)}
          loading={isDepositing}
          style={styles.depositButton}
        />
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
  accountInfoCard: {
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
  depositInfoCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  depositButton: {
    marginTop: SPACING.xl,
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
