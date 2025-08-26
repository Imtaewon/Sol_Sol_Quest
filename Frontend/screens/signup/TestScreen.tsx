import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { AppHeader } from '../../components/common/AppHeader';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

export const TestScreen: React.FC = () => {
  console.log('TestScreen 렌더링됨');
  
  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="테스트 페이지" showBack />
      <View style={styles.content}>
        <Text style={styles.title}>네비게이션이 성공했습니다! 🎉</Text>
        <Text style={styles.description}>
          이 페이지가 표시되면 네비게이션이 정상적으로 작동하는 것입니다.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.dark,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    textAlign: 'center',
    lineHeight: 20,
  },
});

