/**
 * QRPayScreen.tsx
 * 
 * QR 코드 결제 화면
 * 
 * 주요 기능:
 * - QR 코드 스캔 기능
 * - 결제 금액 입력
 * - 결제 처리 및 확인
 * - 결제 내역 표시
 * 
 * 화면 구성:
 * - QR 스캐너: 카메라를 통한 QR 코드 인식
 * - 결제 정보 입력: 금액, 메모 등
 * - 결제 확인: 결제 정보 검토 및 승인
 * - 결제 완료: 결제 성공/실패 상태 표시
 * 
 * 사용 라이브러리:
 * - expo-camera: QR 코드 스캔
 * - react-native-qrcode-svg: QR 코드 생성
 * 
 * 상태 관리:
 * - QR 스캔 상태
 * - 결제 정보 입력 상태
 * - 결제 처리 상태
 * - 에러 처리
 * 
 * 보안:
 * - 결제 정보 암호화
 * - 사용자 인증 확인
 * - 결제 한도 검증
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';
import { PaymentStackParamList } from '../../navigation/PaymentStack';

type QRPayScreenNavigationProp = StackNavigationProp<PaymentStackParamList, 'QRPay'>;

export const QRPayScreen: React.FC = () => {
  const navigation = useNavigation<QRPayScreenNavigationProp>();
  const [isScanning, setIsScanning] = useState(false);

  const handleScanQR = () => {
    setIsScanning(true);
    // TODO: QR 스캔 로직 구현
    console.log('QR 스캔 시작');
  };

  const handleGenerateQR = () => {
    navigation.navigate('QRGenerator');
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="QR 결제"
        showBack
        onBackPress={() => navigation.goBack()}
        showNotification={false}
      />
      
      <View style={styles.content}>
        {/* QR 스캔 섹션 */}
        <View style={styles.scanSection}>
          <Text style={styles.sectionTitle}>QR 스캔</Text>
          <View style={styles.scanCard}>
            <View style={styles.scanIconContainer}>
              <Ionicons name="qr-code" size={80} color={COLORS.primary} />
            </View>
            <Text style={styles.scanTitle}>QR 코드를 스캔하세요</Text>
            <Text style={styles.scanDescription}>
              상점의 QR 코드를 스캔하여 결제를 진행합니다
            </Text>
            <PrimaryButton
              title="QR 스캔하기"
              onPress={handleScanQR}
              size="large"
              style={styles.scanButton}
              accessibilityRole="button"
              accessibilityLabel="QR 스캔하기 버튼"
            />
          </View>
        </View>

        {/* QR 생성 섹션 */}
        <View style={styles.generateSection}>
          <Text style={styles.sectionTitle}>QR 생성</Text>
          <View style={styles.generateCard}>
            <View style={styles.generateIconContainer}>
              <Ionicons name="qr-code-outline" size={80} color={COLORS.secondary} />
            </View>
            <Text style={styles.generateTitle}>내 QR 코드 생성</Text>
            <Text style={styles.generateDescription}>
              내 QR 코드를 생성하여 결제를 받습니다
            </Text>
            <PrimaryButton
              title="QR 생성하기"
              onPress={handleGenerateQR}
              variant="outline"
              size="large"
              style={styles.generateButton}
              accessibilityRole="button"
              accessibilityLabel="QR 생성하기 버튼"
            />
          </View>
        </View>

        {/* 결제 내역 섹션 */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>최근 결제 내역</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('PaymentHistory')}
              accessibilityRole="button"
              accessibilityLabel="결제 내역 더보기"
            >
              <Text style={styles.historyMore}>더보기</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.historyCard}>
            <View style={styles.historyPlaceholder}>
              <Ionicons name="receipt-outline" size={48} color={COLORS.gray[400]} />
              <Text style={styles.historyPlaceholderText}>
                결제 내역이 없습니다
              </Text>
            </View>
          </View>
        </View>
      </View>
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
    paddingTop: SPACING.lg,
  },
  scanSection: {
    marginBottom: SPACING.xl,
  },
  generateSection: {
    marginBottom: SPACING.xl,
  },
  historySection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.md,
  },
  scanCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  generateCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scanIconContainer: {
    marginBottom: SPACING.lg,
  },
  generateIconContainer: {
    marginBottom: SPACING.lg,
  },
  scanTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.sm,
  },
  generateTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.sm,
  },
  scanDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  generateDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  scanButton: {
    width: '100%',
  },
  generateButton: {
    width: '100%',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  historyMore: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyPlaceholder: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  historyPlaceholderText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[500],
    marginTop: SPACING.md,
  },
});
