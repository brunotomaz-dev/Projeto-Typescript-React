import { useAppSelector } from '../redux/store/hooks';
import { useLiveIndicatorsQuery } from './queries/useLiveIndicatorsQuery';
import { useMachineInfoQuery } from './queries/useLiveMachineInfoQuery';

export const useProductionData = () => {
  // Obter a linha selecionada do Redux
  const selectedLine = useAppSelector((state) => state.liveLines.selectedLine);
  // Obter o ID da máquina do Redux
  const machineId = useAppSelector((state) => state.liveLines.selectedMachine);

  // Utilizar os hooks de query existentes
  const { indicators, isLoading: indicatorsLoading } = useLiveIndicatorsQuery(selectedLine);
  const { product, isLoading: machineLoading } = useMachineInfoQuery(machineId);

  return {
    productionTotal: indicators.productionTotal,
    produto: product,
    isLoading: indicatorsLoading || machineLoading,
  };
};
