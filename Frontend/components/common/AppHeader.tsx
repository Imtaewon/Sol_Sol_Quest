import React from 'react';
import {
  View,
  Text,
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
            <Text style={styles.logoText}>{APP_CONSTANTS.BRANDING.LOGO_TEXT}</Text>
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
  logoText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: SPACING.xs,
  },
  appName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
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




