/**
 * LandingScreen.tsx
 * 
 * 앱의 첫 진입점이 되는 랜딩 페이지
 * 
 * 주요 기능:
 * - 앱 로고 및 브랜딩 표시
 * - 로그인/회원가입 버튼 제공
 * - 사용자를 인증 플로우로 안내
 * 
 * 화면 구성:
 * - 로고 섹션: 앱 이름과 태그라인
 * - 캐릭터 섹션: SolCharacter.png 이미지
 * - 버튼 섹션: 로그인/회원가입 버튼
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';
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
          <Image
            source={require('../../assets/heyoung_logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
            accessibilityLabel="Heyoung logo"
          />
          <Text style={styles.systemText}>헤이영 스마트 캠퍼스 시스템</Text>
        
          {/* <Text style={styles.slogan}>
            성장이 이자가 되고{'\n'}경쟁이 나눔이 되다
          </Text> */}
        </View>

        {/* 히어로 이미지 영역 (landing-cpu) */}
        <View style={styles.heroSection}>
          <Image
            source={require('../../assets/landing-cpu.png')}
            style={styles.heroImage}
            resizeMode="contain"
            accessibilityLabel="Landing hero"
          />
        </View>
        {/* 버튼 영역 */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLoginPress}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>로그인</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.signupButton}
            onPress={handleSignupPress}
            activeOpacity={0.8}
          >
            <Text style={styles.signupButtonText}>회원가입</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F2F7', // 이미지의 하늘색 배경
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  justifyContent: 'flex-start',
  paddingTop: SPACING.xxl + SPACING.lg,
  paddingBottom: SPACING.lg,
  },
  logoSection: {
  alignItems: 'center',
  marginBottom: SPACING.xxl + SPACING.md,
  transform: [{ translateY: SPACING.sm }],
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1428A0', // 신한 블루
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  logoImage: {
    width: 220,
    height: 80,
    marginBottom: SPACING.sm,
  },
  systemText: {
    fontSize: FONT_SIZES.xs,
    color: '#1428A0',
    fontWeight: '500',
  marginBottom: SPACING.md,
    textAlign: 'center',
  },
  subTitle: {
    fontFamily: 'gothic-bold',
    fontSize: FONT_SIZES.xxxl,
    color: '#1428A0',
    fontWeight: '700',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxl,
    textAlign: 'center',
  },
  subTitleWrapper: {
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  slogan: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#343A40',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: SPACING.xl,
  },
  characterSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  characterContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterImage: {
    width: 300,
    height: 400,
  },
  heroSection: {
  alignItems: 'center',
  justifyContent: 'center',
  marginVertical: SPACING.xxl,
  },
  heroImage: {
  width: '86%',
  maxWidth: 360,
  height: 230,
  alignSelf: 'center',
  },
  buttonSection: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    bottom: SPACING.xl,
    gap: SPACING.sm,
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: '#1428A0', // 신한 블루
  borderRadius: BORDER_RADIUS.lg,
  paddingVertical: SPACING.md,
  paddingHorizontal: SPACING.lg,
  marginBottom: SPACING.sm,
  minHeight: 44,
  justifyContent: 'center',
  width: '88%',
  alignSelf: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: '#FFFFFF',
  fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
  paddingVertical: SPACING.md,
  paddingHorizontal: SPACING.lg,
    borderWidth: 2,
    borderColor: '#1428A0', // 신한 블루
  alignItems: 'center',
  justifyContent: 'center',
  width: '88%',
  alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signupButtonText: {
    color: '#1428A0', // 신한 블루
  fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});
