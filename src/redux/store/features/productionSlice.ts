import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { iProduction } from '../../../pages/ProductionLive/interfaces/production.interface';
import { iDescartes } from '../../../pages/Supervision/interface/Descartes.interface';

interface ProductionState {
  rawData: iProduction[];
  descartes: iDescartes[];
  totalProduction: number;
  totalByProductBag: number;
  totalByProductBol: number;
  loading: boolean;
  error: string | null;
}

const initialState: ProductionState = {
  rawData: [],
  descartes: [],
  totalProduction: 0,
  totalByProductBag: 0,
  totalByProductBol: 0,
  loading: false,
  error: null,
};

export const productionSlice = createSlice({
  name: 'production',
  initialState,
  reducers: {
    setRawProductionData: (state, action: PayloadAction<iProduction[]>) => {
      state.rawData = action.payload;
    },
    setDescartsData: (state, action: PayloadAction<iDescartes[]>) => {
      state.descartes = action.payload;
    },
    setTotalProduction: (state, action: PayloadAction<number>) => {
      state.totalProduction = action.payload;
    },
    setTotalByProductBag: (state, action: PayloadAction<number>) => {
      state.totalByProductBag = action.payload;
    },
    setTotalByProductBol: (state, action: PayloadAction<number>) => {
      state.totalByProductBol = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setRawProductionData,
  setDescartsData,
  setTotalProduction,
  setTotalByProductBag,
  setTotalByProductBol,
  setLoading,
  setError,
} = productionSlice.actions;

export default productionSlice.reducer;
