import { useMutation, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { createQualityIhmData, getQualityIhmData } from '../../api/apiRequests';
import { queryClient } from '../../lib/react-query';
import { useFilters } from '../useFilters';

export const useQualityIhmQuery = (scope: string = 'home') => {
  /* ------------------------------------------------- Hook's ------------------------------------------------ */
  // Busca os dados do filtro de data e turno conformado com o escopo
  const { date, turn } = useFilters(scope);

  // Determina se a data selecionada é hoje
  const isToday = useMemo(() => {
    const today = new Date();
    return date === format(today, 'yyyy-MM-dd');
  }, [date]);

  // Query para buscar os dados de qualidade IHM
  const qualityIhmQuery = useQuery({
    queryKey: ['qualityIhm', date, turn],
    queryFn: async () => {
      return await getQualityIhmData(date);
    },
    refetchInterval: isToday ? 60000 : false, // Atualiza a cada 60 segundos se for hoje
  });

  // Criar dados de qualidade IHM
  const createQualityIhm = useMutation({
    mutationFn: async (data: any) => createQualityIhmData(data),
    onSuccess: () => {
      // Invalida a query para forçar uma nova busca
      queryClient.invalidateQueries({
        queryKey: ['qualityIhm', date, turn],
      });
      // Faz um refetch dos dados
      qualityIhmQuery.refetch();
    },
  });

  return {
    data: qualityIhmQuery.data,
    isLoading: qualityIhmQuery.isLoading,
    isFetching: qualityIhmQuery.isFetching,
    error: qualityIhmQuery.error,
    createData: createQualityIhm.mutate,
    isCreateSuccess: createQualityIhm.isSuccess,
    isCreateError: createQualityIhm.isError,
  };
};
