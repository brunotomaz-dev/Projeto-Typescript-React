import Color from 'color';
import EChartsReact from 'echarts-for-react';
import React, { useMemo } from 'react';
import { Row } from 'react-bootstrap';
import { BSColors, ColorsSTM } from '../../../helpers/constants';
import { useEfficiencyComparison } from '../../../hooks/useEfficiencyComparison';

const EfficiencyComparison: React.FC = () => {
  /* -------------------------------------------- USE HOOK --------------------------------------------- */
  const {
    factoryEff,
    turnEff,
    lineEff,
    currentEff,
    currentTurn,
    isLoading,
    meta,
    isFactoryAboveMeta,
    isTurnAboveMeta,
    isLineAboveMeta,
    isCurrentAboveMeta,
    hasData,
    isFetching,
  } = useEfficiencyComparison();

  // Arredondar os valores
  const roundedFactoryEff = Math.round(factoryEff);
  const roundedTurnEff = Math.round(turnEff);
  const roundedLineEff = Math.round(lineEff);
  const roundedCurrentEff = Math.round(currentEff);

  // Memoizar a configuração do gráfico para evitar recálculos desnecessários
  const option = useMemo(
    () => ({
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
        splitLine: {
          show: false,
        },
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
          data: [roundedFactoryEff],
          z: 4,
          itemStyle: {
            color: isFactoryAboveMeta ? Color(ColorsSTM.GREEN).darken(0.6).hex() : BSColors.GREY_900_COLOR,
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
          data: [roundedTurnEff],
          z: 3,
          itemStyle: {
            color: isTurnAboveMeta ? Color(ColorsSTM.GREEN).darken(0.45).hex() : BSColors.GREY_800_COLOR,
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
          data: [roundedLineEff],
          z: 2,
          itemStyle: {
            color: isLineAboveMeta ? Color(ColorsSTM.GREEN).darken(0.3).hex() : BSColors.GREY_700_COLOR,
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
          data: [roundedCurrentEff],
          z: 1,
          itemStyle: {
            color: isCurrentAboveMeta ? ColorsSTM.GREEN : ColorsSTM.RED,
          },
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
    }),
    [roundedFactoryEff, roundedTurnEff, roundedLineEff, roundedCurrentEff, currentTurn, meta]
  );

  /* --------------------------------------------------------------------------------------------------------- */
  /*                                                   LAYOUT                                                  */
  /* --------------------------------------------------------------------------------------------------------- */
  const isRefreshing = isLoading || isFetching;

  return (
    <>
      {isRefreshing && (
        <div className='position-absolute top-0 end-0 m-2'>
          <div className={`spinner-border ${isLoading ? 'text-secondary' : 'text-light-grey'}`} role='status'>
            <span className='visually-hidden'>Atualizando...</span>
          </div>
        </div>
      )}
      {hasData ? (
        <EChartsReact option={option} style={{ height: '100%', width: '100%' }} />
      ) : (
        <Row className='align-items-center text-center h-100'>
          <h5>Não há médias registradas</h5>
        </Row>
      )}
    </>
  );
};

export default EfficiencyComparison;
