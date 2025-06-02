import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LineMachine {
  [key: string]: number;
}

interface HomeState {
  lineMachine: LineMachine;
}

// Define the initial state for the home slice
const initialState: HomeState = {
  lineMachine: {},
};

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    setLineMachine: (state, action: PayloadAction<LineMachine>) => {
      state.lineMachine = action.payload;
    },
  },
});

export const { setLineMachine } = homeSlice.actions;
export default homeSlice.reducer;
