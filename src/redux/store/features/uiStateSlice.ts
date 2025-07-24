import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FiltersVisibilityPayload {
  scope: string;
  isVisible: boolean;
}

interface UiStateState {
  filtersVisibility: Record<string, boolean>;
  modalActionPlanCall: Record<string, boolean>;
}

const initialState: UiStateState = {
  filtersVisibility: {
    home: false,
    liveLines: false,
    supervision: false,
  },
  modalActionPlanCall: {
    operators: false,
  },
};

export const uiStateSlice = createSlice({
  name: 'uiState',
  initialState,
  reducers: {
    setFiltersVisibility: (state, action: PayloadAction<FiltersVisibilityPayload>) => {
      const { scope, isVisible } = action.payload;
      state.filtersVisibility[scope] = isVisible;
    },
    setModalActionPlanCall: (state, action: PayloadAction<FiltersVisibilityPayload>) => {
      const { scope, isVisible } = action.payload;
      state.modalActionPlanCall[scope] = isVisible;
    },
    resetModalActionPlanCall: (state, action: PayloadAction<string | undefined>) => {
      const scope = action.payload;
      if (scope) {
        state.modalActionPlanCall[scope] = false;
      } else {
        // Reset de todos os escopos
        state.modalActionPlanCall = { ...initialState.modalActionPlanCall };
      }
    },
    resetFiltersVisibility: (state, action: PayloadAction<string | undefined>) => {
      const scope = action.payload;
      if (scope) {
        // Reset apenas do escopo específico
        state.filtersVisibility[scope] = initialState.filtersVisibility[scope] || false;
      } else {
        // Reset de todos os escopos
        state.filtersVisibility = { ...initialState.filtersVisibility };
      }
    },
  },
});

export const {
  setFiltersVisibility,
  resetFiltersVisibility,
  setModalActionPlanCall,
  resetModalActionPlanCall,
} = uiStateSlice.actions;

export default uiStateSlice.reducer;
