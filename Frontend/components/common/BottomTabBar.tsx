import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';
import { APP_CONSTANTS } from '../../utils/constants';

interface TabItem {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}

const TAB_ITEMS: TabItem[] = [
  { name: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { name: 'Assets', icon: 'wallet-outline', activeIcon: 'wallet' },
  { name: 'Quests', icon: 'trophy-outline', activeIcon: 'trophy' },
  { name: 'Leaderboard', icon: 'list-outline', activeIcon: 'list' },
  { name: 'MyPage', icon: 'person-outline', activeIcon: 'person' },
];

interface BottomTabBarProps {
  activeTab: string;
  onTabPress: (tabName: string) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabPress,
}) => {
  return (
    <View style={styles.container}>
      {TAB_ITEMS.map((item) => {
        const isActive = activeTab === item.name;
        return (
          <TouchableOpacity
            key={item.name}
            style={styles.tabItem}
            onPress={() => onTabPress(item.name)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isActive ? item.activeIcon : item.icon}
              size={24}
              color={isActive ? COLORS.primary : COLORS.gray[500]}
            />
            <Text
              style={[
                styles.tabText,
                isActive && styles.activeTabText,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    paddingBottom: 20, // Safe area for iOS
    paddingTop: SPACING.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
  },
  tabText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
    marginTop: SPACING.xs,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});




