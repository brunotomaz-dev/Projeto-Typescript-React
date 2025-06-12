import { createSlice } from '@reduxjs/toolkit';

interface DiscardsState {
  isModalOpen: boolean;
}

const initialState: DiscardsState = {
  isModalOpen: false,
};

const discardsSlice = createSlice({
  name: 'discards',
  initialState,
  reducers: {
    setIsModalOpen: (state, action) => {
      state.isModalOpen = action.payload;
    },
  },
});

export const { setIsModalOpen } = discardsSlice.actions;

export default discardsSlice.reducer;
