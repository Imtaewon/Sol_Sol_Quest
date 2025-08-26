import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../../navigation/HomeStack';

type SavingsBasicInfoScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'SavingsBasicInfo'>;

export const SavingsBasicInfoScreen: React.FC = () => {
  const navigation = useNavigation<SavingsBasicInfoScreenNavigationProp>();
  
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    age: '',
    userId: '',
    password: '',
    confirmPassword: '',
    email: '',
    school: '',
  });

  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [isIdDuplicate, setIsIdDuplicate] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenderSelect = (gender: string) => {
    setFormData(prev => ({ ...prev, gender }));
  };

  const handleIdDuplicateCheck = () => {
    if (!formData.userId) {
      Alert.alert('입력 오류', '아이디를 입력해주세요.');
      return;
    }
    
    // 간단한 중복 체크 (실제로는 API 호출)
    if (formData.userId.length < 4) {
      Alert.alert('입력 오류', '아이디는 4자 이상이어야 합니다.');
      return;
    }
    
    setIsIdDuplicate(true);
    Alert.alert('확인', '사용 가능한 아이디입니다.');
  };

  const handleEmailVerification = () => {
    if (!formData.email) {
      Alert.alert('입력 오류', '이메일을 입력해주세요.');
      return;
    }
    
    Alert.alert(
      '인증번호 발송',
      '인증번호가 이메일로 발송되었습니다.\n5분 이내에 인증해주세요.',
      [
        { text: '취소', style: 'cancel' },
        { text: '인증하기', onPress: () => {
          // 간단한 인증 시뮬레이션
          setTimeout(() => {
            setIsEmailVerified(true);
            Alert.alert('인증 완료', '이메일 인증이 완료되었습니다.');
          }, 1000);
        }}
      ]
    );
  };

  const handleSchoolSelect = () => {
    setShowSchoolModal(true);
    // 실제로는 학교 검색 모달을 띄움
    setTimeout(() => {
      setShowSchoolModal(false);
      setFormData(prev => ({ ...prev, school: '서울대학교' }));
      Alert.alert('학교 선택', '서울대학교가 선택되었습니다.');
    }, 500);
  };

  const handleSubmit = () => {
    // 필수 필드 검증
    if (!formData.name || !formData.gender || !formData.age || !formData.userId || 
        !formData.password || !formData.email || !formData.school) {
      Alert.alert('입력 오류', '필수 정보를 모두 입력해주세요.');
      return;
    }

    if (!isIdDuplicate) {
      Alert.alert('입력 오류', '아이디 중복 확인을 해주세요.');
      return;
    }

    if (!isEmailVerified) {
      Alert.alert('입력 오류', '이메일 인증을 완료해주세요.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('입력 오류', '비밀번호가 일치하지 않습니다.');
      return;
    }

    // 직접 네비게이션 실행 (Alert 없이)
    try {
      console.log('네비게이션 시도:', 'SavingsTest');
      navigation.navigate('SavingsTest');
      console.log('네비게이션 성공');
    } catch (error) {
      console.error('네비게이션 에러:', error);
      Alert.alert('에러', '페이지 이동 중 오류가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="기본 정보 입력" showBack />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="person-circle" size={24} color={COLORS.secondary} />
            <Text style={styles.infoTitle}>기본 정보</Text>
          </View>
          <Text style={styles.infoDescription}>
            적금 가입을 위해 필요한 기본 정보를 입력해주세요.
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
            <Text style={styles.inputLabel}>성별 *</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  formData.gender === 'male' && styles.genderButtonActive
                ]}
                onPress={() => handleGenderSelect('male')}
              >
                <Text style={[
                  styles.genderButtonText,
                  formData.gender === 'male' && styles.genderButtonTextActive
                ]}>남성</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  formData.gender === 'female' && styles.genderButtonActive
                ]}
                onPress={() => handleGenderSelect('female')}
              >
                <Text style={[
                  styles.genderButtonText,
                  formData.gender === 'female' && styles.genderButtonTextActive
                ]}>여성</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>나이 *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.age}
              onChangeText={(value) => handleInputChange('age', value)}
              placeholder="나이를 입력하세요"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>아이디 *</Text>
            <View style={styles.idContainer}>
              <TextInput
                style={[styles.textInput, styles.idInput]}
                value={formData.userId}
                onChangeText={(value) => {
                  handleInputChange('userId', value);
                  setIsIdDuplicate(false);
                }}
                placeholder="아이디를 입력하세요"
              />
              <TouchableOpacity
                style={styles.duplicateButton}
                onPress={handleIdDuplicateCheck}
              >
                <Text style={styles.duplicateButtonText}>중복확인</Text>
              </TouchableOpacity>
            </View>
            {isIdDuplicate && (
              <Text style={styles.successText}>✓ 사용 가능한 아이디입니다</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>비밀번호 *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              placeholder="비밀번호를 입력하세요"
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>비밀번호 확인 *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              placeholder="비밀번호를 다시 입력하세요"
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>이메일 *</Text>
            <View style={styles.emailContainer}>
              <TextInput
                style={[styles.textInput, styles.emailInput]}
                value={formData.email}
                onChangeText={(value) => {
                  handleInputChange('email', value);
                  setIsEmailVerified(false);
                }}
                placeholder="이메일을 입력하세요"
                keyboardType="email-address"
              />
              <TouchableOpacity
                style={styles.verifyButton}
                onPress={handleEmailVerification}
              >
                <Text style={styles.verifyButtonText}>인증</Text>
              </TouchableOpacity>
            </View>
            {isEmailVerified && (
              <Text style={styles.successText}>✓ 이메일 인증이 완료되었습니다</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>학교 *</Text>
            <TouchableOpacity
              style={styles.schoolButton}
              onPress={handleSchoolSelect}
            >
              <Text style={[
                styles.schoolButtonText,
                formData.school ? styles.schoolButtonTextSelected : styles.schoolButtonTextPlaceholder
              ]}>
                {formData.school || '학교를 선택하세요'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.gray[500]} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.submitSection}>
          <PrimaryButton
            title="다음 단계로"
            onPress={handleSubmit}
            size="large"
            style={styles.submitButton}
          />
          
          {/* 테스트용 버튼 */}
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => {
              console.log('테스트 버튼 클릭');
              navigation.navigate('Test');
            }}
          >
            <Text style={styles.testButtonText}>테스트: 간단한 페이지로</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: COLORS.secondary }]}
            onPress={() => {
              console.log('SavingsTest 버튼 클릭');
              navigation.navigate('SavingsTest');
            }}
          >
            <Text style={[styles.testButtonText, { color: COLORS.white }]}>테스트: SavingsTest로</Text>
          </TouchableOpacity>
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
  genderContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  genderButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  genderButtonActive: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondary,
  },
  genderButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
  },
  genderButtonTextActive: {
    color: COLORS.white,
    fontWeight: '500',
  },
  idContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  idInput: {
    flex: 1,
  },
  duplicateButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    justifyContent: 'center',
  },
  duplicateButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  emailContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  emailInput: {
    flex: 1,
  },
  verifyButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    justifyContent: 'center',
  },
  verifyButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  schoolButton: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  schoolButtonText: {
    fontSize: FONT_SIZES.md,
  },
  schoolButtonTextPlaceholder: {
    color: COLORS.gray[400],
  },
  schoolButtonTextSelected: {
    color: COLORS.dark,
  },
  successText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  submitSection: {
    marginBottom: SPACING.xl,
  },
  submitButton: {
    marginTop: SPACING.lg,
  },
  testButton: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.gray[200],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
});
