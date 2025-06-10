import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SupervisionState {
  // Status de carregamento
  loading: {
    absenceData: boolean;
    presenceData: boolean;
    actionPlans: boolean;
  };

  // Dados da supervisão
  totalProduction: number;
  totalPresentes: number;
}

const initialState: SupervisionState = {
  loading: {
    absenceData: false,
    presenceData: false,
    actionPlans: false,
  },
  totalProduction: 0,
  totalPresentes: 0,
};

export const supervisionSlice = createSlice({
  name: 'supervision',
  initialState,
  reducers: {
    setLoadingState: (state, action: PayloadAction<{ key: keyof typeof state.loading; value: boolean }>) => {
      const { key, value } = action.payload;
      state.loading[key] = value;
    },
    setTotalProduction: (state, action: PayloadAction<number>) => {
      state.totalProduction = action.payload;
    },
    setTotalPresentes: (state, action: PayloadAction<number>) => {
      state.totalPresentes = action.payload;
    },
    resetSupervisionState: () => initialState,
  },
});

export const { setLoadingState, setTotalProduction, setTotalPresentes, resetSupervisionState } =
  supervisionSlice.actions;

export default supervisionSlice.reducer;
