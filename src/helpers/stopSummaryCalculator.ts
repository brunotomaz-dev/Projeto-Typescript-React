import { iInfoIHM } from '../interfaces/InfoIHM.interface';
import { iInfoIhmLive } from '../pages/LiveLines/interfaces/infoIhm.interface';
import { CICLOS_ESPERADOS, CICLOS_ESPERADOS_240, CICLOS_ESPERADOS_BOL } from './constants';
import { impactFilter } from './ImpactFilter';

export interface StopSummary {
  motivo: string;
  problema: string;
  causa: string;
  tempo: number;
  impacto: number;
  equipamento: string; // Adicionado para incluir o equipamento no resumo
}

export interface CycleData {
  ciclo_1_min: number;
  produto: string;
}

export interface StopSummaryResult {
  stopSummary: StopSummary[];
  totalStopTime: number;
  totalRunTime: number;
  cycleLostTime: number;
}

export const calculateStopSummary = (
  data: iInfoIHM[] | iInfoIhmLive[],
  cycleData: CycleData[]
): StopSummaryResult => {
  // Filtro dos itens que não afetam a eficiência
  const filteredData = impactFilter(data);

  // Calcula o tempo total de parada
  const totalStopTime = filteredData
    .filter((item) => item.status === 'parada')
    .reduce((acc, item) => acc + (item.tempo || 0), 0);

  // Tempo rodando
  const totalRunTime = data
    .filter((item) => item.status === 'rodando')
    .reduce((acc, item) => acc + item.tempo, 0);

  // Cria a perda por ciclo baixo
  const cycleLost = (() => {
    // Filtra pela maquina rodando
    const filteredCycleData = cycleData.filter((item) => item.ciclo_1_min > 0);

    if (filteredCycleData.length === 0) {
      return {
        ['Perda de Ciclo-Ciclo Baixo-Ciclo Perdido Min']: {
          problema: '0.00 ciclos/min (0 cxs/turno)',
          impacto: 0,
          motivo: 'Perda de Ciclo',
          causa: 'Ciclo Baixo',
          tempo: 0,
          equipamento: 'Termoformadora',
        },
      };
    }

    // Adicionar ciclo_ideal para cada máquina baseado no tipo de produto
    const cycleDataWithIdeal = filteredCycleData.map((machine) => {
      let ciclo_ideal: number;

      if (machine.produto.includes(' BOL')) {
        ciclo_ideal = CICLOS_ESPERADOS_BOL;
      } else if (machine.produto.includes('240')) {
        ciclo_ideal = CICLOS_ESPERADOS_240;
      } else {
        ciclo_ideal = CICLOS_ESPERADOS;
      }

      return { ...machine, ciclo_ideal };
    });

    // Média de ciclos por minuto real
    const cycleAverage =
      cycleDataWithIdeal.reduce((acc, item) => acc + item.ciclo_1_min, 0) / cycleDataWithIdeal.length;

    // Média de ciclos ideais
    const idealCycleAverage =
      cycleDataWithIdeal.reduce((acc, item) => acc + item.ciclo_ideal, 0) / cycleDataWithIdeal.length;

    // Diferença entre a média ideal e a real
    const cycleDiff = idealCycleAverage > cycleAverage ? idealCycleAverage - cycleAverage : 0;

    return {
      ['Perda de Ciclo-Ciclo Baixo-Ciclo Perdido Min']: {
        problema: `${cycleDiff.toFixed(2)} ciclos/min (${Math.round((cycleDiff * 2 * totalRunTime) / 10)} cxs/turno)`,
        impacto: 0,
        motivo: 'Perda de Ciclo',
        causa: 'Ciclo Baixo',
        tempo: Math.round((cycleDiff * totalRunTime) / idealCycleAverage),
        equipamento: 'Termoformadora',
      },
    };
  })();

  const stopSummary = (() => {
    // Filtra e agrupa os dados por causa
    const stops = filteredData
      .filter((item) => item.status === 'parada')
      .reduce(
        (acc, item) => {
          const key = `${item.motivo}-${item.problema}-${item.causa}`;

          if (!acc[key]) {
            acc[key] = {
              motivo: item.motivo || 'Não apontado',
              problema: item.problema || 'Não apontado',
              causa: item.causa || 'Não apontado',
              equipamento: item.equipamento || 'Não apontado',
              tempo: 0,
              impacto: 0,
            };
          }

          acc[key].tempo += item.tempo;
          return acc;
        },
        {} as Record<string, StopSummary>
      );

    const lostCycleTime = cycleLost['Perda de Ciclo-Ciclo Baixo-Ciclo Perdido Min'].tempo;

    // Une os dados de parada com os dados de ciclo baixo se houver dados de ciclos baixos
    const allStops = lostCycleTime > 0 ? { ...stops, ...cycleLost } : stops;

    // Calcula o tempo total
    const accTime = totalStopTime + lostCycleTime + totalRunTime;

    // Converte para array e calcula o impacto
    return Object.values(allStops)
      .map((item) => ({
        ...item,
        impacto: parseFloat(((item.tempo / accTime) * 100).toFixed(2)),
      }))
      .sort((a, b) => b.tempo - a.tempo);
  })();

  return {
    stopSummary,
    totalStopTime,
    totalRunTime,
    cycleLostTime: cycleLost['Perda de Ciclo-Ciclo Baixo-Ciclo Perdido Min'].tempo,
  };
};
