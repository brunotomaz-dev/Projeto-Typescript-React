import { useQuery } from '@tanstack/react-query';
import { format, startOfDay } from 'date-fns';
import { getInfoIHM } from '../../api/apiRequests';
import { iInfoIhmLive } from '../../pages/LiveLines/interfaces/infoIhm.interface';
import { useFilters } from '../useFilters';

export const useInfoIHMQuery = (line: number) => {
  // Usar filtros com escopo 'liveLines'
  const { date, turn } = useFilters('liveLines');

  // Verificar se é a data atual para determinar refetch interval
  const isToday = date === format(startOfDay(new Date()), 'yyyy-MM-dd');

  // Query para informações do IHM
  const query = useQuery({
    queryKey: ['infoIHM', date, turn, line],
    queryFn: async (): Promise<iInfoIhmLive[]> => {
      const params = turn === 'ALL' ? { data: date, linha: line } : { data: date, linha: line, turno: turn };

      return getInfoIHM(params, [
        'status',
        'data_hora',
        'data_hora_final',
        'motivo',
        'problema',
        'causa',
        'tempo',
        'afeta_eff',
      ]);
    },
    refetchInterval: isToday ? 60 * 1000 : false, // Refetch a cada minuto se for hoje
    staleTime: isToday ? 30 * 1000 : 5 * 60 * 1000, // Dados ficam "frescos" por menos tempo se for hoje
  });

  // Últimas informações do IHM
  const lastInfoIHM = query.data?.at(-1);

  return {
    ihmData: query.data || [],
    lastInfoIHM,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
  };
};
