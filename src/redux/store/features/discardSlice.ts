import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { iDescartes } from '../../../pages/Supervision/interface/Descartes.interface';

interface DiscardsState {
  discardData: iDescartes[];
  loading: boolean;
  error: string | null;
}

const initialState: DiscardsState = {
  discardData: [],
  loading: false,
  error: null,
};

export const discardsSlice = createSlice({
  name: 'discards',
  initialState,
  reducers: {
    setDiscardData: (state, action: PayloadAction<iDescartes[]>) => {
      state.discardData = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearDiscardData: (state) => {
      state.discardData = [];
    },
  },
});

export const { setDiscardData, setLoading, setError, clearDiscardData } =
  discardsSlice.actions;
export default discardsSlice.reducer;
