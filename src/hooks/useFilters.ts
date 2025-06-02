import { format } from 'date-fns';
import { useCallback, useMemo } from 'react';
import { TurnoID } from '../helpers/constants';
import { copyFilters, resetDateTurnFilter, setDate, setTurn } from '../redux/store/features/filterSlice';
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
      };
    }

    // Caso contrário, retorna os filtros do escopo
    return state.filters.dateTurn[scope];
  });

  const { date, turn } = filters;

  // Verificar se os filtros estão com valores padrão
  const isDefault = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return date === today && turn === 'ALL';
  }, [date, turn]);

  // Handlers para atualizar filtros
  const setDateFilter = useCallback(
    (newDate: Date | null) => {
      if (newDate) {
        dispatch(setDate({ scope, date: format(newDate, 'yyyy-MM-dd') }));
      }
    },
    [dispatch, scope]
  );

  const setTurnFilter = useCallback(
    (newTurn: TurnoID | 'ALL') => {
      dispatch(setTurn({ scope, turn: newTurn }));
    },
    [dispatch, scope]
  );

  const resetFilters = useCallback(() => {
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
    date,
    turn,
    isDefault,
    setDateFilter,
    setTurnFilter,
    resetFilters,
    importFiltersFrom,
  };
};
