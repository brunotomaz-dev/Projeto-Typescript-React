import EChartsReact from 'echarts-for-react';
import React from 'react';
import { Row } from 'react-bootstrap';
import { BSColors } from '../../../helpers/constants';
import { iMaquinaInfo } from '../interfaces/maquinaInfo.interface';

interface LineCycleProps {
  maqInfo: iMaquinaInfo[];
}

const LineCycle: React.FC<LineCycleProps> = ({ maqInfo }) => {
  // Ordenar os dados por recno
  maqInfo.sort((a, b) => a.recno - b.recno);

  // Dados para o gráfico de linha
  const cycles = maqInfo.map((maq) => maq.ciclo_1_min);
  let hour = maqInfo.map((maq) => maq.hora_registro);

  // Ajustar a hora para o formato hh:mm sendo que estava em hh:mm:ss.ms
  hour = hour.map((h) => {
    const [hour, minute] = h.split(':');
    return `${hour}:${minute}`;
  });

  // Média de ciclos (só com a máquina no status 'true')
  const maqTrue = maqInfo.filter((item) => item.ciclo_1_min > 0);
  const averageCycles = (maqTrue.reduce((acc, item) => acc + item.ciclo_1_min, 0) / maqTrue.length).toFixed(
    2
  );
  // options for the chart line
  const options = {
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
      data: hour,
      axisTick: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: cycles,
        type: 'line',
        itemStyle: {
          color: BSColors.GREY_600_COLOR,
        },
        showSymbol: false,
        // markPoint: {
        //   data: [
        //     {
        //       type: 'max',
        //     },
        //   ],
        //   symbol: 'pin',
        // },
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
  };

  return (
    <>
      {maqInfo.length > 0 && (
        <Row className='mb-2 p-2' style={{ height: '220px' }}>
          <EChartsReact option={options} style={{ height: '100%', width: '100%' }} />
        </Row>
      )}
    </>
  );
};

export default LineCycle;
