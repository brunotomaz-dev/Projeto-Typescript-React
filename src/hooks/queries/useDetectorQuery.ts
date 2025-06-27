import { useMutation, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { createDetectorData, getDetectorData } from '../../api/apiRequests';
import { iDetectorData } from '../../interfaces/Detector.interface';
import { queryClient } from '../../lib/react-query';
import { useFilters } from '../useFilters';

export const useDetectorQuery = (scope: string = 'home') => {
  /* ------------------------------------------------- Hooks ------------------------------------------------- */
  // Dados de filtro de data e turno conforme o escopo
  const { date, turn } = useFilters(scope);

  const isToday = useMemo(() => {
    const today = new Date();
    return date === format(today, 'yyyy-MM-dd');
  }, [date]);

  // Query para buscar os dados do detector
  const detectorQuery = useQuery({
    queryKey: ['detector', date, turn],
    queryFn: async () => {
      const response: iDetectorData[] = await getDetectorData(date);
      return response;
    },
    refetchInterval: isToday ? 60 * 1000 : false,
  });

  // Cria dados no DB
  const createDetector = useMutation({
    mutationFn: async (data: iDetectorData) => {
      const response = await createDetectorData(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['detector', date, turn],
      });
      detectorQuery.refetch();
    },
  });

  return {
    createData: (data: iDetectorData, options?: { onSuccess?: () => void; onError?: () => void }) =>
      createDetector.mutate(data, {
        onSuccess: () => {
          options?.onSuccess?.();
        },
        onError: () => {
          options?.onError?.();
        },
      }),
    data: detectorQuery.data,
    isLoading: detectorQuery.isLoading,
    isFetching: detectorQuery.isFetching,
    isSuccess: detectorQuery.isSuccess,
    isError: detectorQuery.isError || createDetector.isError,
    error: detectorQuery.error,
  };
};
