import { format } from 'date-fns';
import { useCallback, useMemo } from 'react';
import { TurnoID } from '../helpers/constants';
import { getShift } from '../helpers/turn';
import {
  alternativeScopes,
  copyFilters,
  resetDateTurnFilter,
  setDate,
  setFilterType,
  setIsResetLines,
  setSelectedLines,
  setSelectedRange,
  setTurn,
} from '../redux/store/features/filterSlice';
import { useAppDispatch, useAppSelector } from '../redux/store/hooks';

export const useFilters = (scope = 'home') => {
  const dispatch = useAppDispatch();

  // Buscar os filtros do estado do Redux de forma segura
  const filters = useAppSelector((state) => {
    // Se o escopo não existir ainda, retorna valores padrão
    if (!state.filters.dateTurn[scope]) {
      return {
        date: format(new Date(), 'yyyy-MM-dd'),
        turn: 'ALL' as const,
        type: 'single' as const,
        selectedRange: {
          startDate: '',
          endDate: '',
        },
        selectedLines: [],
        isResetLines: false,
      };
    }

    // Caso contrário, retorna os filtros do escopo
    return state.filters.dateTurn[scope];
  });

  const {
    date,
    turn,
    type = 'single',
    selectedRange = { startDate: '', endDate: '' },
    selectedLines = [],
    isResetLines = false,
  } = filters;

  // Verificar se os filtros estão com valores padrão
  const isDefault = useMemo(() => {
    const shift = getShift();
    const today = format(new Date(), 'yyyy-MM-dd');
    const isDefaultDate = date === today;
    const isDefaultTurn = alternativeScopes.includes(scope) ? turn === shift : turn === 'ALL';
    const isDefaultType = type === 'single';
    const isDefaultRange = selectedRange.startDate === '' && selectedRange.endDate === '';
    const isDefaultLines = selectedLines.length === 0;

    return isDefaultDate && isDefaultTurn && isDefaultType && isDefaultRange && isDefaultLines;
  }, [date, turn, type, selectedRange, selectedLines, scope]);

  // Handlers para atualizar filtros
  const updateFilterType = useCallback(
    (newType: 'single' | 'range') => {
      dispatch(setFilterType({ scope, typeDate: newType }));
    },
    [dispatch, scope]
  );

  const updateSelectedDate = useCallback(
    (dateValue: string | Date | null) => {
      let formattedDate: string;

      if (dateValue instanceof Date) {
        formattedDate = format(dateValue, 'yyyy-MM-dd');
      } else if (typeof dateValue === 'string') {
        formattedDate = dateValue;
      } else {
        return; // Se for null, não faz nada
      }

      dispatch(setDate({ scope, date: formattedDate }));
    },
    [dispatch, scope]
  );

  const updateSelectedDateRange = useCallback(
    (startDate: string, endDate: string) => {
      dispatch(
        setSelectedRange({
          scope,
          startDate: startDate,
          endDate: endDate,
        })
      );
    },
    [dispatch, scope]
  );

  const updateTurn = useCallback(
    (newTurn: TurnoID | 'ALL') => {
      dispatch(setTurn({ scope, turn: newTurn }));
    },
    [dispatch, scope]
  );

  const updateSelectedLines = useCallback(
    (lines: number[]) => {
      dispatch(setSelectedLines({ scope, lines }));
    },
    [dispatch, scope]
  );

  const resetFilters = useCallback(() => {
    setTimeout(() => {
      dispatch(setIsResetLines({ scope, reset: true }));
    }, 10);
    dispatch(resetDateTurnFilter(scope));
  }, [dispatch, scope]);

  // Método para copiar filtros de outro escopo
  const importFiltersFrom = useCallback(
    (fromScope: string) => {
      dispatch(copyFilters({ from: fromScope, to: scope }));
    },
    [dispatch, scope]
  );
  return {
    // Propriedades principais
    date,
    turn,
    type,
    selectedRange,
    selectedLines,
    isResetLines,
    isDefault,

    // Métodos padronizados
    updateFilterType,
    updateSelectedDate,
    updateSelectedDateRange,
    updateTurn,
    updateSelectedLines,
    resetFilters,
    importFiltersFrom,
  };
};
