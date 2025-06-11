import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { getCarrinhosCount } from '../../api/apiRequests';
import { iCartCount } from '../../interfaces/Carrinhos.interface';
import { useFilters } from '../useFilters';

export const useCartProductionQuery = (scope = 'home') => {
  const { date, turn } = useFilters(scope);

  // Determinar se a data selecionada é hoje
  const isToday = useMemo(() => {
    const today = new Date();
    return date === format(today, 'yyyy-MM-dd');
  }, [date]);

  // Query para contagem de carrinhos
  const cartsQuery = useQuery({
    queryKey: ['carts', date, turn],
    queryFn: async () => {
      const data: iCartCount[] = await getCarrinhosCount(date, date);
      return turn === 'ALL' ? data : data.filter((item) => item.Turno === turn);
    },
    refetchInterval: isToday ? 60000 : false,
  });

  // Calcular total de carrinhos
  const totalCarts = useMemo(() => {
    return (cartsQuery.data || []).reduce((acc, curr) => acc + (curr.Contagem_Carrinhos || 0), 0);
  }, [cartsQuery.data]);

  return {
    cartsData: cartsQuery.data || [],
    totalCarts,
    isLoading: cartsQuery.isLoading,
  };
};
