import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { format, startOfDay } from 'date-fns';
import { getShift } from '../../../helpers/turn';
import { iMaquinaIHM } from '../../../pages/LiveLines/interfaces/maquinaIhm.interface';

export interface iLiveLinesState {
  selectedDate: string;
  selectedMachine: string;
  selectedShift: string;
  selectedLine: number;
  machineStatus: string;
  isOpenedUpdateStops: boolean;

  // Estados para o modal de edição
  isEditModalOpen: boolean;
  stopToEdit: iMaquinaIHM | null;

  // Estado para o modal de criação
  isCreateModalOpen: boolean;
}

const initialState: iLiveLinesState = {
  selectedDate: format(startOfDay(new Date()), 'yyyy-MM-dd'),
  selectedMachine: '',
  selectedShift: getShift(),
  selectedLine: 1,
  machineStatus: '-',
  isOpenedUpdateStops: false,

  // Estados iniciais dos modais
  isEditModalOpen: false,
  stopToEdit: null,
  isCreateModalOpen: false,
};

export const liveLinesSlice = createSlice({
  name: 'liveLines',
  initialState,
  reducers: {
    setLiveSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    setLiveSelectedMachine: (state, action: PayloadAction<string>) => {
      state.selectedMachine = action.payload;
    },
    setLiveSelectedShift: (state, action: PayloadAction<string>) => {
      state.selectedShift = action.payload;
    },
    setLiveSelectedLine: (state, action: PayloadAction<number>) => {
      state.selectedLine = action.payload;
    },
    setMachineStatus: (state, action: PayloadAction<string>) => {
      state.machineStatus = action.payload;
    },
    setIsOpenedUpdateStops: (state, action: PayloadAction<boolean>) => {
      state.isOpenedUpdateStops = action.payload;
    },

    openEditModal: (state, action: PayloadAction<iMaquinaIHM>) => {
      state.stopToEdit = action.payload;
      state.isEditModalOpen = true;
    },
    closeEditModal: (state) => {
      state.isEditModalOpen = false;
      state.stopToEdit = null;
    },
    openCreateModal: (state) => {
      state.isCreateModalOpen = true;
    },
    closeCreateModal: (state) => {
      state.isCreateModalOpen = false;
    },
  },
});

export const {
  setLiveSelectedDate,
  setLiveSelectedMachine,
  setLiveSelectedShift,
  setLiveSelectedLine,
  setMachineStatus,
  setIsOpenedUpdateStops,
  openEditModal,
  closeEditModal,
  openCreateModal,
  closeCreateModal,
} = liveLinesSlice.actions;

export default liveLinesSlice.reducer;
