import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';
import { APP_CONSTANTS } from '../../utils/constants';
import { AuthStackParamList } from '../../navigation/AuthStack';

type LandingScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Landing'>;

export const LandingScreen: React.FC = () => {
  const navigation = useNavigation<LandingScreenNavigationProp>();

  const handleLoginPress = () => {
    navigation.navigate('SignIn');
  };

  const handleSignupPress = () => {
    navigation.navigate('SignUp');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* 로고 영역 */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>{APP_CONSTANTS.BRANDING.LOGO_TEXT}</Text>
            <Text style={styles.appName}>{APP_CONSTANTS.BRANDING.APP_NAME}</Text>
          </View>
          <Text style={styles.tagline}>
            적금과 함께하는 재미있는 퀘스트
          </Text>
        </View>

        {/* 메인 이미지 영역 */}
        <View style={styles.imageSection}>
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imageText}>🎯</Text>
            <Text style={styles.imageSubtext}>퀘스트 이미지</Text>
          </View>
        </View>

        {/* 버튼 영역 */}
        <View style={styles.buttonSection}>
          <PrimaryButton
            title="로그인"
            onPress={handleLoginPress}
            variant="primary"
            size="large"
            style={styles.button}
            accessibilityRole="button"
            accessibilityLabel="로그인 버튼"
          />
          <PrimaryButton
            title="회원가입"
            onPress={handleSignupPress}
            variant="outline"
            size="large"
            style={styles.button}
            accessibilityRole="button"
            accessibilityLabel="회원가입 버튼"
          />
        </View>

        {/* 하단 텍스트 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            계속 진행하면 서비스 이용약관과 개인정보처리방침에 동의하는 것으로 간주됩니다.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'space-between',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: SPACING.xxl * 2,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  logoText: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  appName: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.gray[600],
    fontWeight: '500',
  },
  tagline: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[500],
    textAlign: 'center',
    lineHeight: 24,
  },
  imageSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    borderStyle: 'dashed',
  },
  imageText: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  imageSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
  },
  buttonSection: {
    marginBottom: SPACING.xl,
  },
  button: {
    marginBottom: SPACING.md,
  },
  footer: {
    marginBottom: SPACING.lg,
  },
  footerText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
    textAlign: 'center',
    lineHeight: 16,
  },
});
