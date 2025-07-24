import { useQuery } from '@tanstack/react-query';
import { format, startOfDay } from 'date-fns';
import { getIndicator } from '../../api/apiRequests';
import { IndicatorType } from '../../helpers/constants';
import { iEff, iPerf, iRep } from '../../pages/LiveLines/interfaces/indicator.interfaces';
import { useFilters } from '../useFilters';

interface IndicatorData {
  efficiency: iEff[];
  performance: iPerf[];
  repair: iRep[];
}

interface iEfficiencyComparison {
  linha: number;
  turno: string;
  eficiencia: number;
}

interface iLiveIndicatorsQueryProps {
  selectedLine: number;
  scope?: string;
}

export const useLiveIndicatorsQuery = ({ scope = 'liveLines', selectedLine }: iLiveIndicatorsQueryProps) => {
  // Usar o hook de filtros com escopo específico para LiveLines
  const { date, turn } = useFilters(scope);

  // Verificar se é data atual para determinar refetch interval
  const isToday = date === format(startOfDay(new Date()), 'yyyy-MM-dd');

  // Query principal para indicadores (eficiência, performance, reparo)
  const indicatorsQuery = useQuery({
    queryKey: ['liveIndicators', date, selectedLine, turn],
    queryFn: async (): Promise<IndicatorData> => {
      const [effData, perfData, repData] = await Promise.all([
        getIndicator(IndicatorType.EFFICIENCY, date, [
          'linha',
          'maquina_id',
          'turno',
          'data_registro',
          'total_produzido',
          'eficiencia',
        ]),
        getIndicator(IndicatorType.PERFORMANCE, date, ['linha', 'turno', 'data_registro', 'performance']),
        getIndicator('repair', date, ['linha', 'turno', 'data_registro', 'reparo']),
      ]);

      return {
        efficiency: effData,
        performance: perfData,
        repair: repData,
      };
    },
    refetchInterval: isToday ? 60 * 1000 : false, // Refetch a cada minuto se for hoje
    staleTime: isToday ? 30 * 1000 : 5 * 60 * 1000, // Dados ficam "frescos" por menos tempo se for hoje
  });

  // Query para métricas de eficiência (médias mensais, por turno, etc.)
  const metricsQuery = useQuery({
    queryKey: ['liveEfficiencyMetrics', selectedLine, turn],
    queryFn: async () => {
      // Data inicial do mês atual
      const now = startOfDay(new Date());
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayString = format(firstDay, 'yyyy-MM-dd');

      const data: iEfficiencyComparison[] = await getIndicator(
        IndicatorType.EFFICIENCY,
        [firstDayString],
        ['linha', 'turno', 'eficiencia']
      );

      // Filtra dados válidos
      const filteredData = data.filter((item) => item.eficiencia > 0);

      if (filteredData.length === 0) {
        return {
          monthAverage: 0,
          turnAverage: 0,
          lineAverage: 0,
          lineMatAverage: 0,
          lineVesAverage: 0,
          lineNotAverage: 0,
        };
      }

      // Média da eficiência
      const calculateMetricAverage = (items: iEfficiencyComparison[]): number => {
        if (items.length === 0) return 0;
        return items.reduce((acc, curr) => acc + (Math.round(curr.eficiencia * 100) ?? 0), 0) / items.length;
      };

      // Cálculo de todas as médias
      const monthAverage = calculateMetricAverage(filteredData);

      // Eficiência do turno
      const turnData = filteredData.filter((item) => item.turno === turn);
      const turnAverage = calculateMetricAverage(turnData);

      // Eficiência da linha
      const lineData = filteredData.filter((item) => item.linha === selectedLine);
      const lineAverage = calculateMetricAverage(lineData);

      // Eficiência da linha por turno
      const lineMatData = lineData.filter((item) => item.turno === 'MAT');
      const lineMatAverage = calculateMetricAverage(lineMatData);

      const lineVesData = lineData.filter((item) => item.turno === 'VES');
      const lineVesAverage = calculateMetricAverage(lineVesData);

      const lineNotData = lineData.filter((item) => item.turno === 'NOT');
      const lineNotAverage = calculateMetricAverage(lineNotData);

      return {
        monthAverage,
        turnAverage,
        lineAverage,
        lineMatAverage,
        lineVesAverage,
        lineNotAverage,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Função auxiliar para filtrar dados por linha e turno (com tipos genéricos)
  const filterData = <T extends { linha: number; turno: string }>(data: T[]): T[] => {
    if (turn === 'ALL') {
      return data.filter((item) => item.linha === selectedLine);
    }
    return data.filter((item) => item.linha === selectedLine && item.turno === turn);
  };

  // Filtrar dados com base na linha e turno selecionados
  const filteredData = {
    efficiency: filterData<iEff>(indicatorsQuery.data?.efficiency || []),
    performance: filterData<iPerf>(indicatorsQuery.data?.performance || []),
    repair: filterData<iRep>(indicatorsQuery.data?.repair || []),
  };

  // Helper para calcular médias
  const calculateAverage = <T extends { [K in K1]?: number }, K1 extends string>(
    data: T[],
    indicator: K1
  ): number => {
    const filteredForCalc = data.filter(
      (item) => typeof item[indicator] === 'number' && (item[indicator] as number) > 0
    );

    if (filteredForCalc.length === 0) {
      return 0;
    }

    const average =
      filteredForCalc.reduce((acc, curr) => acc + ((curr[indicator] as number) ?? 0), 0) /
      filteredForCalc.length;
    return average * 100;
  };

  // Calcular indicadores
  const indicators = {
    efficiency: calculateAverage(filteredData.efficiency, 'eficiencia'),
    performance: calculateAverage(filteredData.performance, 'performance'),
    repair: calculateAverage(filteredData.repair, 'reparo'),
    productionTotal: filteredData.efficiency.reduce((acc, curr) => acc + curr.total_produzido, 0),
  };

  // Obter a primeira máquina dos dados filtrados (para seleção automática)
  const machineId = filteredData.efficiency[0]?.maquina_id ?? '';

  return {
    data: indicatorsQuery.data,
    filteredData,
    indicators,
    metrics: metricsQuery.data,
    machineId,
    isLoading: indicatorsQuery.isLoading || metricsQuery.isLoading,
    isFetching: indicatorsQuery.isFetching || metricsQuery.isFetching,
    error: indicatorsQuery.error || metricsQuery.error,
  };
};
