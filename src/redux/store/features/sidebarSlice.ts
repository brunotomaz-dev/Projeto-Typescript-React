import { createSlice } from "@reduxjs/toolkit";

export interface SidebarState {
  isCollapsed: boolean;
}

const initialState: SidebarState = {
  isCollapsed: false,
};

const sidebarSlice = createSlice({
  name: "sidebar",  // namespace para as actions
  initialState,  // estado inicial
  reducers: {  // reducers
    toggleCollapsed: (state) => {
      state.isCollapsed = !state.isCollapsed;
    },

  },
});

export const { toggleCollapsed } = sidebarSlice.actions;
export default sidebarSlice.reducer;