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

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { Platform, StyleSheet, View } from 'react-native';
import { store } from './store';
import { AuthStack } from './navigation/AuthStack';
import { MainTabs } from './navigation/MainTabs';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { loginSuccess } from './store/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthToken = async () => {
      console.log('🔍 앱 시작 시 토큰 확인 중...');
      try {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          console.log('✅ 저장된 토큰 발견, 자동 로그인 처리');
          // 토큰이 있으면 자동 로그인
          dispatch(loginSuccess({ token }));
        } else {
          console.log('❌ 저장된 토큰 없음');
        }
      } catch (error) {
        console.error('❌ 토큰 확인 중 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthToken();
  }, [dispatch]);

  // 앱 초기화 시 더미 키 설정
  useEffect(() => {
    const setDummyKey = async () => {
      await AsyncStorage.setItem('dummy_key', 'dummy_value');
      console.log('DEBUG: AsyncStorage dummy_key 설정 완료');
    };
    setDummyKey();
  }, []);

  // 인증 상태가 true가 되면 토큰 재확인
  useEffect(() => {
    if (isAuthenticated) {
      const checkToken = async () => {
        const token = await AsyncStorage.getItem('auth_token');
        console.log('✅ App.tsx - 로그인 후 AsyncStorage 토큰 재확인:', token ? '토큰 존재' : '토큰 없음', '길이:', token?.length || 0);
        
        const dummyValue = await AsyncStorage.getItem('dummy_key');
        console.log('✅ App.tsx - AsyncStorage dummy_key 확인:', dummyValue);
      };
      checkToken();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    console.log('🔄 인증 상태 변경됨:', isAuthenticated);
    console.log('현재 시간:', new Date().toISOString());
  }, [isAuthenticated]);

  if (isLoading) {
    console.log('⏳ 로딩 중...');
    // 로딩 중에는 빈 화면 표시 (또는 로딩 스피너)
    return null;
  }
  
  console.log('🎯 네비게이션 렌더링:', isAuthenticated ? 'MainTabs' : 'AuthStack');
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
    ...(Platform.OS === 'web' && {
      minHeight: '100vh' as any,
    }),
  },
  mobileFrame: {
    width: 375,
    height: 812,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)',
    // 웹에서만 적용되는 스타일
    ...(Platform.OS === 'web' && {
      maxWidth: '100vw' as any,
      maxHeight: '100vh' as any,
      width: 'min(375px, 100vw)' as any,
      height: 'min(812px, 100vh)' as any,
    }),
  },
});

export default App;
