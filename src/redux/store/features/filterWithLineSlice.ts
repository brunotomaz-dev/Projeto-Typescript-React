import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { format, startOfDay } from 'date-fns';
import { TurnoID } from '../../../helpers/constants';

interface iDefaultState {
  type: 'single' | 'range';
  selectedDate: string;
  selectedRange: {
    startDate: string;
    endDate: string;
  };
  turn: TurnoID;
  selectedLines: number[];
}

interface iFilterState {
  scopeState: Record<string, iDefaultState>;
}

// Valor padrão para o estado de filtro
export const defaultFilterWithLinesState = (): iDefaultState => ({
  type: 'single',
  selectedDate: format(startOfDay(new Date()), 'yyyy-MM-dd'),
  selectedRange: {
    startDate: '',
    endDate: '',
  },
  turn: 'ALL',
  selectedLines: [],
});

const initialState: iFilterState = {
  scopeState: {
    management: defaultFilterWithLinesState(),
  },
};

const managementSlice = createSlice({
  name: 'management',
  initialState,
  reducers: {
    setFilterType(state, action: PayloadAction<{ scope: string; typeDate: 'single' | 'range' }>) {
      const { scope, typeDate } = action.payload;

      // Cria o escopo se não existir
      if (!state.scopeState[scope]) {
        state.scopeState[scope] = defaultFilterWithLinesState();
      }

      state.scopeState[scope].type = typeDate;
    },
    setSelectedDate(state, action: PayloadAction<{ scope: string; date: string }>) {
      const { scope, date } = action.payload;

      if (!state.scopeState[scope]) {
        state.scopeState[scope] = defaultFilterWithLinesState();
      }

      state.scopeState[scope].selectedDate = date;
    },
    setSelectedRange(state, action: PayloadAction<{ scope: string; startDate: string; endDate: string }>) {
      const { scope, startDate, endDate } = action.payload;

      if (!state.scopeState[scope]) {
        state.scopeState[scope] = defaultFilterWithLinesState();
      }

      state.scopeState[scope].selectedRange = { startDate, endDate };
    },
    setTurn(state, action: PayloadAction<{ scope: string; TurnoID: TurnoID }>) {
      const { scope, TurnoID } = action.payload;

      if (!state.scopeState[scope]) {
        state.scopeState[scope] = defaultFilterWithLinesState();
      }

      state.scopeState[scope].turn = TurnoID;
    },
    setSelectedLines(state, action: PayloadAction<{ scope: string; lines: number[] }>) {
      const { scope, lines } = action.payload;

      if (!state.scopeState[scope]) {
        state.scopeState[scope] = defaultFilterWithLinesState();
      }

      state.scopeState[scope].selectedLines = lines;
    },

    resetFilterWithLine(state, action: PayloadAction<string>) {
      const scope = action.payload;

      // Se o escopo não existir, cria com valores padrão
      if (!state.scopeState[scope]) {
        state.scopeState[scope] = defaultFilterWithLinesState();
      }

      // Reseta o estado do escopo para os valores padrão
      state.scopeState[scope] = defaultFilterWithLinesState();
    },
  },
});

export const {
  setFilterType,
  setSelectedDate,
  setSelectedRange,
  setTurn,
  setSelectedLines,
  resetFilterWithLine,
} = managementSlice.actions;

export default managementSlice.reducer;
