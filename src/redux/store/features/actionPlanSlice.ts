import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { iActionPlanCards, iActionPlanFormData } from '../../../interfaces/ActionPlan.interface';

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
  formModal: {
    isOpen: boolean;
    mode: 'create' | 'edit';
    editData: iActionPlanCards | null;
    preFilledData: Partial<iActionPlanFormData> | null;
  };
}

const initialState: ActionPlansState = {
  rawData: [],
  processedData: [],
  loading: false,
  error: null,
  formModal: {
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
        editData?: iActionPlanCards;
        preFilledData?: Partial<iActionPlanFormData>;
      }>
    ) => {
      state.formModal.isOpen = true;
      state.formModal.mode = action.payload.mode;
      state.formModal.editData = action.payload.editData || null;
      state.formModal.preFilledData = action.payload.preFilledData || null;
    },
    closeActionPlanModal: (state) => {
      state.formModal.isOpen = false;
      state.formModal.mode = 'create';
      state.formModal.editData = null;
      state.formModal.preFilledData = null;
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
