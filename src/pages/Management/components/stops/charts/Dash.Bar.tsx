import EChartsReact from 'echarts-for-react';
import React, { useMemo } from 'react';
import { Alert, Card, Row } from 'react-bootstrap';
import { colorObj } from '../../../../../helpers/constants';
import { impactFilter, notImpactFilter } from '../../../../../helpers/ImpactFilter';
import { useFullInfoIHMQuery } from '../../../../../hooks/queries/useFullInfoIhmQuery';
import { useFilters } from '../../../../../hooks/useFilters';
import useStopsWithCycles, { iCycleImpactReport } from '../../../../../hooks/useStopsWithCycles';

/* ----------------------------------------- Interfaces ----------------------------------------- */
interface iDashBarProps {
  dataType: 'ALL' | 'Primeiro' | 'Segundo' | 'Terceiro';
  notAffBar: boolean;
}

const DashBar: React.FC<iDashBarProps> = ({ dataType = 'ALL', notAffBar }) => {
  /* ------------------------------------------------- Hooks ------------------------------------------------- */
  const { selectedLines } = useFilters('management');
  const { data, isFetching, isRefreshing } = useFullInfoIHMQuery('management');
  const { cycleLostByLine, cycleLost } = useStopsWithCycles('management');

  /* ---------------------------------------------------------------------- Filtro De Info-ihm ---- */
  const filteredData = useMemo(() => {
    if (selectedLines.length > 0 && selectedLines.length !== 14) {
      const filtered = data?.filter((item) => selectedLines.includes(item.linha));
      return notAffBar ? notImpactFilter(filtered) : impactFilter(filtered);
    }

    return notAffBar ? notImpactFilter(data) : impactFilter(data);
  }, [data, notAffBar, selectedLines]);

  /* ------------------------------------------------------------------ Tempo Total De Parada ---- */
  // Tempo total de parada
  const totalStopTime = useMemo(() => {
    const data = filteredData
      .filter((item) => item.status === 'parada')
      .reduce((acc, item) => acc + (item.tempo || 0), 0);
    return data;
  }, [filteredData]);

  /* ----------------------------------------------------------------------- Resumo De Paradas ---- */
  const stopSummary = useMemo(() => {
    // Filtra e agrupa os dados por causa
    const stops = filteredData
      .filter((item) => item.status === 'parada')
      .reduce(
        (acc, item) => {
          const key = `${item.motivo}`;

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
        {} as Record<string, iCycleImpactReport>
      );

    const lostCycleTime = notAffBar ? 0 : cycleLost['Perda de Ciclo-Ciclo Baixo-Ciclo Perdido Min'].tempo;

    // Une os dados de parada com os dados de ciclo baixo se houver dados de ciclos baixos
    const allStops = lostCycleTime > 0 ? { ...stops, ...cycleLost } : stops;

    // Calcula o tempo total de parada
    const stopTime = totalStopTime + lostCycleTime;

    const summary = Object.values(allStops)
      .map((item) => ({
        ...item,
        impacto: parseFloat(((item.tempo / stopTime) * 100).toFixed(2)),
      }))
      .sort((a, b) => b.tempo - a.tempo);

    return summary;
  }, [filteredData, cycleLost, totalStopTime, notAffBar]);

  /* ----------------------------------------------------------------------------- Top Motivos ---- */
  // Novo: Obter o primeiro, segundo e terceiro motivos
  const topMotivos = useMemo(() => {
    if (!stopSummary || stopSummary.length === 0) return [];

    // Filtrar motivos indesejados antes de pegar os três principais
    const filteredMotivos = stopSummary
      .filter((item) => item.motivo !== 'Liberada' && item.motivo !== 'Não apontado')
      .map((item) => item.motivo);

    // Pegar os três primeiros motivos distintos
    const uniqueMotivos = [...new Set(filteredMotivos)];
    return uniqueMotivos.slice(0, 3);
  }, [stopSummary]);

  // Novo: Obter dados específicos para um determinado motivo (primeiro, segundo, terceiro)
  const getMotivoDetails = useMemo(() => {
    // Se não for um dos três primeiros motivos, retornar vazio
    if (dataType === 'ALL') {
      return stopSummary;
    }

    // Determinar qual motivo estamos analisando
    const motiveIndex = dataType === 'Primeiro' ? 0 : dataType === 'Segundo' ? 1 : 2;

    if (topMotivos.length <= motiveIndex) {
      return [];
    }

    const targetMotivo = topMotivos[motiveIndex];

    // Caso especial: Se o motivo for "Perda de Ciclo", agrupar por linha
    if (targetMotivo === 'Perda de Ciclo') {
      return cycleLostByLine;
    }

    // Caso padrão: Filtrar paradas pelo motivo e agrupar por causa
    const motivoDetails = filteredData
      .filter((item) => item.motivo === targetMotivo)
      .reduce(
        (acc, item) => {
          // Chave de agrupamento: causa
          const key = `${item.causa || 'Não apontado'}`;

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
        {} as Record<string, iCycleImpactReport>
      );

    // Calcular o tempo total para este motivo
    const totalTime = Object.values(motivoDetails).reduce((acc, item) => acc + item.tempo, 0);

    // Converter para array e adicionar impacto
    const result = Object.values(motivoDetails)
      .map((item) => ({
        ...item,
        impacto: parseFloat(((item.tempo / totalTime) * 100).toFixed(2)),
      }))
      .sort((a, b) => b.tempo - a.tempo);

    return result.slice(0, 5);
  }, [dataType, topMotivos, stopSummary, filteredData, cycleLostByLine]);

  // Atualizar o cálculo do tempo total para o subtext
  const subTextTime = useMemo(() => {
    if (dataType === 'ALL') {
      return totalStopTime;
    }

    // Tempo total do motivo específico
    const motiveIndex = dataType === 'Primeiro' ? 0 : dataType === 'Segundo' ? 1 : 2;

    if (topMotivos.length <= motiveIndex) {
      return 0;
    }

    const targetMotivo = topMotivos[motiveIndex];

    if (targetMotivo === 'Perda de Ciclo') {
      return cycleLostByLine.reduce((acc, item) => acc + item.tempo, 0);
    }

    return filteredData
      .filter((item) => item.motivo === targetMotivo)
      .reduce((acc, item) => acc + item.tempo, 0);
  }, [dataType, topMotivos, filteredData, totalStopTime, cycleLostByLine]);

  /* ------------------------------------------- Series ------------------------------------------- */
  const series = useMemo(() => {
    const displayData = dataType === 'ALL' ? stopSummary : getMotivoDetails;

    if (!displayData || displayData.length === 0) {
      return [];
    }

    const serie = [
      {
        type: 'bar',
        data: displayData.map((item: iCycleImpactReport) => {
          const isPerdaCiclo = item.motivo === 'Perda de Ciclo';

          // Para casos de Perda de Ciclo quando agrupando por linha
          const name =
            isPerdaCiclo && item.linha
              ? `Linha ${item.linha}`
              : dataType === 'ALL'
                ? item.motivo
                : item.causa;

          return {
            value: item.tempo,
            name,
            motivo: item.motivo,
            problema: item.problema,
            causa: item.causa,
            impacto: item.impacto,
            linha: item.linha,
          };
        }),
        itemStyle: {
          color: function (params: any) {
            const motivo = displayData[params.dataIndex].motivo;
            return colorObj[motivo as keyof typeof colorObj] || '#999';
          },
        },
        label: {
          show: true,
          // position: dataType === 'ALL' ? 'right' : 'insideLeft',
          position: 'right',
          formatter: function (params: any) {
            return `${params.data.impacto}%`;
          },
          // formatter: function (params: any) {
          //   // Para ALL, mostrar apenas a porcentagem
          //   if (dataType === 'ALL') {
          //     return `${params.data.impacto}%`;
          //   }

          //   // Para não-ALL, mostrar nome e porcentagem
          //   return `${params.name} - ${params.data.impacto}%`;
          // },
          overflow: 'break',
          width: 300,
          textShadow: dataType === 'ALL' ? 'none' : '1px 1px 2px rgba(0,0,0,0.5)',
        },
      },
    ];

    return serie;
  }, [stopSummary, dataType, getMotivoDetails]);

  // Título dinâmico com base no dataType
  const chartTitle = useMemo(() => {
    if (dataType === 'ALL') {
      return 'Principais Motivos de Parada';
    }

    const motiveIndex = dataType === 'Primeiro' ? 0 : dataType === 'Segundo' ? 1 : 2;

    if (topMotivos.length <= motiveIndex) {
      return `${dataType} Motivo de Parada`;
    }

    const targetMotivo = topMotivos[motiveIndex];

    // Título especial para Perda de Ciclo
    if (targetMotivo === 'Perda de Ciclo') {
      return `Linhas com Maior Perda de Ciclo`;
    }

    return `Principais Causas: ${targetMotivo}`;
  }, [dataType, topMotivos]);

  /* ---------------------------------------------------------------------------------- Option ---- */
  // Configurações do gráfico
  const option = {
    title: {
      text: chartTitle,
      subtext: `Total de Paradas: ${subTextTime} min`,
      left: 'center',
      textStyle: {
        fontSize: 16,
      },
    },
    textStyle: {
      fontFamily: 'Poppins',
    },
    tooltip: {
      trigger: 'item',
      formatter: function (params: any) {
        const { data } = params;

        // Tooltip base começa com o valor selecionado como cabeçalho
        let tooltipContent = '';

        // Montagem dinâmica do tooltip com base no dataType e tipo de dado
        if (data.linha && data.motivo === 'Perda de Ciclo') {
          tooltipContent = `
            ${params.marker}
            <strong>Linha ${data.linha}</strong><br/>
            Motivo: ${data.motivo}<br/>
            Problema: ${data.problema}<br/>
            Tempo: ${data.value} min<br/>
            Impacto: ${data.impacto}%
          `;
        } else if (dataType === 'ALL') {
          if (data.motivo === 'Perda de Ciclo') {
            tooltipContent = `
              ${params.marker}
              <strong>${data.motivo}</strong><br/>
              Problema: ${data.problema}<br/>
              Tempo: ${data.value} min<br/>
              Impacto: ${data.impacto}%
            `;
          } else {
            tooltipContent = `
              ${params.marker}
              <strong>${data.motivo}</strong><br/>
              Tempo: ${data.value} min<br/>
              Impacto: ${data.impacto}%
            `;
          }
        } else {
          tooltipContent = `
            ${params.marker}
            <strong>${data.motivo}</strong><br/>
            Problema: ${data.problema}<br/>
            Causa: ${data.causa}<br/>
            Tempo: ${data.value} min<br/>
            Impacto: ${data.impacto}%
          `;
        }

        return tooltipContent;
      },
    },
    grid: {
      left: '3%',
      right: '5%',
      bottom: '10%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      name: 'Tempo (min)',
      nameLocation: 'center',
      nameGap: 30,
      splitLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
    },
    yAxis: {
      type: 'category',
      data: (dataType === 'ALL' ? stopSummary : getMotivoDetails).map((item: iCycleImpactReport) => {
        // Para casos de Perda de Ciclo quando agrupando por linha
        if (item.motivo === 'Perda de Ciclo' && item.linha) {
          return `Linha ${item.linha}`;
        }

        return dataType === 'ALL'
          ? item.motivo
          : item.causa === 'Realizar análise de falha' || item.causa === 'Necessidade de análise'
            ? item.problema
            : item.causa;
      }),
      axisLabel: {
        // show: dataType === 'ALL', // Mostrar apenas no modo ALL
        show: true,
        width: 100,
        overflow: 'break',
        fontSize: 11,
      },
    },
    series: series,
    toolbox: {
      feature: {
        saveAsImage: { title: 'Salvar' },
      },
    },
  };

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             LAYOUT                                             */
  /* ---------------------------------------------------------------------------------------------- */
  const spinnerColor = isFetching ? 'text-light-grey' : 'text-info';

  return (
    <Card className='shadow-sm border-0 bg-light p-2'>
      {isRefreshing && (
        <div className='position-absolute top-0 start-0 m-3' style={{ zIndex: 10 }}>
          <div className={`spinner-border spinner-border-sm ${spinnerColor}`} role='status'>
            <span className='visually-hidden'>Atualizando...</span>
          </div>
        </div>
      )}
      {(dataType === 'ALL' ? stopSummary : getMotivoDetails).length > 0 ? (
        <EChartsReact
          option={option}
          style={{ height: '400px', width: '100%' }}
          opts={{ renderer: 'canvas' }}
          notMerge={true}
        />
      ) : (
        <Row style={{ height: '400px' }} className='d-flex justify-content-center align-items-center p-2'>
          <Alert variant='info' className='text-center'>
            Sem dados disponíveis para exibição. Por favor, selecione outra data ou período.
          </Alert>
        </Row>
      )}
    </Card>
  );
};

export default DashBar;
