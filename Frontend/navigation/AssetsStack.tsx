/**
 * AssetsStack.tsx
 * 
 * 자산 관리 관련 화면들의 네비게이션 스택
 * 
 * 주요 기능:
 * - 자산 관리 화면들의 라우팅 관리
 * - 적금/예금 가입 플로우 네비게이션
 * - 계좌 정보 및 가입 화면 연결
 * 
 * 포함된 화면들:
 * - Assets: 자산 관리 메인 화면
 * - DepositSignup: 예금 가입 화면
 * - SavingOpen: 적금 가입 화면
 * - DepositNewSignup: 예금 신규 가입 화면
 * - DepositRegister: 예금 등록 화면
 * 
 * 네비게이션 옵션:
 * - headerShown: false (커스텀 헤더 사용)
 * - 스택 기반 네비게이션
 * - 화면 간 파라미터 전달
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AssetsScreen } from '../screens/assets/AssetsScreen';
import { DepositSignupScreen } from '../screens/signup/DepositSignupScreen';
import { SavingOpenScreen } from '../screens/signup/SavingOpenScreen';
import { DepositNewSignupScreen } from '../screens/signup/DepositNewSignupScreen';
import { DepositRegisterScreen } from '../screens/signup/DepositRegisterScreen';

export type AssetsStackParamList = {
  Assets: undefined;
  DepositSignup: undefined;
  SavingOpen: undefined;
  DepositNewSignup: undefined;
  DepositRegister: undefined;
};

const Stack = createStackNavigator<AssetsStackParamList>();

export const AssetsStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Assets" component={AssetsScreen} />
      <Stack.Screen name="DepositSignup" component={DepositSignupScreen} />
      <Stack.Screen name="SavingOpen" component={SavingOpenScreen} />
      <Stack.Screen name="DepositNewSignup" component={DepositNewSignupScreen} />
      <Stack.Screen name="DepositRegister" component={DepositRegisterScreen} />
    </Stack.Navigator>
  );
};
