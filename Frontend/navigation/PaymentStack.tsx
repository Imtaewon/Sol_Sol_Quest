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
