import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { format, startOfDay } from 'date-fns';
import { getShift } from '../../../helpers/turn';

export interface iLiveLinesState {
  selectedDate: string;
  selectedMachine: string;
  selectedShift: string;
  selectedLine: number; // Nova propriedade
  machineStatus: string; // Nova propriedade
}

const initialState: iLiveLinesState = {
  selectedDate: format(startOfDay(new Date()), 'yyyy-MM-dd'),
  selectedMachine: '',
  selectedShift: getShift(),
  selectedLine: 1, // Valor inicial
  machineStatus: '-', // Valor inicial
};

export const liveLinesSlice = createSlice({
  name: 'liveLines',
  initialState,
  reducers: {
    setLiveSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    setLiveSelectedMachine: (state, action: PayloadAction<string>) => {
      state.selectedMachine = action.payload;
    },
    setLiveSelectedShift: (state, action: PayloadAction<string>) => {
      state.selectedShift = action.payload;
    },
    setLiveSelectedLine: (state, action: PayloadAction<number>) => {
      state.selectedLine = action.payload;
    },
    setMachineStatus: (state, action: PayloadAction<string>) => {
      state.machineStatus = action.payload;
    },
  },
});

export const {
  setLiveSelectedDate,
  setLiveSelectedMachine,
  setLiveSelectedShift,
  setLiveSelectedLine,
  setMachineStatus,
} = liveLinesSlice.actions;

export default liveLinesSlice.reducer;
