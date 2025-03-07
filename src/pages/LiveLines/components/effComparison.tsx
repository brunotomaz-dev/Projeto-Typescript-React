import Color from 'color';
import EChartsReact from 'echarts-for-react';
import React from 'react';
import { Row } from 'react-bootstrap';
import { BSColors, ColorsSTM } from '../../../helpers/constants';

interface EfficiencyComparisonProps {
  factoryEff: number;
  turnEff: number;
  lineEff: number;
  currentEff: number;
  currentTurn: string;
  meta?: number;
}

const EfficiencyComparison: React.FC<EfficiencyComparisonProps> = ({
  factoryEff,
  turnEff,
  lineEff,
  currentEff,
  currentTurn,
  meta = 90,
}) => {
  // Arredondar os valores
  factoryEff = Math.round(factoryEff);
  turnEff = Math.round(turnEff);
  lineEff = Math.round(lineEff);
  currentEff = Math.round(currentEff);

  const option = {
    title: {
      text: 'Eficiência Mensal x Linha Atual',
      left: 'center',
      textStyle: {
        fontSize: 14,
      },
    },
    textStyle: { fontFamily: 'Poppins' },
    grid: {
      left: '0%',
      right: '0%',
      bottom: '5%',
      top: '15%',
      containLabel: true,
    },
    yAxis: {
      type: 'value',
      max: 100,
      // name: '%',
    },
    xAxis: {
      type: 'category',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
    },
    series: [
      {
        type: 'bar',
        data: [factoryEff],
        z: 4,
        itemStyle: {
          color:
            factoryEff >= 90 ? Color(ColorsSTM.GREEN).darken(0.6).hex() : BSColors.GREY_900_COLOR,
        },
        label: {
          show: true,
          position: 'inside',
          formatter: 'Fábrica\n{c}%',
          color: '#fff',
        },
        labelLayout: {
          hideOverlap: true,
        },
      },
      {
        type: 'bar',
        data: [turnEff],
        z: 3,
        itemStyle: {
          color:
            turnEff >= 90 ? Color(ColorsSTM.GREEN).darken(0.45).hex() : BSColors.GREY_800_COLOR,
        },
        label: {
          show: true,
          position: 'inside',
          formatter: `${currentTurn}\n{c}%`,
          color: '#fff',
        },
        labelLayout: {
          hideOverlap: true,
        },
      },
      {
        type: 'bar',
        data: [lineEff],
        z: 2,
        itemStyle: {
          color: lineEff >= 90 ? Color(ColorsSTM.GREEN).darken(0.3).hex() : BSColors.GREY_700_COLOR,
        },
        label: {
          show: true,
          position: 'inside',
          formatter: 'Linha\n{c}%',
          color: '#fff',
        },
        labelLayout: {
          hideOverlap: true,
        },
      },
      {
        type: 'bar',
        data: [currentEff],
        z: 1,
        itemStyle: { color: currentEff >= 90 ? ColorsSTM.GREEN : ColorsSTM.RED },
        label: {
          show: true,
          position: 'inside',
          formatter: 'Atual\n{c}%',
          color: '#fff',
        },
        labelLayout: {
          hideOverlap: true,
        },
        markLine: {
          silent: true,
          symbol: ['none', 'none'],
          lineStyle: {
            color: BSColors.SECONDARY_COLOR,
            type: 'dashed',
            width: 1,
          },
          label: {
            position: 'start',
            offset: [70, -10],
            formatter: `Meta: ${meta}%`,
            color: BSColors.BLUE_DELFT_COLOR,
          },
          data: [{ yAxis: meta }],
        },
      },
    ],
  };

  // const option = {
  //   title: {
  //     text: 'Comparação de Eficiência',
  //     left: 'center',
  //     textStyle: {
  //       fontSize: 14,
  //     },
  //   },
  //   textStyle: { fontFamily: 'Poppins' },
  //   series: [
  //     {
  //       type: 'gauge',
  //       startAngle: 90,
  //       endAngle: -270,
  //       pointer: {
  //         show: false,
  //       },
  //       progress: {
  //         show: true,
  //         overlap: false,
  //         roundCap: true,
  //         clip: false,
  //         itemStyle: {
  //           borderWidth: 1,
  //           borderColor: '#464646',
  //         },
  //       },
  //       center: ['50%', '55%'],
  //       radius: '80%',
  //       axisLine: {
  //         lineStyle: {
  //           width: 20,
  //         },
  //       },
  //       splitLine: {
  //         show: false,
  //         distance: 0,
  //         length: 10,
  //       },
  //       axisTick: {
  //         show: false,
  //       },
  //       axisLabel: {
  //         show: false,
  //       },
  //       data: [
  //         {
  //           value: factoryEff,
  //           name: 'Fábrica',
  //           title: {
  //             offsetCenter: ['0%', '-55%'],
  //           },
  //           detail: {
  //             valueAnimation: true,
  //             offsetCenter: ['0%', '-33%'],
  //           },
  //         },
  //         {
  //           value: lineEff,
  //           name: 'Linha',
  //           title: {
  //             offsetCenter: ['0%', '-7%'],
  //           },
  //           detail: {
  //             valueAnimation: true,
  //             offsetCenter: ['0%', '15%'],
  //           },
  //         },
  //         {
  //           value: Math.round(currentEff),
  //           name: 'Atual',
  //           title: {
  //             offsetCenter: ['0%', '38%'],
  //           },
  //           detail: {
  //             valueAnimation: true,
  //             offsetCenter: ['0%', '58%'],
  //           },
  //         },
  //       ],
  //       title: {
  //         fontSize: 14,
  //       },
  //       detail: {
  //         width: 40,
  //         height: 12,
  //         fontSize: 10,
  //         color: 'inherit',
  //         borderColor: 'inherit',
  //         borderWidth: 1,
  //         borderRadius: 20,
  //         formatter: '{value}%',
  //       },
  //     },
  //   ],
  // };

  return (
    <>
      {factoryEff > 0 ? (
        <EChartsReact option={option} style={{ height: '100%', width: '100%' }} />
      ) : (
        <Row className='align-items-center text-center h-100'>
          <h5>Não médias registradas</h5>
        </Row>
      )}
    </>
  );
};

export default EfficiencyComparison;
