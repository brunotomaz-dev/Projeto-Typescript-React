import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FiltersVisibilityPayload {
  scope: string;
  isVisible: boolean;
}

interface UiStateState {
  filtersVisibility: Record<string, boolean>;
}

const initialState: UiStateState = {
  filtersVisibility: {
    home: false,
    liveLines: false,
    supervision: false,
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

export const { setFiltersVisibility, resetFiltersVisibility } = uiStateSlice.actions;

export default uiStateSlice.reducer;
