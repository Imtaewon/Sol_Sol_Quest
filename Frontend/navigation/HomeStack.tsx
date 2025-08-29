/**
 * HomeStack.tsx
 * 
 * 홈 화면 네비게이션 스택 정의
 * 
 * 주요 화면들:
 * - Home: 메인 홈 화면
 * - QuestTracker: 퀘스트 추적 화면 (GPS, 걸음수 등)
 * - QuestDetail: 퀘스트 상세 화면
 * - Quests: 퀘스트 목록 화면
 * - SavingOpen: 적금 개설 화면 (통합)
 * - DepositOpen: 예금 개설 화면
 * - 기타 회원가입 관련 화면들
 * 
 * 네비게이션 파라미터:
 * - QuestDetail: quest 객체를 전달 (별도 API 호출 없음)
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/home/HomeScreen';
import { QuestTrackerScreen } from '../screens/quests/QuestTrackerScreen';
import { QuestDetailScreen } from '../screens/quests/QuestDetailScreen';
import { QuestsScreen } from '../screens/quests/QuestsScreen';
import { SavingOpenScreen } from '../screens/signup/SavingOpenScreen';
import { DepositOpenScreen } from '../screens/signup/DepositOpenScreen';
import { DepositSignupScreen } from '../screens/signup/DepositSignupScreen';
import { DepositNewSignupScreen } from '../screens/signup/DepositNewSignupScreen';
import { DepositRegisterScreen } from '../screens/signup/DepositRegisterScreen';
import { TestScreen } from '../screens/signup/TestScreen';
import { DepositMoneyScreen } from '../screens/deposit/DepositMoneyScreen';
import { QuestWithAttempt } from '../types/database';

/**
 * 홈 스택 네비게이션 파라미터 타입 정의
 * 각 화면으로 전달되는 파라미터들을 정의
 */
export type HomeStackParamList = {
  Home: undefined;                    // 메인 홈 화면
  QuestTracker: undefined;            // 퀘스트 추적 화면
  QuestDetail: { quest: QuestWithAttempt }; // 퀘스트 상세 화면 (quest 객체 전달)
  SavingOpen: undefined;              // 적금 개설 화면 (통합)
  DepositOpen: undefined;             // 예금 개설 화면
  Quests: undefined;                  // 퀘스트 목록 화면
  DepositSignup: undefined;           // 예금 회원가입 화면
  DepositNewSignup: undefined;        // 예금 신규 회원가입 화면
  DepositRegister: undefined;         // 예금 등록 화면
  Test: undefined;                    // 테스트 화면
  DepositMoney: undefined;            // 상시입출금 입금 화면
};

/**
 * 홈 스택 네비게이터 생성
 */
const Stack = createStackNavigator<HomeStackParamList>();

/**
 * 홈 스택 네비게이션 컴포넌트
 * 모든 홈 관련 화면들을 스택 형태로 관리
 */
export const HomeStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,  // 기본 헤더 숨김 (각 화면에서 커스텀 헤더 사용)
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="QuestTracker" component={QuestTrackerScreen} />
      <Stack.Screen name="QuestDetail" component={QuestDetailScreen} />
      <Stack.Screen name="Quests" component={QuestsScreen} />
      <Stack.Screen name="SavingOpen" component={SavingOpenScreen} />
      <Stack.Screen name="DepositOpen" component={DepositOpenScreen} />
      <Stack.Screen name="DepositSignup" component={DepositSignupScreen} />
      <Stack.Screen name="DepositNewSignup" component={DepositNewSignupScreen} />
      <Stack.Screen name="DepositRegister" component={DepositRegisterScreen} />
      <Stack.Screen name="Test" component={TestScreen} />
      <Stack.Screen name="DepositMoney" component={DepositMoneyScreen} />
    </Stack.Navigator>
  );
};
