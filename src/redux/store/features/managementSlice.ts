import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { format, startOfDay } from 'date-fns';
import { TurnoID } from '../../../helpers/constants';

interface ManagementState {
  filterState: {
    type: 'single' | 'range';
    selectedDate: string;
    selectedRange: {
      startDate: string;
      endDate: string;
    };
    turn: TurnoID;
    selectedLines: number[];
    showFilter: boolean;
  };
}

const initialState: ManagementState = {
  filterState: {
    type: 'single',
    selectedDate: format(startOfDay(new Date()), 'yyyy-MM-dd'),
    selectedRange: {
      startDate: '',
      endDate: '',
    },
    turn: 'ALL',
    selectedLines: [],
    showFilter: false,
  },
};

const managementSlice = createSlice({
  name: 'management',
  initialState,
  reducers: {
    setFilterType(state, action: PayloadAction<'single' | 'range'>) {
      state.filterState.type = action.payload;
    },
    setSelectedDate(state, action: PayloadAction<string>) {
      state.filterState.selectedDate = action.payload;
    },
    setSelectedRange(state, action: PayloadAction<{ startDate: string; endDate: string }>) {
      state.filterState.selectedRange = action.payload;
    },
    setTurn(state, action: PayloadAction<TurnoID>) {
      state.filterState.turn = action.payload;
    },
    setSelectedLines(state, action: PayloadAction<number[]>) {
      state.filterState.selectedLines = action.payload;
    },
    setShowFilter(state, action: PayloadAction<boolean>) {
      state.filterState.showFilter = action.payload;
    },
  },
});

export const { setFilterType, setSelectedDate, setSelectedRange, setTurn, setSelectedLines, setShowFilter } =
  managementSlice.actions;

export default managementSlice.reducer;
