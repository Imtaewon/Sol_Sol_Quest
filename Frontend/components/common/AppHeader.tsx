/**
 * AppHeader.tsx
 * 
 * 앱의 공통 헤더 컴포넌트
 * 
 * 주요 기능:
 * - 화면 제목 표시
 * - 뒤로가기 버튼 제공
 * - 앱 로고 및 브랜딩 표시
 * - 우측 컴포넌트 영역 제공
 * - 상태바 스타일 관리
 * 
 * Props:
 * - title: 화면 제목
 * - onBackPress: 뒤로가기 이벤트 핸들러
 * - showBack: 뒤로가기 버튼 표시 여부
 * - showBackButton: 뒤로가기 버튼 표시 여부 (showBack과 동일)
 * - rightComponent: 우측 영역에 표시할 컴포넌트
 * - showNotification: 알림 아이콘 표시 여부 (미구현)
 * 
 * 조건부 렌더링:
 * - 뒤로가기 버튼이 있으면: 뒤로가기 버튼 + 제목
 * - 뒤로가기 버튼이 없으면: 로고 + 앱명
 * 
 * 스타일링:
 * - 고정 높이 및 패딩
 * - 하단 테두리
 * - 반응형 레이아웃
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';
import { APP_CONSTANTS } from '../../utils/constants';

interface AppHeaderProps {
  title?: string;
  onBackPress?: () => void;
  showBack?: boolean;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  showNotification?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  onBackPress,
  showBack = false,
  showBackButton = false,
  rightComponent,
  showNotification,
}) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.content}>
        {(showBack || showBackButton) ? (
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoContainer}>
            <Image source={APP_CONSTANTS.BRANDING.LOGO_IMAGE} style={styles.logoImage} resizeMode="contain" />
            <Text style={styles.appName}>{APP_CONSTANTS.BRANDING.APP_NAME}</Text>
          </View>
        )}
        
        <View style={styles.rightContainer}>
          {title && <Text style={styles.title}>{title}</Text>}
          {rightComponent}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
    paddingTop: 32, // 44에서 32로 줄임
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 2, // SPACING.xs에서 2로 더 줄임
    minHeight: 40, // 48에서 40으로 줄임
  },
  backButton: {
    padding: SPACING.xs,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 36,
    height: 36,
    marginRight: SPACING.xs,
  },
  appName: {
    fontSize: FONT_SIZES.sm,
    color: '#1428A0',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.dark,
    marginRight: SPACING.sm,
  },

});




