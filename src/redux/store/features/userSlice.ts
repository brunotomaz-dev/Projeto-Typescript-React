import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
  isLoggedIn: boolean;
  fullName: string;
  userId: string;
  userName: string;
  groups: string[];
  functionalRole: string[];
  functionalLevel: number;
  sectors: string[];
  tokenStatus: {
    refreshing: boolean;
    lastRefreshed: string | null;
    refreshSuccess: boolean | null;
  };
}

const initialState: UserState = {
  isLoggedIn: false,
  fullName: '',
  userId: '',
  userName: '',
  groups: [],
  functionalRole: [],
  functionalLevel: 0,
  sectors: [],
  tokenStatus: {
    refreshing: false,
    lastRefreshed: null,
    refreshSuccess: null,
  },
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Omit<UserState, 'isLoggedIn' | 'tokenStatus'>>) => {
      state.isLoggedIn = true;
      state.fullName = action.payload.fullName;
      state.userId = action.payload.userId;
      state.userName = action.payload.userName;
      state.groups = action.payload.groups;
      state.functionalRole = action.payload.functionalRole;
      state.functionalLevel = action.payload.functionalLevel;
      state.sectors = action.payload.sectors;
    },
    clearUser: (state) => {
      state.isLoggedIn = false;
      state.fullName = '';
      state.userId = '';
      state.userName = '';
      state.groups = [];
      state.functionalRole = [];
      state.functionalLevel = 0;
      state.sectors = [];
      // Não limpa o estado do token
    },
    // Novos reducers para controle do status do token
    setTokenRefreshing: (state, action: PayloadAction<boolean>) => {
      state.tokenStatus.refreshing = action.payload;
    },
    setTokenRefreshed: (state, action: PayloadAction<boolean>) => {
      state.tokenStatus.refreshing = false;
      state.tokenStatus.refreshSuccess = action.payload;
      state.tokenStatus.lastRefreshed = new Date().toISOString();
    },
  },
});

export const { setUser, clearUser, setTokenRefreshing, setTokenRefreshed } = userSlice.actions;

export default userSlice.reducer;
