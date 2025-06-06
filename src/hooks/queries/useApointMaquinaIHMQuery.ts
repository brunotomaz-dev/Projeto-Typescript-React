import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { deleteMaquinaIHM, getInfoIHM, getMaquinaIHM } from '../../api/apiRequests';
import { getShiftByTime } from '../../helpers/turn';
import { iInfoIHM } from '../../interfaces/InfoIHM.interface';
import { iMaquinaIHM } from '../../pages/LiveLines/interfaces/maquinaIhm.interface';
import { useFilters } from '../useFilters';

export const useMaquinaIHMQuery = (linha: number, maquinaId?: string) => {
  const { date: selectedDate, turn: selectedShift } = useFilters('liveLines');
  const queryClient = useQueryClient();

  // Verificar se a data selecionada é hoje
  const isToday = format(new Date(), 'yyyy-MM-dd') === selectedDate;

  // Query principal para obter os dados de paradas
  const query = useQuery({
    queryKey: ['maquinaIHM', selectedDate, selectedShift, linha, maquinaId],
    queryFn: async (): Promise<iMaquinaIHM[]> => {
      // Para o dia atual, usar getMaquinaIHM
      if (isToday) {
        const res: iMaquinaIHM[] = await getMaquinaIHM({
          data: selectedDate,
          linha: linha,
          ...(maquinaId ? { maquina_id: maquinaId } : {}),
        });

        // Filtrar por turno
        return res.filter((item) => {
          const shift = getShiftByTime(item.hora_registro);
          return selectedShift === 'ALL' || shift === selectedShift;
        });
      }

      // Para dias anteriores, usar getInfoIHM
      const res: iInfoIHM[] = await getInfoIHM({
        data: selectedDate,
        linha: linha,
        ...(selectedShift !== 'ALL' ? { turno: selectedShift } : {}),
        ...(maquinaId ? { maquina_id: maquinaId } : {}),
      });

      // Converter dados de InfoIHM para o formato MaquinaIHM
      return res
        .filter((item) => item.status !== 'rodando')
        .map((item) => ({
          recno: item.recno,
          data_registro: item.data_registro,
          hora_registro: item.hora_registro,
          fabrica: item.fabrica,
          linha: item.linha,
          maquina_id: item.maquina_id,
          equipamento: item.equipamento,
          motivo: item.motivo,
          problema: item.problema,
          causa: item.causa,
          afeta_eff: item.afeta_eff,
          operador_id: item.operador_id,
          os_numero: item.os_numero,
          s_backup: null,
          _isHistorical: true, // Propriedade para identificar registros históricos
        })) as iMaquinaIHM[];
    },
    refetchInterval: isToday ? 60 * 1000 : false, // Refetch a cada minuto se for hoje
    staleTime: isToday ? 30 * 1000 : 5 * 60 * 1000, // Dados ficam "frescos" por menos tempo se for hoje
  });

  // Mutation para excluir registro
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteMaquinaIHM(id),
    onSuccess: () => {
      // Invalidar a query atual para forçar recarregar os dados
      queryClient.invalidateQueries({
        queryKey: ['maquinaIHM', selectedDate, selectedShift, linha, maquinaId],
      });
    },
  });

  return {
    maquinaIHM: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    hasData: (query.data?.length || 0) > 0,
    isToday,
    deleteStop: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};
