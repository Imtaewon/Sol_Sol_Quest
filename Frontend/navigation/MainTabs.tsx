import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { HomeStack } from './HomeStack';
import { AssetsStack } from './AssetsStack';
import { PaymentStack } from './PaymentStack';
import { QuestsScreen } from '../screens/quests/QuestsScreen';
import { LeaderboardScreen } from '../screens/leaderboard/LeaderboardScreen';
import { MyPageStack } from './MyPageStack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../utils/constants';

export type MainTabsParamList = {
  Home: undefined;
  Payment: undefined;
  Quests: undefined;
  Leaderboard: undefined;
  MyPage: undefined;
  SavingOpen: undefined;
  DepositOpen: undefined;
  Attendance: undefined;
  GPS: undefined;
  QRPay: undefined;
};

// 탭 아이콘 props 타입 정의
interface CustomTabIconProps {
  route: {
    name: string;
  };
  focused: boolean;
  color: string;
  size: number;
}

const Tab = createBottomTabNavigator<MainTabsParamList>();

// 커스텀 아이콘 컴포넌트
const CustomTabIcon = ({ route, focused, color, size }: CustomTabIconProps) => {
  let iconName: keyof typeof Ionicons.glyphMap;

  if (route.name === 'Home') {
    iconName = focused ? 'home' : 'home-outline';
  } else if (route.name === 'Quests') {
    iconName = focused ? 'trophy' : 'trophy-outline';
  } else if (route.name === 'Payment') {
    iconName = focused ? 'card' : 'card-outline';
  } else if (route.name === 'Leaderboard') {
    iconName = focused ? 'list' : 'list-outline';
  } else if (route.name === 'MyPage') {
    iconName = focused ? 'person' : 'person-outline';
  } else {
    iconName = 'help-outline';
  }

  // 중앙 버튼 (Payment)은 특별한 스타일 적용
  if (route.name === 'Payment') {
    return (
      <View style={[
        styles.centralButton,
        focused && styles.centralButtonActive
      ]}>
        <Ionicons 
          name={iconName} 
          size={focused ? 24 : 20} 
          color={focused ? COLORS.white : COLORS.primary} 
        />
      </View>
    );
  }

  return <Ionicons name={iconName} size={size} color={color} />;
};

export const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => (
          <CustomTabIcon 
            route={route} 
            focused={focused} 
            color={color} 
            size={size} 
          />
        ),
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray[500],
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.gray[200],
          borderTopWidth: 1,
          paddingBottom: 20, // Safe area for iOS
          paddingTop: 4, // 8에서 4로 변경
          height: 70, // 85에서 70으로 변경
          elevation: 8,
          shadowColor: COLORS.black,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{ tabBarLabel: '홈' }}
      />
      <Tab.Screen 
        name="Quests" 
        component={QuestsScreen}
        options={{ tabBarLabel: '퀘스트' }}
      />
      <Tab.Screen 
        name="Payment" 
        component={PaymentStack}
        options={{ tabBarLabel: '결제' }}
      />
      <Tab.Screen 
        name="Leaderboard" 
        component={LeaderboardScreen}
        options={{ tabBarLabel: '랭킹' }}
      />
      <Tab.Screen 
        name="MyPage" 
        component={MyPageStack}
        options={{ tabBarLabel: '마이' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  centralButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginBottom: 6, // 8에서 6으로 변경
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  centralButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    elevation: 6,
  },
});

