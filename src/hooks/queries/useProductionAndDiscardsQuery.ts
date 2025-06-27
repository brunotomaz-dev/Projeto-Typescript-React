import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useEffect, useMemo } from 'react';
import { getProduction } from '../../api/apiRequests';
import { iProdDescartes } from '../../pages/ProductionLive/interfaces/production.interface';
import { iDescartes } from '../../pages/Supervision/interface/Descartes.interface';
import { setDescartsData } from '../../redux/store/features/productionSlice';
import { useAppDispatch } from '../../redux/store/hooks';
import { useFilters } from '../useFilters';

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
    const filteredData: iProdDescartes[] =
      shift && shift !== 'ALL' ? rawData.filter((prod: iProdDescartes) => prod.turno === shift) : rawData;

    // Processa os descartes
    const discardsData = filteredData.map((item: iProdDescartes): iDescartes => {
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
  }, [rawData, shift, dispatch]);

  return {
    isLoading,
    isFetching,
    error: error ? String(error) : null,
  };
};
