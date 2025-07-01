import { format } from 'date-fns';
import { useCallback, useMemo } from 'react';
import { TurnoID } from '../helpers/constants';
import {
  defaultFilterWithLinesState,
  setFilterType,
  setSelectedDate,
  setSelectedLines,
  setSelectedRange,
  setTurn,
} from '../redux/store/features/filterWithLineSlice';
import { useAppDispatch, useAppSelector } from '../redux/store/hooks';

export const useFiltersWithLines = (scope = 'management') => {
  console.log('useFiltersWithLines render:', scope);
  const dispatch = useAppDispatch();

  const { type, selectedDate, selectedRange, turn, selectedLines } = useAppSelector((state) => {
    return state.filterWithLines.scopeState[scope] || defaultFilterWithLinesState();
  });

  // Verificar se os filtros estão com valores padrão
  const isDefault = useMemo(() => {
    return (
      type === 'single' &&
      selectedDate === format(new Date(), 'yyyy-MM-dd') &&
      selectedRange.startDate === '' &&
      selectedRange.endDate === '' &&
      turn === 'ALL' &&
      selectedLines.length === 0
    );
  }, [type, selectedDate, selectedRange, turn, selectedLines]);

  // Handlers para atualizar filtros
  const updateFilterType = useCallback(
    (newType: 'single' | 'range') => {
      dispatch(setFilterType({ scope, typeDate: newType }));
    },
    [dispatch, scope]
  );

  const updateSelectedDate = useCallback(
    (date: string) => {
      if (date) {
        dispatch(setSelectedDate({ scope, date: date }));
      }
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
      dispatch(setTurn({ scope, TurnoID: newTurn }));
    },
    [dispatch, scope]
  );

  const updateSelectedLines = useCallback(
    (lines: number[]) => {
      dispatch(setSelectedLines({ scope, lines }));
    },
    [dispatch, scope]
  );

  return {
    type,
    selectedDate,
    selectedRange,
    turn,
    selectedLines,
    updateFilterType,
    updateSelectedDate,
    updateSelectedDateRange,
    updateTurn,
    updateSelectedLines,
    isDefault,
  };
};
