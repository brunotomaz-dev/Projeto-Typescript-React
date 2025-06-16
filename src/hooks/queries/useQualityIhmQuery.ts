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
      const response = await getQualityIhmData(date);

      // Se o turno for diferente de ALL, aplica filtro
      if (turn !== 'ALL') {
        const filteredData = response?.filter((item) => {
          // Recebe hora de registro e converte para número
          const itemHour = parseInt(item.hora_registro.split(':')[0], 10);

          if (turn === 'NOT') {
            return itemHour >= 0 && itemHour < 8;
          } else if (turn === 'MAT') {
            return itemHour >= 8 && itemHour < 16;
          } else if (turn === 'VES') {
            return itemHour >= 16 && itemHour < 24;
          }
          return false;
        });
        // Retorna os dados filtrados
        return filteredData;
      } else {
        // Se o turno for ALL, retorna todos os dados
        return response;
      }
    },
    refetchInterval: isToday ? 60000 : false, // Atualiza a cada 60 segundos se for hoje
  });

  // Criar dados de qualidade IHM
  const createQualityIhm = useMutation({
    mutationFn: async (data: any) => await createQualityIhmData(data),
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
