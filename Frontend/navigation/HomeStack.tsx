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
import { SavingsBasicInfoScreen } from '../screens/signup/SavingsBasicInfoScreen';
import { SavingsSignupScreen } from '../screens/signup/SavingsSignupScreen';
import { SavingsTestScreen } from '../screens/signup/SavingsTestScreen';
import { TestScreen } from '../screens/signup/TestScreen';

export type HomeStackParamList = {
  Home: undefined;
  QuestTracker: undefined;
  QuestDetail: { questId: string };
  SavingOpen: undefined;
  DepositOpen: undefined;
  Quests: undefined;
  DepositSignup: undefined;
  DepositNewSignup: undefined;
  DepositRegister: undefined;
  SavingsBasicInfo: undefined;
  SavingsSignup: undefined;
  SavingsTest: undefined;
  Test: undefined;
};

const Stack = createStackNavigator<HomeStackParamList>();

export const HomeStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
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
      <Stack.Screen name="SavingsBasicInfo" component={SavingsBasicInfoScreen} />
      <Stack.Screen name="SavingsSignup" component={SavingsSignupScreen} />
      <Stack.Screen name="SavingsTest" component={SavingsTestScreen} />
      <Stack.Screen name="Test" component={TestScreen} />
    </Stack.Navigator>
  );
};
