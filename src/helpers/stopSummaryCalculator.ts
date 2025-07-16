import { iInfoIHM } from '../interfaces/InfoIHM.interface';
import { iInfoIhmLive } from '../pages/LiveLines/interfaces/infoIhm.interface';
import { CICLOS_ESPERADOS, CICLOS_ESPERADOS_BOL } from './constants';
import { impactFilter } from './ImpactFilter';

export interface StopSummary {
  motivo: string;
  problema: string;
  causa: string;
  tempo: number;
  impacto: number;
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

    // Produto único
    const product = filteredCycleData.length > 0 ? filteredCycleData[0].produto : '';

    // Verifica se o produto contém a palavra ' BOL', se tiver usa CICLOS_ESPERADOS, se não CICLOS_ESPERADOS_BOL
    const ciclosIdeais = product.includes(' BOL') ? CICLOS_ESPERADOS_BOL : CICLOS_ESPERADOS;

    // Média de ciclos por minuto
    const cycleAverage =
      filteredCycleData.length > 0
        ? filteredCycleData.reduce((acc, item) => acc + item.ciclo_1_min, 0) / filteredCycleData.length
        : 0;

    // Diferença entre a média e o esperado
    const cycleDiff = ciclosIdeais > cycleAverage ? ciclosIdeais - cycleAverage : 0;

    return {
      ['Perda de Ciclo-Ciclo Baixo-Ciclo Perdido Min']: {
        problema: `${cycleDiff.toFixed(2)} ciclos/min - ${Math.round((cycleDiff * 2 * totalRunTime) / 10)} cxs/turno`,
        impacto: 0,
        motivo: 'Perda de Ciclo',
        causa: 'Ciclo Baixo',
        tempo: Math.round((cycleDiff * totalRunTime) / ciclosIdeais),
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
