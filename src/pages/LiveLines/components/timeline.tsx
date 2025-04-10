import { format } from 'date-fns';
import EChartsReact from 'echarts-for-react';
import React, { useMemo } from 'react';
import { Row } from 'react-bootstrap';
import { BSColors, colorObj } from '../../../helpers/constants';
import { iInfoIhmLive } from '../interfaces/infoIhm.interface';

interface TimelineProps {
  data: iInfoIhmLive[];
}

const Timeline: React.FC<TimelineProps> = ({ data }) => {
  // Processa todos os dados em um único useMemo
  const { processedData, timeRange, uniqueMotivos } = useMemo(() => {
    // Processa os dados
    const processed = data.map((item) => {
      const startTime = new Date(item.data_hora);
      const endTime = new Date(item.data_hora_final);
      const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
      let endMinutes = endTime.getHours() * 60 + endTime.getMinutes();

      if (endMinutes < startMinutes) {
        endMinutes = endMinutes + 24 * 60;
      }

      return {
        ...item,
        causa:
          item.status === 'rodando'
            ? ''
            : item.status === 'parada' && item.motivo === null
              ? ''
              : item.causa,
        motivo:
          item.status === 'rodando'
            ? 'Rodando'
            : item.causa === 'Refeição'
              ? 'Refeição'
              : item.status === 'parada' && item.motivo === null
                ? 'Não apontado'
                : item.motivo,
        problema:
          item.status === 'rodando'
            ? ''
            : item.status === 'parada' && item.motivo === null
              ? ''
              : item.problema,
        startMinutes,
        endMinutes,
      };
    });

    // Calcula timeRange
    const minTime = Math.min(...processed.map((item) => item.startMinutes));
    const maxTime = Math.max(...processed.map((item) => item.endMinutes));

    const range = {
      min: Math.max(0, minTime),
      max: Math.min(24 * 60, maxTime),
    };

    // Extrai motivos únicos
    const motivos = Array.from(new Set(processed.map((item) => item.motivo))).sort();

    return {
      processedData: processed,
      timeRange: range,
      uniqueMotivos: motivos,
    };
  }, [data]);

  // Cria as séries em um useMemo separado
  const series = useMemo(() => {
    return uniqueMotivos.map((motivo) => ({
      name: motivo,
      type: 'custom',
      legendHoverLink: true,
      itemStyle: {
        color: colorObj[motivo as keyof typeof colorObj] || BSColors.GREY_600_COLOR,
      },
      renderItem: (params: any, api: any) => {
        const start = api.coord([api.value(0), params.coordSys.y[0]]);
        const end = api.coord([api.value(1), params.coordSys.y[0]]);
        const height = 30;

        return {
          type: 'rect',
          shape: {
            x: start[0],
            y: start[1] - height / 2,
            width: end[0] - start[0],
            height: height,
          },
          style: {
            fill: colorObj[motivo as keyof typeof colorObj] || BSColors.GREY_600_COLOR,
          },
        };
      },
      data: processedData
        .filter((item) => item.motivo === motivo)
        .map((item) => ({
          ...item,
          value: [item.startMinutes, item.endMinutes],
        })),
    }));
  }, [processedData, uniqueMotivos]);

  const option = {
    title: {
      text: 'Timeline de Paradas',
      left: 'center',
      top: 0,
      textStyle: {
        fontSize: 18,
        fontFamily: 'Poppins',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const data = params.data;
        return `
          <div>
            <b>${data.motivo}</b><br/>
            ${data.problema ? `Problema: ${data.problema}<br/>` : ''}
            ${data.causa ? `Causa: ${data.causa}<br/>` : ''}
            Horário: ${format(new Date(data.data_hora), 'HH:mm')} - ${format(new Date(data.data_hora_final), 'HH:mm')}<br/>
            Duração: ${data.tempo} min<br/>
            <b>${data.afeta_eff ? 'Não impacta' : ''}</b>
          </div>
        `;
      },
    },
    legend: {
      show: true,
      data: uniqueMotivos,
      orient: 'horizontal',
      top: 60,
      left: 'center',
      textStyle: {
        fontSize: 11,
        fontFamily: 'Poppins',
      },
      itemGap: 10,
    },
    grid: {
      top: 90,
      left: '1.5%',
      right: '1.5%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      min: timeRange.min,
      max: timeRange.max,
      axisLabel: {
        formatter: (value: number) => {
          const hours = Math.floor(value / 60);
          const minutes = value % 60;
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        },
      },
    },
    yAxis: {
      type: 'category',
      data: ['Timeline'],
      axisLabel: { show: false },
    },
    series: series,
  };

  // Cria uma key única baseada nos dados
  const chartKey = useMemo(() => {
    return `timeline-${data.length}-${timeRange.min}-${timeRange.max}-${uniqueMotivos.join('-')}`;
  }, [data.length, timeRange.min, timeRange.max, uniqueMotivos]);

  return (
    <>
      {data.length > 0 && (
        <Row className='p-2'>
          <EChartsReact
            key={chartKey}
            option={option}
            style={{ height: '150px' }}
            notMerge={true} // Força recriação completa do gráfico
            lazyUpdate={false} // Desativa atualizações lazy
          />
        </Row>
      )}
    </>
  );
};

export default Timeline;
