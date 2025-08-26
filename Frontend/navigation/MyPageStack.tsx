import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MyPageScreen } from '../screens/mypage/MyPageScreen';
import { AttendanceScreen } from '../screens/mypage/AttendanceScreen';
import { GPSScreen } from '../screens/mypage/GPSScreen';

export type MyPageStackParamList = {
  MyPage: undefined;
  Attendance: undefined;
  GPS: undefined;
  Landing: undefined;
};

const Stack = createStackNavigator<MyPageStackParamList>();

export const MyPageStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MyPage" component={MyPageScreen} />
      <Stack.Screen name="Attendance" component={AttendanceScreen} />
      <Stack.Screen name="GPS" component={GPSScreen} />
    </Stack.Navigator>
  );
};
