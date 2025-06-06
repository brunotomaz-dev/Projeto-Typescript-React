import EChartsReact from 'echarts-for-react';
import React, { useMemo } from 'react';
import { Row } from 'react-bootstrap';
import { BSColors, CICLOS_ESPERADOS, CICLOS_ESPERADOS_BOL } from '../../../helpers/constants';
import { impactFilter } from '../../../helpers/ImpactFilter';
import { useBarStopsData } from '../../../hooks/useBarStopsData';

interface StopSummary {
  motivo: string;
  problema: string;
  causa: string;
  tempo: number;
  impacto: number;
}

const BarStops: React.FC = () => {
  /* ------------------------------------------------- Hook's ------------------------------------------------ */
  const { data, cycleData, isLoading, isFetching } = useBarStopsData();

  /* ------------------------------------------------ Funções ------------------------------------------------ */
  //  Filtro dos itens que não afetam a eficiência
  const filteredData = useMemo(() => {
    return impactFilter(data);
  }, [data]);

  // Calcula o tempo total de parada
  const totalStopTime = useMemo(
    () =>
      filteredData.filter((item) => item.status === 'parada').reduce((acc, item) => acc + item.tempo || 0, 0),
    [filteredData]
  );
  // Tempo rodando
  const totalRunTime = useMemo(() => {
    return data.filter((item) => item.status === 'rodando').reduce((acc, item) => acc + item.tempo, 0);
  }, [data]);

  // Cria a perda por ciclo baixo
  const cycleLost = useMemo(() => {
    // Filtra pela maquina rodando
    const filteredCycleData = cycleData.filter((item) => item.ciclo_1_min > 0);
    // Produto único
    const product = filteredCycleData.length > 0 ? filteredCycleData[0].produto : '';
    // Verifica se o produto contém a palavra ' BOL', se tiver usa CICLOS_ESPERADOS, se não CICLOS_ESPERADOS_BOL
    const ciclosIdeais = product.includes(' BOL') ? CICLOS_ESPERADOS_BOL : CICLOS_ESPERADOS;

    // Média de ciclos por minuto
    const cycleAverage =
      filteredCycleData.reduce((acc, item) => acc + item.ciclo_1_min, 0) / filteredCycleData.length;
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
  }, [cycleData, filteredData]);

  const stopSummary = useMemo(() => {
    // Filtra e agrupa os dados por causa
    const stops = filteredData
      .filter((item) => item.status === 'parada')
      .reduce(
        (acc, item) => {
          const key = `${item.motivo}-${item.problema}-${item.causa}`;

          if (!acc[key]) {
            acc[key] = {
              motivo: item.motivo || 'N/A',
              problema: item.problema || 'N/A',
              causa: item.causa || 'N/A',
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
  }, [filteredData, cycleLost, totalStopTime]);

  /* ------------------------------------------------- Option ------------------------------------------------ */
  // Options para echart de barra
  const option = {
    title: {
      text: 'Paradas (Tempo e Impacto)',
      left: 'center',
      textStyle: {
        fontSize: 14,
      },
    },
    textStyle: {
      fontFamily: 'Poppins',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params: any) => {
        const item = stopSummary[params[0].dataIndex];
        return `
          <strong>${item.motivo}</strong><br/>
          Problema: ${item.problema}<br/>
          Causa: ${item.causa}<br/>
          Tempo: ${item.tempo} min<br/>
          Impacto: ${item.impacto}%
        `;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      name: 'Tempo (min)',
      nameLocation: 'center',
      nameGap: 25,
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      type: 'category',
      data: stopSummary.map((item) => `${item.motivo} - ${item.problema} - ${item.causa}`),
      axisLabel: {
        show: false,
      },
      axisTick: {
        show: false,
      },
    },
    series: [
      {
        name: 'Tempo',
        type: 'bar',
        itemStyle: {
          color: BSColors.GREY_500_COLOR,
        },
        label: {
          show: true,
          position: 'insideLeft',
          distance: 5,
          formatter: (params: any) => {
            const item = stopSummary[params.dataIndex];
            const label =
              item.causa === 'Realizar análise de falha' || item.causa === 'Necessidade de análise'
                ? item.problema
                : item.causa;

            return label;
          },
          align: 'left',
          verticalAlign: 'middle',
        },
        emphasis: {
          focus: 'series',
        },
        data: stopSummary.map((item) => item.tempo),
      },
    ],
  };

  const isRefreshing = isLoading || isFetching;

  /* --------------------------------------------------------------------------------------------------------- */
  /*                                                   LAYOUT                                                  */
  /* --------------------------------------------------------------------------------------------------------- */
  return (
    <>
      {isRefreshing && (
        <Row className='position-absolute top-0 end-0 m-2'>
          <div className={`spinner-border ${isLoading ? 'text-secondary' : 'text-light-grey'}`} role='status'>
            <span className='visually-hidden'>Atualizando...</span>
          </div>
        </Row>
      )}
      {totalStopTime > 0 ? (
        <EChartsReact option={option} style={{ height: '100%', width: '100%' }} />
      ) : (
        <Row className='align-items-center text-center h-100'>
          <h5>Não há paradas registradas</h5>
        </Row>
      )}
    </>
  );
};

export default BarStops;
