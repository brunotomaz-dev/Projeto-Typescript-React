import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { iMaintenanceOrders } from '../../../pages/Manusis/interfaces/MaintenanceOrders';

interface iPreventivaAction {
  id: string;
  data: iMaintenanceOrders[];
}

const initialState: iPreventivaAction = {
  id: '',
  data: [],
};

const preventivaSlice = createSlice({
  name: 'preventiva',
  initialState,
  reducers: {
    setPreventiva: (state, action: PayloadAction<iPreventivaAction>) => {
      state.id = action.payload.id;
      state.data = action.payload.data;
    },
    clearPreventiva: (state) => {
      state.id = '';
      state.data = [];
    },
  },
});

export const { setPreventiva, clearPreventiva } = preventivaSlice.actions;

export default preventivaSlice.reducer;
