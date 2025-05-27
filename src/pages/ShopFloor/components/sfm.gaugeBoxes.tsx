import ReactEcharts, { EChartsOption } from 'echarts-for-react';
import React from 'react';
import { ColorsSTM } from '../../../helpers/constants';

interface GaugeProps {
  data: number;
  style?: React.CSSProperties;
}

const Gauge: React.FC<GaugeProps> = ({ data, style }) => {
  /* ------------------------------------------------- Option ------------------------------------------------ */
  const options: EChartsOption = {
    textStyle: {
      fontFamily: 'Poppins',
    },
    tooltip: {
      formatter: 'Cxs/Pessoa : {c}',
      shadowColor: 'rgba(0, 0, 0, 0.5)',
      shadowBlur: 10,
    },
    series: [
      {
        title: {
          offsetCenter: [0, '100%'],
          fontSize: 20,
          color: 'auto',
          fontWeight: 'bold',
        },
        type: 'gauge',
        startAngle: 220,
        endAngle: -40,
        min: 0,
        max: 60,
        center: ['50%', '50%'],
        splitNumber: 4,
        axisLine: {
          lineStyle: {
            // Convertido para proporções: [0-0.75 = RED, 0.75-0.833 = YELLOW,
            color: [
              [0.75, ColorsSTM.RED], // 0-45 (45/60 = 0.75)
              [0.833, ColorsSTM.YELLOW], // 45-50 (50/60 = 0.833)
              [1, ColorsSTM.GREEN], // 50-60 (60/60 = 1)
            ],
            width: 14,
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
          distance: -14,
          lineStyle: {
            color: '#fff',
            width: 2,
          },
        },
        splitLine: {
          length: 14,
          distance: -14,
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
          fontSize: 26,
          color: 'auto',
          offsetCenter: [0, '60%'],
          formatter: '{value}',
        },
        data: [{ value: data, name: 'Cxs/Pessoa' }],
      },
    ],
  };

  /* --------------------------------------------------------------------------------------------------------- */
  /*                                                   LAYOUT                                                  */
  /* --------------------------------------------------------------------------------------------------------- */
  return (
    <ReactEcharts
      option={options}
      style={style ? style : { height: '200px', width: '100%' }}
      opts={{ renderer: 'canvas' }}
    />
  );
};

export default Gauge;
