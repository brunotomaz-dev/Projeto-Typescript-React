import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { iMaintenanceOrders } from '../../../pages/Manusis/interfaces/MaintenanceOrders';

export const initialPreventive: iMaintenanceOrders = {
  id: 0,
  assunto_principal: '',
  assunto_secundario: '',
  ativo: '',
  codigo_ativo: '',
  codigo_localizacao_nivel1: '',
  codigo_localizacao_nivel2: '',
  codigo_localizacao_nivel3: '',
  criado_por: '',
  data_criacao: '',
  data_conclusao: '',
  descricao: '',
  descricao_localizacao_nivel1: '',
  descricao_localizacao_nivel2: '',
  descricao_localizacao_nivel3: '',
  fim_atendimento: '',
  historico_servico_executado: '',
  hora_conclusao: '',
  hora_criacao: '',
  hora_fim_atendimento: '',
  hora_inicio_atendimento: '',
  inicio_atendimento: '',
  natureza_manutencao: '',
  numero_os: '',
  numero_ss: 0,
  prioridade: 0,
  prioridade_calculada: 0,
  responsavel_manutencao: '',
  solicitante_ss: '',
  status: '',
  tipo_manutencao: '',
  status_id: 0,
  tempo_estimado_trabalho: 0,
  tempo_trabalho_realizado: 0,
};

interface iPreventivaAction {
  corretive: iMaintenanceOrders[];
  preventive: iMaintenanceOrders[];
  inspection: iMaintenanceOrders[];
  progress?: number;
  progressOS?: number;
  isLoading?: boolean;
  assetIdentifier?: IAssetIdentifier;
}

// Interfaces para as ações granulares
interface IAssetIdentifier {
  codigo_ativo: string;
  data_conclusao: string;
  ativo?: string;
}

const initialState: iPreventivaAction = {
  preventive: [],
  inspection: [],
  corretive: [],
  progress: 0,
  progressOS: 0,
  isLoading: false,
};

const preventivaSlice = createSlice({
  name: 'preventiva',
  initialState,
  reducers: {
    setPreventiva: (state, action: PayloadAction<iPreventivaAction>) => {
      state.preventive = action.payload.preventive;
      state.inspection = action.payload.inspection;
    },
    clearPreventiva: (state) => {
      state.preventive = [];
      state.inspection = [];
    },
    setCorretiveOnly: (state, action: PayloadAction<iMaintenanceOrders[]>) => {
      state.corretive = action.payload;
    },
    clearCorretiveOnly: (state) => {
      state.corretive = [];
    },
    // Nova ação para armazenar apenas info essencial do ativo
    setAssetIdentifier: (state, action: PayloadAction<IAssetIdentifier>) => {
      state.assetIdentifier = action.payload;
    },
    setProgress: (state, action: PayloadAction<number>) => {
      state.progress = action.payload;
    },
    clearProgress: (state) => {
      state.progress = 0;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setProgressOS: (state, action: PayloadAction<number>) => {
      state.progressOS = action.payload;
    },
    clearProgressOS: (state) => {
      state.progressOS = 0;
    },
  },
});

export const {
  setPreventiva,
  clearPreventiva,
  setCorretiveOnly,
  clearCorretiveOnly,
  setAssetIdentifier,
  setProgress,
  clearProgress,
  setLoading,
  setProgressOS,
  clearProgressOS,
} = preventivaSlice.actions;

export default preventivaSlice.reducer;
