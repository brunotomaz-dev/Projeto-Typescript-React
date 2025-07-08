import { useMemo } from 'react';
import { useAppSelector } from '../redux/store/hooks';
import { useMaqInfoQuery } from './queries/useMaqInfoQuery';

export interface iMaquinas {
  maquina_id: string;
  linha: number;
  status: string;
  produto: string;
}

const useRunningLines = (scope = 'home') => {
  /* ------------------------------------------------- Hooks ------------------------------------------------- */
  const { data, isLoading, isFetching, error } = useMaqInfoQuery(scope);
  const lineMachine = useAppSelector((state) => state.home.lineMachine);

  /* ----------------------------------------------- Functions ----------------------------------------------- */
  // Processar dados para mostrar máquinas únicas rodando
  const runningMachines = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Ordenar por recno decrescente (mais recentes primeiro)
    const sortedData = [...data].sort((a, b) => b.recno - a.recno);

    // Pegar apenas a entrada mais recente de cada máquina
    const uniqueMachines = sortedData.reduce<Record<string, iMaquinas>>((acc, curr) => {
      if (!acc[curr.maquina_id]) {
        acc[curr.maquina_id] = {
          maquina_id: curr.maquina_id,
          linha: lineMachine[curr.maquina_id] ?? 0,
          status: curr.status === 'true' ? 'Rodando' : 'Parada',
          produto: curr.produto.trim(),
        };
      }
      return acc;
    }, {});

    // Converter para array, filtrar apenas rodando e ordenar por linha
    return Object.values(uniqueMachines)
      .filter((machine) => machine.status === 'Rodando')
      .sort((a, b) => a.linha - b.linha);
  }, [data, lineMachine]);

  return {
    runningMachines,
    isLoading,
    isFetching,
    error,
  };
};

export default useRunningLines;
