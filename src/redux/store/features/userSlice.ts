import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState extends User {
  isLoggedIn: boolean;
}

interface User {
  userId: string;
  fullName: string;
  groups: string[];
  functionalLevel: number;
  sectors: string[];
  functionalRole?: string[];
}

const initialState: UserState = {
  fullName: '',
  groups: [],
  isLoggedIn: false,
  userId: '',
  functionalLevel: 0,
  sectors: [],
  functionalRole: [],
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.fullName = action.payload.fullName;
      state.groups = action.payload.groups;
      state.userId = action.payload.userId;
      state.functionalLevel = action.payload.functionalLevel;
      state.sectors = action.payload.sectors;
      state.functionalRole = action.payload.functionalRole;
      state.isLoggedIn = true;
    },
    clearUser: (state) => {
      state.fullName = '';
      state.groups = [];
      state.userId = '';
      state.functionalLevel = 0;
      state.sectors = [];
      state.functionalRole = [];
      state.isLoggedIn = false;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
