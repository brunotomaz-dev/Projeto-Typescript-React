import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { format, startOfDay } from 'date-fns';
import { TurnoID } from '../../../helpers/constants';
import { getShift } from '../../../helpers/turn';

// Definir tipos para filtros
export type DateTurnFilter = {
  date: string;
  turn: TurnoID | 'ALL';
  // Campos opcionais para funcionalidades expandidas
  type?: 'single' | 'range';
  selectedRange?: {
    startDate: string;
    endDate: string;
  };
  selectedLines?: number[];
  isResetLines?: boolean;
};

interface FiltersState {
  dateTurn: Record<string, DateTurnFilter>;
}

// Valor padrão para filtros de data/turno
const defaultDateTurnFilter = (): DateTurnFilter => ({
  date: format(startOfDay(new Date()), 'yyyy-MM-dd'),
  turn: 'ALL',
  type: 'single',
  selectedRange: {
    startDate: '',
    endDate: '',
  },
  selectedLines: [],
  isResetLines: false,
});

// Turno atual padrão
const alternativeDefaultTurnFilter = (): DateTurnFilter => ({
  date: format(startOfDay(new Date()), 'yyyy-MM-dd'),
  turn: getShift(),
  type: 'single',
  selectedRange: {
    startDate: '',
    endDate: '',
  },
  selectedLines: [],
  isResetLines: false,
});

// Estado inicial com apenas alguns escopos comuns pré-definidos
const initialState: FiltersState = {
  dateTurn: {
    home: defaultDateTurnFilter(),
    liveLines: alternativeDefaultTurnFilter(),
    supervision: alternativeDefaultTurnFilter(),
    operators: alternativeDefaultTurnFilter(),
    management: defaultDateTurnFilter(),
  },
};

export const alternativeScopes = ['liveLines', 'supervision'];

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setDate: (state, action: PayloadAction<{ scope: string; date: string }>) => {
      const { scope, date } = action.payload;

      // Cria o escopo se não existir
      if (!state.dateTurn[scope]) {
        state.dateTurn[scope] = defaultDateTurnFilter();
      }

      state.dateTurn[scope].date = date;
    },

    setTurn: (state, action: PayloadAction<{ scope: string; turn: TurnoID | 'ALL' }>) => {
      const { scope, turn } = action.payload;

      // Cria o escopo se não existir
      if (!state.dateTurn[scope]) {
        state.dateTurn[scope] = defaultDateTurnFilter();
      }

      state.dateTurn[scope].turn = turn;
    },

    resetDateTurnFilter: (state, action: PayloadAction<string>) => {
      const scope = action.payload;
      state.dateTurn[scope] = alternativeScopes.includes(scope)
        ? alternativeDefaultTurnFilter()
        : defaultDateTurnFilter();
    },

    // Ação para copiar filtros de um escopo para outro
    copyFilters: (state, action: PayloadAction<{ from: string; to: string }>) => {
      const { from, to } = action.payload;

      // Verifica se o escopo de origem existe
      if (!state.dateTurn[from]) {
        state.dateTurn[from] = defaultDateTurnFilter();
      }

      state.dateTurn[to] = { ...state.dateTurn[from] };
    },

    // Novas actions para funcionalidades expandidas
    setFilterType: (state, action: PayloadAction<{ scope: string; typeDate: 'single' | 'range' }>) => {
      const { scope, typeDate } = action.payload;

      if (!state.dateTurn[scope]) {
        state.dateTurn[scope] = defaultDateTurnFilter();
      }

      state.dateTurn[scope].type = typeDate;
    },

    setSelectedRange: (
      state,
      action: PayloadAction<{ scope: string; startDate: string; endDate: string }>
    ) => {
      const { scope, startDate, endDate } = action.payload;

      if (!state.dateTurn[scope]) {
        state.dateTurn[scope] = defaultDateTurnFilter();
      }

      if (!state.dateTurn[scope].selectedRange) {
        state.dateTurn[scope].selectedRange = { startDate: '', endDate: '' };
      }

      state.dateTurn[scope].selectedRange!.startDate = startDate;
      state.dateTurn[scope].selectedRange!.endDate = endDate;
    },

    setSelectedLines: (state, action: PayloadAction<{ scope: string; lines: number[] }>) => {
      const { scope, lines } = action.payload;

      if (!state.dateTurn[scope]) {
        state.dateTurn[scope] = defaultDateTurnFilter();
      }

      state.dateTurn[scope].selectedLines = lines;
    },

    setIsResetLines: (state, action: PayloadAction<{ scope: string; reset: boolean }>) => {
      const { scope, reset } = action.payload;

      if (!state.dateTurn[scope]) {
        state.dateTurn[scope] = defaultDateTurnFilter();
      }

      state.dateTurn[scope].isResetLines = reset;
    },
  },
});

export const {
  setDate,
  setTurn,
  resetDateTurnFilter,
  copyFilters,
  setFilterType,
  setSelectedRange,
  setSelectedLines,
  setIsResetLines,
} = filtersSlice.actions;

export default filtersSlice.reducer;
