import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface iProductionData {
  data_registro: string;
  produto: string;
  turno: string;
  total_produzido: number;
}

interface iTodayProductionInWarehouse {
  hora: string;
  quantidade: number;
  data: string;
  unidade: string;
}

interface MonthlyProductionState {
  currentMonthProduction: iProductionData[];
  dailyProductionInWarehouse: iTodayProductionInWarehouse[];
}

const initialState: MonthlyProductionState = {
  currentMonthProduction: [],
  dailyProductionInWarehouse: [],
};

export const monthlyProductionSlice = createSlice({
  name: 'production',
  initialState,
  reducers: {
    setCurrentMonthProduction: (state, action: PayloadAction<iProductionData[]>) => {
      state.currentMonthProduction = action.payload;
    },
    setDailyProductionInWarehouse: (state, action: PayloadAction<iTodayProductionInWarehouse[]>) => {
      state.dailyProductionInWarehouse = action.payload;
    },
  },
});

export const { setCurrentMonthProduction, setDailyProductionInWarehouse } = monthlyProductionSlice.actions;
export default monthlyProductionSlice.reducer;
