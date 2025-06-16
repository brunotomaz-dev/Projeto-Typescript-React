import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { getIndicator } from '../../api/apiRequests';
import { iEficiencia, iPerformance, iRepair } from '../../interfaces/Indicators.interfaces';
import { useFilters } from '../useFilters';

export const useIndicatorsQuery = (scope = 'home', enabled = true) => {
  const { date, turn } = useFilters(scope);

  // Determinar se a data selecionada é hoje
  const isToday = useMemo(() => {
    const today = new Date();
    return date === format(today, 'yyyy-MM-dd');
  }, [date]);

  // Query para eficiência
  const efficiencyQuery = useQuery({
    queryKey: ['indicators', 'efficiency', date, turn],
    queryFn: async () => {
      const data: iEficiencia[] = await getIndicator('eficiencia', date);
      return turn === 'ALL' ? data : data.filter((item) => item.turno === turn);
    },
    enabled,
    refetchInterval: isToday ? 60000 : false, // Atualiza a cada minuto se for hoje
  });

  // Query para performance
  const performanceQuery = useQuery({
    queryKey: ['indicators', 'performance', date, turn],
    queryFn: async () => {
      const data: iPerformance[] = await getIndicator('performance', date);
      return turn === 'ALL' ? data : data.filter((item) => item.turno === turn);
    },
    enabled,
    refetchInterval: isToday ? 60000 : false,
  });

  // Query para reparo
  const repairQuery = useQuery({
    queryKey: ['indicators', 'repair', date, turn],
    queryFn: async () => {
      const data: iRepair[] = await getIndicator('repair', date);
      return turn === 'ALL' ? data : data.filter((item) => item.turno === turn);
    },
    enabled,
    refetchInterval: isToday ? 60000 : false,
  });

  // Calcular médias
  const efficiencyAverage = useMemo(() => {
    const filteredData = (efficiencyQuery.data || []).filter((item) => item.eficiencia > 0);
    return filteredData.length > 0
      ? filteredData.reduce((acc, curr) => acc + curr.eficiencia, 0) / filteredData.length
      : 0;
  }, [efficiencyQuery.data]);

  const performanceAverage = useMemo(() => {
    const data = performanceQuery.data || [];
    return data.length > 0 ? data.reduce((acc, curr) => acc + curr.performance, 0) / data.length : 0;
  }, [performanceQuery.data]);

  const repairAverage = useMemo(() => {
    const data = repairQuery.data || [];
    return data.length > 0 ? data.reduce((acc, curr) => acc + curr.reparo, 0) / data.length : 0;
  }, [repairQuery.data]);

  // Mapa de máquinas para linhas
  const lineMachineMap = useMemo(() => {
    const data = efficiencyQuery.data || [];
    return data.reduce<Record<string, number>>((acc, curr) => {
      acc[curr.maquina_id] = curr.linha;
      return acc;
    }, {});
  }, [efficiencyQuery.data]);

  return {
    efficiency: {
      data: efficiencyQuery.data || [],
      isLoading: efficiencyQuery.isLoading,
      error: efficiencyQuery.error,
      average: efficiencyAverage,
    },
    performance: {
      data: performanceQuery.data || [],
      isLoading: performanceQuery.isLoading,
      error: performanceQuery.error,
      average: performanceAverage,
    },
    repair: {
      data: repairQuery.data || [],
      isLoading: repairQuery.isLoading,
      error: repairQuery.error,
      average: repairAverage,
    },
    lineMachineMap,
    isLoading: efficiencyQuery.isLoading || performanceQuery.isLoading || repairQuery.isLoading,
    isFetching: efficiencyQuery.isFetching || performanceQuery.isFetching || repairQuery.isFetching,
  };
};
