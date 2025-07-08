import { useQuery } from '@tanstack/react-query';
import { format, startOfDay } from 'date-fns';
import { getInfoIHM } from '../../api/apiRequests';
import { iInfoIHM } from '../../interfaces/InfoIHM.interface';
import { useFilters } from '../useFilters';

export const useFullInfoIHMQuery = (scope: string) => {
  // Usar os filtros
  const { date, turn, selectedRange, type } = useFilters(scope);
  // Obtém a data atual
  const today = format(startOfDay(new Date()), 'yyyy-MM-dd');
  // Define os parâmetros de consulta
  const dateParam = type === 'single' ? date : [selectedRange.startDate, selectedRange.endDate];
  const turnParam = turn === 'ALL' ? undefined : turn;
  const params = { data: dateParam, turno: turnParam };

  // Verifica se a data é a de hoje, caso seja single
  const isToday = type === 'single' && date === today;

  // Query
  const query = useQuery({
    queryKey: ['fullInfoIHM', params],
    queryFn: async (): Promise<iInfoIHM[]> => {
      return getInfoIHM(params);
    },
    refetchInterval: isToday ? 60 * 1000 : false,
    staleTime: isToday ? 60 * 1000 : 5 * 60 * 1000,
  });

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isRefreshing: query.isLoading || query.isFetching,
    error: query.error,
  };
};
