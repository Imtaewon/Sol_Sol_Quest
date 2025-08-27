/**
 * App.tsx
 * 
 * SolQuest 앱의 메인 진입점
 * 
 * 주요 기능:
 * - 앱의 전체 구조 및 프로바이더 설정
 * - 인증 상태에 따른 네비게이션 분기
 * - 전역 상태 관리 및 API 클라이언트 설정
 * 
 * 프로바이더 구성:
 * - Redux Provider: 전역 상태 관리
 * - QueryClientProvider: React Query 서버 상태 관리
 * - NavigationContainer: 네비게이션 컨테이너
 * 
 * 네비게이션 분기:
 * - 인증된 사용자: MainTabs (메인 탭 네비게이션)
 * - 비인증 사용자: AuthStack (인증 스택 네비게이션)
 * 
 * 전역 설정:
 * - React Query 기본 옵션 설정
 * - Toast 메시지 시스템
 * - 에러 처리 및 재시도 로직
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { Platform, StyleSheet, View } from 'react-native';
import { store } from './store';
import { AuthStack } from './navigation/AuthStack';
import { MainTabs } from './navigation/MainTabs';
import { useSelector } from 'react-redux';
import { RootState } from './store';

// React Query 클라이언트 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5분
    },
  },
});

// 인증 상태에 따른 네비게이션 컴포넌트
const Navigation: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  
  return isAuthenticated ? <MainTabs /> : <AuthStack />;
};

// 웹에서 모바일 뷰를 강제하는 컨테이너
const MobileContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <View style={styles.mobileFrame}>
          {children}
        </View>
      </View>
    );
  }
  
  return <>{children}</>;
};

// 메인 앱 컴포넌트
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <MobileContainer>
            <Navigation />
            <Toast />
          </MobileContainer>
        </NavigationContainer>
      </QueryClientProvider>
    </Provider>
  );
};

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
  },
  mobileFrame: {
    width: 375, // iPhone 12/13/14 width
    height: 812, // iPhone 12/13/14 height
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)',
    // 웹에서만 적용되는 스타일
    ...(Platform.OS === 'web' && {
      maxWidth: '100vw',
      maxHeight: '100vh',
      width: 'min(375px, 100vw)',
      height: 'min(812px, 100vh)',
    }),
  },
});

export default App;
