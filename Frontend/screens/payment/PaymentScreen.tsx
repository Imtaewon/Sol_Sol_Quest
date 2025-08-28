import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { QRScanner } from '../../components/payment/QRScanner';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';

const { width, height } = Dimensions.get('window');

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

export const PaymentScreen: React.FC = () => {
  const navigation = useNavigation();
  // QRScanner 컴포넌트에서 권한 처리를 담당하므로 제거
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fadeAnimation] = useState(new Animated.Value(0));

  // QRScanner 컴포넌트에서 권한 처리를 담당하므로 제거

  useEffect(() => {
    if (scannedData) {
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [scannedData]);

  const handleBarCodeScanned = (data: any) => {
    setScanned(true);
    setScannedData(data);
  };

  const handlePaymentConfirm = () => {
    if (!password) {
      Alert.alert('알림', '비밀번호를 입력해주세요.');
      return;
    }
    
    // 실제로는 비밀번호 검증 로직이 들어가야 함
    if (password === '1234') { // 테스트용
      Alert.alert(
        '결제 완료',
        `${scannedData.amount.toLocaleString()}원이 결제되었습니다.`,
        [
          {
            text: '확인',
            onPress: () => {
              setShowPaymentModal(false);
              setPassword('');
              setScannedData(null);
              setScanned(false);
              fadeAnimation.setValue(0);
            },
          },
        ]
      );
    } else {
      Alert.alert('오류', '비밀번호가 올바르지 않습니다.');
    }
  };

  const handleScanAgain = () => {
    setScanned(false);
    setScannedData(null);
    setPassword('');
    fadeAnimation.setValue(0);
  };

  // 테스트용 QR 스캔 시뮬레이션
  const handleTestScan = () => {
    setScanned(true);
    setScannedData({
      type: 'payment',
      amount: 10000,
      merchantName: '테스트 상점',
      description: 'QR 결제 테스트',
    });
  };

  // QRScanner 컴포넌트에서 권한 처리를 담당하므로 제거

  return (
    <View style={styles.container}>
      <AppHeader 
        title="쏠페이 결제" 
        showBackButton 
        rightComponent={
          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={() => navigation.navigate('QRGenerator' as never)}
              style={styles.headerButton}
            >
              <Ionicons name="qr-code" size={24} color={SHINHAN_COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('PaymentHistory' as never)}
              style={styles.headerButton}
            >
              <Ionicons name="receipt-outline" size={24} color={SHINHAN_COLORS.primary} />
            </TouchableOpacity>
          </View>
        }
      />
      
                    {!scanned ? (
                 <QRScanner 
          onScan={handleBarCodeScanned}
          onClose={() => navigation.goBack()}
        />
       ) : (
        <Animated.View 
          style={[
            styles.resultContainer,
            { opacity: fadeAnimation }
          ]}
        >
          <View style={styles.resultCard}>
            <View style={styles.merchantInfo}>
              <View style={styles.merchantIcon}>
                <Ionicons name="storefront" size={32} color={SHINHAN_COLORS.primary} />
              </View>
              <View style={styles.merchantDetails}>
                <Text style={styles.merchantName}>
                  {scannedData.merchantName || '상점'}
                </Text>
                <Text style={styles.merchantDescription}>
                  {scannedData.description || 'QR 결제'}
                </Text>
              </View>
            </View>
            
            <View style={styles.amountSection}>
              <Text style={styles.amountLabel}>결제 금액</Text>
              <Text style={styles.amountText}>
                {scannedData.amount.toLocaleString()}원
              </Text>
            </View>
            
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => setShowPaymentModal(true)}
              >
                <Text style={styles.confirmButtonText}>결제하기</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleScanAgain}
              >
                <Text style={styles.cancelButtonText}>다시 스캔</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}


      {/* 비밀번호 입력 모달 */}
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>비밀번호 입력</Text>
              <TouchableOpacity
                onPress={() => setShowPaymentModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={SHINHAN_COLORS.gray[600]} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.passwordSection}>
              <Text style={styles.passwordLabel}>결제 비밀번호</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  keyboardType="numeric"
                  maxLength={4}
                  placeholder="0000"
                  placeholderTextColor={SHINHAN_COLORS.gray[400]}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color={SHINHAN_COLORS.gray[600]} 
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.modalButtonGroup}>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handlePaymentConfirm}
              >
                <Text style={styles.modalConfirmButtonText}>결제 확인</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowPaymentModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SHINHAN_COLORS.background,
  },
    headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  resultContainer: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  resultCard: {
    backgroundColor: SHINHAN_COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    shadowColor: SHINHAN_COLORS.gray[800],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  merchantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  merchantIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: SHINHAN_COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  merchantDetails: {
    flex: 1,
  },
  merchantName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: SHINHAN_COLORS.gray[800],
    marginBottom: SPACING.xs,
  },
  merchantDescription: {
    fontSize: FONT_SIZES.md,
    color: SHINHAN_COLORS.gray[600],
  },
  amountSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: SHINHAN_COLORS.gray[200],
  },
  amountLabel: {
    fontSize: FONT_SIZES.md,
    color: SHINHAN_COLORS.gray[600],
    marginBottom: SPACING.sm,
  },
  amountText: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: SHINHAN_COLORS.primary,
  },
  buttonGroup: {
    gap: SPACING.md,
  },
  confirmButton: {
    backgroundColor: SHINHAN_COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: SHINHAN_COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: SHINHAN_COLORS.gray[100],
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: SHINHAN_COLORS.gray[700],
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: SHINHAN_COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    width: width * 0.9,
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: SHINHAN_COLORS.gray[800],
  },
  closeButton: {
    padding: SPACING.xs,
  },
  passwordSection: {
    marginBottom: SPACING.xl,
  },
  passwordLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: SHINHAN_COLORS.gray[700],
    marginBottom: SPACING.md,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: SHINHAN_COLORS.gray[300],
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
  },
  passwordInput: {
    flex: 1,
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: SHINHAN_COLORS.gray[800],
    textAlign: 'center',
    letterSpacing: 8,
    paddingVertical: SPACING.md,
  },
  eyeButton: {
    padding: SPACING.sm,
  },
  modalButtonGroup: {
    gap: SPACING.md,
  },
  modalConfirmButton: {
    backgroundColor: SHINHAN_COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    color: SHINHAN_COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  modalCancelButton: {
    backgroundColor: SHINHAN_COLORS.gray[100],
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: SHINHAN_COLORS.gray[700],
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
});

