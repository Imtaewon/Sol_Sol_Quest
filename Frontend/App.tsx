import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
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

// 메인 앱 컴포넌트
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <Navigation />
          <Toast />
        </NavigationContainer>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
