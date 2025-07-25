import { useAppSelector } from '../redux/store/hooks';
import { useInfoIHMQuery } from './queries/useLiveInfoIHMQuery';
import { useMachineInfoQuery } from './queries/useLiveMachineInfoQuery';

export const useBarStopsData = () => {
  // Obter linha selecionada do Redux
  const selectedLine = useAppSelector((state) => state.liveLines.selectedLine);

  // Obter máquina selecionada do Redux
  const machineId = useAppSelector((state) => state.liveLines.selectedMachine);

  // Utilizar os hooks de query existentes
  const { ihmData, isLoading: ihmLoading, isFetching: ihmFetching } = useInfoIHMQuery({ selectedLine });
  const {
    machineInfo,
    isLoading: machineLoading,
    isFetching: machineFetching,
  } = useMachineInfoQuery({ machineId });

  return {
    data: ihmData,
    cycleData: machineInfo,
    isLoading: ihmLoading || machineLoading,
    isFetching: ihmFetching || machineFetching,
    isRefreshing: ihmFetching || machineFetching || ihmLoading || machineLoading,
  };
};
