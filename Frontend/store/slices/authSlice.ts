import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    loginSuccess: (state, action: PayloadAction<{ token: string }>) => {
      console.log('🔐 Redux loginSuccess 액션 호출됨');
      console.log('토큰:', action.payload.token);
      console.log('이전 인증 상태:', state.isAuthenticated);
      
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.error = null;
      
      console.log('✅ 인증 상태 업데이트 완료:', state.isAuthenticated);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.error = null;
    },
  },
});

export const { setLoading, setError, loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;

