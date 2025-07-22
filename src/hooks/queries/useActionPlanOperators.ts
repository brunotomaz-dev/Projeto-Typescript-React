import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createActionPlan, getActionPlan, updateActionPlan } from '../../api/apiRequests';
import { iActionPlan } from '../../interfaces/ActionPlan.interface';

// Tipos para as queries
interface UseActionPlanOperatorsQueryOptions {
  data?: string | string[];
  conclusao?: number | number[];
  enabled?: boolean;
}

interface ActionPlanCreateData extends Omit<iActionPlan, 'recno'> {}

interface ActionPlanUpdateData extends iActionPlan {}

/**
 * Hook para buscar planos de ação (específico para operadores)
 */
export const useActionPlanOperatorsQuery = (options: UseActionPlanOperatorsQueryOptions = {}) => {
  const { data, conclusao, enabled = true } = options;

  return useQuery({
    queryKey: ['actionPlanOperators', data, conclusao],
    queryFn: async () => await getActionPlan(data, conclusao),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

/**
 * Hook para criar plano de ação
 */
export const useCreateActionPlanOperatorsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ActionPlanCreateData) => await createActionPlan(data),
    onSuccess: () => {
      // Invalida todas as queries relacionadas ao action plan
      queryClient.invalidateQueries({ queryKey: ['actionPlanOperators'] });
    },
    onError: (error: any) => {
      console.error('Erro ao criar plano de ação:', error);
    },
  });
};

/**
 * Hook para atualizar plano de ação
 */
export const useUpdateActionPlanOperatorsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ActionPlanUpdateData) => await updateActionPlan(data),
    onSuccess: () => {
      // Invalida todas as queries relacionadas ao action plan
      queryClient.invalidateQueries({ queryKey: ['actionPlanOperators'] });
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar plano de ação:', error);
    },
  });
};

/**
 * Hook combinado para facilitar o uso
 */
export const useActionPlanOperators = (queryOptions: UseActionPlanOperatorsQueryOptions = {}) => {
  const query = useActionPlanOperatorsQuery(queryOptions);
  const createMutation = useCreateActionPlanOperatorsMutation();
  const updateMutation = useUpdateActionPlanOperatorsMutation();

  return {
    // Query data
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,

    // Mutations
    createActionPlan: createMutation.mutate,
    updateActionPlan: updateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isMutating: createMutation.isPending || updateMutation.isPending,
  };
};
