import { format } from 'date-fns';
import EChartsReact from 'echarts-for-react';
import React, { useMemo, useState } from 'react';
import { Alert, Row, Spinner } from 'react-bootstrap';
import { BSColors, TurnoID, colorObj } from '../../../helpers/constants';
import { iInfoIHM } from '../../../interfaces/InfoIHM.interface';

interface DashTimelineProps {
  data: iInfoIHM[];
  selectedLines: number[];
  selectedShift: TurnoID;
}

const DashTimeline: React.FC<DashTimelineProps> = ({ data, selectedLines, selectedShift }) => {
  const [isLoading, setIsLoading] = useState(true);

  // Processa todos os dados para criar a timeline multi-linha
  const { processedData, timeRange, uniqueMotivos, lineNumbers } = useMemo(() => {
    setIsLoading(true);

    if (!data || data.length === 0) {
      setIsLoading(false);
      return {
        processedData: [],
        timeRange: { min: 0, max: 24 * 60 },
        uniqueMotivos: [],
        lineNumbers: [],
      };
    }

    // Determina quais linhas mostrar (todas ou selecionadas)
    let linesToShow: number[] = [];

    // Se há linhas selecionadas, use-as; caso contrário, extraia todas as linhas dos dados
    if (selectedLines && selectedLines.length > 0 && selectedLines.length < 14) {
      linesToShow = selectedLines;
    } else {
      // Extrair números de linha únicos dos dados
      linesToShow = Array.from(new Set(data.map((item) => item.linha))).sort((a, b) => a - b);
    }

    // Processar os dados para o formato de timeline
    const processed = data.map((item) => {
      // Converter timestamp para objetos Date
      const startTime = new Date(item.data_hora);
      const endTime = new Date(item.data_hora_final);

      // Calcular minutos desde o início do dia
      const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
      let endMinutes = endTime.getHours() * 60 + endTime.getMinutes();

      // Lidar com eventos que cruzam a meia-noite
      if (endMinutes < startMinutes) {
        endMinutes = endMinutes + 24 * 60;
      }

      // Processar os dados para formato padrão
      return {
        ...item,
        causa:
          item.status === 'rodando'
            ? ''
            : item.status === 'parada' && !item.motivo
              ? ''
              : item.causa,
        motivo:
          item.status === 'rodando'
            ? 'Rodando'
            : item.causa === 'Refeição'
              ? 'Refeição'
              : item.status === 'parada' && !item.motivo
                ? 'Não apontado'
                : item.motivo,
        problema:
          item.status === 'rodando'
            ? ''
            : item.status === 'parada' && !item.motivo
              ? ''
              : item.problema,
        startMinutes,
        endMinutes,
      };
    });

    // Calcular range de tempo (min e max)
    const minTime = Math.min(...processed.map((item) => item.startMinutes));
    const maxTime = Math.max(...processed.map((item) => item.endMinutes));

    const range = {
      min: Math.max(0, minTime),
      max: Math.min(24 * 60, maxTime),
    };

    // Extrair motivos únicos e ordená-los
    const motivos = Array.from(new Set(processed.map((item) => item.motivo))).sort();

    setIsLoading(false);

    return {
      processedData: processed,
      timeRange: range,
      uniqueMotivos: motivos,
      lineNumbers: linesToShow,
    };
  }, [data, selectedLines]);

  // Modificar o useMemo do series
  const series = useMemo(() => {
    // Criar apenas uma série por motivo, contendo dados de todas as linhas
    const seriesByMotivo: Record<string, any[]> = {};

    // Inicializar arrays para cada motivo
    uniqueMotivos.forEach((motivo) => {
      seriesByMotivo[motivo] = [];
    });

    // Agrupar dados por motivo
    lineNumbers.forEach((lineNumber, lineIndex) => {
      // Filtrar dados para esta linha
      const lineData = processedData.filter((item) => item.linha === lineNumber);

      // Agrupar dados desta linha por motivo
      lineData.forEach((item) => {
        if (seriesByMotivo[item.motivo]) {
          seriesByMotivo[item.motivo].push({
            ...item,
            lineIndex: lineIndex, // Armazenar índice da linha para posicionamento
          });
        }
      });
    });

    // Atualização na definição das séries
    return uniqueMotivos.map((motivo) => ({
      name: motivo,
      type: 'custom',
      renderItem: (params: any, api: any) => {
        const start = api.coord([api.value(0), api.value(2)]); // [startMinutes, lineIndex]
        const end = api.coord([api.value(1), api.value(2)]); // [endMinutes, lineIndex]
        const height = 20;

        // Obter o índice do dataItem atual
        const dataIndex = params.dataIndex;
        const item = params.data;

        // Criar retângulo clicável
        return {
          type: 'rect',
          shape: {
            x: start[0],
            y: start[1] - height / 2,
            width: Math.max(end[0] - start[0], 2), // Garantir largura mínima para clique
            height: height,
          },
          style: api.style({
            fill: colorObj[motivo as keyof typeof colorObj] || BSColors.GREY_600_COLOR,
          }),
          // Propriedades importantes para interatividade
          silent: false, // Não silenciar eventos do mouse
          emphasis: {
            // Destacar ao passar o mouse
            itemStyle: {
              // Tornar ligeiramente mais escuro ao passar o mouse
              shadowBlur: 5,
              shadowColor: 'rgba(0,0,0,0.3)',
            },
          },
          // Este é o identificador do dado para o tooltip
          dataIndex: dataIndex,
          // Certificar que o dados do tooltip estejam corretos
          data: item,
          // Certificar que o tooltip seja acionado por este elemento
          tooltip: {
            show: true,
          },
        };
      },
      encode: {
        x: [0, 1], // startMinutes, endMinutes
        y: 2, // lineIndex
        tooltip: [0, 1, 2], // Garantir que esses valores sejam incluídos no tooltip
      },
      // Importante: adicionar o campo tooltip para referência de dados
      tooltip: {
        trigger: 'item',
      },
      data: seriesByMotivo[motivo].map((item) => {
        return {
          ...item,
          value: [item.startMinutes, item.endMinutes, item.lineIndex],
          // Garantir que todos os dados necessários estejam disponíveis
          originalData: item, // Armazenar os dados originais para o tooltip
        };
      }),
      itemStyle: {
        color: colorObj[motivo as keyof typeof colorObj] || BSColors.GREY_600_COLOR,
      },
    }));
  }, [processedData, uniqueMotivos, lineNumbers]);

  // Configuração do gráfico
  const option = useMemo(() => {
    // Se não houver dados ou linhas, retornar configuração vazia
    if (lineNumbers.length === 0 || processedData.length === 0) {
      return {};
    }

    return {
      title: {
        text: 'Timeline de Paradas por Linha',
        left: 'center',
        top: 0,
        textStyle: {
          fontSize: 20,
          fontFamily: 'Poppins',
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const data = params.data;
          return `
            <div>
              <b>Linha ${data.linha} - ${data.motivo}</b><br/>
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
        top: '10%',
        left: 'center',
        textStyle: {
          fontSize: 11,
          fontFamily: 'Poppins',
        },
        itemGap: 10,
        type: 'scroll',
        pageIconSize: 12,
      },
      grid: {
        top: '15%',
        left: '1%', // Espaço para os rótulos de linha
        right: '1%',
        bottom: '1%',
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
          fontSize: 11,
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            color: '#ddd',
          },
        },
      },
      yAxis: {
        type: 'category',
        data: lineNumbers.map((line) => `Linha ${line}`),
        axisLabel: {
          show: true,
          fontSize: 12,
          fontWeight: 'bold',
        },
      },
      series: series,
      toolbox: {
        feature: {
          saveAsImage: { title: 'Salvar' },
        },
      },
    };
  }, [processedData, timeRange, uniqueMotivos, lineNumbers, series]);

  // Cria uma key única baseada nos dados para forçar re-renderização
  const chartKey = useMemo(() => {
    return `dashboard-timeline-${data.length}-${lineNumbers.join('-')}-${selectedShift}`;
  }, [data.length, lineNumbers, selectedShift]);

  return (
    <>
      {!isLoading ? (
        processedData.length > 0 ? (
          <Row className='p-2'>
            <EChartsReact
              key={chartKey}
              option={option}
              style={{ height: `${Math.max(300, lineNumbers.length * 50)}px` }}
              opts={{ renderer: 'canvas' }}
              notMerge={true}
              lazyUpdate={false}
            />
          </Row>
        ) : (
          <Row
            style={{ height: '200px' }}
            className='d-flex justify-content-center align-items-center p-2'
          >
            <Alert variant='info' className='text-center'>
              Sem dados disponíveis para exibição. Por favor, selecione outra data ou período.
            </Alert>
          </Row>
        )
      ) : (
        <Row
          className='d-flex justify-content-center align-items-center p-3'
          style={{ height: '200px' }}
        >
          <Spinner animation='border' style={{ width: '3rem', height: '3rem' }} />
        </Row>
      )}
    </>
  );
};

export default DashTimeline;
