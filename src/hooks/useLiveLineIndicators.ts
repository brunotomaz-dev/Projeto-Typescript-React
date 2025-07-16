import { useAppSelector } from '../redux/store/hooks';
import { useLiveIndicatorsQuery } from './queries/useLiveIndicatorsQuery';

export const useLineIndicators = () => {
  // Obter a linha selecionada do Redux
  const selectedLine = useAppSelector((state) => state.liveLines.selectedLine);

  // Utilizar o hook de query existente
  const { indicators, isLoading, isFetching, error } = useLiveIndicatorsQuery({ selectedLine });

  return {
    efficiency: indicators.efficiency,
    performance: indicators.performance,
    repair: indicators.repair,
    isLoading,
    isFetching,
    error,
  };
};
