import { useQuery } from '@tanstack/react-query';
import { getEstoqueAtual } from '../../api/apiRequests';

export const useEstoqueQuery = () => {
  const estoqueQuery = useQuery({
    queryKey: ['estoque'],
    queryFn: () => getEstoqueAtual(),
    refetchInterval: 5 * 60 * 1000, // Atualiza a cada 5 minutos
  });

  return {
    estoqueData: estoqueQuery.data || [],
    isLoading: estoqueQuery.isLoading,
    isFetching: estoqueQuery.isFetching,
    error: estoqueQuery.error,
  };
};
