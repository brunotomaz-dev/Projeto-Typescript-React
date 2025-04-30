import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { format, startOfDay } from 'date-fns';
import { getShift } from '../../../helpers/turn';

export interface iLiveLinesState {
  selectedDate: string;
  selectedMachine: string;
  selectedShift: string;
}

const initialState: iLiveLinesState = {
  selectedDate: format(startOfDay(new Date()), 'yyyy-MM-dd'),
  selectedMachine: '',
  selectedShift: getShift(),
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
  },
});

export const { setLiveSelectedDate, setLiveSelectedMachine, setLiveSelectedShift } =
  liveLinesSlice.actions;
export default liveLinesSlice.reducer;
