import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { getMaquinaInfo, iMaquinaInfoParams } from '../../api/apiRequests';
import { iMaquinaInfo } from '../../interfaces/MaquinaInfo.interface';
import { useFilters } from '../useFilters';

interface iOptions<T extends keyof iMaquinaInfo = keyof iMaquinaInfo> {
  params?: Omit<iMaquinaInfoParams, 'data' | 'turno'>;
  fields?: T[];
}

// Sobrecarga para quando fields não é passado
export function useMaqInfoQuery(scope?: string): {
  data: iMaquinaInfo[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: any;
};

// Sobrecarga para quando fields é passado
export function useMaqInfoQuery<T extends keyof iMaquinaInfo>(
  scope: string,
  options: iOptions<T> & { fields: T[] }
): {
  data: Pick<iMaquinaInfo, T>[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: any;
};

// Sobrecarga para quando options é passado mas fields pode ser undefined
export function useMaqInfoQuery<T extends keyof iMaquinaInfo>(
  scope: string,
  options?: iOptions<T>
): {
  data: iMaquinaInfo[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: any;
};

// Implementação
export function useMaqInfoQuery(scope = 'home', options?: any) {
  const { date, turn } = useFilters(scope);

  const params = useMemo(() => {
    const baseParams: iMaquinaInfoParams = { data: date };
    if (turn && turn !== 'ALL') {
      baseParams.turno = turn;
    }
    return { ...baseParams, ...options?.params };
  }, [date, turn, options?.params]);

  // Determinar se a data selecionada é hoje
  const isToday = useMemo(() => {
    const today = new Date();
    return date === format(today, 'yyyy-MM-dd');
  }, [date]);

  // Query para máquinas rodando
  const maquinaInfoQuery = useQuery({
    queryKey: ['maquinaInfo', date, turn, options?.params, options?.fields],
    queryFn: async () => {
      const fields = options?.fields;
      return await getMaquinaInfo(params, fields);
    },
    refetchInterval: isToday ? 30000 : false, // Atualiza a cada 30 segundos se for hoje
  });

  return {
    data: maquinaInfoQuery.data,
    isLoading: maquinaInfoQuery.isLoading,
    isFetching: maquinaInfoQuery.isFetching,
    error: maquinaInfoQuery.error,
  };
}
