import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';

// 신한은행/신한카드 스타일 색상
const SHINHAN_COLORS = {
  primary: '#1428A0', // 신한 블루
  secondary: '#FF6B35', // 신한 오렌지
  accent: '#00A3E0', // 신한 라이트 블루
  success: '#00C851',
  error: '#FF4444',
  background: '#F8F9FA',
  white: '#FFFFFF',
  gray: {
    50: '#F8F9FA',
    100: '#E9ECEF',
    200: '#DEE2E6',
    300: '#CED4DA',
    400: '#ADB5BD',
    500: '#6C757D',
    600: '#495057',
    700: '#343A40',
    800: '#212529',
  },
};
import { AppHeader } from '../../components/common/AppHeader';
import { Skeleton } from '../../components/common/Skeleton';
import { formatters } from '../../utils/formatters';

// 결제 내역 아이템 타입 정의
interface PaymentHistoryItem {
  id: string;
  merchantName: string;
  description: string;
  amount: number;
  status: 'completed' | 'failed' | 'pending';
  createdAt: Date;
}

export const PaymentHistoryScreen: React.FC = () => {
  // 더미 데이터 사용 (API가 아직 구현되지 않음)
  const paymentHistory: PaymentHistoryItem[] = [
    {
      id: '1',
      merchantName: '스타벅스 강남점',
      description: '아메리카노 결제',
      amount: 4500,
      status: 'completed',
      createdAt: new Date('2024-01-15T10:30:00Z'),
    },
    {
      id: '2',
      merchantName: '올리브영',
      description: '화장품 구매',
      amount: 25000,
      status: 'completed',
      createdAt: new Date('2024-01-14T15:20:00Z'),
    },
  ];
  
  const isLoading = false; // 더미 데이터 사용으로 로딩 상태 제거
  const refetch = () => {}; // 더미 함수

  const renderPaymentItem = ({ item }: { item: PaymentHistoryItem }) => (
    <View style={styles.paymentItem}>
      <View style={styles.paymentInfo}>
        <View style={styles.paymentHeader}>
          <Text style={styles.merchantName}>
            {item.merchantName || '결제'}
          </Text>
          <View style={[
            styles.statusBadge,
            item.status === 'completed' ? styles.completedBadge : styles.failedBadge
          ]}>
            <Text style={[
              styles.statusText,
              item.status === 'completed' ? styles.completedText : styles.failedText
            ]}>
              {item.status === 'completed' ? '완료' : '실패'}
            </Text>
          </View>
        </View>
        <Text style={styles.description}>
          {item.description || 'QR 결제'}
        </Text>
        <Text style={styles.date}>
          {formatters.formatDate(item.createdAt)}
        </Text>
      </View>
      <View style={styles.amountContainer}>
        <Text style={styles.amount}>
          {formatters.formatCurrency(item.amount)}
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="receipt-outline" size={64} color={SHINHAN_COLORS.gray[400]} />
      </View>
      <Text style={styles.emptyTitle}>결제 내역이 없습니다</Text>
      <Text style={styles.emptyDescription}>
        QR 결제를 통해 결제 내역을 확인할 수 있습니다
      </Text>
    </View>
  );

  const renderSkeleton = () => (
    <View style={styles.paymentItem}>
      <View style={styles.paymentInfo}>
        <Skeleton width={120} height={16} style={styles.skeletonTitle} />
        <Skeleton width={80} height={14} style={styles.skeletonDescription} />
        <Skeleton width={100} height={12} style={styles.skeletonDate} />
      </View>
      <Skeleton width={80} height={20} style={styles.skeletonAmount} />
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader title="결제 내역" showBackButton />
      
      <FlatList
        data={isLoading ? Array(5).fill({}) : paymentHistory}
        renderItem={isLoading ? renderSkeleton : renderPaymentItem}
        keyExtractor={(item, index) => item.id || index.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={[SHINHAN_COLORS.primary]}
          />
        }
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SHINHAN_COLORS.background,
  },
  listContainer: {
    padding: SPACING.lg,
  },
  paymentItem: {
    flexDirection: 'row',
    backgroundColor: SHINHAN_COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: SHINHAN_COLORS.gray[200],
    shadowColor: SHINHAN_COLORS.gray[800],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  merchantName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: SHINHAN_COLORS.gray[800],
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  completedBadge: {
    backgroundColor: SHINHAN_COLORS.success + '20',
  },
  failedBadge: {
    backgroundColor: SHINHAN_COLORS.error + '20',
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  completedText: {
    color: SHINHAN_COLORS.success,
  },
  failedText: {
    color: SHINHAN_COLORS.error,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: SHINHAN_COLORS.gray[600],
    marginBottom: SPACING.xs,
  },
  date: {
    fontSize: FONT_SIZES.sm,
    color: SHINHAN_COLORS.gray[500],
  },
  amountContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: SHINHAN_COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: SHINHAN_COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: SHINHAN_COLORS.gray[700],
    marginBottom: SPACING.sm,
  },
  emptyDescription: {
    fontSize: FONT_SIZES.md,
    color: SHINHAN_COLORS.gray[500],
    textAlign: 'center',
  },
  skeletonTitle: {
    marginBottom: SPACING.xs,
  },
  skeletonDescription: {
    marginBottom: SPACING.xs,
  },
  skeletonDate: {
    marginBottom: 0,
  },
  skeletonAmount: {
    alignSelf: 'flex-end',
  },
});
