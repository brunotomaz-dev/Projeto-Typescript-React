import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { getCarrinhosCount, getProduction } from '../../api/apiRequests';
import { iCartCount } from '../../interfaces/Carrinhos.interface';
import { iProduction } from '../../pages/ProductionLive/interfaces/production.interface';
import { useFilters } from '../useFilters';

interface ProductionItem {
  produto: string;
  quantidade: number;
  tipo: 'bolinha' | 'baguete';
}

export const useProductionQuery = (scope = 'home') => {
  const { date, turn } = useFilters(scope);

  // Determinar se a data selecionada é hoje
  const isToday = useMemo(() => {
    const today = new Date();
    return date === format(today, 'yyyy-MM-dd');
  }, [date]);

  // Query para dados de produção
  const productionQuery = useQuery({
    queryKey: ['production', date, turn],
    queryFn: async () => {
      const data: iProduction[] = await getProduction(date);
      return turn === 'ALL' ? data : data.filter((item) => item.turno === turn);
    },
    refetchInterval: isToday ? 60000 : false,
  });

  // Query para contagem de carrinhos
  const cartsQuery = useQuery({
    queryKey: ['carts', date, turn],
    queryFn: async () => {
      const data: iCartCount[] = await getCarrinhosCount(date, date);
      return turn === 'ALL' ? data : data.filter((item) => item.Turno === turn);
    },
    refetchInterval: isToday ? 60000 : false,
  });

  // Agrupar produção por produto individual (em vez de apenas por tipo)
  const productionDetails = useMemo(() => {
    const data = productionQuery.data || [];

    // Agrupar por produto específico
    const productMap = new Map<string, number>();

    data.forEach((item) => {
      const produto = item.produto.trim();
      const atual = productMap.get(produto) || 0;
      productMap.set(produto, atual + item.total_produzido);
    });

    // Converter para array de objetos com tipo (bolinha/baguete)
    const products: ProductionItem[] = Array.from(productMap.entries())
      .map(([produto, quantidade]) => {
        const tipo = produto.includes(' BOL') ? ('bolinha' as const) : ('baguete' as const);
        return { produto, quantidade, tipo };
      })
      .sort((a, b) => a.produto.localeCompare(b.produto));

    return products;
  }, [productionQuery.data]);

  // Calcular total de produção por tipo
  const productionByType = useMemo(() => {
    // Calcular totais a partir dos detalhes de produtos
    const bolinha = productionDetails
      .filter((item) => item.tipo === 'bolinha')
      .reduce((sum, item) => sum + item.quantidade, 0);

    const baguete = productionDetails
      .filter((item) => item.tipo === 'baguete')
      .reduce((sum, item) => sum + item.quantidade, 0);

    return {
      bolinha,
      baguete,
      total: bolinha + baguete,
    };
  }, [productionDetails]);

  // Calcular total de carrinhos
  const totalCarts = useMemo(() => {
    return (cartsQuery.data || []).reduce((acc, curr) => acc + (curr.Contagem_Carrinhos || 0), 0);
  }, [cartsQuery.data]);

  return {
    productionData: productionQuery.data || [],
    productionDetails, // Nova propriedade com detalhes por produto
    cartsData: cartsQuery.data || [],
    isLoading: productionQuery.isLoading || cartsQuery.isLoading,
    isFetching: productionQuery.isFetching || cartsQuery.isFetching,
    error: productionQuery.error || cartsQuery.error,
    productionByType,
    totalCarts,
  };
};
