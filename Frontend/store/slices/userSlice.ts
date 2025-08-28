import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  name: string;
  real_name?: string;
  username: string;
  email: string;
  gender: 'male' | 'female';
  birthYear: number;
  school: string;
  school_id?: string;
  department: string;
  grade: number;
  savingStatus: boolean;
  hasSavings?: boolean;
  profileImage?: string;
}

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setSavingStatus: (state, action: PayloadAction<boolean>) => {
      if (state.user) {
        state.user.savingStatus = action.payload;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
      state.error = null;
    },
  },
});

export const { 
  setUser, 
  updateUser, 
  setSavingStatus, 
  setLoading, 
  setError, 
  clearUser 
} = userSlice.actions;
export default userSlice.reducer;

