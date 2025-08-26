import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { ModalBase } from '../../components/common/ModalBase';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { RootState } from '../../store';
import { AssetsStackParamList } from '../../navigation/AssetsStack';

// 더미 데이터
const mockSavingsCard = {
  baseRate: 2.5,
  tierBonusRate: 2.5, // 골드 티어 보너스
  finalRate: 5.0, // 골드 티어 최종 금리
  balance: 500000,
  monthlyAmount: 100000,
};

const mockTierInfo = {
  tier: 'gold',
  exp: 1250,
  nextTierExp: 2001, // SOL 티어 시작점
  progress: 62.5,
};

const mockProducts = [
  {
    id: '1',
    name: '청년 적금',
    rate: 2.5, // 기본 금리
    period: 12,
    minAmount: 100000,
    description: '티어에 따라 최대 7.0%까지!',
  },
  {
    id: '2',
    name: '학생 적금',
    rate: 2.5, // 기본 금리
    period: 24,
    minAmount: 50000,
    description: '퀘스트로 SOL 티어 달성!',
  },
];

type AssetsScreenNavigationProp = StackNavigationProp<AssetsStackParamList, 'Assets'>;

export const AssetsScreen: React.FC = () => {
  const [showTierModal, setShowTierModal] = useState(false);
  const navigation = useNavigation<AssetsScreenNavigationProp>();
  const user = useSelector((state: RootState) => state.user.user);
  const hasSavings = user?.hasSavings ?? false;

  const renderSavingsCard = () => (
    <View style={styles.savingsCard}>
      <View style={styles.savingsHeader}>
        <Text style={styles.savingsTitle}>내 적금</Text>
        <Ionicons name="trending-up" size={24} color={COLORS.primary} />
      </View>
      
      <View style={styles.rateSection}>
        <View style={styles.rateItem}>
          <Text style={styles.rateLabel}>기본 이자율</Text>
          <Text style={styles.rateValue}>{formatPercentage(mockSavingsCard.baseRate)}</Text>
        </View>
        <View style={styles.rateItem}>
          <Text style={styles.rateLabel}>티어 보너스</Text>
          <Text style={styles.rateValue}>+{formatPercentage(mockSavingsCard.tierBonusRate)}</Text>
        </View>
        <View style={[styles.rateItem, styles.finalRateItem]}>
          <Text style={styles.rateLabel}>최종 이자율</Text>
          <Text style={styles.finalRateValue}>{formatPercentage(mockSavingsCard.finalRate)}</Text>
        </View>
      </View>

      <View style={styles.balanceSection}>
        <Text style={styles.balanceLabel}>현재 잔액</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(mockSavingsCard.balance)}</Text>
        <Text style={styles.monthlyAmount}>월 {formatCurrency(mockSavingsCard.monthlyAmount)} 적립</Text>
      </View>
    </View>
  );

  const renderTierBox = () => (
    <View style={styles.tierBox}>
      <View style={styles.tierHeader}>
        <Text style={styles.tierTitle}>내 티어</Text>
        <TouchableOpacity onPress={() => setShowTierModal(true)}>
          <Ionicons name="information-circle" size={20} color={COLORS.gray[500]} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.tierContent}>
        <View style={styles.tierInfo}>
          <Text style={styles.tierName}>골드</Text>
          <Text style={styles.tierExp}>{mockTierInfo.exp} EXP</Text>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${mockTierInfo.progress}%` }]} 
            />
          </View>
          <Text style={styles.progressText}>
            다음 티어까지 {mockTierInfo.nextTierExp - mockTierInfo.exp} EXP
          </Text>
        </View>
      </View>
    </View>
  );

  const renderProductsCarousel = () => (
    <View style={styles.productsSection}>
      <Text style={styles.sectionTitle}>추천 상품</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {mockProducts.map((product) => (
          <View key={product.id} style={styles.productCard}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productRate}>{formatPercentage(product.rate)}</Text>
            <Text style={styles.productDescription}>{product.description}</Text>
            <Text style={styles.productPeriod}>{product.period}개월</Text>
            <Text style={styles.productMinAmount}>
              최소 {formatCurrency(product.minAmount)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyContent}>
        <Ionicons name="wallet-outline" size={64} color={COLORS.gray[400]} />
        <Text style={styles.emptyTitle}>가입한 상품이 없습니다</Text>
        <Text style={styles.emptyDescription}>
          예금이나 적금을 가입하여 자산을 관리해보세요!
        </Text>
        <View style={styles.emptyButtons}>
          <PrimaryButton
            title="예금 가입하기"
            onPress={() => navigation.navigate('DepositSignup')}
            variant="outline"
            size="medium"
            style={styles.emptyButton}
          />
          <PrimaryButton
            title="적금 가입하기"
            onPress={() => navigation.navigate('SavingsSignup')}
            size="medium"
            style={styles.emptyButton}
          />
        </View>
      </View>
    </View>
  );

  const renderTierModal = () => (
    <ModalBase
      visible={showTierModal}
      onClose={() => setShowTierModal(false)}
      title="티어 시스템 안내"
    >
      <View style={styles.modalContent}>
        <View style={styles.tierInfoSection}>
          <Text style={styles.modalSectionTitle}>티어별 보너스 이자율</Text>
          <View style={styles.tierList}>
            <View style={styles.tierItem}>
              <Text style={styles.tierItemName}>브론즈</Text>
              <Text style={styles.tierItemRate}>3.0%</Text>
              <Text style={styles.tierItemExp}>0-500 EXP</Text>
            </View>
            <View style={styles.tierItem}>
              <Text style={styles.tierItemName}>실버</Text>
              <Text style={styles.tierItemRate}>3.8%</Text>
              <Text style={styles.tierItemExp}>501-1000 EXP</Text>
            </View>
            <View style={styles.tierItem}>
              <Text style={styles.tierItemName}>골드</Text>
              <Text style={styles.tierItemRate}>5.0%</Text>
              <Text style={styles.tierItemExp}>1001-2000 EXP</Text>
            </View>
            <View style={styles.tierItem}>
              <Text style={styles.tierItemName}>SOL</Text>
              <Text style={styles.tierItemRate}>7.0%</Text>
              <Text style={styles.tierItemExp}>2001+ EXP</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.modalInfoSection}>
          <Text style={styles.modalSectionTitle}>경험치 획득 방법</Text>
          <Text style={styles.modalInfoText}>
            • 퀘스트 완료: 300-3000 EXP{'\n'}
            • 일일 로그인: 50 EXP{'\n'}
            • 적금 가입: 1000 EXP{'\n'}
            • 친구 초대: 200 EXP
          </Text>
        </View>
      </View>
    </ModalBase>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="자산 관리" />
      
      {hasSavings ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 적금 카드 */}
          <View style={styles.savingsSection}>
            {renderSavingsCard()}
          </View>

          {/* 티어 박스 */}
          <View style={styles.tierSection}>
            {renderTierBox()}
          </View>

          {/* 상품 캐러셀 */}
          <View style={styles.carouselSection}>
            {renderProductsCarousel()}
          </View>
        </ScrollView>
      ) : (
        renderEmptyState()
      )}

      {/* 티어 정보 모달 */}
      {renderTierModal()}
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
  },
  savingsSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  savingsCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  savingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  savingsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.dark,
  },
  rateSection: {
    marginBottom: SPACING.lg,
  },
  rateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  finalRateItem: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    marginTop: SPACING.sm,
    paddingTop: SPACING.md,
  },
  rateLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
  },
  rateValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.dark,
  },
  finalRateValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  balanceSection: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
    marginBottom: SPACING.xs,
  },
  balanceAmount: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: SPACING.xs,
  },
  monthlyAmount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  tierSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  tierBox: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  tierTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.dark,
  },
  tierContent: {
    alignItems: 'center',
  },
  tierInfo: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  tierName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  tierExp: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.gray[200],
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
    textAlign: 'center',
  },
  carouselSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  productsSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.md,
  },
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginRight: SPACING.md,
    width: 200,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.sm,
  },
  productRate: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  productDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.secondary,
    fontWeight: '500',
    marginBottom: SPACING.sm,
  },
  productPeriod: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.xs,
  },
  productMinAmount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
  },
  modalContent: {
    padding: SPACING.md,
  },
  modalSectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.md,
  },
  tierInfoSection: {
    marginBottom: SPACING.lg,
  },
  tierList: {
    gap: SPACING.sm,
  },
  tierItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md,
  },
  tierItemName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.dark,
    flex: 1,
  },
  tierItemRate: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: SPACING.md,
  },
  tierItemExp: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  modalInfoSection: {
    marginTop: SPACING.md,
  },
  modalInfoText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  emptyContent: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  emptyButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  emptyButton: {
    flex: 1,
  },
});

