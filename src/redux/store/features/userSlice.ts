import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserState extends User {
  isLoggedIn: boolean;
}

interface User {
  fullName: string;
  groups: string[];
  user_id: string;
}

const initialState: UserState = {
  fullName: "",
  groups: [],
  isLoggedIn: false,
  user_id: "",
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.fullName = action.payload.fullName;
      state.groups = action.payload.groups;
      state.user_id = action.payload.user_id;
      state.isLoggedIn = true;
    },
    clearUser: (state) => {
      state.fullName = "";
      state.groups = [];
      state.user_id = "";
      state.isLoggedIn = false;
    },
  }
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;