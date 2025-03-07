import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LineMachine {
  [key: string]: number;
}

interface HomeState {
  count: number;
  lineMachine: LineMachine;
}

const initialState: HomeState = {
  count: 0,
  lineMachine: {},
};

export const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    increment: (state) => {
      state.count += 1;
    },
    setLineMachine: (state, action: PayloadAction<LineMachine>) => {
      state.lineMachine = action.payload;
    }
  },
});

export const { increment, setLineMachine } = homeSlice.actions;
export default homeSlice.reducer;