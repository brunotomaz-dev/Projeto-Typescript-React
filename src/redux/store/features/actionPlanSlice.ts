import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { iActionPlan, iActionPlanCards, iActionPlanFormData } from '../../../interfaces/ActionPlan.interface';

export interface iActionToShow extends iActionPlanCards {
  nivelExibicao: number;
  isPinned: boolean;
}

interface ActionPlansState {
  rawData: iActionPlanCards[]; // Dados brutos dos planos de ação
  processedData: iActionToShow[]; // Dados processados para exibição
  loading: boolean;
  error: string | null;
  // Estado para o formulário
  formModalOperators: {
    isOpen: boolean;
    mode: 'create' | 'edit';
    editData: iActionPlan | null;
    preFilledData: Partial<iActionPlanFormData> | null;
  };
}

const initialState: ActionPlansState = {
  rawData: [],
  processedData: [],
  loading: false,
  error: null,
  formModalOperators: {
    isOpen: false,
    mode: 'create',
    editData: null,
    preFilledData: null,
  },
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
    // Ações do modal de formulário
    openActionPlanModal: (
      state,
      action: PayloadAction<{
        mode: 'create' | 'edit';
        editData?: iActionPlan;
        preFilledData?: Partial<iActionPlanFormData>;
      }>
    ) => {
      state.formModalOperators.isOpen = true;
      state.formModalOperators.mode = action.payload.mode;
      state.formModalOperators.editData = action.payload.editData || null;
      state.formModalOperators.preFilledData = action.payload.preFilledData || null;
    },
    closeActionPlanModal: (state) => {
      state.formModalOperators.isOpen = false;
      state.formModalOperators.mode = 'create';
      state.formModalOperators.editData = null;
      state.formModalOperators.preFilledData = null;
    },
  },
});

export const {
  setRawActionPlans,
  setProcessedActionPlans,
  setLoadingActionPlans,
  setErrorActionPlans,
  resetActionPlans,
  openActionPlanModal,
  closeActionPlanModal,
} = actionPlansSlice.actions;

export default actionPlansSlice.reducer;
