import { useQuery } from '@tanstack/react-query';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { getInfoIHM } from '../../api/apiRequests';
import { iInfoIHM } from '../../interfaces/InfoIHM.interface';

export const useFullInfoIHMMonthQuery = () => {
  const currentDate = new Date();

  // Usar date-fns para obter o primeiro e último dia do mês
  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);

  // Formatar as datas no formato ISO (YYYY-MM-DD)
  const startDate = format(firstDayOfMonth, 'yyyy-MM-dd');
  const endDate = format(lastDayOfMonth, 'yyyy-MM-dd');

  const params = {
    data: [startDate, endDate],
  };

  const query = useQuery({
    queryKey: ['fullInfoIHMMonth', params],
    queryFn: async (): Promise<iInfoIHM[]> => {
      return getInfoIHM(params);
    },
    refetchInterval: 30 * 60 * 1000, // Atualiza a cada 30 minutos
    staleTime: 30 * 60 * 1000, // Dados são considerados frescos por 30 minutos
  });

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isRefreshing: query.isLoading || query.isFetching,
    error: query.error,
  };
};
