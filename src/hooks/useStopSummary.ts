import { useMemo } from 'react';
import { calculateStopSummary, StopSummaryResult } from '../helpers/stopSummaryCalculator';
import { iInfoIHM } from '../interfaces/InfoIHM.interface';
import { iInfoIhmLive } from '../pages/LiveLines/interfaces/infoIhm.interface';

interface CycleData {
  ciclo_1_min: number;
  produto: string;
}

export const useStopSummary = (
  data: iInfoIHM[] | iInfoIhmLive[],
  cycleData: CycleData[]
): StopSummaryResult => {
  return useMemo(() => {
    if (!data || !cycleData) {
      return {
        stopSummary: [],
        totalStopTime: 0,
        totalRunTime: 0,
        cycleLostTime: 0,
      };
    }
    return calculateStopSummary(data, cycleData);
  }, [data, cycleData]);
};
