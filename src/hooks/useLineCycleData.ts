import { useMemo } from 'react';
import { useAppSelector } from '../redux/store/hooks';
import { useMachineInfoQuery } from './queries/useLiveMachineInfoQuery';

export const useLineCycleData = () => {
  // Obter o ID da máquina do Redux
  const machineId = useAppSelector((state) => state.liveLines.selectedMachine);

  // Usar o hook de consulta existente para obter dados da máquina
  const { machineInfo, isLoading, isFetching, error } = useMachineInfoQuery({ machineId });

  // Processar os dados para o gráfico
  const processedData = useMemo(() => {
    if (!machineInfo || machineInfo.length === 0) {
      return {
        cycles: [],
        hours: [],
        averageCycles: '0.00',
        hasData: false,
      };
    }

    // Ordenar os dados por recno
    const sortedData = [...machineInfo].sort((a, b) => a.recno - b.recno);

    // Extrair ciclos e horas
    const cycles = sortedData.map((maq) => maq.ciclo_1_min);

    // Ajustar a hora para o formato hh:mm
    const hours = sortedData.map((maq) => {
      const [hour, minute] = maq.hora_registro.split(':');
      return `${hour}:${minute}`;
    });

    // Calcular média de ciclos (apenas com a máquina no status 'true')
    const validCycles = sortedData.filter((item) => item.ciclo_1_min > 0);
    const averageCycles =
      validCycles.length > 0
        ? (validCycles.reduce((acc, item) => acc + item.ciclo_1_min, 0) / validCycles.length).toFixed(2)
        : '0.00';

    return {
      cycles,
      hours,
      averageCycles,
      hasData: sortedData.length > 0,
    };
  }, [machineInfo]);

  // Lidar com erros e estados de loading
  const handleError = (error: any) => {
    console.error('Erro ao carregar dados de ciclo:', error);
    // Você pode adicionar lógica para notificar o usuário ou tentar novamente
  };

  // Se houver erro, fornecer dados vazios
  if (error) {
    handleError(error);
    return {
      cycles: [],
      hours: [],
      averageCycles: '0.00',
      hasData: false,
      isLoading: false,
      isFetching: false,
      error,
      rawData: [],
    };
  }

  return {
    ...processedData,
    isLoading,
    isFetching,
    rawData: machineInfo,
  };
};
