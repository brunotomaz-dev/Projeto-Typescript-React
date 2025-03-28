import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserState extends User {
  isLoggedIn: boolean;
}

interface User {
  fullName: string;
  groups: string[];
  user_id: string;
  level: number;
}

const initialState: UserState = {
  fullName: "",
  groups: [],
  isLoggedIn: false,
  user_id: "",
  level: 0
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.fullName = action.payload.fullName;
      state.groups = action.payload.groups;
      state.user_id = action.payload.user_id;
      state.level = action.payload.level;
      state.isLoggedIn = true;
    },
    clearUser: (state) => {
      state.fullName = "";
      state.groups = [];
      state.user_id = "";
      state.level = 0;
      state.isLoggedIn = false;
    },
  }
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;