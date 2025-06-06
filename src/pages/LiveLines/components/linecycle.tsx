import EChartsReact from 'echarts-for-react';
import React, { useMemo } from 'react';
import { Row } from 'react-bootstrap';
import { BSColors } from '../../../helpers/constants';
import { useLineCycleData } from '../../../hooks/useLineCycleData';

const LineCycle: React.FC = () => {
  /* ------------------------------------------------- Hook's ------------------------------------------------ */
  // Usar o hook especializado para obter os dados
  const { cycles, hours, averageCycles, hasData, isLoading, isFetching } = useLineCycleData();

  /* ------------------------------------------------- Option ------------------------------------------------ */
  // Configurações do gráfico
  const options = useMemo(
    () => ({
      textStyle: {
        fontFamily: 'Poppins',
      },
      title: {
        text: 'Ciclos de Máquina',
        left: 'center',
        textStyle: {
          fontSize: 16,
        },
      },
      grid: {
        left: '1.5%',
        right: '1.5%',
        bottom: '5%',
        top: '25%',
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        textStyle: {
          color: BSColors.BLUE_DELFT_COLOR,
        },
      },
      xAxis: {
        type: 'category',
        data: hours,
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
        splitLine: {
          show: false,
        },
      },
      series: [
        {
          data: cycles,
          type: 'line',
          itemStyle: {
            color: BSColors.GREY_600_COLOR,
          },
          showSymbol: false,
          markLine: {
            symbol: ['none', 'none'],
            lineStyle: {
              color: BSColors.ORANGE_COLOR,
              type: 'dashed',
              width: 1,
            },
            label: {
              formatter: `Média: ${averageCycles}`,
              position: 'insideStartTop',
              distance: 20,
              color: BSColors.GREY_700_COLOR,
            },
            data: [
              {
                yAxis: parseFloat(averageCycles),
                name: 'Média',
              },
            ],
          },
        },
      ],
    }),
    [cycles, hours, averageCycles]
  );

  // Se não houver dados, mostrar mensagem
  if (!hasData) {
    return (
      <Row className='mb-2 p-2 d-flex justify-content-center align-items-center' style={{ height: '220px' }}>
        <h5 className='text-center text-secondary'>Sem dados de ciclos disponíveis</h5>
      </Row>
    );
  }

  /* --------------------------------------------------------------------------------------------------------- */
  /*                                                   LAYOUT                                                  */
  /* --------------------------------------------------------------------------------------------------------- */
  const isRefreshing = isLoading || isFetching;

  return (
    <>
      {isRefreshing && (
        <Row className='position-absolute top-0 end-0 m-2'>
          <div className={`spinner-border ${isLoading ? 'text-secondary' : 'text-light-grey'}`} role='status'>
            <span className='visually-hidden'>Atualizando...</span>
          </div>
        </Row>
      )}
      <Row className='mb-2 p-2' style={{ height: '220px' }}>
        <EChartsReact option={options} style={{ height: '100%', width: '100%' }} />
      </Row>
    </>
  );
};

export default LineCycle;
