import ReactECharts from 'echarts-for-react';
import React from 'react';
import { ColorsSTM, IndicatorType } from '../helpers/constants';

type Position = 'top' | 'bottom' | 'center' | 'up-center' | 'down-center';

interface GaugeProps {
  indicator: IndicatorType;
  data: number;
  large?: boolean;
  pos?: Position;
  trio?: boolean;
}

const GaugeChart: React.FC<GaugeProps> = ({
  indicator,
  data,
  large = false,
  pos = 'up-center',
  trio = false,
}) => {
  // Opções de cores do gauge conforme o indicador
  const optColor = {
    [IndicatorType.PERFORMANCE]: [
      [0.1, ColorsSTM.GREEN],
      [1, ColorsSTM.RED],
    ],
    [IndicatorType.REPAIR]: [
      [0.1, ColorsSTM.GREEN],
      [1, ColorsSTM.RED],
    ],
    [IndicatorType.EFFICIENCY]: [
      [0.89, ColorsSTM.RED],
      [1, ColorsSTM.GREEN],
    ],
  };

  // Opção de Altura do gauge
  const position_y = {
    top: '35%',
    bottom: '65%',
    center: '50%',
    'up-center': '46%',
    'down-center': '55%',
  };

  // Arredondar o valor de data para 2 casas decimais
  data = Math.round(data * 100) / 100;

  // Configurações do gauge
  const option = {
    textStyle: {
      fontFamily: 'Poppins',
    },
    tooltip: {
      formatter: '{b} : {c}%',
      shadowColor: 'rgba(0, 0, 0, 0.5)',
      shadowBlur: 10,
    },
    series: [
      {
        title: {
          offsetCenter: trio ? [0, '120%'] : [0, '115%'],
          fontSize: trio ? 16 : 20,
          color: 'auto',
          fontWeight: 'bold',
          fontFamily: 'Poppins',
        },
        type: 'gauge',
        startAngle: 220,
        endAngle: -40,
        min: 0,
        max: indicator === IndicatorType.EFFICIENCY ? 100 : 40,
        center: ['50%', position_y[pos]],
        splitNumber: 4,
        axisLine: {
          lineStyle: {
            color: optColor[indicator],
            width: trio ? 12 : 14,
            shadowColor: 'rgba(0,0,0,0.5)',
            shadowBlur: 10,
          },
        },
        pointer: {
          width: 4,
          itemStyle: {
            color: 'auto',
          },
        },
        axisTick: {
          length: 4,
          distance: trio ? -12 : -14,
          lineStyle: {
            color: '#fff',
            width: 2,
          },
        },
        splitLine: {
          length: trio ? 12 : 14,
          distance: trio ? -12 : -14,
          width: 2,
          lineStyle: {
            color: '#fff',
            width: 2,
          },
        },
        axisLabel: {
          color: 'auto',
          fontSize: 10,
          distance: -15,
        },
        detail: {
          fontSize: trio ? 24 : 26,
          offsetCenter: trio ? [0, '80%'] : [0, '70%'],
          valueAnimation: true,
          formatter: function (value: number) {
            return Math.round(value) + '%';
          },
          color: 'auto',
        },
        data: [
          {
            value: data,
            name:
              indicator === IndicatorType.EFFICIENCY
                ? 'EFICIÊNCIA'
                : indicator.toUpperCase(),
          },
        ],
      },
    ],
  };

  const size = large
    ? { height: '300px', width: '100%' }
    : { height: '200px', width: '100%' };

  return <ReactECharts option={option} style={size} opts={{ renderer: 'canvas' }} />;
};

export default GaugeChart;
