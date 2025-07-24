import EChartsReact from 'echarts-for-react';
import React from 'react';
import { Row } from 'react-bootstrap';
import { BSColors } from '../../../helpers/constants';
import { useBarStopsData } from '../../../hooks/useBarStopsData';
import { useStopSummary } from '../../../hooks/useStopSummary';

const BarStops: React.FC = () => {
  /* ------------------------------------------------- Hook's ------------------------------------------------ */
  const { data, cycleData, isLoading, isFetching } = useBarStopsData();

  /* ------------------------------------------------ Funções ------------------------------------------------ */
  // Usar o hook personalizado para calcular todos os dados de parada
  const { stopSummary, totalStopTime } = useStopSummary(data, cycleData);

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
