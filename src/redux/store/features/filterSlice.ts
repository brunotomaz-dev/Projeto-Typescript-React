import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { format, startOfDay } from 'date-fns';
import { TurnoID } from '../../../helpers/constants';
import { getShift } from '../../../helpers/turn';

// Definir tipos para filtros
export type DateTurnFilter = {
  date: string;
  turn: TurnoID | 'ALL';
};

interface FiltersState {
  dateTurn: Record<string, DateTurnFilter>;
}

// Valor padrão para filtros de data/turno
const defaultDateTurnFilter = (): DateTurnFilter => ({
  date: format(startOfDay(new Date()), 'yyyy-MM-dd'),
  turn: 'ALL',
});

// Turno atual padrão
const alternativeDefaultTurnFilter = (): DateTurnFilter => ({
  date: format(startOfDay(new Date()), 'yyyy-MM-dd'),
  turn: getShift(),
});

// Estado inicial com apenas alguns escopos comuns pré-definidos
const initialState: FiltersState = {
  dateTurn: {
    home: defaultDateTurnFilter(),
    liveLines: alternativeDefaultTurnFilter(),
    // Não precisamos pré-definir todos os escopos possíveis
  },
};

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
      state.dateTurn[scope] =
        scope === 'liveLines' ? alternativeDefaultTurnFilter() : defaultDateTurnFilter();
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
  },
});

export const { setDate, setTurn, resetDateTurnFilter, copyFilters } = filtersSlice.actions;

export default filtersSlice.reducer;
