/**
 * MyPageStack.tsx
 * 
 * 마이페이지 관련 화면들의 네비게이션 스택
 * 
 * 주요 기능:
 * - 마이페이지 화면들의 라우팅 관리
 * - 사용자 정보 및 서비스 화면 연결
 * - 출석체크 및 GPS 기능 네비게이션
 * 
 * 포함된 화면들:
 * - MyPage: 마이페이지 메인 화면
 * - Attendance: 출석체크 화면
 * - GPS: GPS/만보기 화면
 * 
 * 네비게이션 옵션:
 * - headerShown: false (커스텀 헤더 사용)
 * - 스택 기반 네비게이션
 * - 적금 가입자 전용 기능 포함
 */

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
