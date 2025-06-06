import { useMemo } from 'react';
import { getTurnoName, TurnoID } from '../helpers/constants';
import { useAppSelector } from '../redux/store/hooks';
import { useLiveIndicatorsQuery } from './queries/useLiveIndicatorsQuery';

export const useEfficiencyComparison = () => {
  // Obter linha selecionada e outras informações do Redux
  const selectedLine = useAppSelector((state) => state.liveLines.selectedLine);
  const currentTurn = useAppSelector((state) => state.liveLines.selectedShift);

  // Usar hook de query para obter dados
  const { indicators, metrics, isLoading, isFetching } = useLiveIndicatorsQuery(selectedLine);

  // Obter o nome do turno para exibição
  const turnName = useMemo(() => getTurnoName(currentTurn as TurnoID), [currentTurn]);

  // Meta de eficiência poderia vir da configuração ou API
  const meta = 90;

  // Calcular se os valores estão acima da meta
  const isFactoryAboveMeta = (metrics?.monthAverage || 0) >= meta;
  const isTurnAboveMeta = (metrics?.turnAverage || 0) >= meta;
  const isLineAboveMeta = (metrics?.lineAverage || 0) >= meta;
  const isCurrentAboveMeta = indicators.efficiency >= meta;

  return {
    factoryEff: metrics?.monthAverage || 0,
    turnEff: metrics?.turnAverage || 0,
    lineEff: metrics?.lineAverage || 0,
    currentEff: indicators.efficiency,
    currentTurn,
    turnName,
    isLoading,
    isFetching,
    meta,
    isFactoryAboveMeta,
    isTurnAboveMeta,
    isLineAboveMeta,
    isCurrentAboveMeta,
    hasData: (metrics?.monthAverage || 0) > 0,
  };
};
