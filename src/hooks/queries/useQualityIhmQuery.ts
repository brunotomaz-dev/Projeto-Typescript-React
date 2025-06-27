import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { getQualityIhmData } from '../../api/apiRequests';
import { getShiftByTime } from '../../helpers/turn';
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
          // Turno conforme horário
          const itemTurn = getShiftByTime(item.hora_registro);
          // Retorna itens que correspondem ao turno selecionado
          return itemTurn === turn;
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

  return {
    data: qualityIhmQuery.data,
    isLoading: qualityIhmQuery.isLoading,
    isFetching: qualityIhmQuery.isFetching,
    error: qualityIhmQuery.error,
  };
};
