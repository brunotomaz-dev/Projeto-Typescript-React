import { useMutation } from '@tanstack/react-query';
import { createQualityIhmData } from '../../api/apiRequests';
import { iQualidadeIHMCreate } from '../../interfaces/QualidadeIHM.interface';
import { queryClient } from '../../lib/react-query';
import { useFilters } from '../useFilters';

export const useQualityIhmMutation = (scope: string = 'home') => {
  /* ------------------------------------------------- Hook's ------------------------------------------------ */
  // Busca os dados do filtro de data e turno conformado com o escopo
  const { date, turn } = useFilters(scope);

  // Criar dados de qualidade IHM
  const createQualityIhm = useMutation({
    mutationFn: async (data: iQualidadeIHMCreate) => await createQualityIhmData(data),
    onSuccess: () => {
      // Invalida a query para forçar uma nova busca
      queryClient.invalidateQueries({
        queryKey: ['qualityIhm', date, turn],
      });
    },
  });

  return {
    createData: (data: iQualidadeIHMCreate, options?: { onSuccess?: () => void; onError?: () => void }) =>
      createQualityIhm.mutate(data, {
        onSuccess: () => {
          options?.onSuccess?.();
        },
        onError: () => {
          options?.onError?.();
        },
      }),
    isSuccess: createQualityIhm.isSuccess,
    Error: createQualityIhm.isError,
  };
};
