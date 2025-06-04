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
    production: false,
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
  },
});

export const { setFiltersVisibility } = uiStateSlice.actions;

export default uiStateSlice.reducer;
