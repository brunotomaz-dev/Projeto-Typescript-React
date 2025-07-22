import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface iStopsData {
  causa: string;
  equipamento: string;
  impacto: number;
  color?: string;
  motivo: string;
  problema: string;
  tempo: number;
}

interface iClickDataState {
  stopsData: iStopsData | null;
}

const initialState: iClickDataState = {
  stopsData: null,
};

export const clickDataSlice = createSlice({
  name: 'clickData',
  initialState,
  reducers: {
    setClickStopsData: (state, action: PayloadAction<iStopsData>) => {
      state.stopsData = action.payload;
    },
    clearClickStopsData: (state) => {
      state.stopsData = null;
    },
  },
});

export const { setClickStopsData, clearClickStopsData } = clickDataSlice.actions;
export default clickDataSlice.reducer;
