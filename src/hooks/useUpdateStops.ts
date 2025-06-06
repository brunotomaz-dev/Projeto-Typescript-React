import { useAppSelector } from '../redux/store/hooks';
import { useMaquinaIHMQuery } from './queries/useApointMaquinaIHMQuery';

export const useUpdateStops = () => {
  // Selecionar dados do Redux
  const selectedLine = useAppSelector((state) => state.liveLines.selectedLine);
  const selectedMachine = useAppSelector((state) => state.liveLines.selectedMachine);
  const selectedDate = useAppSelector((state) => state.liveLines.selectedDate);
  const selectedShift = useAppSelector((state) => state.liveLines.selectedShift);

  // Usar o hook de query especializado
  const { maquinaIHM, isLoading, isFetching, error, hasData, isToday, deleteStop, isDeleting } =
    useMaquinaIHMQuery(selectedLine, selectedMachine || undefined);

  return {
    maquinaIHM,
    loading: isLoading,
    isFetching,
    error: error ? String(error) : null,
    isToday,
    deleteStop,
    isDeleting,
    selectedLine,
    selectedMachine,
    selectedDate,
    selectedShift,
    hasData,
  };
};
