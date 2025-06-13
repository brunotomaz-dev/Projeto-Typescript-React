import { createSlice } from '@reduxjs/toolkit';
import { iQualDescartesGroupedByLine } from '../../../interfaces/QualidadeIHM.interface';

interface DiscardsState {
  isModalOpen: boolean;
  discardsGroupedByLine: iQualDescartesGroupedByLine[];
}

const initialState: DiscardsState = {
  isModalOpen: false,
  discardsGroupedByLine: [],
};

const discardsSlice = createSlice({
  name: 'discards',
  initialState,
  reducers: {
    setIsModalOpen: (state, action) => {
      state.isModalOpen = action.payload;
    },
    setDiscardsGroupedByLine: (state, action) => {
      state.discardsGroupedByLine = action.payload;
    },
  },
});

export const { setIsModalOpen, setDiscardsGroupedByLine } = discardsSlice.actions;

export default discardsSlice.reducer;
