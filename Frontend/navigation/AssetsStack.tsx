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
