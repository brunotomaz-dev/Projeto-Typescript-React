import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { iAbsenceForm, iPresence } from '../../../interfaces/Absence.interface';

interface SupervisionState {
  // Status de carregamento
  loading: {
    absenceData: boolean;
    presenceData: boolean;
    actionPlans: boolean;
  };
  //Modal de absenteísmo
  absenceModal: {
    absenceModalVisible: boolean;
    absenceModalEdit?: boolean;
    absenceModalData: iAbsenceForm;
    absenceModalType: string;
  };
  //Modal de presença
  presenceModal: {
    presenceModalVisible: boolean;
    presenceModalEdit?: boolean;
    presenceModalData: iPresence;
  };
  // Modal do detector de metais
  detectorModal: {
    detectorModalVisible: boolean;
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
  absenceModal: {
    absenceModalVisible: false,
    absenceModalEdit: false,
    absenceModalData: {} as iAbsenceForm,
    absenceModalType: 'Falta',
  },
  presenceModal: {
    presenceModalVisible: false,
    presenceModalEdit: false,
    presenceModalData: {} as iPresence,
  },
  detectorModal: {
    detectorModalVisible: false,
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
    setAbsenceModal: (state, action: PayloadAction<Partial<SupervisionState['absenceModal']>>) => {
      state.absenceModal = { ...state.absenceModal, ...action.payload };
    },
    setPresenceModal: (state, action: PayloadAction<Partial<SupervisionState['presenceModal']>>) => {
      state.presenceModal = { ...state.presenceModal, ...action.payload };
    },
    setDetectorModal: (state, action: PayloadAction<Partial<SupervisionState['detectorModal']>>) => {
      state.detectorModal = { ...state.detectorModal, ...action.payload };
    },
    resetSupervisionState: () => initialState,
  },
});

export const {
  setLoadingState,
  setTotalProduction,
  setTotalPresentes,
  resetSupervisionState,
  setAbsenceModal,
  setPresenceModal,
  setDetectorModal,
} = supervisionSlice.actions;

export default supervisionSlice.reducer;
