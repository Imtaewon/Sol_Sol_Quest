/**
 * QuestsStack.tsx
 * 
 * 퀘스트 관련 화면들의 네비게이션 스택
 * 
 * 포함 화면:
 * - Quests: 퀘스트 목록 화면
 * - QuestUpload: 퀘스트 파일 업로드 화면
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { QuestsScreen } from '../screens/quests/QuestsScreen';
import { QuestUploadScreen } from '../screens/quests/QuestUploadScreen';
import { QuestDetailScreen } from '../screens/quests/QuestDetailScreen';

export type QuestsStackParamList = {
  Quests: undefined;
  QuestUpload: { quest: { id: string; title: string; description: string } };
  QuestDetail: { quest: any };
};

const Stack = createStackNavigator<QuestsStackParamList>();

export const QuestsStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Quests" component={QuestsScreen} />
      <Stack.Screen name="QuestUpload" component={QuestUploadScreen} />
      <Stack.Screen name="QuestDetail" component={QuestDetailScreen} />
    </Stack.Navigator>
  );
};
