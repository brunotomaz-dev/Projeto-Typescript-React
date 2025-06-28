import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useEffect, useMemo } from 'react';
import { getProductionByProduct } from '../../api/apiRequests';
import { iProduction } from '../../pages/ProductionLive/interfaces/production.interface';
import {
  setRawProductionData,
  setTotalByProductBag,
  setTotalByProductBol,
  setTotalProduction,
} from '../../redux/store/features/productionSlice';
import { useAppDispatch } from '../../redux/store/hooks';
import { useFilters } from '../useFilters';

interface ProductionItem {
  produto: string;
  quantidade: number;
  tipo: 'bolinha' | 'baguete';
}

export const useProductionQuery = (scope = 'home') => {
  const { date, turn } = useFilters(scope);
  const dispatch = useAppDispatch();

  // Determinar se a data selecionada é hoje
  const isToday = useMemo(() => {
    const today = new Date();
    return date === format(today, 'yyyy-MM-dd');
  }, [date]);

  // Query para dados de produção
  const productionQuery = useQuery({
    queryKey: ['production', date, turn],
    queryFn: async () => {
      const data: iProduction[] = await getProductionByProduct([date, date]);
      return turn === 'ALL' ? data : data.filter((item) => item.turno === turn);
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

    return { data, products }; // Retornar tanto os dados brutos quanto processados
  }, [productionQuery.data]);

  // Calcular total de produção por tipo
  const productionByType = useMemo(() => {
    const bolinha = productionDetails.products
      .filter((item) => item.tipo === 'bolinha')
      .reduce((sum, item) => sum + item.quantidade, 0);

    const baguete = productionDetails.products
      .filter((item) => item.tipo === 'baguete')
      .reduce((sum, item) => sum + item.quantidade, 0);

    return {
      bolinha,
      baguete,
      total: bolinha + baguete,
    };
  }, [productionDetails.products]);

  useEffect(() => {
    if (productionQuery.data) {
      // Dispatch dos dados brutos
      dispatch(setRawProductionData(productionDetails.data));
    }
  }, [productionQuery.data, productionDetails.data, dispatch]);

  useEffect(() => {
    // Dispatch dos totais calculados
    dispatch(setTotalProduction(productionByType.total));
    dispatch(setTotalByProductBag(productionByType.baguete));
    dispatch(setTotalByProductBol(productionByType.bolinha));
  }, [productionByType, dispatch]);

  return {
    productionData: productionQuery.data || [],
    productionDetails: productionDetails.products,
    isLoading: productionQuery.isLoading,
    isFetching: productionQuery.isFetching,
    error: productionQuery.error,
    productionByType,
  };
};
