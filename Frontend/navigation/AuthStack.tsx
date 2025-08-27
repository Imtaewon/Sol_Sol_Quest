/**
 * AuthStack.tsx
 * 
 * 인증 관련 화면들의 네비게이션 스택
 * 
 * 주요 기능:
 * - 인증 플로우 화면들의 라우팅 관리
 * - 로그인/회원가입 화면 연결
 * - 인증 상태에 따른 화면 전환
 * 
 * 포함된 화면들:
 * - Landing: 앱 진입점 (로그인/회원가입 선택)
 * - SignIn: 로그인 화면
 * - SignUp: 회원가입 화면
 * 
 * 네비게이션 옵션:
 * - headerShown: false (커스텀 헤더 사용)
 * - 스택 기반 네비게이션
 * - 인증 완료 시 메인 화면으로 전환
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { LandingScreen } from '../screens/auth/LandingScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';

export type AuthStackParamList = {
  Landing: undefined;
  SignIn: undefined;
  SignUp: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="SignIn" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignupScreen} />
    </Stack.Navigator>
  );
};




