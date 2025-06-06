import { useMemo } from 'react';
import { useAppSelector } from '../redux/store/hooks';
import { useLiveIndicatorsQuery } from './queries/useLiveIndicatorsQuery';

export const useLineAverages = () => {
  // Obter a linha selecionada do Redux
  const selectedLine = useAppSelector((state) => state.liveLines.selectedLine);

  // Reutilizar a consulta que já traz os dados das médias
  const { metrics, isLoading, isFetching, error } = useLiveIndicatorsQuery(selectedLine);

  // Processar e organizar os dados de média por turno
  const averages = useMemo(() => {
    // Dados padrão se não houver métricas disponíveis
    if (!metrics) {
      return {
        matutino: { value: 0, exists: false },
        vespertino: { value: 0, exists: false },
        noturno: { value: 0, exists: false },
      };
    }

    return {
      matutino: {
        value: metrics.lineMatAverage || 0,
        exists: (metrics.lineMatAverage || 0) >= 0,
      },
      vespertino: {
        value: metrics.lineVesAverage || 0,
        exists: (metrics.lineVesAverage || 0) >= 0,
      },
      noturno: {
        value: metrics.lineNotAverage || 0,
        exists: (metrics.lineNotAverage || 0) >= 0,
      },
    };
  }, [metrics]);

  return {
    averages,
    isLoading,
    isFetching,
    error,
    hasData: !!metrics && (averages.matutino.exists || averages.vespertino.exists || averages.noturno.exists),
  };
};
