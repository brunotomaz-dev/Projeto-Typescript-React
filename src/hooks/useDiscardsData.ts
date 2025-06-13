import { useEffect, useMemo } from 'react';
import { iQualDescartesGroupedByLine } from '../interfaces/QualidadeIHM.interface';
import { setDiscardsGroupedByLine } from '../redux/store/features/discardsSlice';
import { useAppDispatch } from '../redux/store/hooks';
import { useQualityIhmQuery } from './queries/useQualityIhmQuery';

const useDiscardsData = (scope = 'home') => {
  /* ------------------------------------------------- Hook's ------------------------------------------------ */
  // Faz a requisição dos dados de descartes
  const { data, isLoading, error, isFetching } = useQualityIhmQuery(scope);
  const dispatch = useAppDispatch();

  // Processar dados dentro de useMemo para evitar cálculos desnecessários
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Renomear propriedades do objeto para manter a compatibilidade com o Redux
    const data_adjusted = data.map((item) => ({
      linha: item.linha,
      data_registro: item.data_registro,
      maquina_id: item.maquina_id,
      descarteBdj: item.bdj_vazias,
      descartePaes: item.descarte_paes,
      descartePaesPasta: item.descarte_paes_pasta,
      descartePasta: item.descarte_pasta,
      reprocessoBdj: item.reprocesso_bdj,
      reprocessoPaes: item.reprocesso_paes,
      reprocessoPaesPasta: item.reprocesso_paes_pasta,
      reprocessoPasta: item.reprocesso_pasta,
    })) as iQualDescartesGroupedByLine[];

    // Agrupa os dados de descartes por linha
    const groupedData = data_adjusted.reduce<Array<(typeof data_adjusted)[0]>>((acc, item) => {
      const existing = acc.find(
        (entry) => entry.linha === item.linha && entry.data_registro === item.data_registro
      );
      if (existing) {
        existing.descarteBdj += item.descarteBdj;
        existing.descartePasta += item.descartePasta;
        existing.descartePaes += item.descartePaes;
        existing.descartePaesPasta += item.descartePaesPasta;
        existing.reprocessoPasta += item.reprocessoPasta;
        existing.reprocessoPaes += item.reprocessoPaes;
        existing.reprocessoPaesPasta += item.reprocessoPaesPasta;
        existing.reprocessoBdj += item.reprocessoBdj;
      } else {
        acc.push({ ...item });
      }
      return acc;
    }, []);

    // Ordenar por linha
    return [...groupedData].sort((a, b) => a.linha - b.linha);
  }, [data]); // Depende apenas de data

  // Faz o dispatch para o Redux
  useEffect(() => {
    if (!isLoading) {
      dispatch(setDiscardsGroupedByLine(processedData));
    }
  }, [processedData, isLoading, dispatch]);

  return {
    data: processedData,
    isLoading,
    error: error ? String(error) : null,
    isFetching,
  };
};

export default useDiscardsData;
