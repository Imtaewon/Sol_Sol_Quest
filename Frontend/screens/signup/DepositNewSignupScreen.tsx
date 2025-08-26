import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';

export const DepositNewSignupScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    occupation: '',
    monthlyIncome: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // 필수 필드 검증
    if (!formData.name || !formData.phone || !formData.email) {
      Alert.alert('입력 오류', '필수 정보를 모두 입력해주세요.');
      return;
    }

    Alert.alert(
      '가입 완료',
      '예금 계좌가 성공적으로 개설되었습니다!',
      [{ text: '확인', onPress: () => console.log('예금 가입 완료') }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="예금 신규 가입" showBack />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={24} color={COLORS.primary} />
            <Text style={styles.infoTitle}>기본 정보 입력</Text>
          </View>
          <Text style={styles.infoDescription}>
            예금 계좌 개설을 위해 필요한 기본 정보를 입력해주세요.
          </Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>개인 정보</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>이름 *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="실명을 입력하세요"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>휴대폰 번호 *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="010-0000-0000"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>이메일 *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="example@email.com"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>주소</Text>
            <TextInput
              style={styles.textInput}
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              placeholder="주소를 입력하세요"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>직업</Text>
            <TextInput
              style={styles.textInput}
              value={formData.occupation}
              onChangeText={(value) => handleInputChange('occupation', value)}
              placeholder="직업을 입력하세요"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>월 소득</Text>
            <TextInput
              style={styles.textInput}
              value={formData.monthlyIncome}
              onChangeText={(value) => handleInputChange('monthlyIncome', value)}
              placeholder="월 소득을 입력하세요"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.submitSection}>
          <PrimaryButton
            title="예금 계좌 개설하기"
            onPress={handleSubmit}
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
  submitSection: {
    marginBottom: SPACING.xl,
  },
  submitButton: {
    marginTop: SPACING.lg,
  },
});



