import { useEffect, useState } from 'react';
import { getIndicator } from '../api/apiRequests';
import { IndicatorType } from '../helpers/constants';
import { iEficiencia, iPerformance, iRepair } from '../interfaces/Indicators.interfaces';

interface IndicatorData {
  efficiency: iEficiencia[];
  performance: iPerformance[];
  repair: iRepair[];
}

export function useIndicatorData(dateRange: string[]) {
  const [data, setData] = useState<IndicatorData>({ efficiency: [], performance: [], repair: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const dateKey = dateRange.join('-');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getIndicator(IndicatorType.EFFICIENCY, dateRange, ['data_registro', 'eficiencia']),
      getIndicator(IndicatorType.PERFORMANCE, dateRange, ['data_registro', 'performance']),
      getIndicator('repair', dateRange, ['data_registro', 'reparo']),
    ])
      .then(([efficiency, performance, repair]: [iEficiencia[], iPerformance[], iRepair[]]) => {
        setData({ efficiency, performance, repair });
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [dateKey]);

  return { data, loading, error };
}
