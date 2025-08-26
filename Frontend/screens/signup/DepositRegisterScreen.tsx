import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';

export const DepositRegisterScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    accountNumber: '',
    accountHolder: '',
    bankName: '',
    phoneNumber: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVerify = () => {
    // 필수 필드 검증
    if (!formData.accountNumber || !formData.accountHolder || !formData.bankName) {
      Alert.alert('입력 오류', '필수 정보를 모두 입력해주세요.');
      return;
    }

    // 계좌번호 형식 검증 (간단한 예시)
    if (formData.accountNumber.length < 10) {
      Alert.alert('입력 오류', '올바른 계좌번호를 입력해주세요.');
      return;
    }

    Alert.alert(
      '인증 완료',
      '계좌 인증이 완료되었습니다!',
      [{ text: '확인', onPress: () => console.log('계좌 등록 완료') }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="기존 계좌 등록" showBack />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="shield-checkmark" size={24} color={COLORS.primary} />
            <Text style={styles.infoTitle}>계좌 인증</Text>
          </View>
          <Text style={styles.infoDescription}>
            보유하고 계신 예금 계좌 정보를 입력하여 인증을 진행합니다.
          </Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>계좌 정보</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>은행명 *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.bankName}
              onChangeText={(value) => handleInputChange('bankName', value)}
              placeholder="예: 신한은행, KB국민은행"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>계좌번호 *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.accountNumber}
              onChangeText={(value) => handleInputChange('accountNumber', value)}
              placeholder="계좌번호를 입력하세요"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>예금주명 *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.accountHolder}
              onChangeText={(value) => handleInputChange('accountHolder', value)}
              placeholder="예금주명을 입력하세요"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>휴대폰 번호</Text>
            <TextInput
              style={styles.textInput}
              value={formData.phoneNumber}
              onChangeText={(value) => handleInputChange('phoneNumber', value)}
              placeholder="010-0000-0000"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.noticeSection}>
          <View style={styles.noticeHeader}>
            <Ionicons name="information-circle" size={20} color={COLORS.gray[600]} />
            <Text style={styles.noticeTitle}>안내사항</Text>
          </View>
          <Text style={styles.noticeText}>
            • 계좌번호는 하이픈(-) 없이 숫자만 입력해주세요{'\n'}
            • 예금주명은 계좌에 등록된 이름과 정확히 일치해야 합니다{'\n'}
            • 인증 완료 후 해당 계좌의 예금 정보를 확인할 수 있습니다
          </Text>
        </View>

        <View style={styles.submitSection}>
          <PrimaryButton
            title="계좌 인증하기"
            onPress={handleVerify}
            size="large"
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  infoTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginLeft: SPACING.sm,
  },
  infoDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    lineHeight: 20,
  },
  formSection: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.dark,
    marginBottom: SPACING.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    backgroundColor: COLORS.white,
  },
  noticeSection: {
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  noticeTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.dark,
    marginLeft: SPACING.xs,
  },
  noticeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    lineHeight: 18,
  },
  submitSection: {
    marginBottom: SPACING.xl,
  },
  submitButton: {
    marginTop: SPACING.lg,
  },
});



