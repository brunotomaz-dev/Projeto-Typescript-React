import ReactECharts from 'echarts-for-react';
import React, { useMemo } from 'react';
import { Card } from 'react-bootstrap';
import { useFullInfoIHMQuery } from '../../../../../hooks/queries/useFullInfoIhmQuery';

interface SetupGrouped {
  [key: string]: {
    linha: number;
    turno: string;
    data: string;
    tempoTotal: number;
    problemas: string[];
    count: number;
  };
}

const TempoMedioPorTurnoChart: React.FC = () => {
  const { data, isRefreshing } = useFullInfoIHMQuery('management');

  // Manter apenas os dados com motivo 'Setup'
  const setupData = data?.filter((item) => item.motivo === 'Setup') || [];

  // Função para ordenar turnos na ordem NOT, MAT, VES
  const ordenarTurnos = (turnos: string[]): string[] => {
    const ordemTurnos = ['NOT', 'MAT', 'VES'];
    return turnos.sort((a, b) => {
      const indexA = ordemTurnos.indexOf(a);
      const indexB = ordemTurnos.indexOf(b);

      // Se ambos estão na lista de ordem, ordena por posição
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }

      // Se apenas um está na lista, o que está tem prioridade
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      // Se nenhum está na lista, ordena alfabeticamente
      return a.localeCompare(b);
    });
  };

  // Agrupar setups por turno/linha/data
  const groupedSetups = useMemo((): SetupGrouped => {
    const grouped: SetupGrouped = {};

    setupData.forEach((item) => {
      const key = `${item.linha}-${item.turno}-${item.data_registro}`;

      if (!grouped[key]) {
        grouped[key] = {
          linha: item.linha,
          turno: item.turno,
          data: item.data_registro,
          tempoTotal: 0,
          problemas: [],
          count: 0,
        };
      }

      grouped[key].tempoTotal += item.tempo;
      if (!grouped[key].problemas.includes(item.problema)) {
        grouped[key].problemas.push(item.problema);
      }
      grouped[key].count++;
    });

    return grouped;
  }, [setupData]);

  // Dados para gráfico de tempo médio por turno
  const chartData = useMemo(() => {
    if (setupData.length === 0) return null;

    const turnos: { [key: string]: { total: number; count: number } } = {};
    Object.values(groupedSetups).forEach((setup) => {
      if (!turnos[setup.turno]) {
        turnos[setup.turno] = { total: 0, count: 0 };
      }
      turnos[setup.turno].total += setup.tempoTotal;
      turnos[setup.turno].count++;
    });

    const turnosOrdenados = ordenarTurnos(Object.keys(turnos));
    if (turnosOrdenados.length === 0) return null;

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
        },
        formatter: (params: any) => {
          const data = params[0];
          return `<strong>${data.name}</strong><br/>Tempo Médio: ${data.value} min`;
        },
        textStyle: {
          fontFamily: 'Poppins',
        },
      },
      xAxis: {
        type: 'category',
        data: turnosOrdenados,
        axisLabel: {
          textStyle: {
            fontFamily: 'Poppins',
          },
        },
      },
      yAxis: {
        type: 'value',
        name: 'Tempo (min)',
        nameTextStyle: {
          fontFamily: 'Poppins',
        },
        axisLabel: {
          textStyle: {
            fontFamily: 'Poppins',
          },
        },
      },
      series: [
        {
          data: turnosOrdenados.map((t) => Number((turnos[t].total / turnos[t].count).toFixed(1))),
          type: 'line',
          itemStyle: { color: '#e74c3c' },
          lineStyle: { color: '#e74c3c', width: 3 },
          symbol: 'circle',
          symbolSize: 8,
          label: {
            show: true,
            position: 'top',
            formatter: '{c} min',
            textStyle: {
              fontSize: 11,
              fontFamily: 'Poppins',
            },
          },
          emphasis: {
            itemStyle: {
              color: '#c0392b',
              borderColor: '#fff',
              borderWidth: 2,
            },
          },
        },
      ],
      title: {
        text: 'Tempo Médio por Turno',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          fontFamily: 'Poppins',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '2%',
        top: '20%',
        containLabel: true,
      },
    };
  }, [groupedSetups, setupData]);

  return (
    <Card className='shadow-sm border-0 h-100 position-relative'>
      {isRefreshing && (
        <div className='position-absolute top-0 end-0 m-3' style={{ zIndex: 10 }}>
          <div className='spinner-border spinner-border-sm text-primary' role='status'>
            <span className='visually-hidden'>Atualizando...</span>
          </div>
        </div>
      )}
      <Card.Body>
        {chartData ? (
          <ReactECharts option={chartData} style={{ height: '300px' }} />
        ) : (
          <div className='d-flex align-items-center justify-content-center' style={{ height: '300px' }}>
            <div className='text-center text-muted'>
              <i className='bi bi-graph-up' style={{ fontSize: '2rem' }}></i>
              <p className='mt-2'>Dados insuficientes para o gráfico</p>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default TempoMedioPorTurnoChart;
