import { useMemo } from 'react';
import { iMaquinaInfoParams } from '../api/apiRequests';
import { CICLOS_ESPERADOS, CICLOS_ESPERADOS_BOL } from '../helpers/constants';
import { useAppSelector } from '../redux/store/hooks';
import { useFullInfoIHMQuery } from './queries/useFullInfoIhmQuery';
import { useMaqInfoQuery } from './queries/useMaqInfoQuery';
import { useFilters } from './useFilters';

export interface iCycleImpactReport {
  motivo: string;
  problema: string;
  causa: string;
  tempo: number;
  impacto: number;
  linha?: number; // Adicionado para casos de Perda de Ciclo
}

const useStopsWithCycles = (scope: string) => {
  /* ------------------------------------------------- Hooks ------------------------------------------------- */
  const lineMachine = useAppSelector((state) => state.home.lineMachine);
  const { selectedLines } = useFilters(scope);
  const { data: infoIhm } = useFullInfoIHMQuery('management');

  const selectedMachines = Object.keys(lineMachine)
    .filter(([_maquina_id, linha]) => selectedLines.includes(Number(linha)))
    .map(([maquina_id]) => maquina_id);

  const params: Omit<iMaquinaInfoParams, 'data' | 'turno'> = { status: 'true' };
  const fields = ['maquina_id', 'produto', 'status', 'ciclo_1_min'] as (
    | 'maquina_id'
    | 'produto'
    | 'status'
    | 'ciclo_1_min'
  )[];

  if (selectedLines.length === 0 || selectedLines.length === 14) {
    // Se não houver linhas selecionadas ou todas as linhas estão selecionadas, não filtrar por linha
    params.maquina_id = selectedMachines;
  }

  // Agora o TypeScript sabe que data é Pick<iMaquinaInfo, 'maquina_id' | 'produto' | 'status' | 'ciclo_1_min'>[]
  const { data, isFetching, error, isLoading } = useMaqInfoQuery(scope, { params, fields });

  // Tipo para os dados com linha adicionada
  type MaquinaInfoWithLine = NonNullable<typeof data>[number] & { linha: number };

  // Inclui o número da linha nos dados da máquina
  const maqInfoWithLine: MaquinaInfoWithLine[] = (data || []).map((item) => {
    const linha = Number(lineMachine[item.maquina_id]);
    return { ...item, linha };
  });

  /* -------------------------------------------------------------------------- Perda De Ciclo ---- */
  const infoIhmData = useMemo(() => {
    if (infoIhm.length === 0) {
      return [];
    }
    // Filtrar dados pela linha, se não for [] ou length = 14
    if (selectedLines.length > 0 && selectedLines.length !== 14) {
      return infoIhm.filter((item) => selectedLines.includes(item.linha));
    }

    return infoIhm;
  }, [infoIhm, selectedLines]);

  // Calcula perdas de ciclo por linha
  const cycleLostByLine = useMemo(() => {
    if (!maqInfoWithLine || maqInfoWithLine.length === 0) return [];

    // Tempo rodando por linha
    const runTimeByLine = infoIhmData
      .filter((item) => item.status === 'rodando')
      .reduce(
        (acc, item) => {
          if (!acc[item.linha]) {
            acc[item.linha] = 0;
          }
          acc[item.linha] += item.tempo;
          return acc;
        },
        {} as Record<number, number>
      );

    // Ajusta os ciclos perdidos por linha
    const cycleLossByLine: iCycleImpactReport[] = [];

    // Obter linhas únicas das máquinas
    const uniqueLines = [...new Set(maqInfoWithLine.map((item) => item.linha))];

    uniqueLines.forEach((linha) => {
      if (!linha) return; // Skip undefined linhas

      // Filtrar máquinas para esta linha
      const lineMachines = maqInfoWithLine.filter((m) => m.linha === linha);

      if (lineMachines.length === 0) return;

      // Primeiro, calcular a média de ciclos por minuto da linha
      const averageCyclesByMin =
        lineMachines.reduce((acc, item) => acc + item.ciclo_1_min, 0) / lineMachines.length;

      // Determinar o ciclo ideal baseado no tipo de produto mais comum na linha
      const bolProducts = lineMachines.filter((item) => item.produto.includes(' BOL')).length;
      const regularProducts = lineMachines.length - bolProducts;

      // Usar o ciclo ideal baseado na maioria dos produtos na linha
      const idealCycle = bolProducts > regularProducts ? CICLOS_ESPERADOS_BOL : CICLOS_ESPERADOS;

      // Calcular a perda de ciclo com base na média da linha vs. ciclo ideal
      const cycleLossPercent =
        idealCycle > averageCyclesByMin ? ((idealCycle - averageCyclesByMin) * 100) / idealCycle : 0;

      // Calcular tempo perdido para esta linha
      const runTime = runTimeByLine[linha] || 0;
      const lostTime = Math.round((cycleLossPercent * runTime) / 100);

      if (lostTime > 0) {
        cycleLossByLine.push({
          motivo: 'Perda de Ciclo',
          problema: `Ciclo ${cycleLossPercent.toFixed(2)}% abaixo do esperado`,
          causa: 'Ciclo Perdido',
          tempo: lostTime,
          impacto: 0, // Será calculado depois
          linha: linha,
        });
      }
    });

    // Calcular o tempo total perdido para todas as linhas
    const totalLostTime = cycleLossByLine.reduce((acc, item) => acc + item.tempo, 0);

    // Adicionar cálculo de impacto (porcentagem do tempo total)
    return cycleLossByLine
      .map((item) => ({
        ...item,
        impacto: parseFloat(((item.tempo / totalLostTime) * 100).toFixed(2)),
      }))
      .sort((a, b) => b.tempo - a.tempo);
  }, [maqInfoWithLine, infoIhmData]);

  // Cria a perda por ciclo total (como já existe, mas usando o cycleLostByLine)
  const cycleLost = useMemo(() => {
    const totalLostTime = cycleLostByLine.reduce((acc, item) => acc + item.tempo, 0);
    const averageLoss =
      maqInfoWithLine.length > 0
        ? cycleLostByLine.reduce((acc, item) => acc + (item.tempo * 100) / totalLostTime, 0) /
          cycleLostByLine.length
        : 0;

    return {
      ['Perda de Ciclo-Ciclo Baixo-Ciclo Perdido Min']: {
        problema: `Perda média de ciclo --> ${averageLoss.toFixed(2)} %`,
        impacto: 0,
        motivo: 'Perda de Ciclo',
        causa: 'Ciclo Baixo',
        tempo: totalLostTime,
      },
    };
  }, [cycleLostByLine, maqInfoWithLine]);

  return {
    data: maqInfoWithLine,
    cycleLostByLine,
    cycleLost,
    isFetching,
    error,
    isLoading,
  };
};

export default useStopsWithCycles;
