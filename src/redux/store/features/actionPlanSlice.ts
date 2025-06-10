import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { iActionPlanCards } from '../../../interfaces/ActionPlan.interface';

export interface iActionToShow extends iActionPlanCards {
  nivelExibicao: number;
  isPinned: boolean;
}

interface ActionPlansState {
  rawData: iActionPlanCards[]; // Dados brutos dos planos de ação
  processedData: iActionToShow[]; // Dados processados para exibição
  loading: boolean;
  error: string | null;
}

const initialState: ActionPlansState = {
  rawData: [],
  processedData: [],
  loading: false,
  error: null,
};

export const actionPlansSlice = createSlice({
  name: 'actionPlans',
  initialState,
  reducers: {
    setRawActionPlans: (state, action: PayloadAction<iActionPlanCards[]>) => {
      state.rawData = action.payload;
    },
    setProcessedActionPlans: (state, action: PayloadAction<iActionToShow[]>) => {
      state.processedData = action.payload;
    },
    setLoadingActionPlans: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setErrorActionPlans: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetActionPlans: () => initialState,
  },
});

export const {
  setRawActionPlans,
  setProcessedActionPlans,
  setLoadingActionPlans,
  setErrorActionPlans,
  resetActionPlans,
} = actionPlansSlice.actions;

export default actionPlansSlice.reducer;
