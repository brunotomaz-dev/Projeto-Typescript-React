import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useEffect, useMemo } from 'react';
import { getProduction } from '../../api/apiRequests';
import { iProduction } from '../../pages/ProductionLive/interfaces/production.interface';
import { iDescartes } from '../../pages/Supervision/interface/Descartes.interface';
import {
  setDescartsData,
  setRawProductionData,
  setTotalByProductBag,
  setTotalByProductBol,
  setTotalProduction,
} from '../../redux/store/features/productionSlice';
import { useAppDispatch } from '../../redux/store/hooks';
import { useFilters } from '../useFilters';

interface iProductionTotal {
  [key: string]: number;
}

export const useProductionAndDiscardsQuery = (scope = 'home') => {
  /* ------------------------------------------------- Hook's ------------------------------------------------ */
  // Busca os dados do filtro de data e turno conforme o escopo
  const { date, turn: shift } = useFilters(scope);

  // Determinar se a data selecionada é hoje
  const isToday = useMemo(() => {
    const today = new Date();
    return date === format(today, 'yyyy-MM-dd');
  }, [date]);

  const dispatch = useAppDispatch();

  // Busca os dados usando TanStack Query
  const {
    data: rawData,
    isLoading,
    error,
    isFetching,
  } = useQuery({
    queryKey: ['production', date],
    queryFn: () => getProduction(date),
    refetchInterval: isToday ? 60000 : false, // Atualiza a cada 60 segundos se for hoje
  });

  // Processamento para um efeito em vez de fazer durante a renderização
  useEffect(() => {
    if (!rawData) return;

    // Filtrar dados pelo turno se especificado e não for ALL
    const filteredData: iProduction[] =
      shift && shift !== 'ALL' ? rawData.filter((prod: iProduction) => prod.turno === shift) : rawData;

    // Armazena os dados brutos no Redux
    dispatch(setRawProductionData(filteredData));

    // Processa os descartes
    const discardsData = filteredData.map((item: iProduction): iDescartes => {
      return {
        linha: item.linha,
        produto: item.produto.trim(),
        descartePaesPasta: item.descarte_paes_pasta,
        descartePaes: item.descarte_paes,
        descartePasta: item.descarte_pasta,
        descarteBdj: item.bdj_vazias,
        reprocessoBdj: item.bdj_retrabalho,
        reprocessoPaes: item.reprocesso_paes,
        reprocessoPaesPasta: item.reprocesso_paes_pasta,
        reprocessoPasta: item.reprocesso_pasta,
      };
    });

    dispatch(setDescartsData(discardsData));

    // Calcula a produção total por produto e converte para caixas
    const productionByType = filteredData.reduce((acc, curr) => {
      const produto = curr.produto.trim();
      acc[produto] = (acc[produto] || 0) + curr.total_produzido / 10;
      return acc;
    }, {} as iProductionTotal);

    // Separa produção por tipo (Bolinha e Baguete)
    const bolProduction = Object.entries(productionByType).reduce((acc, [key, value]) => {
      if (key.includes(' BOL')) {
        acc[key] = value;
      }
      return acc;
    }, {} as iProductionTotal);

    const bagProduction = Object.entries(productionByType).reduce((acc, [key, value]) => {
      if (!key.includes(' BOL')) {
        acc[key] = value;
      }
      return acc;
    }, {} as iProductionTotal);

    // Calcula totais
    const totalBol = Object.values(bolProduction).reduce((sum, val) => sum + val, 0);
    const totalBag = Object.values(bagProduction).reduce((sum, val) => sum + val, 0);
    const totalAll = totalBol + totalBag;

    // Atualiza o Redux com os totais
    dispatch(setTotalByProductBol(totalBol));
    dispatch(setTotalByProductBag(totalBag));
    dispatch(setTotalProduction(totalAll));
  }, [rawData, shift, dispatch]);

  // Memoizar os dados de produção para evitar recálculos desnecessários
  const productionData = useMemo(() => {
    if (!rawData) {
      return {
        bagProduction: {},
        bolProduction: {},
        allProduction: {},
      };
    }

    // Filtrar dados pelo turno se especificado
    const filteredData: iProduction[] =
      shift && shift !== 'ALL' ? rawData.filter((prod: iProduction) => prod.turno === shift) : rawData;

    // Calcula a produção e converte para caixas
    const productionByType = filteredData.reduce((acc, curr) => {
      const produto = curr.produto.trim();
      acc[produto] = (acc[produto] || 0) + curr.total_produzido / 10;
      return acc;
    }, {} as iProductionTotal);

    // Separa por tipo
    const bagProduction = {} as iProductionTotal;
    const bolProduction = {} as iProductionTotal;

    Object.entries(productionByType).forEach(([key, value]) => {
      if (key.includes(' BOL')) {
        bolProduction[key] = value;
      } else {
        bagProduction[key] = value;
      }
    });

    return {
      bagProduction,
      bolProduction,
      allProduction: productionByType,
    };
  }, [rawData, shift]);

  return {
    productionData,
    isLoading,
    isFetching,
    error: error ? String(error) : null,
  };
};
