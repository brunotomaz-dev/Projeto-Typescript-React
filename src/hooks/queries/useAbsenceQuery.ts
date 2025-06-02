import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { getAbsenceData, getPresenceData } from '../../api/apiRequests';
import { iAbsence, iPresence } from '../../interfaces/Absence.interface';
import { useAppSelector } from '../../redux/store/hooks';

// Constantes para tipos de ausência
const ABSENCE_TYPES = {
  FALTA: 'Falta',
  ATESTADO: 'Atestado',
  ATRASO: 'Atraso',
  AFASTAMENTO: 'Afastamento',
  SAIDA_ANTECIPADA: 'Saída Antecipada',
  REMANEJAMENTO: 'Remanejamento',
  FERIAS: 'Férias',
};

export const useAbsenceQuery = () => {
  const { date, turn } = useAppSelector((state) => state.home.filters);

  // Determinar se a data selecionada é hoje
  const isToday = useMemo(() => {
    const today = new Date();
    return date === format(today, 'yyyy-MM-dd');
  }, [date]);

  // Query para dados de ausência do dia específico
  const absenceDayQuery = useQuery({
    queryKey: ['absence', 'day', date],
    queryFn: async () => {
      return await getAbsenceData(date);
    },
    refetchInterval: isToday ? 60000 : false,
  });

  // Query para dados de ausência por período (férias, afastamentos)
  const absencePeriodQuery = useQuery({
    queryKey: ['absence', 'period', date],
    queryFn: async () => {
      return await getAbsenceData(date, true);
    },
    refetchInterval: isToday ? 60000 : false,
  });

  // Query para dados de presença
  const presenceQuery = useQuery({
    queryKey: ['presence', date],
    queryFn: async () => {
      return await getPresenceData(date);
    },
    refetchInterval: isToday ? 60000 : false,
  });

  // Combinar e filtrar os dados de ausência
  const absenceData = useMemo(() => {
    const dayData = absenceDayQuery.data || [];
    const periodData = absencePeriodQuery.data || [];

    // Combinar os dados, evitando duplicatas
    const combinedData: iAbsence[] = [...dayData, ...periodData].reduce((acc: iAbsence[], curr: iAbsence) => {
      const exists = acc.find((item) => item.recno === curr.recno);
      if (!exists) {
        acc.push(curr);
      }
      return acc;
    }, []);

    // Filtrar por turno se necessário
    return turn === 'ALL' ? combinedData : combinedData.filter((item) => item.turno === turn);
  }, [absenceDayQuery.data, absencePeriodQuery.data, turn]);

  // Filtrar os dados de presença por turno
  const presenceData = useMemo(() => {
    const data: iPresence[] = presenceQuery.data || [];
    return turn === 'ALL' ? data : data.filter((item) => item.turno === turn);
  }, [presenceQuery.data, turn]);

  // Calcular contadores
  const counters = useMemo(() => {
    return {
      faltas: absenceData.filter((item) => item.tipo === ABSENCE_TYPES.FALTA).length,
      atestados: absenceData.filter((item) => item.tipo === ABSENCE_TYPES.ATESTADO).length,
      ferias: absenceData.filter((item) => item.tipo === ABSENCE_TYPES.FERIAS).length,
      afastamentos: absenceData.filter((item) => item.tipo === ABSENCE_TYPES.AFASTAMENTO).length,
      atrasos: absenceData.filter((item) => item.tipo === ABSENCE_TYPES.ATRASO).length,
      saidaAntecipada: absenceData.filter((item) => item.tipo === ABSENCE_TYPES.SAIDA_ANTECIPADA).length,
      remanejados: absenceData.filter((item) => item.tipo === ABSENCE_TYPES.REMANEJAMENTO).length,
      total: absenceData.length,
    };
  }, [absenceData]);

  // Calcular total de presentes
  const totalPresentes = useMemo(() => {
    return presenceData.reduce((total, item) => {
      return (
        total +
        (Number(item.embalagem) || 0) +
        (Number(item.forno) || 0) +
        (Number(item.lideranca) || 0) +
        (Number(item.panificacao) || 0) +
        (Number(item.pasta) || 0) +
        (Number(item.recheio) || 0)
      );
    }, 0);
  }, [presenceData]);

  return {
    absenceData,
    presenceData,
    isLoading: absenceDayQuery.isLoading || absencePeriodQuery.isLoading || presenceQuery.isLoading,
    isFetching: absenceDayQuery.isFetching || absencePeriodQuery.isFetching || presenceQuery.isFetching,
    error: absenceDayQuery.error || absencePeriodQuery.error || presenceQuery.error,
    counters,
    totalPresentes,
  };
};
