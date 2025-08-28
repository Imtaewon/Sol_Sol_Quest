import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';

export const QRGeneratorScreen = () => {
  const [merchantName, setMerchantName] = useState('테스트 상점');
  const [amount, setAmount] = useState('10000');
  const [description, setDescription] = useState('QR 결제 테스트');

  const generateQRData = () => {
    return JSON.stringify({
      type: 'payment',
      amount: parseInt(amount),
      merchantName,
      description,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="qr-code-outline" size={32} color={COLORS.primary} />
        <Text style={styles.title}>QR 코드 생성기</Text>
        <Text style={styles.subtitle}>카메라 테스트용 QR 코드를 생성하세요</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>상점명</Text>
          <TextInput
            style={styles.input}
            value={merchantName}
            onChangeText={setMerchantName}
            placeholder="상점명을 입력하세요"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>금액</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="금액을 입력하세요"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>설명</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="설명을 입력하세요"
          />
        </View>
      </View>

      <View style={styles.qrContainer}>
        <Text style={styles.qrTitle}>생성된 QR 코드</Text>
        <View style={styles.qrWrapper}>
          <QRCode
            value={generateQRData()}
            size={250}
            color={COLORS.gray[800]}
            backgroundColor={COLORS.white}
          />
        </View>
        <Text style={styles.qrData}>{generateQRData()}</Text>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>사용 방법:</Text>
        <Text style={styles.instructionText}>
          1. 이 화면을 다른 기기에서 열거나 프린트하세요
        </Text>
        <Text style={styles.instructionText}>
          2. 결제 화면에서 QR 스캔을 시도하세요
        </Text>
        <Text style={styles.instructionText}>
          3. 카메라가 QR 코드를 인식하면 결제 화면으로 이동합니다
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.gray[50],
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.gray[800],
    marginTop: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  form: {
    padding: SPACING.xl,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.gray[700],
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    backgroundColor: COLORS.white,
  },
  qrContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.gray[50],
  },
  qrTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.gray[800],
    marginBottom: SPACING.lg,
  },
  qrWrapper: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: COLORS.gray[400],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrData: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    marginTop: SPACING.lg,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  instructions: {
    padding: SPACING.xl,
    backgroundColor: COLORS.white,
  },
  instructionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.gray[800],
    marginBottom: SPACING.md,
  },
  instructionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
});
