import { useQuery } from '@tanstack/react-query';
import { format, startOfDay } from 'date-fns';
import { useEffect } from 'react';
import { getMaquinaInfo } from '../../api/apiRequests';
import { iMaquinaInfo } from '../../pages/LiveLines/interfaces/maquinaInfo.interface';
import { setMachineStatus } from '../../redux/store/features/liveLinesSlice';
import { useAppDispatch } from '../../redux/store/hooks';
import { useFilters } from '../useFilters';

export const useMachineInfoQuery = (machineId: string) => {
  // Dispatch para Redux
  const dispatch = useAppDispatch();

  // Usar filtros com escopo 'liveLines'
  const { date, turn } = useFilters('liveLines');

  // Verificar se é a data atual para determinar refetch interval
  const isToday = date === format(startOfDay(new Date()), 'yyyy-MM-dd');

  // Query para informações da máquina
  const query = useQuery({
    queryKey: ['machineInfo', date, turn, machineId],
    queryFn: async (): Promise<iMaquinaInfo[]> => {
      // Se não tem ID de máquina, retorna array vazio
      if (!machineId) return [];

      const params =
        turn === 'ALL'
          ? { data: date, maquina_id: machineId }
          : { data: date, turno: turn, maquina_id: machineId };

      return getMaquinaInfo(params, [
        'ciclo_1_min',
        'hora_registro',
        'produto',
        'recno',
        'status',
        'tempo_parada',
      ]);
    },
    enabled: !!machineId, // Só executa se houver um ID de máquina
    refetchInterval: machineId && isToday ? 60 * 1000 : false, // Refetch a cada minuto se for hoje e tiver máquina
    staleTime: isToday ? 30 * 1000 : 5 * 60 * 1000, // Dados ficam "frescos" por menos tempo se for hoje
  });

  // Últimas informações da máquina
  const lastMachineInfo = query.data?.at(-1);
  const status = lastMachineInfo?.status || '-';

  // Efeito para atualizar o status no Redux
  useEffect(() => {
    dispatch(setMachineStatus(status));
  }, [status, dispatch]);

  return {
    machineInfo: query.data || [],
    lastMachineInfo,
    status,
    product: lastMachineInfo?.produto?.trim() || '-',
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
  };
};
