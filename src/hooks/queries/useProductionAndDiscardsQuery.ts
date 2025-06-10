import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getProduction } from '../../api/apiRequests';
import { TurnoID } from '../../helpers/constants';
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

interface iProductionTotal {
  [key: string]: number;
}

interface UseProductionAndDiscardsOptions {
  date?: string;
  shift?: TurnoID | 'ALL';
  enabled?: boolean;
}

export const useProductionAndDiscardsQuery = (options: UseProductionAndDiscardsOptions = {}) => {
  const { date = new Date().toISOString().split('T')[0], shift, enabled = true } = options;

  const dispatch = useAppDispatch();

  // Busca os dados usando TanStack Query
  const {
    data: rawData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['production', date],
    queryFn: () => getProduction(date),
    enabled,
  });

  // Processa os dados quando disponíveis
  useMemo(() => {
    if (!rawData) return;

    // Filtrar dados pelo turno se especificado e não for ALL
    const filteredData: iProduction[] =
      shift && shift !== 'ALL' ? rawData.filter((prod: iProduction) => prod.turno === shift) : rawData; // Se for ALL ou undefined, usa todos os dados

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

  // Valores computados específicos por escopo
  const productionData = useMemo(() => {
    if (!rawData) return { bagProduction: {}, bolProduction: {}, allProduction: {} };

    // Filtra os dados por turno se solicitado e não for ALL
    const filteredData: iProduction[] =
      shift && shift !== 'ALL' ? rawData.filter((prod: iProduction) => prod.turno === shift) : rawData; // Se for ALL ou undefined, usa todos os dados

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
    error: error ? String(error) : null,
    refetch,
  };
};
