import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../../navigation/HomeStack';

type DepositSignupScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'DepositSignup'>;

export const DepositSignupScreen: React.FC = () => {
  const navigation = useNavigation<DepositSignupScreenNavigationProp>();

  const handleNewSignup = () => {
    navigation.navigate('DepositNewSignup');
  };

  const handleAccountRegister = () => {
    navigation.navigate('DepositRegister');
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="예금 가입" showBack />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 예금 설명 카드 */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="wallet" size={48} color={COLORS.primary} />
            <Text style={styles.infoTitle}>예금 상품</Text>
          </View>
          
          <View style={styles.infoContent}>
            <Text style={styles.infoDescription}>
              안전하고 안정적인 예금으로 자산을 관리하세요.
            </Text>
            
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                <Text style={styles.featureText}>연 2.5% 기본 이자율</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                <Text style={styles.featureText}>언제든지 입출금 가능</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                <Text style={styles.featureText}>최소 10만원부터 시작</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                <Text style={styles.featureText}>원금 보장</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 가입 옵션 */}
        <View style={styles.optionsSection}>
          <Text style={styles.sectionTitle}>가입 방법 선택</Text>
          
          <View style={styles.optionCard}>
            <View style={styles.optionHeader}>
              <Ionicons name="add-circle" size={24} color={COLORS.primary} />
              <Text style={styles.optionTitle}>신규 가입</Text>
            </View>
            <Text style={styles.optionDescription}>
              새로운 예금 계좌를 개설합니다.
            </Text>
            <PrimaryButton
              title="신규 가입하기"
              onPress={handleNewSignup}
              size="medium"
              style={styles.optionButton}
            />
          </View>

          <View style={styles.optionCard}>
            <View style={styles.optionHeader}>
              <Ionicons name="link" size={24} color={COLORS.secondary} />
              <Text style={styles.optionTitle}>기존 계좌 등록</Text>
            </View>
            <Text style={styles.optionDescription}>
              이미 보유한 예금 계좌를 등록합니다.
            </Text>
            <PrimaryButton
              title="계좌 등록하기"
              onPress={handleAccountRegister}
              variant="outline"
              size="medium"
              style={styles.optionButton}
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
    backgroundColor: COLORS.light,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  infoTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginTop: SPACING.md,
  },
  infoContent: {
    alignItems: 'center',
  },
  infoDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  featureList: {
    width: '100%',
    gap: SPACING.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  featureText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.dark,
  },
  optionsSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.md,
  },
  optionCard: {
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
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  optionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.dark,
  },
  optionDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  optionButton: {
    width: '100%',
  },
});
