import { useMemo } from 'react';
import { impactFilter } from '../helpers/ImpactFilter';
import { useInfoIHMQuery } from './queries/useLiveInfoIHMQuery';
import { useFilters } from './useFilters';

export const useTimelineMetrics = (scope: string) => {
  const { selectedLines } = useFilters(scope);

  // Utilizar o hook de query existente
  const { ihmData, isLoading, isFetching, error } = useInfoIHMQuery({
    scope: 'operators',
    selectedLine: selectedLines[0],
  });

  // Calcular métricas de resumo
  const metrics = useMemo(() => {
    if (!Array.isArray(ihmData) || ihmData.length === 0) {
      return {
        totalRunningTime: 0,
        totalStoppedTime: 0,
        longestContinuousRun: 0,
        percentageRunning: 0,
        totalEvents: 0,
        stopEvents: 0,
        stopEventsImpactingEfficiency: 0,
        mainCause: 'N/A',
        mainCauseText: 'N/A',
        mainCauseTime: 0,
        showAsProblem: false,
      };
    }

    // Usar a função impactFilter para obter apenas eventos que impactam a eficiência
    // após descontar o tempo permitido
    const impactingEvents = impactFilter(ihmData);

    let totalRunningTime = 0;
    let totalStoppedTime = 0;
    let longestContinuousRun = 0;
    let currentRunTime = 0;
    let stopEvents = 0;

    // Causas de paradas que afetam a eficiência, com o tempo já descontado
    // através do impactFilter
    const impactingCauses: Record<string, { count: number; time: number; items: any[] }> = {};

    // Processar cada evento original para estatísticas gerais
    ihmData.forEach((item) => {
      // Calculamos o tempo em minutos
      const startTime = new Date(item.data_hora);
      const endTime = new Date(item.data_hora_final);
      const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);

      if (item.status === 'rodando') {
        totalRunningTime += durationMinutes;
        currentRunTime += durationMinutes;

        // Atualizar o recorde de tempo contínuo de produção
        if (currentRunTime > longestContinuousRun) {
          longestContinuousRun = currentRunTime;
        }
      } else if (item.status === 'parada') {
        stopEvents++;
        totalStoppedTime += durationMinutes;
        currentRunTime = 0; // Reset do tempo contínuo
      }
    });

    // Contar as causas que realmente impactam eficiência após aplicar filtros e descontos
    // E armazenar os itens originais para poder acessar o problema depois
    impactingEvents.forEach((item) => {
      const causa = item.causa || 'Não especificada';

      if (!impactingCauses[causa]) {
        impactingCauses[causa] = { count: 0, time: 0, items: [] };
      }

      impactingCauses[causa].count++;
      impactingCauses[causa].time += item.tempo; // Tempo já descontado pelo impactFilter
      impactingCauses[causa].items.push(item);
    });

    // Encontrar a causa mais impactante
    // Considerar tanto a frequência quanto o tempo total
    let mainCause = 'N/A';
    let mainCauseText = 'N/A';
    let showAsProblem = false;
    let maxImpact = 0;
    let mainCauseItems: any[] = [];

    for (const [causa, data] of Object.entries(impactingCauses)) {
      // Poderíamos usar diferentes métricas para determinar impacto
      // Aqui usamos o tempo total como métrica de impacto
      const impact = data.time;

      if (impact > maxImpact) {
        maxImpact = impact;
        mainCause = causa;
        mainCauseItems = data.items;
      }
    }

    // Verificar se a causa principal é uma que deve mostrar o problema
    if (mainCause === 'Realizar análise de falha' || mainCause === 'Necessidade de análise') {
      showAsProblem = true;

      // Encontrar o problema mais comum para essa causa
      const problemCounts: Record<string, number> = {};

      mainCauseItems.forEach((item) => {
        const problema = item.problema || 'Não especificado';
        problemCounts[problema] = (problemCounts[problema] || 0) + 1;
      });

      let mainProblem = 'Não especificado';
      let maxCount = 0;

      for (const [problema, count] of Object.entries(problemCounts)) {
        if (count > maxCount) {
          maxCount = count;
          mainProblem = problema;
        }
      }

      mainCauseText = mainProblem;
    } else {
      mainCauseText = mainCause;
    }

    const totalTime = totalRunningTime + totalStoppedTime;
    const percentageRunning = totalTime > 0 ? (totalRunningTime / totalTime) * 100 : 0;

    return {
      totalRunningTime,
      totalStoppedTime,
      longestContinuousRun,
      percentageRunning,
      totalEvents: ihmData.length,
      stopEvents,
      stopEventsImpactingEfficiency: impactingEvents.length,
      mainCause,
      mainCauseText,
      mainCauseTime: maxImpact,
      showAsProblem,
    };
  }, [ihmData]);

  if (selectedLines.length !== 1) {
    // Lógica para múltiplas linhas selecionadas
    return {
      data: [],
      isLoading: false,
      isFetching: false,
      error: null,
      metrics: {
        totalRunningTime: 0,
        totalStoppedTime: 0,
        longestContinuousRun: 0,
        percentageRunning: 0,
        totalEvents: 0,
        stopEvents: 0,
        stopEventsImpactingEfficiency: 0,
        mainCause: 'N/A',
        mainCauseText: 'N/A',
        mainCauseTime: 0,
        showAsProblem: false,
      },
      hasData: false,
    };
  }

  return {
    data: ihmData,
    isLoading,
    isFetching,
    error,
    hasData: Array.isArray(ihmData) && ihmData.length > 0,
    metrics,
  };
};
