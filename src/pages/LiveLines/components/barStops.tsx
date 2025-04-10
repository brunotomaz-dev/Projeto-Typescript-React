import EChartsReact from 'echarts-for-react';
import React, { useMemo } from 'react';
import { Row } from 'react-bootstrap';
import {
  BSColors,
  CICLOS_ESPERADOS,
  CICLOS_ESPERADOS_BOL,
} from '../../../helpers/constants';
import { impactFilter } from '../../../helpers/ImpactFilter';
import { iInfoIhmLive } from '../interfaces/infoIhm.interface';
import { iMaquinaInfo } from '../interfaces/maquinaInfo.interface';

interface BarStopsProps {
  data: iInfoIhmLive[];
  cycleData: iMaquinaInfo[];
}

interface StopSummary {
  motivo: string;
  problema: string;
  causa: string;
  tempo: number;
  impacto: number;
}

const BarStops: React.FC<BarStopsProps> = ({ data, cycleData }) => {
  //  Filtro dos itens que não afetam a eficiência
  const filteredData = useMemo(() => {
    return impactFilter(data);
  }, [data]);

  // Calcula o tempo total de parada
  const totalStopTime = useMemo(
    () =>
      filteredData
        .filter((item) => item.status === 'parada')
        .reduce((acc, item) => acc + item.tempo || 0, 0),
    [filteredData]
  );

  // Cria a perda por ciclo baixo
  const cycleLost = useMemo(() => {
    // Tempo rodando
    const totalRunTime = filteredData
      .filter((item) => item.status === 'rodando')
      .reduce((acc, item) => acc + item.tempo, 0);
    // Filtra pela maquina rodando
    cycleData = cycleData.filter((item) => item.status === 'true');
    // Produto único
    const product = cycleData.length > 0 ? cycleData[0].produto : '';
    // Verifica se o produto contém a palavra ' BOL', se tiver usa CICLOS_ESPERADOS, se não CICLOS_ESPERADOS_BOL
    const ciclosIdeais = product.includes(' BOL')
      ? CICLOS_ESPERADOS_BOL
      : CICLOS_ESPERADOS;

    // Média de ciclos por minuto
    const cycleAverage =
      cycleData.reduce((acc, item) => acc + item.ciclo_1_min, 0) / cycleData.length;
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

    // Calcula o tempo total de parada
    const stopTime = totalStopTime + lostCycleTime;

    // Converte para array e calcula o impacto
    return Object.values(allStops)
      .map((item) => ({
        ...item,
        impacto: parseFloat(((item.tempo / stopTime) * 100).toFixed(2)),
      }))
      .sort((a, b) => b.tempo - a.tempo);
  }, [filteredData, cycleLost, totalStopTime]);

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
    },
    yAxis: {
      type: 'category',
      data: stopSummary.map(
        (item) => `${item.motivo} - ${item.problema} - ${item.causa}`
      ),
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
              item.causa === 'Realizar análise de falha' ||
              item.causa === 'Necessidade de análise'
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

  return (
    <>
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
