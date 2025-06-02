import { useQuery } from '@tanstack/react-query';
import { getMaquinaInfo } from '../../api/apiRequests';
import { useAppSelector } from '../../redux/store/hooks';
import { useMemo } from 'react';
import { format } from 'date-fns';

export interface iMaquinas {
  maquina_id: string;
  linha: number;
  status: string;
  produto: string;
}

export const useLinesQuery = () => {
  const { date, turn } = useAppSelector((state) => state.home.filters);
  const lineMachine = useAppSelector((state) => state.home.lineMachine);

  // Determinar se a data selecionada é hoje
  const isToday = useMemo(() => {
    const today = new Date();
    return date === format(today, 'yyyy-MM-dd');
  }, [date]);

  // Query para máquinas rodando
  const maquinaInfoQuery = useQuery({
    queryKey: ['maquinaInfo', date, turn],
    queryFn: async () => {
      const params = turn === 'ALL' ? { data: date } : { data: date, turno: turn };

      return await getMaquinaInfo(params);
    },
    refetchInterval: isToday ? 30000 : false, // Atualiza a cada 30 segundos se for hoje
  });

  // Processar dados para mostrar máquinas únicas rodando
  const runningMachines = useMemo(() => {
    const data = maquinaInfoQuery.data || [];

    if (data.length === 0) return [];

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
  }, [maquinaInfoQuery.data, lineMachine]);

  return {
    runningMachines,
    isLoading: maquinaInfoQuery.isLoading,
    isFetching: maquinaInfoQuery.isFetching,
    error: maquinaInfoQuery.error,
  };
};
