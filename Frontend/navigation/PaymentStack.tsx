/**
 * PaymentStack.tsx
 * 
 * 결제 관련 화면들의 네비게이션 스택
 * 
 * 주요 기능:
 * - 결제 관련 화면들의 라우팅 관리
 * - 결제 플로우 네비게이션
 * - QR 코드 관련 화면 연결
 * 
 * 포함된 화면들:
 * - Payment: 메인 결제 화면
 * - PaymentHistory: 결제 내역 화면
 * - QRGenerator: QR 코드 생성 화면
 * - QRPay: QR 코드 결제 화면
 * 
 * 네비게이션 옵션:
 * - headerShown: false (커스텀 헤더 사용)
 * - 스택 기반 네비게이션
 * - 화면 간 파라미터 전달
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { PaymentScreen } from '../screens/payment/PaymentScreen';
import { PaymentHistoryScreen } from '../screens/payment/PaymentHistoryScreen';
import { QRGeneratorScreen } from '../screens/payment/QRGeneratorScreen';
import { QRPayScreen } from '../screens/payment/QRPayScreen';

export type PaymentStackParamList = {
  Payment: undefined;
  PaymentHistory: undefined;
  QRGenerator: undefined;
  QRPay: undefined;
};

const Stack = createStackNavigator<PaymentStackParamList>();

export const PaymentStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
      <Stack.Screen name="QRGenerator" component={QRGeneratorScreen} />
      <Stack.Screen name="QRPay" component={QRPayScreen} />
    </Stack.Navigator>
  );
};
