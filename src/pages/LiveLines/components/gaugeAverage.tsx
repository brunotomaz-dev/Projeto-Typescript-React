import EChartsReact from 'echarts-for-react';
import React from 'react';
import { Col } from 'react-bootstrap';
import { ColorsSTM } from '../../../helpers/constants';

interface GaugeAverageProps {
  average: number;
  turn: string;
}

const GaugeAverage: React.FC<GaugeAverageProps> = ({ average, turn }) => {
  average = Math.round(average);
  const colorOpt = average >= 90 ? ColorsSTM.GREEN : ColorsSTM.RED;

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
        type: 'gauge',
        startAngle: 90,
        endAngle: -270,
        min: 0,
        max: 100,
        itemStyle: {
          color: colorOpt,
        },
        progress: {
          show: true,
        },
        axisLine: {
          lineStyle: {
            color: [
              [0.9, '#fff'],
              [1, '#fff'],
            ],
            width: 15,
            // shadowColor: 'rgba(0,0,0,0.5)',
            // shadowBlur: 15,
          },
        },
        axisLabel: {
          show: false,
        },
        splitNumber: 1,
        splitLine: {
          length: 15,
          distance: -15,
          width: 2,
          // lineStyle: {
          //   shadowColor: 'rgba(0,0,0,0.3)',
          //   shadowBlur: 3,
          //   shadowOffsetX: 1,
          //   shadowOffsetY: 2,
          // },
        },
        axisTick: {
          show: false,
          splitNumber: 0,
          lineStyle: {
            color: ColorsSTM.GREEN,
            width: 2,
          },
        },
        pointer: {
          show: false,
        },
        title: {
          offsetCenter: [0, '15%'],
          fontSize: 12,
          color: colorOpt,
          fontWeight: 'bold',
          fontFamily: 'Poppins',
        },
        detail: {
          formatter: '{value}%',
          fontSize: 20,
          offsetCenter: [0, '-15%'],
          color: colorOpt,
          valueAnimation: true,
        },
        data: [{ value: average, name: turn }],
      },
      {
        type: 'custom',
        coordinateSystem: 'none',
        renderItem: (_params: any, api: any) => {
          const centerX = api.getWidth() / 2;
          const centerY = api.getHeight() / 2;
          const radius = Math.min(api.getWidth(), api.getHeight()) / 2;

          return {
            type: 'circle',
            shape: {
              cx: centerX,
              cy: centerY,
              r: radius * 0.53,
            },
            style: {
              fill: '#fff',
              shadowBlur: 50,
              shadowColor: 'rgba(0,0,0,0.2)',
              shadowOffsetX: 5,
              shadowOffsetY: 5,
            },
          };
        },
        data: [{ value: average, name: turn }],
        z: 1,
      },
    ],
  };

  return (
    <Col style={{ minWidth: '200px', minHeight: '150px' }}>
      <EChartsReact option={option} style={{ height: '100%', width: '100%' }} />
    </Col>
  );
};

export default GaugeAverage;
